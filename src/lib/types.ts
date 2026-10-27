export interface ProfileDesignTokens {
  backgroundColor: string;
  backgroundPattern: 'none' | 'stars' | 'glitter' | 'scanlines' | 'retro-grid' | 'denim' | 'hearts';
  backgroundImageUrl: string;
  cardColor: string;
  cardOpacity: number;
  textColor: string;
  headerColor: string;
  accentColor: string;
  linkHoverColor: string;
  fontFamily: string;
  fontSize: 'sm' | 'base' | 'lg';
  borderRadius: string;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'ridge' | 'groove' | 'retro-bevel';
  borderColor: string;
  borderWidth: string;
  boxShadow: 'none' | 'retro-hard' | 'neon-glow' | 'soft-blur' | 'cyber-drop';
}

export type LayoutBlockId = 'bio' | 'topConnections' | 'mediaPlayer' | 'guestbook' | 'statusBlurb' | 'interests';

export interface LayoutBlock {
  id: LayoutBlockId;
  title: string;
  column: 'left' | 'right';
  order: number;
  visible: boolean;
}

export interface FriendConnection {
  id: string;
  name: string;
  username?: string;
  avatarUrl: string;
  role: string;
  status: string;
}

export interface GuestbookEntry {
  id: string;
  author: string;
  username?: string;
  avatarUrl: string;
  timestamp: string;
  contentHtml: string;
}

export interface DirectMessage {
  id: string;
  fromUsername: string;
  fromDisplayName?: string;
  fromAvatarUrl?: string;
  toUsername: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  username: string;
  displayName: string;
  headline: string;
  tagline: string;
  mood: string;
  avatarUrl: string;
  bannerUrl?: string;
  bioHtml: string;
  whoIdLikeToMeetHtml?: string;
  interestsHtml: string;
  songTitle: string;
  songArtist: string;
  songAudioUrl?: string;
  mediaType?: 'retro-cassette' | 'spotify' | 'youtube' | 'audio';
  mediaUrl?: string;
  tokens: ProfileDesignTokens;
  layout: LayoutBlock[];
  rawCss: string;
  topFriends: FriendConnection[];
  guestbook: GuestbookEntry[];
  friends?: string[];
  favorites?: string[];
  passwordHash?: string;
  salt?: string;
  updatedAt: string;
}

export interface SanitizationViolation {
  type: 'blocked_at_rule' | 'scoped_selector' | 'neutralized_property' | 'blocked_uri' | 'syntax_error';
  severity: 'warning' | 'info' | 'critical';
  message: string;
  originalSnippet?: string;
}

export interface SanitizedCssResult {
  rawCss: string;
  sanitizedCss: string;
  isValid: boolean;
  violations: SanitizationViolation[];
  stats: {
    ruleCount: number;
    scopedRuleCount: number;
    strippedRuleCount: number;
  };
}
