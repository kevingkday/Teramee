import { ProfileDesignTokens } from './types';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  tokens: ProfileDesignTokens;
  sampleCss: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classic-blue',
    name: 'Classic 2006 Blue',
    description: 'The authentic MySpace nostalgia: royal blue accents, crisp borders, and clean layout.',
    tokens: {
      backgroundColor: '#e6edf5',
      backgroundPattern: 'none',
      backgroundImageUrl: '',
      cardColor: '#ffffff',
      cardOpacity: 1,
      textColor: '#1f2937',
      headerColor: '#003366',
      accentColor: '#0055aa',
      linkHoverColor: '#cc0000',
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: 'base',
      borderRadius: '4px',
      borderStyle: 'solid',
      borderColor: '#99b3cc',
      borderWidth: '1px',
      boxShadow: 'retro-hard'
    },
    sampleCss: `/* Classic MySpace Accent Polish */
.profile-card {
  box-shadow: 2px 2px 0px #003366;
}
.profile-header h1 {
  text-shadow: 1px 1px 0px #99b3cc;
}
a:hover {
  text-decoration: underline;
  color: #cc0000;
}`
  },
  {
    id: 'scene-queen',
    name: 'Scene Queen 2007',
    description: 'Hot pink, jet black, neon cyan accents, rawr xD glitter aesthetic.',
    tokens: {
      backgroundColor: '#0a0a0f',
      backgroundPattern: 'glitter',
      backgroundImageUrl: '',
      cardColor: '#120f18',
      cardOpacity: 0.92,
      textColor: '#fce7f3',
      headerColor: '#ff007f',
      accentColor: '#00f0ff',
      linkHoverColor: '#ff007f',
      fontFamily: '"Comic Sans MS", cursive, sans-serif',
      fontSize: 'base',
      borderRadius: '8px',
      borderStyle: 'dashed',
      borderColor: '#ff007f',
      borderWidth: '2px',
      boxShadow: 'neon-glow'
    },
    sampleCss: `/* Scene Queen Sparkle Glow */
.profile-card {
  box-shadow: 0 0 12px rgba(255, 0, 127, 0.4);
}
h2, h3 {
  letter-spacing: 1px;
}
.player-cassette {
  border: 2px dashed #00f0ff !important;
}`
  },
  {
    id: 'cyberpunk-matrix',
    name: 'Cyberpunk Matrix',
    description: 'Deep terminal black, phosphor neon green, scanline CRT monitor vibe.',
    tokens: {
      backgroundColor: '#030804',
      backgroundPattern: 'scanlines',
      backgroundImageUrl: '',
      cardColor: '#061309',
      cardOpacity: 0.95,
      textColor: '#22c55e',
      headerColor: '#4ade80',
      accentColor: '#10b981',
      linkHoverColor: '#86efac',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: 'base',
      borderRadius: '0px',
      borderStyle: 'solid',
      borderColor: '#22c55e',
      borderWidth: '1px',
      boxShadow: 'retro-hard'
    },
    sampleCss: `/* Phosphor CRT Scanlines & Glow */
.profile-card {
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.3), inset 0 0 4px rgba(34, 197, 94, 0.1);
  text-shadow: 0 0 4px rgba(74, 222, 128, 0.4);
}
.profile-badge {
  background: #22c55e;
  color: #000;
  font-weight: bold;
}`
  },
  {
    id: 'vaporwave-pastel',
    name: 'Vaporwave 1995',
    description: 'Pastel lilac, mint teal, retro grid horizon, 90s digital paradise.',
    tokens: {
      backgroundColor: '#1a102f',
      backgroundPattern: 'retro-grid',
      backgroundImageUrl: '',
      cardColor: '#261b44',
      cardOpacity: 0.88,
      textColor: '#f5d0fe',
      headerColor: '#f472b6',
      accentColor: '#38bdf8',
      linkHoverColor: '#f43f5e',
      fontFamily: 'Inter, sans-serif',
      fontSize: 'base',
      borderRadius: '16px',
      borderStyle: 'solid',
      borderColor: '#c084fc',
      borderWidth: '2px',
      boxShadow: 'cyber-drop'
    },
    sampleCss: `/* Aesthetic Vaporwave Gradient & Soft Glow */
.profile-card {
  backdrop-filter: blur(8px);
  box-shadow: 4px 4px 0px #f472b6, 8px 8px 0px #38bdf8;
}
.profile-header h1 {
  background: linear-gradient(90deg, #f472b6, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`
  },
  {
    id: 'dark-emo',
    name: 'Dark Emo Romance',
    description: 'Blood crimson, obsidian, starry melancholy, dramatic mid-2000s angst.',
    tokens: {
      backgroundColor: '#09090b',
      backgroundPattern: 'stars',
      backgroundImageUrl: '',
      cardColor: '#18181b',
      cardOpacity: 0.95,
      textColor: '#e4e4e7',
      headerColor: '#ef4444',
      accentColor: '#dc2626',
      linkHoverColor: '#f87171',
      fontFamily: 'Georgia, serif',
      fontSize: 'base',
      borderRadius: '2px',
      borderStyle: 'double',
      borderColor: '#991b1b',
      borderWidth: '3px',
      boxShadow: 'soft-blur'
    },
    sampleCss: `/* Dramatic Gothic Borders & Shadow */
.profile-card {
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.2);
}
.player-cassette {
  background: #111 !important;
  border-color: #ef4444 !important;
}`
  }
];
