// ============================================================================
// HẰNG SỐ CẤU HÌNH GAME (Crossing Tap - YouTube Playables Edition)
// Độ phân giải dọc 720x1280 đồng bộ với Block Blast & Single Line
// ============================================================================

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

// Vùng an toàn (Safe Zone 5%)
export const SAFE_MARGIN_X = 36;
export const SAFE_MARGIN_Y = 56;

// Kích thước mỗi làn đường (1 ô lưới nhảy tiến lên = 84px)
export const LANE_HEIGHT = 84;
export const PLAYER_SIZE = 58;

// Tọa độ Y thế giới của làn xuất phát (laneIndex = 0)
export const START_WORLD_Y = 960;

// Bảng màu Toy-Box Arcade
export const COLORS = {
  GRASS_LIGHT: 0x65c43e,
  GRASS_DARK: 0x58b433,
  GRASS_SHADOW: 0x459624,
  TREE_TOP: 0x3b8c22,
  TREE_LIGHT: 0x52ad34,

  ROAD: 0x3b4454,
  ROAD_DARK: 0x29303d,
  ROAD_CURB: 0xcbd5e1,
  ROAD_DOUBLE_LINE: 0xffc93c,

  RIVER: 0x22a7f0,
  RIVER_DEEP: 0x1681c4,
  RIVER_FOAM: 0xb3e5fc,

  LOG_FILL: 0x9c6234,
  LOG_LIGHT: 0xbd7d4a,
  LOG_DARK: 0x6b3e1b,
  LOG_RING: 0xe6be99,

  CAR_RED: 0xff5a4e,
  CAR_RED_LIGHT: 0xff948c,
  CAR_RED_DARK: 0xc9352b,

  CAR_BLUE: 0x3b82f6,
  CAR_BLUE_LIGHT: 0x8cc0ff,
  CAR_BLUE_DARK: 0x1d4ed8,

  CAR_YELLOW: 0xffc93c,
  CAR_YELLOW_LIGHT: 0xffe38f,
  CAR_YELLOW_DARK: 0xd49b0b,

  CAR_PURPLE: 0xa855f7,
  CAR_PURPLE_LIGHT: 0xd8b4fe,
  CAR_PURPLE_DARK: 0x7e22ce,

  CAR_GREEN: 0x10b981,
  CAR_GREEN_LIGHT: 0x6ee7b7,
  CAR_GREEN_DARK: 0x047857,

  CAR_ORANGE: 0xf97316,
  CAR_ORANGE_LIGHT: 0xfdba74,
  CAR_ORANGE_DARK: 0xc2410c,

  COIN_GOLD: 0xffc93c,
  COIN_LIGHT: 0xfff0a8,
  COIN_DARK: 0xd98a00,

  INK: 0x16202a,
  CREAM_CARD: 0xfff9ec,
  CREAM_SLOT: 0xf1e6d0,
  SLOT_LOCKED: 0xdce3ec,
  WHITE: 0xffffff,

  BTN_GREEN: 0x2ecc71,
  BTN_AMBER: 0xff9f1c,
  BTN_BLUE: 0x3b82f6,
  BTN_GRAY: 0x94a3b8,
  FOCUS_RING: 0x00f5d4,
};

export const INK_HEX = '#16202a';
export const GOLD_HEX = '#ffc93c';
export const MUTED_HEX = '#5c6b7a';

export const FONT_DISPLAY = '"Bagel Fat One", "Nunito", system-ui, sans-serif';
export const FONT_TEXT = '"Nunito", system-ui, -apple-system, sans-serif';

// Các loại phương tiện giao thông trên đường
export type VehicleKind = 'motorbike' | 'car' | 'sports' | 'van' | 'truck';

// Các trạng thái Thời tiết & Khí hậu đa dạng
export type WeatherKind =
  | 'day'
  | 'sunny'
  | 'sunset'
  | 'rain'
  | 'storm'
  | 'flood'
  | 'snow'
  | 'blizzard'
  | 'fog'
  | 'night';

// Các kiểu hình dáng đầu/phụ kiện của 46 nhân vật
export type HeadTrait =
  | 'comb'
  | 'frogEyes'
  | 'catEars'
  | 'bunnyEars'
  | 'duckTuft'
  | 'horns'
  | 'bearEars'
  | 'dogEars'
  | 'foxEars'
  | 'mane'
  | 'crown'
  | 'unicornHorn'
  | 'ninjaBand'
  | 'pirateHat'
  | 'wizardHat'
  | 'helmet'
  | 'dinoSpikes'
  | 'sharkFin'
  | 'antlers'
  | 'antennae';

