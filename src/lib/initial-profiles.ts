import { UserProfile, DirectMessage } from './types';

export const INITIAL_PROFILES: Record<string, UserProfile> = {
  "kevin": {
    "username": "kevin",
    "displayName": "Kevin",
    "headline": "Kevin is in your extended network! ;-)",
    "tagline": "Building the friendly web since 2003. Let's connect!",
    "mood": "nostalgic",
    "avatarUrl": "https://github.com/kevingkday.png",
    "bannerUrl": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Hi! I'm Kevin.</b></p><p>Welcome to my profile! I enjoy building open platforms where everyone has their own space on the internet.</p><p><i>\"Don't take life too seriously, nobody gets out alive anyway!\"</i></p>",
    "whoIdLikeToMeetHtml": "<p>Old friends, new friends, developers, musicians, and anyone who misses when the internet was creative, customizable, and fun! Drop a comment below! ;-)</p>",
    "interestsHtml": "<p><b>General:</b> Web architecture, retro gaming, vinyl records, film cameras</p><p><b>Music:</b> The Postal Service, Jimmy Eat World, Daft Punk, Modest Mouse</p><p><b>Movies:</b> The Matrix, Eternal Sunshine, Donnie Darko</p>",
    "songTitle": "Such Great Heights",
    "songArtist": "The Postal Service",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#e6edf5",
      "backgroundPattern": "none",
      "backgroundImageUrl": "",
      "cardColor": "#ffffff",
      "cardOpacity": 1,
      "textColor": "#1f2937",
      "headerColor": "#003366",
      "accentColor": "#0055aa",
      "linkHoverColor": "#cc0000",
      "fontFamily": "Trebuchet MS, sans-serif",
      "fontSize": "base",
      "borderRadius": "4px",
      "borderStyle": "solid",
      "borderColor": "#99b3cc",
      "borderWidth": "1px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Kevin's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Classic MySpace Accent Polish */\n.profile-card {\n  box-shadow: 2px 2px 0px #003366;\n}\n.profile-header h1 {\n  text-shadow: 1px 1px 0px #99b3cc;\n}\na:hover {\n  text-decoration: underline;\n  color: #cc0000;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "Best Friend",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Bassist",
        "status": "away"
      },
      {
        "id": "f3",
        "name": "Maya",
        "username": "maya",
        "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        "role": "Designer",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "Jordan",
        "username": "jordan",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "role": "DJ",
        "status": "offline"
      },
      {
        "id": "f5",
        "name": "Chloe",
        "username": "chloe",
        "avatarUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
        "role": "Artist",
        "status": "online"
      },
      {
        "id": "f6",
        "name": "Liam",
        "username": "liam",
        "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
        "role": "Skater",
        "status": "away"
      },
      {
        "id": "f7",
        "name": "Zoe",
        "username": "zoe",
        "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
        "role": "Vocalist",
        "status": "offline"
      },
      {
        "id": "f8",
        "name": "Marcus",
        "username": "marcus",
        "avatarUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        "role": "Gamer",
        "status": "online"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Today at 2:14 PM",
        "contentHtml": "Thanks for the add Kevin!! Love your new profile background! PC4PC? <3"
      },
      {
        "id": "g2",
        "author": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Yesterday at 9:40 PM",
        "contentHtml": "Awesome song choice bro! Are we practicing this Saturday at the studio?"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "sarah",
      "alex",
      "maya",
      "jordan",
      "chloe",
      "liam",
      "zoe",
      "marcus",
      "glitterqueen99"
    ],
    "favorites": [
      "sarah",
      "alex"
    ],
    "updatedAt": "2026-10-21T21:32:45.364Z"
  },
  "glitterqueen99": {
    "username": "glitterqueen99",
    "displayName": "xX_Glitter_Star_Xx",
    "headline": "Rawr means I love you in dinosaur!! xD",
    "tagline": "Scene kids never die, they just dye their hair neon again~",
    "mood": "ecstatic",
    "avatarUrl": "/avatars/glitterqueen.jpg",
    "bannerUrl": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><marquee scrollamount=\"4\">★ Welcome 2 My Sparkly Nightmare ★</marquee></p><p>Stargazer, side-bang enthusiast, and hot-topic loyalty club member. Leave a comment or get deleted from my top 8!</p>",
    "whoIdLikeToMeetHtml": "<p>Paramore, scene queens &amp; kings, anyone with cool hair, and cute emo boys with side bangs! No posers allowed! &lt;3</p>",
    "interestsHtml": "<p><b>Music:</b> Paramore, Fall Out Boy, My Chemical Romance, Cobra Starship</p><p><b>Hobbies:</b> Taking mirror selfies with a digital Olympus cam, designing sparkly layouts</p>",
    "songTitle": "Misery Business",
    "songArtist": "Paramore",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#0a0a0f",
      "backgroundPattern": "glitter",
      "backgroundImageUrl": "",
      "cardColor": "#120f18",
      "cardOpacity": 0.92,
      "textColor": "#fce7f3",
      "headerColor": "#ff007f",
      "accentColor": "#00f0ff",
      "linkHoverColor": "#ff007f",
      "fontFamily": "\"Comic Sans MS\", cursive, sans-serif",
      "fontSize": "base",
      "borderRadius": "8px",
      "borderStyle": "dashed",
      "borderColor": "#ff007f",
      "borderWidth": "2px",
      "boxShadow": "neon-glow"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "GlitterQueen's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Scene Queen Sparkle Glow */\n.profile-card {\n  box-shadow: 0 0 12px rgba(255, 0, 127, 0.4);\n}\nh2, h3 {\n  letter-spacing: 1px;\n}\n.player-cassette {\n  border: 2px dashed #00f0ff !important;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "VampireKitten",
        "username": "vampirekitten",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        "role": "BFFL",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "CyberGoth",
        "username": "cybergoth",
        "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        "role": "Emo King",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "NeonSkater",
        "username": "neonskater",
        "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "role": "Homie",
        "status": "away"
      },
      {
        "id": "f4",
        "name": "PixelDoll",
        "username": "pixeldoll",
        "avatarUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
        "role": "Bestie",
        "status": "online"
      },
      {
        "id": "f5",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Site Creator",
        "status": "online"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "PixelDoll",
        "username": "pixeldoll",
        "avatarUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
        "timestamp": "3 hours ago",
        "contentHtml": "OMG your layout is SO PRETTY!! Teach me how you did the glowing border!! <3<3"
      },
      {
        "id": "g2",
        "author": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "timestamp": "Today at 3:30 PM",
        "contentHtml": "Awesome scene layout! Keep the music playing! :-)"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "vampirekitten",
      "cybergoth",
      "neonskater",
      "pixeldoll"
    ],
    "favorites": [
      "vampirekitten",
      "kevin"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "sarah": {
    "username": "sarah",
    "displayName": "Sarah",
    "headline": "Sarah is sipping iced matcha and listening to indie vinyl ~",
    "tagline": "Life happens, coffee helps. Kevin's partner in crime since high school!",
    "mood": "creative",
    "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Hey! I'm Sarah.</b></p><p>Kevin's best friend since high school. When I'm not designing indie album sleeves, I'm wandering record shops or hunting for vintage film cameras.</p><p><i>\"To live will be an awfully big adventure.\"</i></p>",
    "whoIdLikeToMeetHtml": "<p>Musicians, photographers, indie kids, and anyone who wants to talk about 2000s indie rock! Don't hesitate to leave a comment or drop a message.</p>",
    "interestsHtml": "<p><b>Music:</b> Yeah Yeah Yeahs, Metric, Rilo Kiley, Death Cab for Cutie, Feist</p><p><b>Hobbies:</b> 35mm film photography, ceramic pottery, thrifting</p><p><b>Favorite Movies:</b> Almost Famous, Amélie, Lost in Translation</p>",
    "songTitle": "Maps",
    "songArtist": "Yeah Yeah Yeahs",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#fbf7ee",
      "backgroundPattern": "none",
      "backgroundImageUrl": "",
      "cardColor": "#ffffff",
      "cardOpacity": 0.98,
      "textColor": "#292524",
      "headerColor": "#b45309",
      "accentColor": "#d97706",
      "linkHoverColor": "#b91c1c",
      "fontFamily": "Georgia, serif",
      "fontSize": "base",
      "borderRadius": "8px",
      "borderStyle": "solid",
      "borderColor": "#fde68a",
      "borderWidth": "1px",
      "boxShadow": "soft-blur"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Sarah's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Warm Indie Coffeehouse */\n.profile-card {\n  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.15);\n}\n.profile-header h1 {\n  font-family: Georgia, serif;\n  color: #78350f;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "BFFL",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Bandmate",
        "status": "away"
      },
      {
        "id": "f3",
        "name": "Maya",
        "username": "maya",
        "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        "role": "Art Bestie",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "Jordan",
        "username": "jordan",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "role": "DJ Friend",
        "status": "offline"
      },
      {
        "id": "f5",
        "name": "Zoe",
        "username": "zoe",
        "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
        "role": "Singer",
        "status": "online"
      },
      {
        "id": "f6",
        "name": "Chloe",
        "username": "chloe",
        "avatarUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
        "role": "Painter",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g_1792618506437",
        "author": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "timestamp": "Just now",
        "contentHtml": "Can't wait to hear the new acoustic arrangements! See you this Saturday!"
      },
      {
        "id": "g1",
        "author": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "timestamp": "Today at 1:20 PM",
        "contentHtml": "Thanks for the add Sarah! Coffee before band practice on Saturday? ;-)"
      },
      {
        "id": "g2",
        "author": "Maya",
        "username": "maya",
        "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Yesterday at 6:15 PM",
        "contentHtml": "Love your photos from the weekend concert! Send me the raw files! <3"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "alex",
      "maya",
      "jordan",
      "zoe",
      "chloe"
    ],
    "favorites": [
      "kevin"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "alex": {
    "username": "alex",
    "displayName": "Alex",
    "headline": "Alex is turning up the bass amplifier to 11 🎸",
    "tagline": "Garage rock, distortion pedals, and midnight jam sessions.",
    "mood": "hyped",
    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>What's up, I'm Alex.</b></p><p>I play bass in our indie rock garage band. Always looking for drummers with good tempo and people who appreciate good tube amps.</p>",
    "whoIdLikeToMeetHtml": "<p>Musicians who want to jam, roadies, audio engineers, and anyone who loves live rock &amp; roll!</p>",
    "interestsHtml": "<p><b>Music:</b> The White Stripes, Queens of the Stone Age, Arctic Monkeys, The Strokes</p><p><b>Gear:</b> Fender Precision Bass, Ampeg SVT, Big Muff Pi</p>",
    "songTitle": "Seven Nation Army",
    "songArtist": "The White Stripes",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#18181b",
      "backgroundPattern": "none",
      "backgroundImageUrl": "",
      "cardColor": "#27272a",
      "cardOpacity": 0.95,
      "textColor": "#f4f4f5",
      "headerColor": "#f97316",
      "accentColor": "#ea580c",
      "linkHoverColor": "#fbbf24",
      "fontFamily": "Trebuchet MS, sans-serif",
      "fontSize": "base",
      "borderRadius": "4px",
      "borderStyle": "solid",
      "borderColor": "#f97316",
      "borderWidth": "1px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Alex's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Garage Rock Distortion */\n.profile-card {\n  box-shadow: 3px 3px 0px #ea580c;\n}\nh2, h3 {\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Guitarist",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "Bestie",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "Jordan",
        "username": "jordan",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "role": "DJ",
        "status": "offline"
      },
      {
        "id": "f4",
        "name": "NeonSkater",
        "username": "neonskater",
        "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "role": "Skate Homie",
        "status": "away"
      },
      {
        "id": "f5",
        "name": "Marcus",
        "username": "marcus",
        "avatarUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        "role": "LAN Host",
        "status": "online"
      },
      {
        "id": "f6",
        "name": "Liam",
        "username": "liam",
        "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
        "role": "Skater",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "timestamp": "Today at 2:00 PM",
        "contentHtml": "Studio is booked for 2pm Saturday Alex! Bring the new fuzz pedal!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "sarah",
      "jordan",
      "neonskater",
      "marcus",
      "liam",
      "maya"
    ],
    "favorites": [
      "kevin"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "maya": {
    "username": "maya",
    "displayName": "Maya",
    "headline": "Maya is pushing pixels and tweaking CSS gradients 🎨✨",
    "tagline": "Digital artist, graphic designer, and retro web enthusiast.",
    "mood": "artistic",
    "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Hi! I'm Maya.</b></p><p>Graphic artist by day, retro profile customizer by night. If your layout needs a custom banner or pixel badge, hit me up!</p>",
    "whoIdLikeToMeetHtml": "<p>Fellow artists, web developers, animators, and anyone who appreciates good typography!</p>",
    "interestsHtml": "<p><b>Software:</b> Photoshop CS2, Illustrator, Blender, Pixelmator</p><p><b>Music:</b> Daft Punk, Justice, Gorillaz, Crystal Castles</p>",
    "songTitle": "Harder, Better, Faster, Stronger",
    "songArtist": "Daft Punk",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#1e1b4b",
      "backgroundPattern": "retro-grid",
      "backgroundImageUrl": "",
      "cardColor": "#312e81",
      "cardOpacity": 0.9,
      "textColor": "#e0e7ff",
      "headerColor": "#a78bfa",
      "accentColor": "#818cf8",
      "linkHoverColor": "#38bdf8",
      "fontFamily": "Inter, sans-serif",
      "fontSize": "base",
      "borderRadius": "12px",
      "borderStyle": "solid",
      "borderColor": "#818cf8",
      "borderWidth": "2px",
      "boxShadow": "cyber-drop"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Maya's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Aesthetic Pixel Studio */\n.profile-card {\n  box-shadow: 0 0 16px rgba(129, 140, 248, 0.3);\n}\n.profile-header h1 {\n  letter-spacing: 0.5px;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Web Builder",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "BFFL",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "PixelDoll",
        "username": "pixeldoll",
        "avatarUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
        "role": "Pixel Sister",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Rocker",
        "status": "away"
      },
      {
        "id": "f5",
        "name": "Chloe",
        "username": "chloe",
        "avatarUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
        "role": "Artist",
        "status": "online"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Yesterday at 7:00 PM",
        "contentHtml": "Your new portfolio banner looks incredible Maya!! Teach me your grid technique!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "sarah",
      "pixeldoll",
      "alex",
      "chloe"
    ],
    "favorites": [
      "sarah"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "jordan": {
    "username": "jordan",
    "displayName": "Jordan",
    "headline": "Jordan is cooking up new electronic mixes in Ableton 🎧",
    "tagline": "DJ, sound designer, and vinyl collector. Feel the bass drop.",
    "mood": "energetic",
    "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Yo! I'm Jordan.</b></p><p>House, electro, French touch, and breakbeats. Playing clubs on weekends and tweaking synth patches all week.</p>",
    "whoIdLikeToMeetHtml": "<p>Promoters, producers, vocalists, and anyone who loves club culture and dance music.</p>",
    "interestsHtml": "<p><b>Music:</b> Daft Punk, Deadmau5, Justice, Fatboy Slim, Chemical Brothers</p><p><b>Gear:</b> Technics 1200s, Pioneer CDJ, Roland TR-808</p>",
    "songTitle": "One More Time",
    "songArtist": "Daft Punk",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#020617",
      "backgroundPattern": "scanlines",
      "backgroundImageUrl": "",
      "cardColor": "#0f172a",
      "cardOpacity": 0.95,
      "textColor": "#38bdf8",
      "headerColor": "#0ea5e9",
      "accentColor": "#6366f1",
      "linkHoverColor": "#a855f7",
      "fontFamily": "\"Courier New\", Courier, monospace",
      "fontSize": "base",
      "borderRadius": "6px",
      "borderStyle": "solid",
      "borderColor": "#0284c7",
      "borderWidth": "1px",
      "boxShadow": "neon-glow"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Jordan's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Club DJ Scanline Glow */\n.profile-card {\n  box-shadow: 0 0 10px rgba(14, 165, 233, 0.35);\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Friend",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Bassist",
        "status": "away"
      },
      {
        "id": "f3",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "Photog",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "CyberGoth",
        "username": "cybergoth",
        "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        "role": "Synth Head",
        "status": "online"
      },
      {
        "id": "f5",
        "name": "Marcus",
        "username": "marcus",
        "avatarUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        "role": "Gamer",
        "status": "online"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "timestamp": "Today at 10:15 AM",
        "contentHtml": "That mix you dropped on Friday night was incredible Jordan! Keep it spinning!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "alex",
      "sarah",
      "cybergoth",
      "marcus"
    ],
    "favorites": [
      "kevin"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "vampirekitten": {
    "username": "vampirekitten",
    "displayName": "VampireKitten",
    "headline": "xX_blood_red_tears_Xx ~ Rawr! ⚰️🖤",
    "tagline": "Forever spooky, forever scene. Don't judge a book by its bleeding cover.",
    "mood": "mischievous",
    "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Welcome to my crypt...</b></p><p>Glitterqueen's BFFL! Eyeliner thicker than my patience. If you don't like My Chemical Romance, don't talk to me. &lt;3</p>",
    "whoIdLikeToMeetHtml": "<p>Scene queens, emo boys, vampires, and Gerard Way. Posers will be blocked!</p>",
    "interestsHtml": "<p><b>Music:</b> My Chemical Romance, The Used, AFI, Escape The Fate, Aiden</p><p><b>Obsessions:</b> Black clothes, hot pink streaks, vampire books, horror flicks</p>",
    "songTitle": "Helena",
    "songArtist": "My Chemical Romance",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#09090b",
      "backgroundPattern": "stars",
      "backgroundImageUrl": "",
      "cardColor": "#18181b",
      "cardOpacity": 0.95,
      "textColor": "#e4e4e7",
      "headerColor": "#ef4444",
      "accentColor": "#dc2626",
      "linkHoverColor": "#f87171",
      "fontFamily": "Georgia, serif",
      "fontSize": "base",
      "borderRadius": "4px",
      "borderStyle": "solid",
      "borderColor": "#ef4444",
      "borderWidth": "2px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "VampireKitten's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Gothic Melancholy */\n.profile-card {\n  box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);\n}\nh1, h2 {\n  color: #ef4444;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "xX_Glitter_Star_Xx",
        "username": "glitterqueen99",
        "avatarUrl": "/avatars/glitterqueen.jpg",
        "role": "BFFL",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "CyberGoth",
        "username": "cybergoth",
        "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        "role": "Emo King",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "PixelDoll",
        "username": "pixeldoll",
        "avatarUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
        "role": "Bestie",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "NeonSkater",
        "username": "neonskater",
        "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "role": "Homie",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "xX_Glitter_Star_Xx",
        "username": "glitterqueen99",
        "avatarUrl": "/avatars/glitterqueen.jpg",
        "timestamp": "Today at 2:00 PM",
        "contentHtml": "BFFL 4EVER!! Mall trip this Friday after school!! Rawrrr <3<3"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "glitterqueen99",
      "cybergoth",
      "pixeldoll",
      "neonskater"
    ],
    "favorites": [
      "glitterqueen99"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "cybergoth": {
    "username": "cybergoth",
    "displayName": "CyberGoth",
    "headline": "INDUSTRIAL NOISE / CYBERNETIC REALITY ⚡",
    "tagline": "Gas masks, neon dreads, stomping boots & EBM bass.",
    "mood": "intense",
    "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>[SYSTEM OVERRIDE DETECTED]</b></p><p>Industrial dance and darkwave enthusiast. Catch me under the overpass stomping to 140 BPM synth hooks.</p>",
    "whoIdLikeToMeetHtml": "<p>Industrial DJs, cyberpunks, rivetheads, and anyone who appreciates raw modular synthesis.</p>",
    "interestsHtml": "<p><b>Music:</b> Nine Inch Nails, Combichrist, VNV Nation, Front 242, Ministry</p><p><b>Interests:</b> Synth modding, cyberpunk lore, underground rave culture</p>",
    "songTitle": "Closer",
    "songArtist": "Nine Inch Nails",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#030804",
      "backgroundPattern": "scanlines",
      "backgroundImageUrl": "",
      "cardColor": "#061309",
      "cardOpacity": 0.95,
      "textColor": "#22c55e",
      "headerColor": "#4ade80",
      "accentColor": "#10b981",
      "linkHoverColor": "#86efac",
      "fontFamily": "\"Courier New\", Courier, monospace",
      "fontSize": "base",
      "borderRadius": "0px",
      "borderStyle": "solid",
      "borderColor": "#22c55e",
      "borderWidth": "1px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "CyberGoth's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Phosphor Matrix Terminal */\n.profile-card {\n  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);\n  text-shadow: 0 0 4px rgba(74, 222, 128, 0.4);\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "xX_Glitter_Star_Xx",
        "username": "glitterqueen99",
        "avatarUrl": "/avatars/glitterqueen.jpg",
        "role": "Scene Queen",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "VampireKitten",
        "username": "vampirekitten",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        "role": "Dark Soul",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "Jordan",
        "username": "jordan",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "role": "DJ Ally",
        "status": "offline"
      },
      {
        "id": "f4",
        "name": "NeonSkater",
        "username": "neonskater",
        "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "role": "Skater",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "VampireKitten",
        "username": "vampirekitten",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Yesterday at 11:45 PM",
        "contentHtml": "Your new industrial mix is insane!! Send me the tracklist ⚰️"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "glitterqueen99",
      "vampirekitten",
      "jordan",
      "neonskater"
    ],
    "favorites": [
      "vampirekitten"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "pixeldoll": {
    "username": "pixeldoll",
    "displayName": "PixelDoll",
    "headline": "Sparkle glitter kawaii maker (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
    "tagline": "Making sparkly blinkies, pixel dolls, and colorful CSS templates!",
    "mood": "bubbly",
    "avatarUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Haiiii everyone! (≧◡≦)</b></p><p>I code cute HTML pages, draw tiny 16x16 pixel sprites, and hoard stickers. Leave a comment and I'll visit your page!</p>",
    "whoIdLikeToMeetHtml": "<p>Cute people, pixel artists, Web 1.0 lovers, and anime fans!</p>",
    "interestsHtml": "<p><b>Music:</b> Avril Lavigne, Hilary Duff, Gwen Stefani, Kyary Pamyu Pamyu</p><p><b>Hobbies:</b> Pixel art, dollz makers, journaling, glitter GIFs</p>",
    "songTitle": "Girlfriend",
    "songArtist": "Avril Lavigne",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#fdf2f8",
      "backgroundPattern": "glitter",
      "backgroundImageUrl": "",
      "cardColor": "#ffffff",
      "cardOpacity": 0.95,
      "textColor": "#831843",
      "headerColor": "#db2777",
      "accentColor": "#ec4899",
      "linkHoverColor": "#be185d",
      "fontFamily": "\"Comic Sans MS\", cursive, sans-serif",
      "fontSize": "base",
      "borderRadius": "16px",
      "borderStyle": "dotted",
      "borderColor": "#f472b6",
      "borderWidth": "2px",
      "boxShadow": "soft-blur"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "PixelDoll's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Kawaii Sweet Sparkle */\n.profile-card {\n  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.25);\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "xX_Glitter_Star_Xx",
        "username": "glitterqueen99",
        "avatarUrl": "/avatars/glitterqueen.jpg",
        "role": "Bestie",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Maya",
        "username": "maya",
        "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        "role": "Art Idol",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "VampireKitten",
        "username": "vampirekitten",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        "role": "Goth Pal",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "Indie Gal",
        "status": "online"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "xX_Glitter_Star_Xx",
        "username": "glitterqueen99",
        "avatarUrl": "/avatars/glitterqueen.jpg",
        "timestamp": "3 hours ago",
        "contentHtml": "Luv you bestieee! Ur blinkies are the cutest!! &lt;3"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "glitterqueen99",
      "maya",
      "vampirekitten",
      "sarah"
    ],
    "favorites": [
      "glitterqueen99"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "neonskater": {
    "username": "neonskater",
    "displayName": "NeonSkater",
    "headline": "Kickflips, halfpipes, and pop punk on blast 🛹🔥",
    "tagline": "Skate or die, bro! Catch me at the skatepark with bruised shins.",
    "mood": "rebellious",
    "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Yo! What's up!</b></p><p>Tony Hawk Pro Skater 2 soundtrack on repeat. Always down to session any 5-stair or concrete ledge in the city.</p>",
    "whoIdLikeToMeetHtml": "<p>Skaters, punk rockers, videographers with fisheye lenses, and anyone who isn't afraid of a bail.</p>",
    "interestsHtml": "<p><b>Music:</b> Blink-182, Sum 41, Green Day, The Offspring, NOFX</p><p><b>Board Setup:</b> Baker 8.0, Independent Trucks, Spitfire 52mm wheels</p>",
    "songTitle": "All The Small Things",
    "songArtist": "Blink-182",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#0f172a",
      "backgroundPattern": "denim",
      "backgroundImageUrl": "",
      "cardColor": "#1e293b",
      "cardOpacity": 0.95,
      "textColor": "#f1f5f9",
      "headerColor": "#facc15",
      "accentColor": "#f97316",
      "linkHoverColor": "#38bdf8",
      "fontFamily": "Trebuchet MS, sans-serif",
      "fontSize": "base",
      "borderRadius": "4px",
      "borderStyle": "solid",
      "borderColor": "#f97316",
      "borderWidth": "2px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "NeonSkater's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Skater Punk Flare */\n.profile-card {\n  box-shadow: 4px 4px 0px #facc15;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Bassist",
        "status": "away"
      },
      {
        "id": "f2",
        "name": "xX_Glitter_Star_Xx",
        "username": "glitterqueen99",
        "avatarUrl": "/avatars/glitterqueen.jpg",
        "role": "Scene Sis",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Homie",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "Liam",
        "username": "liam",
        "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
        "role": "Skate Bro",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Yesterday at 5:00 PM",
        "contentHtml": "Dude you landed that kickflip down the 6-stair! Cleanest catch ever!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "alex",
      "glitterqueen99",
      "kevin",
      "liam"
    ],
    "favorites": [
      "alex"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "chloe": {
    "username": "chloe",
    "displayName": "Chloe",
    "headline": "Chloe is painting watercolours and sketching cityscapes 🎨",
    "tagline": "Art is what you can get away with. Oil paints & wet brushes.",
    "mood": "thoughtful",
    "avatarUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1460661419200-1845a3c94d03?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Hey there! I'm Chloe.</b></p><p>Studio artist and illustrator. Working on a gallery series about city architecture at dusk.</p>",
    "whoIdLikeToMeetHtml": "<p>Painters, sculptors, gallery curators, and fellow creative souls.</p>",
    "interestsHtml": "<p><b>Music:</b> Modest Mouse, Broken Social Scene, Belle and Sebastian</p><p><b>Mediums:</b> Oil on canvas, gouache, charcoal</p>",
    "songTitle": "Float On",
    "songArtist": "Modest Mouse",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#f8fafc",
      "backgroundPattern": "none",
      "backgroundImageUrl": "",
      "cardColor": "#ffffff",
      "cardOpacity": 1,
      "textColor": "#334155",
      "headerColor": "#0f766e",
      "accentColor": "#14b8a6",
      "linkHoverColor": "#0d9488",
      "fontFamily": "Georgia, serif",
      "fontSize": "base",
      "borderRadius": "8px",
      "borderStyle": "solid",
      "borderColor": "#99f6e4",
      "borderWidth": "1px",
      "boxShadow": "soft-blur"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Chloe's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Gallery Studio */\n.profile-card {\n  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.15);\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Friend",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "Art Pal",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "Maya",
        "username": "maya",
        "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        "role": "Designer",
        "status": "online"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "timestamp": "Today at 12:00 PM",
        "contentHtml": "Can't wait to see the new gallery exhibit Chloe! Looks amazing!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "sarah",
      "maya"
    ],
    "favorites": [
      "sarah"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "liam": {
    "username": "liam",
    "displayName": "Liam",
    "headline": "Liam is grinding handrails and filming skate video parts 🛹",
    "tagline": "Skateboarding is not a crime. Keep pushing.",
    "mood": "chill",
    "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>What's up!</b></p><p>Filming with a Sony VX1000 and death lens. Street skating all day, editing tape all night.</p>",
    "whoIdLikeToMeetHtml": "<p>Anyone with a board or a camera.</p>",
    "interestsHtml": "<p><b>Music:</b> Jimmy Eat World, Taking Back Sunday, Thrice</p><p><b>Spots:</b> Downtown plaza, concrete ditch, street ledges</p>",
    "songTitle": "The Middle",
    "songArtist": "Jimmy Eat World",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#f1f5f9",
      "backgroundPattern": "none",
      "backgroundImageUrl": "",
      "cardColor": "#ffffff",
      "cardOpacity": 1,
      "textColor": "#1e293b",
      "headerColor": "#b45309",
      "accentColor": "#d97706",
      "linkHoverColor": "#ea580c",
      "fontFamily": "Trebuchet MS, sans-serif",
      "fontSize": "base",
      "borderRadius": "4px",
      "borderStyle": "solid",
      "borderColor": "#cbd5e1",
      "borderWidth": "1px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Liam's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Street Tape */\n.profile-card {\n  box-shadow: 2px 2px 0px #d97706;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Friend",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "NeonSkater",
        "username": "neonskater",
        "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "role": "Skate Bro",
        "status": "away"
      },
      {
        "id": "f3",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Bassist",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "NeonSkater",
        "username": "neonskater",
        "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Today at 1:45 PM",
        "contentHtml": "Session at the street plaza at 4pm Liam? I brought fresh tape!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "neonskater",
      "alex"
    ],
    "favorites": [
      "neonskater"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "zoe": {
    "username": "zoe",
    "displayName": "Zoe",
    "headline": "Zoe is recording acoustic cover songs in her bedroom studio 🎤",
    "tagline": "Singing my heart out into a Shure microphone. Harmonies & acoustics.",
    "mood": "melodic",
    "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Hi! I'm Zoe.</b></p><p>Acoustic singer-songwriter. Strumming my Taylor acoustic and posting songs for fun.</p>",
    "whoIdLikeToMeetHtml": "<p>Songwriters, lyricists, coffee house patrons, and musicians.</p>",
    "interestsHtml": "<p><b>Music:</b> Sia, Regina Spektor, Fiona Apple, Damien Rice</p><p><b>Instruments:</b> Taylor 214ce, Piano, Ukulele</p>",
    "songTitle": "Breathe Me",
    "songArtist": "Sia",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#fdf4ff",
      "backgroundPattern": "none",
      "backgroundImageUrl": "",
      "cardColor": "#ffffff",
      "cardOpacity": 1,
      "textColor": "#4a044e",
      "headerColor": "#c026d3",
      "accentColor": "#d946ef",
      "linkHoverColor": "#a21caf",
      "fontFamily": "Georgia, serif",
      "fontSize": "base",
      "borderRadius": "8px",
      "borderStyle": "solid",
      "borderColor": "#f5d0fe",
      "borderWidth": "1px",
      "boxShadow": "soft-blur"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Zoe's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Acoustic Harmony */\n.profile-card {\n  box-shadow: 0 4px 12px rgba(217, 70, 239, 0.15);\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Friend",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "Coffee Pal",
        "status": "online"
      },
      {
        "id": "f3",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Bass Player",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Today at 11:00 AM",
        "contentHtml": "Your acoustic cover of Maps gave me chills Zoe!! Keep posting!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "sarah",
      "alex"
    ],
    "favorites": [
      "sarah"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "marcus": {
    "username": "marcus",
    "displayName": "Marcus",
    "headline": "Marcus is organizing a LAN party this weekend for Halo 2 and Smash! 🎮",
    "tagline": "GG NO RE. CRT monitors, Ethernet cables, and Mountain Dew.",
    "mood": "competitive",
    "avatarUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    "bannerUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Hello world! Marcus here.</b></p><p>Competitive gaming enthusiast, PC builder, and hardware tinkerer. Hosting 16-player LAN parties every month.</p>",
    "whoIdLikeToMeetHtml": "<p>Gamers, speedrunners, modders, and Halo 2 clan members.</p>",
    "interestsHtml": "<p><b>Games:</b> Halo 2, Super Smash Bros Melee, StarCraft, Counter-Strike 1.6</p><p><b>Music:</b> System of a Down, Linkin Park, Pendulum</p>",
    "songTitle": "Chop Suey!",
    "songArtist": "System of a Down",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#030712",
      "backgroundPattern": "scanlines",
      "backgroundImageUrl": "",
      "cardColor": "#111827",
      "cardOpacity": 0.95,
      "textColor": "#e5e7eb",
      "headerColor": "#3b82f6",
      "accentColor": "#2563eb",
      "linkHoverColor": "#60a5fa",
      "fontFamily": "\"Courier New\", Courier, monospace",
      "fontSize": "base",
      "borderRadius": "0px",
      "borderStyle": "solid",
      "borderColor": "#3b82f6",
      "borderWidth": "1px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Marcus's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Halo 2 LAN Tournament */\n.profile-card {\n  box-shadow: 2px 2px 0px #3b82f6;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "role": "Smash Rival",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Jordan",
        "username": "jordan",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "role": "DJ beats",
        "status": "offline"
      },
      {
        "id": "f3",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "LAN buddy",
        "status": "away"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Kevin",
        "username": "kevin",
        "avatarUrl": "https://github.com/kevingkday.png",
        "timestamp": "Today at 1:00 PM",
        "contentHtml": "I'm bringing my Gamecube controllers for Smash on Saturday Marcus!"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "kevin",
      "jordan",
      "alex"
    ],
    "favorites": [
      "kevin"
    ],
    "updatedAt": "2026-10-21T21:32:45.365Z"
  },
  "tom": {
    "username": "tom",
    "displayName": "Tom",
    "headline": "Kevin is in your extended network! ;-)",
    "tagline": "Building the friendly web since 2003. Let's connect!",
    "mood": "nostalgic",
    "avatarUrl": "https://github.com/kevingkday.png",
    "bannerUrl": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    "bioHtml": "<p><b>Hi! I'm Kevin.</b></p><p>Welcome to my profile! I enjoy building open platforms where everyone has their own space on the internet.</p><p><i>\"Don't take life too seriously, nobody gets out alive anyway!\"</i></p>",
    "whoIdLikeToMeetHtml": "<p>Old friends, new friends, developers, musicians, and anyone who misses when the internet was creative, customizable, and fun! Drop a comment below! ;-)</p>",
    "interestsHtml": "<p><b>General:</b> Web architecture, retro gaming, vinyl records, film cameras</p><p><b>Music:</b> The Postal Service, Jimmy Eat World, Daft Punk, Modest Mouse</p><p><b>Movies:</b> The Matrix, Eternal Sunshine, Donnie Darko</p>",
    "songTitle": "Such Great Heights",
    "songArtist": "The Postal Service",
    "songAudioUrl": "",
    "tokens": {
      "backgroundColor": "#e6edf5",
      "backgroundPattern": "none",
      "backgroundImageUrl": "",
      "cardColor": "#ffffff",
      "cardOpacity": 1,
      "textColor": "#1f2937",
      "headerColor": "#003366",
      "accentColor": "#0055aa",
      "linkHoverColor": "#cc0000",
      "fontFamily": "Trebuchet MS, sans-serif",
      "fontSize": "base",
      "borderRadius": "4px",
      "borderStyle": "solid",
      "borderColor": "#99b3cc",
      "borderWidth": "1px",
      "boxShadow": "retro-hard"
    },
    "layout": [
      {
        "id": "bio",
        "title": "About Me & Status",
        "column": "left",
        "order": 1,
        "visible": true
      },
      {
        "id": "interests",
        "title": "Interests & Favorites",
        "column": "left",
        "order": 2,
        "visible": true
      },
      {
        "id": "mediaPlayer",
        "title": "Music Player",
        "column": "right",
        "order": 1,
        "visible": true
      },
      {
        "id": "topConnections",
        "title": "Kevin's Top 8 Connections",
        "column": "right",
        "order": 2,
        "visible": true
      },
      {
        "id": "guestbook",
        "title": "Friend Comments & Blurbs",
        "column": "right",
        "order": 3,
        "visible": true
      }
    ],
    "rawCss": "/* Classic MySpace Accent Polish */\n.profile-card {\n  box-shadow: 2px 2px 0px #003366;\n}\n.profile-header h1 {\n  text-shadow: 1px 1px 0px #99b3cc;\n}\na:hover {\n  text-decoration: underline;\n  color: #cc0000;\n}",
    "topFriends": [
      {
        "id": "f1",
        "name": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        "role": "Best Friend",
        "status": "online"
      },
      {
        "id": "f2",
        "name": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "role": "Bassist",
        "status": "away"
      },
      {
        "id": "f3",
        "name": "Maya",
        "username": "maya",
        "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        "role": "Designer",
        "status": "online"
      },
      {
        "id": "f4",
        "name": "Jordan",
        "username": "jordan",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        "role": "DJ",
        "status": "offline"
      },
      {
        "id": "f5",
        "name": "Chloe",
        "username": "chloe",
        "avatarUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
        "role": "Artist",
        "status": "online"
      },
      {
        "id": "f6",
        "name": "Liam",
        "username": "liam",
        "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
        "role": "Skater",
        "status": "away"
      },
      {
        "id": "f7",
        "name": "Zoe",
        "username": "zoe",
        "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
        "role": "Vocalist",
        "status": "offline"
      },
      {
        "id": "f8",
        "name": "Marcus",
        "username": "marcus",
        "avatarUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        "role": "Gamer",
        "status": "online"
      }
    ],
    "guestbook": [
      {
        "id": "g1",
        "author": "Sarah",
        "username": "sarah",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Today at 2:14 PM",
        "contentHtml": "Thanks for the add Kevin!! Love your new profile background! PC4PC? <3"
      },
      {
        "id": "g2",
        "author": "Alex",
        "username": "alex",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        "timestamp": "Yesterday at 9:40 PM",
        "contentHtml": "Awesome song choice bro! Are we practicing this Saturday at the studio?"
      }
    ],
    "passwordHash": "9f5c350ac0afc6b3b92d6192ed38eb86913e88cf1c2cc95654f18fe220f2654db9dea5378fd4eb188ee95d2468d2ba9c4a79d53b2d278638dbfd84d4eb45b531",
    "salt": "ad184984c726add3462dcaa751008621",
    "friends": [
      "sarah",
      "alex",
      "maya",
      "jordan",
      "chloe",
      "liam",
      "zoe",
      "marcus",
      "glitterqueen99"
    ],
    "favorites": [
      "sarah",
      "alex"
    ],
    "updatedAt": "2026-10-21T21:32:45.364Z"
  }
};

export const INITIAL_MESSAGES: DirectMessage[] = [
  {
    "id": "m_1792644325052",
    "fromUsername": "kevin",
    "fromDisplayName": "Kevin",
    "fromAvatarUrl": "https://github.com/kevingkday.png",
    "toUsername": "alex",
    "subject": "Re: New bass tab for Seven Nation Army",
    "body": "Will do!",
    "timestamp": "Just now",
    "read": false
  },
  {
    "id": "m_1792618506519",
    "fromUsername": "alex",
    "fromDisplayName": "Alex",
    "fromAvatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "toUsername": "kevin",
    "subject": "Re: Checking in about the pedals",
    "body": "Yes please bring an extra 1/4 inch cable! See you at 2pm!",
    "timestamp": "Just now",
    "read": false
  },
  {
    "id": "m_1792618506411",
    "fromUsername": "kevin",
    "fromDisplayName": "Kevin",
    "fromAvatarUrl": "https://github.com/kevingkday.png",
    "toUsername": "alex",
    "subject": "Checking in about the pedals",
    "body": "Hey Alex! Do you need an extra patch cable for your Big Muff pedal for rehearsal?",
    "timestamp": "Just now",
    "read": false
  },
  {
    "id": "m1",
    "fromUsername": "glitterqueen99",
    "fromDisplayName": "xX_Glitter_Star_Xx",
    "fromAvatarUrl": "/avatars/glitterqueen.jpg",
    "toUsername": "kevin",
    "subject": "Rawr! Love the retro platform!",
    "body": "OMG Kevin! Teramee is so fun! I added glitter stars to my layout and my cassette player is blasting Paramore. Add me to your Top 8? xD",
    "timestamp": "Today at 3:15 PM",
    "read": false
  },
  {
    "id": "m2",
    "fromUsername": "sarah",
    "fromDisplayName": "Sarah",
    "fromAvatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    "toUsername": "kevin",
    "subject": "Band rehearsal Saturday",
    "body": "Hey Kevin, let me know if you want to try out the new guitar amp this weekend! See you soon.",
    "timestamp": "Yesterday at 8:20 PM",
    "read": true
  },
  {
    "id": "m3",
    "fromUsername": "alex",
    "fromDisplayName": "Alex",
    "fromAvatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    "toUsername": "kevin",
    "subject": "New bass tab for Seven Nation Army",
    "body": "Hey dude, I figured out the alternate bridge lick for Saturday. Check it out when you have a sec!",
    "timestamp": "Today at 1:10 PM",
    "read": true
  },
  {
    "id": "m4",
    "fromUsername": "kevin",
    "fromDisplayName": "Kevin",
    "fromAvatarUrl": "https://github.com/kevingkday.png",
    "toUsername": "sarah",
    "subject": "Re: Band rehearsal Saturday",
    "body": "Sounds awesome Sarah! I will bring the cables and my acoustic just in case. Coffee before at 1?",
    "timestamp": "Today at 11:30 AM",
    "read": false
  },
  {
    "id": "m5",
    "fromUsername": "vampirekitten",
    "fromDisplayName": "VampireKitten",
    "fromAvatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    "toUsername": "glitterqueen99",
    "subject": "OMG mall trip Friday???",
    "body": "Hot Topic has new studded belts and black eyeliner pens on sale 2 for 1! We HAVE to go after class! Rawrrr <3",
    "timestamp": "Today at 2:45 PM",
    "read": false
  },
  {
    "id": "m6",
    "fromUsername": "maya",
    "fromDisplayName": "Maya",
    "fromAvatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    "toUsername": "kevin",
    "subject": "New sticker designs ready!",
    "body": "Hey Kevin! Just finished drawing the pixel icons for the music cassette widget. Let me know what you think!",
    "timestamp": "Today at 2:10 PM",
    "read": false
  }
];
