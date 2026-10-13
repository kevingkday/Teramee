import * as csstree from 'css-tree';
import { SanitizedCssResult, SanitizationViolation } from './types';

const APPROVED_IMPORT_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.bunny.net',
  'fonts.cdnfonts.com',
  'use.typekit.net'
];

interface SanitizeOptions {
  scopeClass?: string;
  maxZIndex?: number;
  allowKeyframes?: boolean;
}

export function sanitizeAndScopeCss(
  rawCss: string,
  options: SanitizeOptions = {}
): SanitizedCssResult {
  const scopeClass = options.scopeClass || '.profile-canvas';
  const maxZIndex = options.maxZIndex ?? 50;
  const violations: SanitizationViolation[] = [];
  let ruleCount = 0;
  let scopedRuleCount = 0;
  let strippedRuleCount = 0;

  if (!rawCss || typeof rawCss !== 'string' || !rawCss.trim()) {
    return {
      rawCss: '',
      sanitizedCss: '',
      isValid: true,
      violations: [],
      stats: { ruleCount: 0, scopedRuleCount: 0, strippedRuleCount: 0 }
    };
  }

  let ast: csstree.CssNode;
  try {
    ast = csstree.parse(rawCss, {
      onParseError: (error) => {
        violations.push({
          type: 'syntax_error',
          severity: 'warning',
          message: `CSS syntax notice at line ${error.line}, col ${error.column}: ${error.message}`
        });
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      rawCss,
      sanitizedCss: `/* Sanitization Error: ${errorMsg} */`,
      isValid: false,
      violations: [
        {
          type: 'syntax_error',
          severity: 'critical',
          message: `Fatal syntax parsing error: ${errorMsg}`
        }
      ],
      stats: { ruleCount: 0, scopedRuleCount: 0, strippedRuleCount: 0 }
    };
  }

  // 1. Process and filter @rules (@import, @keyframes, etc.)
  csstree.walk(ast, {
    visit: 'Atrule',
    enter(node: csstree.Atrule, item, list) {
      const atName = node.name.toLowerCase();

      if (atName === 'import') {
        const generated = csstree.generate(node);
        // Check if @import targets an approved font provider
        const isApproved = APPROVED_IMPORT_DOMAINS.some((domain) =>
          generated.includes(domain) && generated.includes('https://')
        );

        if (!isApproved) {
          violations.push({
            type: 'blocked_at_rule',
            severity: 'critical',
            message: `Blocked unauthorized @import rule: only approved font services are permitted`,
            originalSnippet: generated
          });
          strippedRuleCount++;
          list.remove(item);
        } else {
          violations.push({
            type: 'blocked_at_rule',
            severity: 'info',
            message: `Allowed secure web font @import from trusted CDN`,
            originalSnippet: generated
          });
        }
      } else if (
        atName === 'charset' ||
        atName === 'namespace' ||
        atName === 'document' ||
        atName === 'scope'
      ) {
        // Strip non-standard or risky at-rules
        violations.push({
          type: 'blocked_at_rule',
          severity: 'warning',
          message: `Removed restricted @${atName} directive`,
          originalSnippet: csstree.generate(node)
        });
        strippedRuleCount++;
        list.remove(item);
      }
    }
  });

  // 2. Process declarations (neutralize position: fixed, javascript:, expression, high z-index)
  csstree.walk(ast, {
    visit: 'Declaration',
    enter(node: csstree.Declaration, item, list) {
      const prop = node.property.toLowerCase();
      const val = csstree.generate(node.value).toLowerCase();

      // Check for position: fixed (escape hatch hijack prevention)
      if (prop === 'position' && val.includes('fixed')) {
        violations.push({
          type: 'neutralized_property',
          severity: 'critical',
          message: `Neutralized 'position: fixed' to 'position: absolute' to prevent overlaying platform UI escape hatches`,
          originalSnippet: `${prop}: ${val}`
        });
        try {
          node.value = csstree.parse('absolute', { context: 'value' }) as csstree.Value;
        } catch {
          list.remove(item);
        }
        return;
      }

      // Check for malicious javascript: or vbscript: URIs
      if (
        val.includes('javascript:') ||
        val.includes('vbscript:') ||
        val.includes('data:text/html') ||
        val.includes('expression(') ||
        prop === 'behavior' ||
        prop === '-moz-binding'
      ) {
        violations.push({
          type: 'blocked_uri',
          severity: 'critical',
          message: `Stripped dangerous script or expression execution in property '${prop}'`,
          originalSnippet: `${prop}: ${val}`
        });
        strippedRuleCount++;
        list.remove(item);
        return;
      }

      // Clamp excessively high z-index to protect platform modals & navbars
      if (prop === 'z-index') {
        const numVal = parseInt(val.replace(/[^0-9-]/g, ''), 10);
        if (!isNaN(numVal) && numVal > maxZIndex) {
          violations.push({
            type: 'neutralized_property',
            severity: 'warning',
            message: `Clamped z-index from ${numVal} to ${maxZIndex} to ensure platform navbar accessibility`,
            originalSnippet: `${prop}: ${val}`
          });
          try {
            node.value = csstree.parse(String(maxZIndex), { context: 'value' }) as csstree.Value;
          } catch {
            // Keep as is if parse fails
          }
        }
      }
    }
  });

  // 3. Scope all rule selectors to .profile-canvas
  csstree.walk(ast, {
    visit: 'Rule',
    enter(ruleNode: csstree.Rule) {
      // Don't scope keyframe selectors (like 0%, 100%, from, to)
      // Check if this rule is inside an @keyframes rule
      // csstree doesn't easily expose parent in basic walk, so we inspect prelude
      if (!ruleNode.prelude || ruleNode.prelude.type !== 'SelectorList') {
        return;
      }

      const rawPrelude = csstree.generate(ruleNode.prelude);
      // Keyframe steps look like "from", "to", "0%", "50%"
      if (/^(from|to|\d+%)$/i.test(rawPrelude.trim())) {
        return;
      }

      ruleCount++;
      let anyScoped = false;

      ruleNode.prelude.children.forEach((selNode) => {
        const rawSel = csstree.generate(selNode).trim();
        let scoped = '';

        if (
          rawSel === 'body' ||
          rawSel === 'html' ||
          rawSel === ':root' ||
          rawSel === ':host'
        ) {
          scoped = scopeClass;
          anyScoped = true;
        } else if (
          rawSel.startsWith('body ') ||
          rawSel.startsWith('html ') ||
          rawSel.startsWith(':root ')
        ) {
          scoped = `${scopeClass} ${rawSel.replace(/^(body|html|:root)\s+/, '')}`;
          anyScoped = true;
        } else if (rawSel.startsWith(scopeClass)) {
          // Already scoped
          scoped = rawSel;
        } else {
          // Standard scoping: prepend container selector
          scoped = `${scopeClass} ${rawSel}`;
          anyScoped = true;
        }

        try {
          const parsedSel = csstree.parse(scoped, { context: 'selector' }) as csstree.Selector;
          if ('children' in selNode) {
            (selNode as csstree.Selector).children = parsedSel.children;
          }
        } catch {
          // Fallback if parsing specific selector fails
        }
      });

      if (anyScoped) {
        scopedRuleCount++;
      }
    }
  });

  const sanitizedCss = csstree.generate(ast);

  return {
    rawCss,
    sanitizedCss,
    isValid: true,
    violations,
    stats: {
      ruleCount,
      scopedRuleCount,
      strippedRuleCount
    }
  };
}