export type FaceTrait =
  | 'beak'
  | 'frog'
  | 'whiskers'
  | 'bunny'
  | 'duckBill'
  | 'snout'
  | 'panda'
  | 'visor'
  | 'ninjaMask'
  | 'cute';

export interface SkinDefinition {
  id: string;
  name: string;
  roleTitle: string;
  cost: number;      // Giá mở khóa bằng Xu (sẽ trừ đúng số Xu này khi mua!)
  reqScore: number;  // Điểm kỷ lục cần đạt để mở khóa (hoặc dùng Xu mua thẳng)
  headTrait: HeadTrait;
  faceTrait: FaceTrait;
  fill: number;
  light: number;
  dark: number;
  accent: number;
}

// Bảng màu Nhuộm (Color Dyes) mua bằng Coin để đổi màu cho nhân vật bất kỳ
export interface ColorDyeDefinition {
  id: string;
  name: string;
  cost: number;
  fill: number;
  light: number;
  dark: number;
}

export const COLOR_DYES: ColorDyeDefinition[] = [
  { id: 'default', name: 'Original', cost: 0, fill: 0, light: 0, dark: 0 },
  { id: 'gold', name: 'Royal Gold', cost: 5, fill: 0xffd166, light: 0xfff3b0, dark: 0xc98a00 },
  { id: 'ruby', name: 'Crimson Ruby', cost: 5, fill: 0xff4d6d, light: 0xff8fa3, dark: 0xc9184a },
  { id: 'emerald', name: 'Jade Emerald', cost: 5, fill: 0x10b981, light: 0x6ee7b7, dark: 0x047857 },
  { id: 'sapphire', name: 'Deep Sapphire', cost: 6, fill: 0x3b82f6, light: 0x93c5fd, dark: 0x1d4ed8 },
  { id: 'amethyst', name: 'Nebula Purple', cost: 6, fill: 0xa855f7, light: 0xd8b4fe, dark: 0x7e22ce },
  { id: 'sakura', name: 'Sakura Pink', cost: 6, fill: 0xff8ad8, light: 0xffc4ec, dark: 0xd645a6 },
  { id: 'sunset', name: 'Sunset Blaze', cost: 8, fill: 0xf97316, light: 0xfdba74, dark: 0xc2410c },
  { id: 'frost', name: 'Glacier Frost', cost: 8, fill: 0x38bdf8, light: 0xbae6fd, dark: 0x0284c7 },
  { id: 'shadow', name: 'Shadow Night', cost: 10, fill: 0x334155, light: 0x64748b, dark: 0x0f172a },
];

// Roster of 46 Unlockable Characters (6 Original + 40 New)
const RAW_SKINS: Array<
  [string, string, string, number, number, HeadTrait, FaceTrait, number, number, number, number]
