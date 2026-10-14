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
  { id: 'default', name: 'Nguyên Bản', cost: 0, fill: 0, light: 0, dark: 0 },
  { id: 'gold', name: 'Vàng Hoàng Kim', cost: 5, fill: 0xffd166, light: 0xfff3b0, dark: 0xc98a00 },
  { id: 'ruby', name: 'Đỏ Hồng Ngọc', cost: 5, fill: 0xff4d6d, light: 0xff8fa3, dark: 0xc9184a },
  { id: 'emerald', name: 'Xanh Ngọc Bích', cost: 5, fill: 0x10b981, light: 0x6ee7b7, dark: 0x047857 },
  { id: 'sapphire', name: 'Xanh Lam Bảo', cost: 6, fill: 0x3b82f6, light: 0x93c5fd, dark: 0x1d4ed8 },
  { id: 'amethyst', name: 'Tím Tinh Vân', cost: 6, fill: 0xa855f7, light: 0xd8b4fe, dark: 0x7e22ce },
  { id: 'sakura', name: 'Hồng Anh Đào', cost: 6, fill: 0xff8ad8, light: 0xffc4ec, dark: 0xd645a6 },
  { id: 'sunset', name: 'Cam Hoàng Hôn', cost: 8, fill: 0xf97316, light: 0xfdba74, dark: 0xc2410c },
  { id: 'frost', name: 'Xanh Băng Giá', cost: 8, fill: 0x38bdf8, light: 0xbae6fd, dark: 0x0284c7 },
  { id: 'shadow', name: 'Đen Huyền Bí', cost: 10, fill: 0x334155, light: 0x64748b, dark: 0x0f172a },
];

// Danh sách 46 Nhân vật (6 Nhân vật gốc + 40 Nhân vật mới)
const RAW_SKINS: Array<
  [string, string, string, number, number, HeadTrait, FaceTrait, number, number, number, number]
