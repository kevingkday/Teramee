// Utilities to parse and generate safe embed URLs for YouTube and Spotify

export interface ParsedMedia {
  type: 'spotify' | 'youtube' | 'audio' | 'none';
  embedUrl?: string;
  id?: string;
  isValid: boolean;
  error?: string;
}

export function parseYouTubeUrl(url: string): { isValid: boolean; videoId?: string; embedUrl?: string } {
  if (!url || typeof url !== 'string') return { isValid: false };
  const trimmed = url.trim();

  // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, etc.
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^"&?/\s]{11})/i;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    const videoId = match[1];
    return {
      isValid: true,
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`
    };
  }

  return { isValid: false };
}

export function parseSpotifyUrl(url: string): { isValid: boolean; id?: string; mediaType?: string; embedUrl?: string } {
  if (!url || typeof url !== 'string') return { isValid: false };
  const trimmed = url.trim();

  // Match https://open.spotify.com/(track|album|playlist|artist)/ID
  const webMatch = trimmed.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/i);
  if (webMatch && webMatch[1] && webMatch[2]) {
    const mediaType = webMatch[1].toLowerCase();
    const id = webMatch[2];
    return {
      isValid: true,
      id,
      mediaType,
      embedUrl: `https://open.spotify.com/embed/${mediaType}/${id}?utm_source=generator&theme=0`
    };
  }

  // Match spotify:track:ID or spotify:album:ID
  const uriMatch = trimmed.match(/^spotify:(track|album|playlist):([a-zA-Z0-9]+)/i);
  if (uriMatch && uriMatch[1] && uriMatch[2]) {
    const mediaType = uriMatch[1].toLowerCase();
    const id = uriMatch[2];
    return {
      isValid: true,
      id,
      mediaType,
      embedUrl: `https://open.spotify.com/embed/${mediaType}/${id}?utm_source=generator&theme=0`
    };
  }

  return { isValid: false };
}

export const POPULAR_RETRO_SOUNDTRACKS = [
  {
    name: 'Such Great Heights',
    artist: 'The Postal Service',
    spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    youtubeUrl: 'https://www.youtube.com/watch?v=0wrsZog8qXg'
  },
  {
    name: 'Misery Business',
    artist: 'Paramore',
    spotifyUrl: 'https://open.spotify.com/track/6SpLc7EXDR0zuFvlzxRZCV',
    youtubeUrl: 'https://www.youtube.com/watch?v=aCyGvGEtOwc'
  },
  {
    name: 'Helena (So Long & Goodnight)',
    artist: 'My Chemical Romance',
    spotifyUrl: 'https://open.spotify.com/track/5dTHtzPrPyEgddmzX4Vn8v',
    youtubeUrl: 'https://www.youtube.com/watch?v=UCCyoocDxBA'
  },
  {
    name: 'The Middle',
    artist: 'Jimmy Eat World',
    spotifyUrl: 'https://open.spotify.com/track/6GG73Jik4jUlQCkKg94y42',
    youtubeUrl: 'https://www.youtube.com/watch?v=oKsxPW6i3pM'
  },
  {
    name: 'One More Time',
    artist: 'Daft Punk',
    spotifyUrl: 'https://open.spotify.com/track/0DiWol3AO6WpXZgp0goxAV',
    youtubeUrl: 'https://www.youtube.com/watch?v=FGBhQbmPwH8'
  }
];
