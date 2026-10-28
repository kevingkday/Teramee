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

export type LayoutBlockId =
  | 'bio'
  | 'topConnections'
  | 'mediaPlayer'
  | 'guestbook'
  | 'statusBlurb'
  | 'interests'
  | 'photos'
  | 'recentVisitors';

export type ActivityActionType =
  | 'PROFILE_UPDATED'
  | 'SONG_CHANGED'
  | 'GUESTBOOK_SIGNED'
  | 'MOOD_UPDATED'
  | 'TOP_FRIENDS_CHANGED'
  | 'PHOTO_ADDED';

export interface ActivityItem {
  id: string;
  actorUsername: string;
  actorDisplayName?: string;
  actorAvatarUrl?: string;
  targetUsername?: string | null;
  actionType: ActivityActionType;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ProfileVisitor {
  id: string;
  profileUsername: string;
  viewerUsername: string;
  viewerDisplayName?: string;
  viewerAvatarUrl: string;
  viewedAt: string;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  caption: string;
  album?: string;
  timestamp?: string;
}

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
  email?: string;
  isAdmin?: boolean;
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
  photos?: ProfilePhoto[];
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