> = [
  // Trang 1 (1 - 6)
  ['chicken', 'Gà Vàng', 'Tân Binh Qua Đường', 0, 0, 'comb', 'beak', 0xffd93d, 0xfff2a6, 0xd4a012, 0xff5a4e],
  ['frog', 'Ếch Xanh', 'Cao Thủ Nhảy Bè', 6, 8, 'frogEyes', 'frog', 0x3ddc97, 0x9bf5cc, 0x1fa368, 0xff8ad8],
  ['cat', 'Mèo Cam', 'Tia Chớp Phố Thị', 8, 12, 'catEars', 'whiskers', 0xff9f1c, 0xffcf85, 0xd17400, 0xff5a4e],
  ['bunny', 'Thỏ Trắng', 'Bước Nhảy Lò Xo', 10, 16, 'bunnyEars', 'bunny', 0xffffff, 0xffffff, 0xcbd5e1, 0xff8ad8],
  ['duck', 'Vịt Trời', 'Thủy Thủ Vượt Sông', 12, 20, 'duckTuft', 'duckBill', 0x2ec4b6, 0x80eddf, 0x19857b, 0xffc93c],
  ['dragon', 'Rồng Lửa', 'Chiến Binh Lửa Đỏ', 15, 25, 'horns', 'snout', 0xff5a4e, 0xffa39c, 0xc2291f, 0xffc93c],

  // Trang 2 (7 - 12)
  ['corgi', 'Cún Corgi', 'Chân Ngắn Siêu Tốc', 12, 18, 'dogEars', 'cute', 0xf59e0b, 0xfde68a, 0xb45309, 0xffffff],
  ['panda', 'Gấu Trúc', 'Võ Sư Rừng Trúc', 14, 22, 'bearEars', 'panda', 0xf8fafc, 0xffffff, 0xcbd5e1, 0x1e293b],
  ['fox', 'Cáo Đỏ', 'Thợ Săn Nhanh Nhẹn', 15, 24, 'foxEars', 'whiskers', 0xf97316, 0xfdba74, 0xc2410c, 0xffffff],
  ['penguin', 'Cánh Cụt', 'Trượt Băng Cực Nam', 16, 26, 'duckTuft', 'beak', 0x3b82f6, 0x93c5fd, 0x1d4ed8, 0xffc93c],
  ['piggy', 'Heo Hồng', 'Ủn Ỉn Đáng Yêu', 16, 28, 'dogEars', 'snout', 0xff8ad8, 0xffc2eb, 0xd645a6, 0xff5a4e],
  ['bear', 'Gấu Nâu', 'Vệ Sĩ Rừng Già', 18, 30, 'bearEars', 'snout', 0xa16207, 0xd97706, 0x713f12, 0xfde047],

  // Trang 3 (13 - 18)
  ['koala', 'Gấu Koala', 'Ngủ Gật Trên Cây', 18, 32, 'bearEars', 'cute', 0x94a3b8, 0xcbd5e1, 0x475569, 0x1e293b],
  ['lion', 'Sư Tử Vàng', 'Chúa Sơn Lâm', 20, 35, 'mane', 'whiskers', 0xfbbf24, 0xfef08a, 0xb45309, 0xd97706],
  ['tiger', 'Hổ Vằn', 'Mãnh Hổ Vượt Suối', 20, 38, 'catEars', 'whiskers', 0xf97316, 0xfed7aa, 0x9a3412, 0x1e293b],
  ['deer', 'Tuần Lộc', 'Sừng Vàng Mùa Lễ', 22, 40, 'antlers', 'cute', 0xb45309, 0xf59e0b, 0x78350f, 0xef4444],
  ['owl', 'Cú Thông Thái', 'Đôi Mắt Bóng Đêm', 22, 42, 'foxEars', 'beak', 0x8b5cf6, 0xc4b5fd, 0x5b21b6, 0xffc93c],
  ['shark', 'Cá Mập Nhí', 'Sát Thủ Đại Dương', 24, 45, 'sharkFin', 'cute', 0x0ea5e9, 0x7dd3fc, 0x0369a1, 0xffffff],

  // Trang 4 (19 - 24)
  ['dino', 'Khủng Long T-Rex', 'Chúa Tể Tiền Sử', 25, 48, 'dinoSpikes', 'snout', 0x22c55e, 0x86efac, 0x15803d, 0xfacc15],
  ['unicorn', 'Kỳ Lân Hồng', 'Phép Thuật Cầu Vồng', 26, 50, 'unicornHorn', 'cute', 0xf472b6, 0xfbcfe8, 0xdb2777, 0xfacc15],
  ['bee', 'Ong Chăm Chỉ', 'Đôi Cánh Mật Ngọt', 26, 52, 'antennae', 'cute', 0xfacc15, 0xfef08a, 0xca8a04, 0x1e293b],
  ['turtle', 'Rùa Thần Tốc', 'Chậm Mà Chắc', 28, 55, 'helmet', 'frog', 0x10b981, 0x6ee7b7, 0x047857, 0xf59e0b],
  ['monkey', 'Khỉ Tinh Nghịch', 'Vua Leo Trèo', 28, 58, 'bearEars', 'cute', 0xd97706, 0xfbbf24, 0x92400e, 0xfef3c7],
  ['hippo', 'Hà Mã Tím', 'Chuyên Gia Bơi Lội', 30, 60, 'bearEars', 'snout', 0xa855f7, 0xd8b4fe, 0x6b21a8, 0xf472b6],

  // Trang 5 (25 - 30)
  ['croc', 'Cá Sấu Xanh', 'Hàm Răng Đầm Lầy', 30, 62, 'dinoSpikes', 'frog', 0x16a34a, 0x4ade80, 0x14532d, 0xfacc15],
  ['flamingo', 'Hồng Hạc', 'Vũ Điệu Nhiệt Đới', 32, 65, 'duckTuft', 'duckBill', 0xf43f5e, 0xfda4af, 0xbe123c, 0xffc93c],
  ['parrot', 'Vẹt Hải Tặc', 'Sắc Màu Rừng Mưa', 32, 68, 'comb', 'beak', 0xef4444, 0xfca5a5, 0x991b1b, 0x3b82f6],
  ['swan', 'Thiên Nga Trắng', 'Vương Giả Hồ Nước', 34, 70, 'crown', 'duckBill', 0xf8fafc, 0xffffff, 0x94a3b8, 0xfacc15],
  ['hedgehog', 'Nhím Xù Lông', 'Quả Cầu Gai Nhọn', 35, 72, 'dinoSpikes', 'cute', 0x78716c, 0xa8a29e, 0x44403c, 0xfde047],
  ['squirrel', 'Sóc Hạt Dẻ', 'Nhảy Vọt QuaCành', 36, 75, 'foxEars', 'bunny', 0xea580c, 0xfb923c, 0x9a3412, 0xfef3c7],

  // Trang 6 (31 - 36)
  ['sheep', 'Cừu Bông Xốp', 'Đám Mây Biết Đi', 38, 78, 'horns', 'cute', 0xf1f5f9, 0xffffff, 0xcbd5e1, 0x334155],
  ['cow', 'Bò Sữa Vui Vẻ', 'Thảo Nguyên Xanh', 38, 80, 'horns', 'snout', 0xffffff, 0xffffff, 0x94a3b8, 0xf472b6],
  ['wolf', 'Sói Băng Giá', 'Tiếng Hú Đêm Trăng', 40, 82, 'foxEars', 'whiskers', 0x64748b, 0x94a3b8, 0x334155, 0x38bdf8],
  ['racoon', 'Gấu Mèo Siêu Trộm', 'Mặt Nạ Đêm Khuya', 40, 85, 'catEars', 'panda', 0x475569, 0x94a3b8, 0x1e293b, 0xffffff],
  ['axolotl', 'Kỳ Nhông Hồng', 'Nụ Cười Nước Ngọt', 42, 88, 'antlers', 'frog', 0xff8ad8, 0xffc4ec, 0xdb2777, 0xf43f5e],
  ['slime', 'Slime Ngọc Bích', 'Thạch Dẻo Đàn Hồi', 42, 90, 'antennae', 'cute', 0x06b6d4, 0x67e8f9, 0x0e7490, 0xffffff],

  // Trang 7 (37 - 42)
  ['robobot', 'Robot Tia Chớp', 'Trí Tuệ Nhân Tạo', 45, 92, 'antennae', 'visor', 0x3b82f6, 0x93c5fd, 0x1d4ed8, 0x00f5d4],
  ['ninjacat', 'Mèo Ninja', 'Ẩn Thân Phóng Phi Tiêu', 46, 95, 'ninjaBand', 'ninjaMask', 0x1e293b, 0x475569, 0x0f172a, 0xef4444],
  ['knight', 'Hiệp Sĩ Gà', 'Giáp Sắt Dũng Cảm', 48, 98, 'helmet', 'visor', 0x94a3b8, 0xe2e8f0, 0x475569, 0xfacc15],
  ['pirate', 'Vịt Hải Tặc', 'Thuyền Trưởng Bảy Biển', 50, 100, 'pirateHat', 'duckBill', 0x0f766e, 0x2dd4bf, 0x115e59, 0xef4444],
  ['wizard', 'Cú Pháp Sư', 'Bậc Thầy Phép Thuật', 52, 105, 'wizardHat', 'beak', 0x6d28d9, 0xa78bfa, 0x4c1d95, 0xfacc15],
  ['snowman', 'Người Tuyết', 'Mùa Đông Vĩnh Cửu', 55, 110, 'wizardHat', 'beak', 0xe0f2fe, 0xffffff, 0x7dd3fc, 0xf97316],

  // Trang 8 (43 - 46)
  ['alien', 'Khách Vũ Trụ', 'Đĩa Bay Ngân Hà', 58, 115, 'antennae', 'visor', 0x84cc16, 0xbef264, 0x4d7c0f, 0x00f5d4],
  ['phoenix', 'Phượng Hoàng Lửa', 'Đôi Cánh Bất Tử', 65, 120, 'crown', 'beak', 0xff5a4e, 0xfde047, 0xb91c1c, 0xffc93c],
  ['kitsune', 'Cáo Chín Đuôi', 'Huyền Thoại Linh Hồ', 75, 130, 'foxEars', 'whiskers', 0xfffbeb, 0xffffff, 0xf59e0b, 0xef4444],
  ['kingchicken', 'Vua Gà Hoàng Kim', 'Đế Vương Qua Đường', 90, 150, 'crown', 'beak', 0xffc93c, 0xfffbeb, 0xb45309, 0xef4444],
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