> = [
  // Page 1 (1 - 6)
  ['chicken', 'Golden Chick', 'Rookie Road Crosser', 0, 0, 'comb', 'beak', 0xffd93d, 0xfff2a6, 0xd4a012, 0xff5a4e],
  ['frog', 'Minty Frog', 'River Log Master', 6, 8, 'frogEyes', 'frog', 0x3ddc97, 0x9bf5cc, 0x1fa368, 0xff8ad8],
  ['cat', 'Ginger Cat', 'City Street Sprinter', 8, 12, 'catEars', 'whiskers', 0xff9f1c, 0xffcf85, 0xd17400, 0xff5a4e],
  ['bunny', 'Snow Bunny', 'Spring-Loaded Hopper', 10, 16, 'bunnyEars', 'bunny', 0xffffff, 0xffffff, 0xcbd5e1, 0xff8ad8],
  ['duck', 'Mallard Duck', 'Rapid River Sailor', 12, 20, 'duckTuft', 'duckBill', 0x2ec4b6, 0x80eddf, 0x19857b, 0xffc93c],
  ['dragon', 'Blaze Dragon', 'Crimson Flame Warrior', 15, 25, 'horns', 'snout', 0xff5a4e, 0xffa39c, 0xc2291f, 0xffc93c],

  // Page 2 (7 - 12)
  ['corgi', 'Happy Corgi', 'Short-Legged Turbo', 12, 18, 'dogEars', 'cute', 0xf59e0b, 0xfde68a, 0xb45309, 0xffffff],
  ['panda', 'Bamboo Panda', 'Zen Forest Master', 14, 22, 'bearEars', 'panda', 0xf8fafc, 0xffffff, 0xcbd5e1, 0x1e293b],
  ['fox', 'Swift Fox', 'Nimble Forest Hunter', 15, 24, 'foxEars', 'whiskers', 0xf97316, 0xfdba74, 0xc2410c, 0xffffff],
  ['penguin', 'Ice Penguin', 'Antarctic Glider', 16, 26, 'duckTuft', 'beak', 0x3b82f6, 0x93c5fd, 0x1d4ed8, 0xffc93c],
  ['piggy', 'Rosy Piggy', 'Cheerful Meadow Jumper', 16, 28, 'dogEars', 'snout', 0xff8ad8, 0xffc2eb, 0xd645a6, 0xff5a4e],
  ['bear', 'Grizzly Bear', 'Ancient Woods Guardian', 18, 30, 'bearEars', 'snout', 0xa16207, 0xd97706, 0x713f12, 0xfde047],

  // Page 3 (13 - 18)
  ['koala', 'Sleepy Koala', 'Eucalyptus Dreamer', 18, 32, 'bearEars', 'cute', 0x94a3b8, 0xcbd5e1, 0x475569, 0x1e293b],
  ['lion', 'Golden Lion', 'King of the Savanna', 20, 35, 'mane', 'whiskers', 0xfbbf24, 0xfef08a, 0xb45309, 0xd97706],
  ['tiger', 'Bengal Tiger', 'Fierce Stream Leaper', 20, 38, 'catEars', 'whiskers', 0xf97316, 0xfed7aa, 0x9a3412, 0x1e293b],
  ['deer', 'Star Reindeer', 'Holiday Golden Antlers', 22, 40, 'antlers', 'cute', 0xb45309, 0xf59e0b, 0x78350f, 0xef4444],
  ['owl', 'Mystic Owl', 'Midnight Watcher', 22, 42, 'foxEars', 'beak', 0x8b5cf6, 0xc4b5fd, 0x5b21b6, 0xffc93c],
  ['shark', 'Baby Shark', 'Ocean Wave Dasher', 24, 45, 'sharkFin', 'cute', 0x0ea5e9, 0x7dd3fc, 0x0369a1, 0xffffff],

  // Page 4 (19 - 24)
  ['dino', 'T-Rex Dino', 'Prehistoric Champ', 25, 48, 'dinoSpikes', 'snout', 0x22c55e, 0x86efac, 0x15803d, 0xfacc15],
  ['unicorn', 'Starlight Unicorn', 'Rainbow Magic Dasher', 26, 50, 'unicornHorn', 'cute', 0xf472b6, 0xfbcfe8, 0xdb2777, 0xfacc15],
  ['bee', 'Bumble Bee', 'Sweet Honey Wings', 26, 52, 'antennae', 'cute', 0xfacc15, 0xfef08a, 0xca8a04, 0x1e293b],
  ['turtle', 'Turbo Turtle', 'Slow & Steady Legend', 28, 55, 'helmet', 'frog', 0x10b981, 0x6ee7b7, 0x047857, 0xf59e0b],
  ['monkey', 'Cheeky Monkey', 'Canopy Acrobat', 28, 58, 'bearEars', 'cute', 0xd97706, 0xfbbf24, 0x92400e, 0xfef3c7],
  ['hippo', 'Violet Hippo', 'River Splash Champion', 30, 60, 'bearEars', 'snout', 0xa855f7, 0xd8b4fe, 0x6b21a8, 0xf472b6],

  // Page 5 (25 - 30)
  ['croc', 'Swamp Gator', 'Bayou Snapper', 30, 62, 'dinoSpikes', 'frog', 0x16a34a, 0x4ade80, 0x14532d, 0xfacc15],
  ['flamingo', 'Pink Flamingo', 'Tropical Dancer', 32, 65, 'duckTuft', 'duckBill', 0xf43f5e, 0xfda4af, 0xbe123c, 0xffc93c],
  ['parrot', 'Macaw Parrot', 'Rainforest Flyer', 32, 68, 'comb', 'beak', 0xef4444, 0xfca5a5, 0x991b1b, 0x3b82f6],
  ['swan', 'Royal Swan', 'Graceful Lake Royalty', 34, 70, 'crown', 'duckBill', 0xf8fafc, 0xffffff, 0x94a3b8, 0xfacc15],
  ['hedgehog', 'Spiky Hedgehog', 'Quill Dash Roller', 35, 72, 'dinoSpikes', 'cute', 0x78716c, 0xa8a29e, 0x44403c, 0xfde047],
  ['squirrel', 'Acorn Squirrel', 'Treetop Jumper', 36, 75, 'foxEars', 'bunny', 0xea580c, 0xfb923c, 0x9a3412, 0xfef3c7],

  // Page 6 (31 - 36)
  ['sheep', 'Fluffy Sheep', 'Walking Cloud Puff', 38, 78, 'horns', 'cute', 0xf1f5f9, 0xffffff, 0xcbd5e1, 0x334155],
  ['cow', 'Jolly Dairy Cow', 'Green Pasture Star', 38, 80, 'horns', 'snout', 0xffffff, 0xffffff, 0x94a3b8, 0xf472b6],
  ['wolf', 'Frost Wolf', 'Full Moon Howler', 40, 82, 'foxEars', 'whiskers', 0x64748b, 0x94a3b8, 0x334155, 0x38bdf8],
  ['racoon', 'Bandit Raccoon', 'Midnight Sneaker', 40, 85, 'catEars', 'panda', 0x475569, 0x94a3b8, 0x1e293b, 0xffffff],
  ['axolotl', 'Pink Axolotl', 'Smiling Water Sprite', 42, 88, 'antlers', 'frog', 0xff8ad8, 0xffc4ec, 0xdb2777, 0xf43f5e],
  ['slime', 'Crystal Slime', 'Bouncy Jelly Cube', 42, 90, 'antennae', 'cute', 0x06b6d4, 0x67e8f9, 0x0e7490, 0xffffff],

  // Page 7 (37 - 42)
  ['robobot', 'Cyber Bot', 'AI Traffic Dodger', 45, 92, 'antennae', 'visor', 0x3b82f6, 0x93c5fd, 0x1d4ed8, 0x00f5d4],
  ['ninjacat', 'Shadow Ninja', 'Silent Shuriken Master', 46, 95, 'ninjaBand', 'ninjaMask', 0x1e293b, 0x475569, 0x0f172a, 0xef4444],
  ['knight', 'Sir Cluck-a-Lot', 'Valiant Iron Knight', 48, 98, 'helmet', 'visor', 0x94a3b8, 0xe2e8f0, 0x475569, 0xfacc15],
  ['pirate', 'Captain Quack', 'Seven Seas Buccaneer', 50, 100, 'pirateHat', 'duckBill', 0x0f766e, 0x2dd4bf, 0x115e59, 0xef4444],
  ['wizard', 'Arcane Owl', 'Grand Spellcaster', 52, 105, 'wizardHat', 'beak', 0x6d28d9, 0xa78bfa, 0x4c1d95, 0xfacc15],
  ['snowman', 'Frosty Snowman', 'Eternal Winter Buddy', 55, 110, 'wizardHat', 'beak', 0xe0f2fe, 0xffffff, 0x7dd3fc, 0xf97316],

  // Page 8 (43 - 46)
  ['alien', 'Cosmic Alien', 'Galactic UFO Traveler', 58, 115, 'antennae', 'visor', 0x84cc16, 0xbef264, 0x4d7c0f, 0x00f5d4],
  ['phoenix', 'Solar Phoenix', 'Immortal Firebird', 65, 120, 'crown', 'beak', 0xff5a4e, 0xfde047, 0xb91c1c, 0xffc93c],
  ['kitsune', 'Nine-Tail Kitsune', 'Celestial Spirit Fox', 75, 130, 'foxEars', 'whiskers', 0xfffbeb, 0xffffff, 0xf59e0b, 0xef4444],
  ['kingchicken', 'Golden King Chick', 'Supreme Road Emperor', 90, 150, 'crown', 'beak', 0xffc93c, 0xfffbeb, 0xb45309, 0xef4444],
];

export const SKINS: SkinDefinition[] = RAW_SKINS.map(
  ([id, name, roleTitle, cost, reqScore, headTrait, faceTrait, fill, light, dark, accent]) => ({
    id,
    name,
    roleTitle,
    cost,
    reqScore,
    headTrait,
    faceTrait,
    fill,
    light,
    dark,
    accent,
  })
);

export function getSkinById(id: string): SkinDefinition {
  return SKINS.find((s) => s.id === id) || SKINS[0];
}

export function getDyeById(id: string): ColorDyeDefinition {
  return COLOR_DYES.find((d) => d.id === id) || COLOR_DYES[0];
}
