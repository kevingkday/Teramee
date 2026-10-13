import sanitizeHtmlLib from 'sanitize-html';

const ALLOWED_TAGS = [
  'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'u', 's', 'strike',
  'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'h3', 'h4', 'h5', 'h6',
  'img', 'hr', 'font', 'marquee', 'center', 'blink'
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'name', 'target', 'title', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'style', 'class'],
  span: ['style', 'class'],
  p: ['style', 'class'],
  font: ['color', 'size', 'face'],
  marquee: ['behavior', 'direction', 'scrollamount'],
  '*': ['title']
};

export function sanitizeUserHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  return sanitizeHtmlLib(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    transformTags: {
      a: (tagName, attribs) => {
        // Enforce safe link attributes
        const newAttribs = { ...attribs };
        newAttribs.target = '_blank';
        newAttribs.rel = 'noopener noreferrer nofollow';
        return {
          tagName,
          attribs: newAttribs
        };
      }
    }
  });
}
