import { contrastText, type ShareCard } from '../src/lib/seo';

/**
 * Tiny PNG card for profiles that were created after the static export.
 * Seed profiles use prerendered next/og images instead.
 * This path stays on the worker: no resvg.wasm and no custom fonts, so it
 * fits Cloudflare's script-size limit and next/og's 500KB edge budget.
 */

const WIDTH = 1200;
const HEIGHT = 630;

const FONT: Record<string, string[]> = {
  ' ': ['000', '000', '000', '000', '000'],
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['101', '111', '111', '111', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  Q: ['010', '101', '101', '011', '001'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '101', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['110', '001', '010', '100', '111'],
  '3': ['111', '001', '011', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '110', '001', '110'],
  '6': ['011', '100', '110', '101', '010'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['010', '101', '010', '101', '010'],
  '9': ['010', '101', '011', '001', '110'],
  '@': ['010', '101', '111', '101', '011'],
  '.': ['000', '000', '000', '000', '010'],
  _: ['000', '000', '000', '000', '111'],
  '-': ['000', '000', '111', '000', '000'],
  '!': ['010', '010', '010', '000', '010'],
  '?': ['110', '001', '010', '000', '010'],
  "'": ['010', '010', '000', '000', '000'],
  ',': ['000', '000', '000', '010', '100'],
  ':': ['000', '010', '000', '010', '000'],
  '/': ['001', '001', '010', '100', '100'],
  '(': ['001', '010', '010', '010', '001'],
  ')': ['100', '010', '010', '010', '100'],
  '+': ['000', '010', '111', '010', '000'],
  '&': ['010', '101', '010', '101', '011']
};

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ];
}

function glyphFor(char: string): string[] {
  if (FONT[char]) return FONT[char];
  const upper = char.toUpperCase();
  if (FONT[upper]) return FONT[upper];
  return FONT['?'];
}

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return ~crc >>> 0;
}

function u32(value: number): Uint8Array {
  return new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]);
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes, 0);
  crcInput.set(data, typeBytes.length);
  const out = new Uint8Array(12 + data.length);
  out.set(u32(data.length), 0);
  out.set(typeBytes, 4);
  out.set(data, 8);
  out.set(u32(crc32(crcInput)), 8 + data.length);
  return out;
}

async function zlibDeflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new CompressionStream('deflate');
  const writer = stream.writable.getWriter();
  await writer.write(data as unknown as BufferSource);
  await writer.close();
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

class Canvas {
  readonly stride = 1 + WIDTH * 3;
  readonly raw = new Uint8Array(HEIGHT * this.stride);

  fill(x: number, y: number, w: number, h: number, color: Rgb) {
    const left = Math.max(0, x);
    const top = Math.max(0, y);
    const right = Math.min(WIDTH, x + w);
    const bottom = Math.min(HEIGHT, y + h);
    if (right <= left || bottom <= top) return;
    const row = new Uint8Array((right - left) * 3);
    for (let i = 0; i < right - left; i++) {
      row[i * 3] = color[0];
      row[i * 3 + 1] = color[1];
      row[i * 3 + 2] = color[2];
    }
    for (let yy = top; yy < bottom; yy++) {
      this.raw.set(row, yy * this.stride + 1 + left * 3);
    }
  }

  text(value: string, x: number, y: number, scale: number, color: Rgb, maxWidth: number) {
    let cursor = x;
    const gap = Math.max(2, Math.round(scale * 0.8));
    for (const char of value) {
      const glyph = glyphFor(char);
      const advance = 3 * scale + gap;
      if (cursor + 3 * scale > x + maxWidth) break;
      glyph.forEach((row, rowIndex) => {
        for (let col = 0; col < 3; col++) {
          if (row[col] !== '1') continue;
          this.fill(cursor + col * scale, y + rowIndex * scale, scale, scale, color);
        }
      });
      cursor += advance;
    }
  }
}

export async function renderProfileCardPng(card: ShareCard): Promise<Uint8Array> {
  const canvas = new Canvas();
  const background = parseHex(card.backgroundColor);
  const header = parseHex(card.headerColor);
  const accent = parseHex(card.accentColor);
  const paper = parseHex(card.cardColor);
  const ink = parseHex(card.textColor);
  const footerInk = parseHex(contrastText(card.headerColor));

  canvas.fill(0, 0, WIDTH, HEIGHT, background);
  canvas.fill(0, 0, WIDTH, 36, accent);
  canvas.fill(64, 72, WIDTH - 128, HEIGHT - 160, header);
  canvas.fill(80, 88, WIDTH - 160, HEIGHT - 192, paper);
  canvas.fill(0, HEIGHT - 64, WIDTH, 64, header);

  const name = card.displayName.length > 22 ? `${card.displayName.slice(0, 19)}...` : card.displayName;
  canvas.text('TERAMEE', 112, 120, 8, accent, 900);
  canvas.text(name, 112, 230, 14, ink, 960);
  canvas.text(`@${card.username}`, 112, 340, 8, header, 960);
  canvas.text(card.imageDescription, 112, 430, 5, ink, 960);
  canvas.text(`teramee.com/@${card.username}`, 112, HEIGHT - 46, 4, footerInk, 980);

  const ihdr = new Uint8Array(13);
  ihdr.set(u32(WIDTH), 0);
  ihdr.set(u32(HEIGHT), 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const compressed = await zlibDeflate(canvas.raw);
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [signature, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', new Uint8Array())];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}
