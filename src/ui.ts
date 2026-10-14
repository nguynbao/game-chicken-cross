import Phaser from 'phaser';
import {
  COLOR_DYES,
  COLORS,
  FONT_DISPLAY,
  FONT_TEXT,
  GAME_HEIGHT,
  GAME_WIDTH,
  INK_HEX,
  SKINS,
  type SkinDefinition,
  type VehicleKind,
} from './constants';
import { progress } from './progress';
import { soundManager } from './audio/SoundManager';

export const REDUCED_MOTION =
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function textStyle(
  size: number,
  weight: '700' | '900' = '900',
  color: string = '#ffffff'
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT_TEXT,
    fontSize: `${size}px`,
    fontStyle: weight,
    color,
  };
}

export function applyTextOutline(
  textObj: Phaser.GameObjects.Text,
  strokeThickness: number = 6,
  shadowOffset: number = 4
): Phaser.GameObjects.Text {
  textObj.setStroke(INK_HEX, strokeThickness);
  textObj.setShadow(0, shadowOffset, INK_HEX, 0, true, true);
  return textObj;
}

/**
 * Vẽ Nhân vật (Hỗ trợ toàn bộ 46 nhân vật + Bảng màu nhuộm + Chế độ Bóng Đen Bí Ẩn ???)
 */
export function drawCharacter(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number,
  skinInput: SkinDefinition,
  isMystery: boolean = false
) {
  // Áp dụng màu nhuộm (Color Dye) nếu nhân vật đã mở khóa
  const skin = isMystery ? skinInput : progress.getStyledSkin(skinInput.id);

  const half = size / 2;
  const r = Math.max(10, Math.round(size * 0.24));
  const o = Math.max(3, Math.round(size * 0.065));
  const lip = Math.max(5, Math.round(size * 0.14));

  const mainFill = isMystery ? 0x263342 : skin.fill;
  const darkFill = isMystery ? 0x16202a : skin.dark;
  const lightFill = isMystery ? 0x3b4d63 : skin.light;
  const accentFill = isMystery ? 0x3b4d63 : skin.accent;

  // 1. Bóng đổ dưới chân
  g.fillStyle(COLORS.INK, 0.28);
  g.fillEllipse(x, y + half - 2, size * 0.92, size * 0.34);

  // 2. Phụ kiện / Hình dáng đầu đặc trưng (HeadTrait)
  const ht = skin.headTrait;
  if (ht === 'mane') {
    // Bờm sư tử bao quanh thân
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - half - 6, y - half - 6, size + 12, size + 10, r + 6);
    g.fillStyle(accentFill, 1);
    g.fillRoundedRect(x - half - 3, y - half - 3, size + 6, size + 4, r + 4);
  } else if (ht === 'bunnyEars') {
    const earW = size * 0.22;
    const earH = size * 0.38;
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - half + 6, y - half - earH + 6, earW + o * 2, earH, 8);
    g.fillRoundedRect(x + half - earW - o * 2 - 6, y - half - earH + 6, earW + o * 2, earH, 8);
    g.fillStyle(mainFill, 1);
    g.fillRoundedRect(x - half + 6 + o, y - half - earH + 6 + o, earW, earH - o, 6);
    g.fillRoundedRect(x + half - earW - o - 6, y - half - earH + 6 + o, earW, earH - o, 6);
    if (!isMystery) {
      g.fillStyle(accentFill, 1);
      g.fillRoundedRect(x - half + 9 + o, y - half - earH + 12, earW - 6, earH - 14, 4);
      g.fillRoundedRect(x + half - earW - o - 3, y - half - earH + 12, earW - 6, earH - 14, 4);
    }
  } else if (ht === 'catEars' || ht === 'foxEars') {
    const hEar = ht === 'foxEars' ? 16 : 12;
    g.fillStyle(COLORS.INK, 1);
    g.fillTriangle(x - half + 2, y - half + 6, x - half + 22, y - half + 6, x - half + 6, y - half - hEar);
    g.fillTriangle(x + half - 2, y - half + 6, x + half - 22, y - half + 6, x + half - 6, y - half - hEar);
    g.fillStyle(mainFill, 1);
    g.fillTriangle(x - half + 6, y - half + 6, x - half + 18, y - half + 6, x - half + 8, y - half - hEar + 5);
    g.fillTriangle(x + half - 6, y - half + 6, x + half - 18, y - half + 6, x + half - 8, y - half - hEar + 5);
  } else if (ht === 'bearEars' || ht === 'dogEars') {
    g.fillStyle(COLORS.INK, 1);
    g.fillCircle(x - half + 8, y - half + 3, size * 0.18);
    g.fillCircle(x + half - 8, y - half + 3, size * 0.18);
    g.fillStyle(ht === 'dogEars' ? accentFill : mainFill, 1);
    g.fillCircle(x - half + 8, y - half + 3, size * 0.12);
    g.fillCircle(x + half - 8, y - half + 3, size * 0.12);
  } else if (ht === 'horns') {
    g.fillStyle(COLORS.INK, 1);
    g.fillTriangle(x - half + 4, y - half + 4, x - half + 18, y - half + 4, x - half - 2, y - half - 14);
    g.fillTriangle(x + half - 4, y - half + 4, x + half - 18, y - half + 4, x + half + 2, y - half - 14);
    g.fillStyle(accentFill, 1);
    g.fillTriangle(x - half + 7, y - half + 4, x - half + 15, y - half + 4, x - half + 2, y - half - 9);
    g.fillTriangle(x + half - 7, y - half + 4, x + half - 15, y - half + 4, x + half - 2, y - half - 9);
  } else if (ht === 'comb' || ht === 'duckTuft') {
    const wComb = ht === 'comb' ? 20 : 14;
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - wComb / 2, y - half - 10, wComb, 14, 6);
    g.fillStyle(accentFill, 1);
    g.fillRoundedRect(x - wComb / 2 + 3, y - half - 7, wComb - 6, 10, 4);
  } else if (ht === 'frogEyes') {
    g.fillStyle(COLORS.INK, 1);
    g.fillCircle(x - size * 0.24, y - half + 2, size * 0.16);
    g.fillCircle(x + size * 0.24, y - half + 2, size * 0.16);
    g.fillStyle(mainFill, 1);
    g.fillCircle(x - size * 0.24, y - half + 2, size * 0.12);
    g.fillCircle(x + size * 0.24, y - half + 2, size * 0.12);
  } else if (ht === 'crown') {
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - 16, y - half - 13, 32, 16, 4);
    g.fillStyle( isMystery ? darkFill : 0xffc93c, 1);
    g.fillTriangle(x - 13, y - half + 2, x - 5, y - half + 2, x - 11, y - half - 11);
    g.fillTriangle(x - 6, y - half + 2, x + 6, y - half + 2, x, y - half - 13);
    g.fillTriangle(x + 5, y - half + 2, x + 13, y - half + 2, x + 11, y - half - 11);
  } else if (ht === 'unicornHorn') {
    g.fillStyle(COLORS.INK, 1);
    g.fillTriangle(x - 8, y - half + 3, x + 8, y - half + 3, x, y - half - 18);
    g.fillStyle(accentFill, 1);
    g.fillTriangle(x - 5, y - half + 3, x + 5, y - half + 3, x, y - half - 13);
  } else if (ht === 'sharkFin' || ht === 'dinoSpikes') {
    g.fillStyle(COLORS.INK, 1);
    g.fillTriangle(x - 9, y - half + 3, x + 9, y - half + 3, x + 2, y - half - 15);
    g.fillStyle(accentFill, 1);
    g.fillTriangle(x - 5, y - half + 3, x + 5, y - half + 3, x + 1, y - half - 10);
  } else if (ht === 'antlers' || ht === 'antennae') {
    g.lineStyle(5, COLORS.INK, 1);
    g.lineBetween(x - 10, y - half + 2, x - 16, y - half - 12);
    g.lineBetween(x + 10, y - half + 2, x + 16, y - half - 12);
    g.fillStyle(accentFill, 1);
    g.fillCircle(x - 16, y - half - 12, 5);
    g.fillCircle(x + 16, y - half - 12, 5);
  } else if (ht === 'wizardHat' || ht === 'pirateHat' || ht === 'helmet') {
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - half - 2, y - half - 8, size + 4, 14, 6);
    if (ht === 'wizardHat') {
      g.fillTriangle(x - 16, y - half - 4, x + 16, y - half - 4, x, y - half - 24);
    }
    g.fillStyle(accentFill, 1);
    g.fillRoundedRect(x - half + 2, y - half - 5, size - 4, 8, 4);
  }

  // 3. Thân chính hình vuông bo góc (Viền mực + Cạnh tối 3D + Mặt sáng)
  g.fillStyle(COLORS.INK, 1);
  g.fillRoundedRect(x - half, y - half, size, size, r);

  g.fillStyle(darkFill, 1);
  g.fillRoundedRect(x - half + o, y - half + o, size - o * 2, size - o * 2, Math.max(4, r - o));

  g.fillStyle(mainFill, 1);
  g.fillRoundedRect(
    x - half + o,
    y - half + o,
    size - o * 2,
    size - o * 2 - lip,
    Math.max(4, r - o)
  );

  // Vệt sáng glint trên đỉnh thân
  g.fillStyle(lightFill, isMystery ? 0.35 : 0.9);
  g.fillRoundedRect(x - half + o + 6, y - half + o + 5, size * 0.36, Math.max(4, size * 0.08), 3);

  // Băng trán Ninja nếu có
  if (ht === 'ninjaBand' && !isMystery) {
    g.fillStyle(accentFill, 1);
    g.fillRect(x - half + o, y - half + o + 6, size - o * 2, 8);
  }

  // Nếu là Bóng Đen Bí Ẩn (???) thì dừng tại đây
  if (isMystery) {
    return;
  }

  // 4. Đôi mắt & Khuôn mặt (FaceTrait)
  const ft = skin.faceTrait;
  const eyeY = ht === 'frogEyes' ? y - half + 4 : y - size * 0.12;
  const eyeOffsetX = size * 0.22;

  if (ft === 'panda') {
    g.fillStyle(COLORS.INK, 1);
    g.fillEllipse(x - eyeOffsetX, eyeY, 13, 10);
    g.fillEllipse(x + eyeOffsetX, eyeY, 13, 10);
  }

  if (ft === 'visor') {
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - size * 0.34, eyeY - 6, size * 0.68, 13, 5);
    g.fillStyle(accentFill, 1);
    g.fillRoundedRect(x - size * 0.3, eyeY - 4, size * 0.6, 9, 4);
  } else {
    g.fillStyle(COLORS.INK, 1);
    g.fillCircle(x - eyeOffsetX, eyeY, Math.max(3.5, size * 0.08));
    g.fillCircle(x + eyeOffsetX, eyeY, Math.max(3.5, size * 0.08));

    g.fillStyle(COLORS.WHITE, 1);
    g.fillCircle(x - eyeOffsetX - 1.2, eyeY - 1.5, Math.max(1.5, size * 0.032));
    g.fillCircle(x + eyeOffsetX - 1.2, eyeY - 1.5, Math.max(1.5, size * 0.032));
  }

  if (ft === 'beak') {
    g.fillStyle(COLORS.INK, 1);
    g.fillTriangle(x - 8, y - 3, x + 8, y - 3, x, y + 9);
    g.fillStyle(COLORS.BTN_AMBER, 1);
    g.fillTriangle(x - 5, y - 1, x + 5, y - 1, x, y + 6);
  } else if (ft === 'duckBill') {
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - 11, y - 3, 22, 11, 5);
    g.fillStyle(accentFill, 1);
    g.fillRoundedRect(x - 8, y - 1, 16, 7, 3.5);
  } else if (ft === 'frog') {
    g.fillStyle(accentFill, 0.85);
    g.fillCircle(x - size * 0.28, y + 2, 5);
    g.fillCircle(x + size * 0.28, y + 2, 5);
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - 8, y + 1, 16, 3.5, 1.5);
  } else if (ft === 'whiskers') {
    g.fillStyle(accentFill, 1);
    g.fillTriangle(x - 5, y - 1, x + 5, y - 1, x, y + 5);
    g.lineStyle(2.5, COLORS.INK, 0.85);
    g.lineBetween(x - 12, y + 1, x - 21, y - 1);
    g.lineBetween(x + 12, y + 1, x + 21, y - 1);
  } else if (ft === 'bunny') {
    g.fillStyle(accentFill, 0.85);
    g.fillCircle(x - size * 0.27, y + 2, 4.5);
    g.fillCircle(x + size * 0.27, y + 2, 4.5);
    g.fillStyle(accentFill, 1);
    g.fillTriangle(x - 4, y - 2, x + 4, y - 2, x, y + 3);
  } else if (ft === 'snout') {
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x - 11, y - 3, 22, 12, 6);
    g.fillStyle(accentFill, 1);
    g.fillRoundedRect(x - 9, y - 1, 18, 8, 4);
    g.fillStyle(COLORS.INK, 1);
    g.fillCircle(x - 4, y + 3, 2);
    g.fillCircle(x + 4, y + 3, 2);
  } else if (ft === 'ninjaMask') {
    g.fillStyle(COLORS.INK, 0.85);
    g.fillRoundedRect(x - half + o + 2, y - 1, size - (o + 2) * 2, half - o - 3, 6);
  } else {
    // cute
    g.fillStyle(0xff8ad8, 0.8);
    g.fillCircle(x - size * 0.26, y + 2, 4.5);
    g.fillCircle(x + size * 0.26, y + 2, 4.5);
    g.fillStyle(COLORS.INK, 1);
    g.fillCircle(x, y, 2.5);
  }
}

/**
 * ============================================================================
 * VẼ ĐA DẠNG CÁC LOẠI PHƯƠNG TIỆN GIAO THÔNG:
 * - 'motorbike': Xe máy nhỏ gọn, có tay lái, đèn tròn và người đội mũ bảo hiểm
 * - 'car': Ô tô Sedan 4 chỗ
 * - 'sports': Xe đua thể thao có sọc đôi & cánh gió đuôi
 * - 'van': Xe bán tải / SUV
 * - 'truck': Xe tải thùng Container cỡ lớn 6 bánh
 * Hỗ trợ bật chùm sáng đèn pha rực rỡ khi trời tối (isNight = true)
 * ============================================================================
 */
export function drawVehicle(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  kind: VehicleKind,
  colorVariant: number,
  direction: 1 | -1,
  isNight: boolean = false
) {
  const palettes = [
    { fill: COLORS.CAR_RED, light: COLORS.CAR_RED_LIGHT, dark: COLORS.CAR_RED_DARK },
    { fill: COLORS.CAR_BLUE, light: COLORS.CAR_BLUE_LIGHT, dark: COLORS.CAR_BLUE_DARK },
    { fill: COLORS.CAR_YELLOW, light: COLORS.CAR_YELLOW_LIGHT, dark: COLORS.CAR_YELLOW_DARK },
    { fill: COLORS.CAR_PURPLE, light: COLORS.CAR_PURPLE_LIGHT, dark: COLORS.CAR_PURPLE_DARK },
    { fill: COLORS.CAR_GREEN, light: COLORS.CAR_GREEN_LIGHT, dark: COLORS.CAR_GREEN_DARK },
    { fill: COLORS.CAR_ORANGE, light: COLORS.CAR_ORANGE_LIGHT, dark: COLORS.CAR_ORANGE_DARK },
  ];
  const pal = palettes[Math.abs(colorVariant) % palettes.length];

  // 1. Chùm sáng đèn pha chiếu dài trên mặt đường khi trời tối (Night Mode)
  if (isNight) {
    g.fillStyle(0xfff3b0, 0.22);
    if (direction === 1) {
      g.fillTriangle(x + w - 4, y + 8, x + w + 115, y - 16, x + w + 115, y + h + 16);
    } else {
      g.fillTriangle(x + 4, y + 8, x - 115, y - 16, x - 115, y + h + 16);
    }
  }

  // 2. Trường hợp XE MÁY (Motorbike)
  if (kind === 'motorbike') {
    const cy = y + h / 2;
    g.fillStyle(COLORS.INK, 0.35);
    g.fillEllipse(x + w / 2, cy + 8, w * 0.95, h * 0.55);

    // Bánh trước & bánh sau
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x + 2, cy - 10, 18, 20, 6);
    g.fillRoundedRect(x + w - 20, cy - 10, 18, 20, 6);

    // Khung thân xe máy
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x + 10, cy - 14, w - 20, 28, 12);
    g.fillStyle(pal.fill, 1);
    g.fillRoundedRect(x + 14, cy - 10, w - 28, 20, 9);

    // Ghi-đông tay lái & Đèn pha
    const handleX = direction === 1 ? x + w - 22 : x + 18;
    g.lineStyle(4, COLORS.INK, 1);
    g.lineBetween(handleX, cy - 18, handleX, cy + 18);

    const headLightX = direction === 1 ? x + w - 8 : x + 4;
    g.fillStyle(0xfffbeb, 1);
    g.fillCircle(headLightX, cy, 5);

    // Mũ bảo hiểm người lái ở giữa xe
    const riderX = direction === 1 ? x + w * 0.44 : x + w * 0.56;
    g.fillStyle(COLORS.INK, 1);
    g.fillCircle(riderX, cy - 2, 14);
    g.fillStyle(pal.light, 1);
    g.fillCircle(riderX, cy - 3, 10);
    g.fillStyle(0x1e293b, 1);
    g.fillRoundedRect(direction === 1 ? riderX + 2 : riderX - 10, cy - 8, 8, 10, 3);
    return;
  }

  // 3. Trường hợp XE TẢI LỚN (Truck - Đầu kéo + Thùng Container)
  if (kind === 'truck') {
    const o = 4;
    g.fillStyle(COLORS.INK, 0.35);
    g.fillRoundedRect(x + 4, y + 6, w, h, 12);

    // 6 Bánh xe tải
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(x + 14, y - 4, 20, h + 8, 4);
    g.fillRoundedRect(x + w / 2 - 10, y - 4, 20, h + 8, 4);
    g.fillRoundedRect(x + w - 34, y - 4, 20, h + 8, 4);

    const cabW = 54;
    const trailerW = w - cabW - 6;
    const cabX = direction === 1 ? x + w - cabW : x;
    const trailerX = direction === 1 ? x : x + cabW + 6;

    // Khớp nối giữa đầu kéo và thùng xe
    g.fillStyle(COLORS.INK, 1);
    g.fillRect(x + 20, y + h / 2 - 6, w - 40, 12);

    // Đầu kéo Cabin
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(cabX, y + 3, cabW, h - 6, 12);
    g.fillStyle(pal.dark, 1);
    g.fillRoundedRect(cabX + o, y + 3 + o, cabW - o * 2, h - 6 - o * 2, 9);
    g.fillStyle(pal.fill, 1);
    g.fillRoundedRect(cabX + o, y + 3 + o, cabW - o * 2, h - 12 - o * 2, 9);

    // Kính chắn gió đầu kéo
    const windX = direction === 1 ? cabX + cabW - 20 : cabX + 6;
    g.fillStyle(0xdbeafe, 1);
    g.fillRoundedRect(windX, y + 10, 14, h - 22, 5);

    // Thùng Container lớn phía sau
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(trailerX, y, trailerW, h, 10);
    g.fillStyle(0xe2e8f0, 1);
    g.fillRoundedRect(trailerX + o, y + o, trailerW - o * 2, h - o * 2 - 6, 7);
    g.fillStyle(pal.fill, 1);
    g.fillRect(trailerX + o, y + h / 2 - 5, trailerW - o * 2, 10);

    // Các gờ sóng trên nóc thùng container
    g.fillStyle(0xcbd5e1, 1);
    for (let rx = trailerX + 16; rx < trailerX + trailerW - 14; rx += 22) {
      g.fillRect(rx, y + 8, 6, h - 22);
    }

    // Đèn pha đầu kéo
    const frontLightX = direction === 1 ? x + w - 5 : x + 1;
    g.fillStyle(0xfffbeb, 1);
    g.fillRoundedRect(frontLightX, y + 9, 4, 10, 2);
    g.fillRoundedRect(frontLightX, y + h - 21, 4, 10, 2);
    return;
  }

  // 4. Trường hợp Ô TÔ CON ('car'), XE THỂ THAO ('sports') và XE BÁN TẢI ('van')
  const r = 14;
  const o = 4;

  g.fillStyle(COLORS.INK, 0.35);
  g.fillRoundedRect(x + 3, y + 6, w, h, r);

  // 4 Bánh xe
  g.fillStyle(COLORS.INK, 1);
  g.fillRoundedRect(x + 14, y - 4, 20, h + 8, 5);
  g.fillRoundedRect(x + w - 34, y - 4, 20, h + 8, 5);

  // Khung xe
  g.fillStyle(COLORS.INK, 1);
  g.fillRoundedRect(x, y, w, h, r);
  g.fillStyle(pal.dark, 1);
  g.fillRoundedRect(x + o, y + o, w - o * 2, h - o * 2, r - 3);
  g.fillStyle(pal.fill, 1);
  g.fillRoundedRect(x + o, y + o, w - o * 2, h - o * 2 - 7, r - 3);

  // Nếu là Xe Đua Thể Thao ('sports'): Thêm sọc trắng dọc thân & cánh gió sau
  if (kind === 'sports') {
    g.fillStyle(COLORS.WHITE, 0.88);
    g.fillRect(x + o + 4, y + h / 2 - 4, w - (o + 4) * 2, 6);
    const spoilerX = direction === 1 ? x + 5 : x + w - 13;
    g.fillStyle(COLORS.INK, 1);
    g.fillRoundedRect(spoilerX, y + 5, 8, h - 14, 3);
  }

  // Cabin & kính chắn gió
  const cabinW = kind === 'van' ? Math.round(w * 0.68) : Math.round(w * 0.54);
  const cabinX = direction === 1 ? x + w - cabinW - 16 : x + 16;
  g.fillStyle(COLORS.INK, 1);
  g.fillRoundedRect(cabinX - 2, y + 6, cabinW + 4, h - 16, 8);
  g.fillStyle(0xdbeafe, 1);
  g.fillRoundedRect(cabinX, y + 8, cabinW, h - 20, 6);

  g.fillStyle(pal.light, 1);
  const roofX = direction === 1 ? cabinX + 4 : cabinX + 14;
  g.fillRoundedRect(roofX, y + 9, cabinW - 18, h - 22, 5);

  // Đèn pha & Đèn hậu
  const frontX = direction === 1 ? x + w - 6 : x + 2;
  const backX = direction === 1 ? x + 2 : x + w - 6;
  g.fillStyle(0xfffbeb, 1);
  g.fillRoundedRect(frontX, y + 8, 4, 10, 2);
  g.fillRoundedRect(frontX, y + h - 20, 4, 10, 2);
  g.fillStyle(0xff5a4e, 1);
  g.fillRoundedRect(backX, y + 10, 4, 8, 2);
  g.fillRoundedRect(backX, y + h - 20, 4, 8, 2);
}

/**
 * Vẽ Khúc gỗ nổi trên sông
 */
export function drawLog(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const r = 16;
  const o = 4;

  g.fillStyle(COLORS.RIVER_DEEP, 0.75);
  g.fillRoundedRect(x + 2, y + 6, w, h, r);

  g.fillStyle(COLORS.INK, 1);
  g.fillRoundedRect(x, y, w, h, r);

  g.fillStyle(COLORS.LOG_DARK, 1);
  g.fillRoundedRect(x + o, y + o, w - o * 2, h - o * 2, r - 3);

  g.fillStyle(COLORS.LOG_FILL, 1);
  g.fillRoundedRect(x + o, y + o, w - o * 2, h - o * 2 - 8, r - 3);

  g.fillStyle(COLORS.LOG_RING, 0.9);
  g.fillRoundedRect(x + 8, y + 10, 10, h - 24, 5);

  g.fillStyle(COLORS.LOG_LIGHT, 0.9);
  g.fillRoundedRect(x + 26, y + 12, Math.max(24, w * 0.42), 6, 3);
  g.fillRoundedRect(x + w * 0.36, y + h - 24, Math.max(24, w * 0.46), 6, 3);
}

export function drawSideTree(g: Phaser.GameObjects.Graphics, cx: number, cy: number, scale: number = 1) {
  const r = 24 * scale;
  g.fillStyle(COLORS.INK, 0.25);
  g.fillEllipse(cx + 3, cy + r * 0.75, r * 1.8, r * 0.75);

  g.fillStyle(COLORS.INK, 1);
  g.fillCircle(cx, cy, r + 4);
  g.fillStyle(COLORS.TREE_TOP, 1);
  g.fillCircle(cx, cy + 2, r);
  g.fillStyle(COLORS.TREE_LIGHT, 1);
  g.fillCircle(cx - r * 0.22, cy - r * 0.2, r * 0.65);
}

export function drawCoin(g: Phaser.GameObjects.Graphics, cx: number, cy: number, radius: number = 16) {
  g.fillStyle(COLORS.INK, 1);
  g.fillCircle(cx, cy, radius + 3.5);

  g.fillStyle(COLORS.COIN_DARK, 1);
  g.fillCircle(cx, cy + 1, radius);

  g.fillStyle(COLORS.COIN_GOLD, 1);
  g.fillCircle(cx, cy - 1, radius - 2);

  g.fillStyle(COLORS.COIN_LIGHT, 1);
  g.fillRoundedRect(cx - 3, cy - radius * 0.48, 6, radius * 0.96, 2);
}

export interface ChunkyButton {
  container: Phaser.GameObjects.Container;
  face: Phaser.GameObjects.Container;
  setFocused: (focused: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  trigger: () => void;
}

export function createChunkyButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  onPress: () => void,
  opts: { radius?: number; shadow?: number; outline?: number } = {}
): ChunkyButton {
  const radius = opts.radius ?? 22;
  const shadow = opts.shadow ?? 8;
  const outline = opts.outline ?? 4;

  const container = scene.add.container(x, y);

  const shadowG = scene.add.graphics();
  shadowG.fillStyle(COLORS.INK, 1);
  shadowG.fillRoundedRect(-w / 2, -h / 2 + shadow, w, h, radius);
  container.add(shadowG);

  const face = scene.add.container(0, 0);
  const faceG = scene.add.graphics();
  faceG.fillStyle(COLORS.INK, 1);
  faceG.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
  faceG.fillStyle(fill, 1);
  faceG.fillRoundedRect(
    -w / 2 + outline,
    -h / 2 + outline,
    w - outline * 2,
    h - outline * 2,
    Math.max(4, radius - outline)
  );
  faceG.fillStyle(COLORS.WHITE, 0.22);
  faceG.fillRoundedRect(
    -w / 2 + outline + 10,
    -h / 2 + outline + 5,
    w - (outline + 10) * 2,
    6,
    3
  );
  face.add(faceG);
  container.add(face);

  const focusRing = scene.add.graphics();
  focusRing.lineStyle(4, COLORS.FOCUS_RING, 1);
  focusRing.strokeRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + shadow + 10, radius + 4);
  focusRing.setVisible(false);
  container.add(focusRing);

  const hitW = Math.max(48, w);
  const hitH = Math.max(48, h + shadow);
  const zone = scene.add.zone(0, shadow / 2, hitW, hitH).setInteractive({ useHandCursor: true });
  container.add(zone);

  let enabled = true;
  const release = () => {
    face.y = 0;
  };

  zone.on('pointerdown', () => {
    if (!enabled) return;
    face.y = shadow - 2;
  });
  zone.on('pointerout', release);
  zone.on('pointerup', () => {
    if (!enabled || face.y === 0) return;
    release();
    onPress();
  });

  return {
    container,
    face,
    setFocused(focused: boolean) {
      focusRing.setVisible(focused);
    },
    setEnabled(on: boolean) {
      enabled = on;
      container.setAlpha(on ? 1 : 0.55);
    },
    trigger() {
      if (!enabled) return;
      onPress();
    },
  };
}

export type IconKind = 'home' | 'sound' | 'muted' | 'shop' | 'restart';

export function createIconButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: IconKind,
  onPress: () => void,
  fill: number = COLORS.CREAM_CARD
) {
  const size = 64;
  const btn = createChunkyButton(scene, x, y, size, size, fill, onPress, {
    radius: 18,
    shadow: 6,
    outline: 4,
  });

  const icon = scene.add.graphics();
  btn.face.add(icon);

  const draw = (k: IconKind) => {
    icon.clear();
    icon.fillStyle(COLORS.INK, 1);
    icon.lineStyle(4, COLORS.INK, 1);

    if (k === 'home') {
      icon.fillTriangle(-15, 0, 0, -14, 15, 0);
      icon.fillRoundedRect(-10, -1, 20, 15, 3);
      icon.fillStyle(fill, 1);
      icon.fillRoundedRect(-3.5, 4, 7, 10, 2);
    } else if (k === 'shop') {
      icon.fillRoundedRect(-13, -3, 26, 17, 4);
      icon.beginPath();
      icon.arc(0, -3, 8, Math.PI, 0);
      icon.strokePath();
      icon.fillStyle(COLORS.COIN_GOLD, 1);
      icon.fillCircle(0, 5, 4.5);
    } else if (k === 'restart') {
      icon.beginPath();
      icon.arc(0, 0, 12, -Math.PI * 0.35, Math.PI * 1.4);
      icon.strokePath();
      icon.fillTriangle(4, -17, 14, -9, 3, -5);
    } else {
      icon.fillRect(-15, -6, 8, 12);
      icon.fillPoints(
        [
          new Phaser.Math.Vector2(-8, -6),
          new Phaser.Math.Vector2(2, -14),
          new Phaser.Math.Vector2(2, 14),
          new Phaser.Math.Vector2(-8, 6),
        ],
        true
      );
      if (k === 'sound') {
        icon.beginPath();
        icon.arc(4, 0, 7, -0.85, 0.85);
        icon.strokePath();
        icon.beginPath();
        icon.arc(4, 0, 13, -0.85, 0.85);
        icon.strokePath();
      } else {
        icon.lineBetween(8, -6, 18, 6);
        icon.lineBetween(18, -6, 8, 6);
      }
    }
  };

  draw(kind);

  return { ...btn, setIcon: draw };
}

/**
 * ============================================================================
 * HIỆU ỨNG PHÓNG TO NHÂN VẬT KHI MỞ KHÓA THÀNH CÔNG (UNLOCK ZOOM CELEBRATION)
 * Phóng to nhân vật lên kích thước cực đại ở chính giữa màn hình kèm hào quang xoay
 * và pháo giấy chúc mừng khi người chơi giải mã thành công một nhân vật mới!
 * ============================================================================
 */
export function playUnlockRevealAnimation(
  scene: Phaser.Scene,
  skin: SkinDefinition,
  onComplete?: () => void
) {
  const overlay = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(320);

  // Lớp nền tối làm nổi bật nhân vật
  const bg = scene.add.graphics();
  bg.fillStyle(COLORS.INK, 0.86);
  bg.fillRect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT);
  overlay.add(bg);

  const hitZone = scene.add
    .zone(0, 0, GAME_WIDTH, GAME_HEIGHT)
    .setInteractive({ useHandCursor: true });
  overlay.add(hitZone);

  // Hào quang tia sáng vàng xoay tròn phía sau nhân vật
  const rays = scene.add.graphics();
  rays.fillStyle(COLORS.COIN_GOLD, 0.25);
  for (let i = 0; i < 12; i++) {
    const a1 = (i * Math.PI * 2) / 12;
    const a2 = a1 + Math.PI / 18;
    rays.fillTriangle(
      0,
      0,
      Math.cos(a1) * 340,
      Math.sin(a1) * 340,
      Math.cos(a2) * 340,
      Math.sin(a2) * 340
    );
  }
  rays.fillStyle(COLORS.WHITE, 0.2);
  rays.fillCircle(0, 0, 145);
  overlay.add(rays);

  if (!REDUCED_MOTION) {
    scene.tweens.add({
      targets: rays,
      angle: 360,
      duration: 6000,
      repeat: -1,
    });
  }

  // Container chứa nhân vật được phóng to
  const heroHolder = scene.add.container(0, -30);
  const heroGfx = scene.add.graphics();
  drawCharacter(heroGfx, 0, 0, 120, skin, false);
  heroHolder.add(heroGfx);
  overlay.add(heroHolder);

  // Pháo giấy màu sắc bung ra xung quanh
  if (!REDUCED_MOTION) {
    for (let i = 0; i < 20; i++) {
      const p = scene.add.graphics();
      const colors = [COLORS.COIN_GOLD, COLORS.BTN_GREEN, COLORS.CAR_RED, COLORS.CAR_BLUE, skin.fill];
      p.fillStyle(COLORS.INK, 1);
      p.fillCircle(0, 0, 11);
      p.fillStyle(colors[i % colors.length], 1);
      p.fillCircle(0, 0, 8);
      p.setPosition(0, -30);
      overlay.add(p);

      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.2;
      const dist = 160 + Math.random() * 120;
      scene.tweens.add({
        targets: p,
        x: Math.cos(angle) * dist,
        y: -30 + Math.sin(angle) * dist,
        scale: 0.1,
        alpha: 0,
        duration: 650,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  // Tiêu đề & Tên nhân vật mới mở khóa
  const headerTxt = applyTextOutline(
    scene.add.text(0, -270, 'MỞ KHÓA THÀNH CÔNG!', textStyle(42, '900', '#ffd166')).setOrigin(0.5),
    9,
    6
  );
  const nameTxt = applyTextOutline(
    scene.add
      .text(0, 155, skin.name.toUpperCase(), {
        fontFamily: FONT_DISPLAY,
        fontSize: '58px',
        color: '#ffffff',
      })
      .setOrigin(0.5),
    10,
    7
  );
  const roleTxt = applyTextOutline(
    scene.add.text(0, 218, skin.roleTitle, textStyle(26, '900', '#86efac')).setOrigin(0.5),
    6,
    3
  );
  const tapHint = applyTextOutline(
    scene.add.text(0, 300, 'Chạm bất kỳ đâu để tiếp tục', textStyle(22, '700', '#e2e8f0')).setOrigin(0.5),
    5,
    2
  );
  overlay.add([headerTxt, nameTxt, roleTxt, tapHint]);

  // Hiệu ứng Phóng To Nhân Vật (Scale từ nhỏ -> Phóng cực đại 1.85x -> Nhịp thở)
  if (!REDUCED_MOTION) {
    heroHolder.setScale(0.2);
    scene.tweens.add({
      targets: heroHolder,
      scale: 1.85,
      duration: 380,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: heroHolder,
          scale: 1.65,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });
  } else {
    heroHolder.setScale(1.65);
  }

  let closed = false;
  const dismiss = () => {
    if (closed) return;
    closed = true;
    soundManager.playClick();
    overlay.destroy();
    onComplete?.();
  };

  // Cho phép đóng sau 350ms để người chơi kịp chiêm ngưỡng hiệu ứng phóng to
  scene.time.delayedCall(350, () => {
    hitZone.on('pointerdown', dismiss);
  });
}

/**
 * ============================================================================
 * MENU BỘ SƯU TẬP 46 NHÂN VẬT [???] & CỬA HÀNG ĐỔI MÀU (COLOR DYE SHOP)
 * - Phân trang 46 nhân vật (6 nhân vật / trang).
 * - Nhân vật chưa mở khóa hiển thị Bóng Đen Bí Ẩn + "?" + Tên "???".
 * - Mua nhân vật sẽ TRỪ TIỀN XU ngay lập tức và kích hoạt Hiệu Ứng Phóng To!
 * - Thanh Đổi Màu Nhân Vật (10 màu sắc mua bằng Coin).
 * ============================================================================
 */
export function openShopModal(scene: Phaser.Scene, onClose: () => void) {
  const root = scene.add.container(0, 0).setDepth(250);

  const backdrop = scene.add.graphics();
  backdrop.fillStyle(COLORS.INK, 0.78);
  backdrop.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  root.add(backdrop);

  const blockerZone = scene.add
    .zone(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT)
    .setInteractive();
  root.add(blockerZone);

  const card = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  root.add(card);

  const cardW = 668;
  const cardH = 1040;

  const panelG = scene.add.graphics();
  panelG.fillStyle(COLORS.INK, 1);
  panelG.fillRoundedRect(-cardW / 2, -cardH / 2 + 12, cardW, cardH, 36);
  panelG.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 36);
  panelG.fillStyle(COLORS.CREAM_CARD, 1);
  panelG.fillRoundedRect(-cardW / 2 + 6, -cardH / 2 + 6, cardW - 12, cardH - 12, 30);
  card.add(panelG);

  // Tiêu đề & Hộp Tiền Xu hiện có (y = -472)
  const headerY = -472;
  const title = scene.add
    .text(-110, headerY, 'NHÂN VẬT & ĐỔI MÀU', {
      fontFamily: FONT_TEXT,
      fontSize: '30px',
      fontStyle: '900',
      color: INK_HEX,
    })
    .setOrigin(0.5);
  card.add(title);

  const coinBar = scene.add.graphics();
  coinBar.fillStyle(COLORS.INK, 1);
  coinBar.fillRoundedRect(115, headerY - 26, 185, 52, 26);
  coinBar.fillStyle(COLORS.WHITE, 1);
  coinBar.fillRoundedRect(119, headerY - 22, 177, 44, 22);
  drawCoin(coinBar, 148, headerY, 13);
  card.add(coinBar);

  const coinBalanceText = scene.add
    .text(174, headerY, `${progress.coins} XU`, textStyle(22, '900', '#d97706'))
    .setOrigin(0, 0.5);
  card.add(coinBalanceText);

  // Khu vực ĐỔI MÀU NHÂN VẬT (-434 -> -322)
  const dyePanelG = scene.add.graphics();
  dyePanelG.fillStyle(COLORS.CREAM_SLOT, 1);
  dyePanelG.fillRoundedRect(-cardW / 2 + 24, -434, cardW - 48, 112, 22);
  card.add(dyePanelG);

  const dyeHeaderText = scene.add
    .text(0, -410, '', textStyle(18, '900', INK_HEX))
    .setOrigin(0.5);
  card.add(dyeHeaderText);

  const dyeRowContainer = scene.add.container(0, -362);
  card.add(dyeRowContainer);

  // Phân trang 46 nhân vật (6 nhân vật mỗi trang => 8 trang)
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(SKINS.length / ITEMS_PER_PAGE);
  const activeSkinIndex = SKINS.findIndex((s) => s.id === progress.selectedSkin);
  let currentPage = activeSkinIndex >= 0 ? Math.floor(activeSkinIndex / ITEMS_PER_PAGE) : 0;

  const gridContainer = scene.add.container(0, 0);
  card.add(gridContainer);

  // Thanh chuyển trang (y = 364, nằm dưới Hàng 2 kết thúc ở +318)
  const pageY = 364;
  const prevPageBtn = createChunkyButton(
    scene,
    -195,
    pageY,
    80,
    50,
    COLORS.WHITE,
    () => {
      soundManager.playClick();
      currentPage = (currentPage - 1 + totalPages) % totalPages;
      renderAll();
    },
    { radius: 16, shadow: 5, outline: 3 }
  );
  prevPageBtn.face.add(scene.add.text(0, -2, '◀', textStyle(22, '900', INK_HEX)).setOrigin(0.5));
  card.add(prevPageBtn.container);

  const nextPageBtn = createChunkyButton(
    scene,
    195,
    pageY,
    80,
    50,
    COLORS.WHITE,
    () => {
      soundManager.playClick();
      currentPage = (currentPage + 1) % totalPages;
      renderAll();
    },
    { radius: 16, shadow: 5, outline: 3 }
  );
  nextPageBtn.face.add(scene.add.text(0, -2, '▶', textStyle(22, '900', INK_HEX)).setOrigin(0.5));
  card.add(nextPageBtn.container);

  const pageLabel = scene.add
    .text(0, pageY, '', textStyle(20, '900', INK_HEX))
    .setOrigin(0.5);
  card.add(pageLabel);

  const statusBanner = scene.add
    .text(
      0,
      414,
      `Đã mở khóa ${progress.unlockedSkins.length}/${SKINS.length} nhân vật`,
      textStyle(18, '900', '#475569')
    )
    .setOrigin(0.5);
  card.add(statusBanner);

  // Nút Đóng Cửa Hàng (y = 468)
  const closeBtn = createChunkyButton(
    scene,
    0,
    468,
    460,
    68,
    COLORS.BTN_GREEN,
    () => {
      soundManager.playClick();
      cleanupAndClose();
    },
    { radius: 22, shadow: 7, outline: 4 }
  );
  closeBtn.face.add(
    applyTextOutline(
      scene.add.text(0, 0, 'TIẾP TỤC CHƠI', textStyle(26, '900', '#ffffff')).setOrigin(0.5),
      6,
      3
    )
  );
  card.add(closeBtn.container);

  // Vẽ thanh 10 Màu Nhuộm (Color Dyes)
  const renderDyeBar = () => {
    dyeRowContainer.removeAll(true);
    const currentSkin = SKINS.find((s) => s.id === progress.selectedSkin) || SKINS[0];
    const currentDye = progress.getSelectedDyeForSkin(currentSkin.id);

    dyeHeaderText.setText(
      `ĐỔI MÀU CHO [${currentSkin.name.toUpperCase()}] • Đang dùng: ${currentDye.name}`
    );

    const spacing = 58;
    const startX = -((COLOR_DYES.length - 1) * spacing) / 2;

    COLOR_DYES.forEach((dye, idx) => {
      const dx = startX + idx * spacing;
      const unlocked = progress.isDyeUnlocked(dye.id);
      const isSelected = currentDye.id === dye.id;
      const swatchColor = dye.id === 'default' ? currentSkin.fill : dye.fill;

      const g = scene.add.graphics();
      if (isSelected) {
        g.fillStyle(COLORS.BTN_GREEN, 1);
        g.fillCircle(dx, 0, 25);
      }
      g.fillStyle(COLORS.INK, 1);
      g.fillCircle(dx, 0, 21);
      g.fillStyle(swatchColor, 1);
      g.fillCircle(dx, 0, 17);
      dyeRowContainer.add(g);

      if (!unlocked) {
        const priceTag = applyTextOutline(
          scene.add.text(dx, 2, `${dye.cost}`, textStyle(14, '900', '#ffffff')).setOrigin(0.5),
          4,
          1
        );
        dyeRowContainer.add(priceTag);
      } else if (isSelected) {
        const checkTag = applyTextOutline(
          scene.add.text(dx, 0, '✓', textStyle(16, '900', '#ffffff')).setOrigin(0.5),
          4,
          1
        );
        dyeRowContainer.add(checkTag);
      }

      const hit = scene.add.zone(dx, 0, 50, 50).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        const res = progress.buyOrSelectDye(currentSkin.id, dye);
        if (res === 'bought') {
          soundManager.playUnlock();
          statusBanner.setText(`Đã mua màu [${dye.name}] (-${dye.cost} Xu)!`);
          renderAll();
        } else if (res === 'selected') {
          soundManager.playClick();
          statusBanner.setText(`Đã đổi sang màu [${dye.name}]!`);
          renderAll();
        } else {
          soundManager.playCrash();
          statusBanner.setText(`Cần ${dye.cost} Xu để mở khóa màu [${dye.name}]!`);
        }
      });
      dyeRowContainer.add(hit);
    });
  };

  // Vẽ lưới 6 nhân vật của trang hiện tại (3 hàng x 2 cột cân đối, sát ngay dưới khung Đổi Màu)
  const renderAll = () => {
    coinBalanceText.setText(`${progress.coins} XU`);
    pageLabel.setText(
      `TRANG ${currentPage + 1} / ${totalPages}  (${progress.unlockedSkins.length}/${SKINS.length})`
    );
    renderDyeBar();

    gridContainer.removeAll(true);

    const pageSkins = SKINS.slice(
      currentPage * ITEMS_PER_PAGE,
      (currentPage + 1) * ITEMS_PER_PAGE
    );

    const colWidth = 294;
    const rowHeight = 198;
    const startX = -colWidth / 2 - 12;
    const startY = -205;

    pageSkins.forEach((skin, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = startX + col * (colWidth + 24);
      const cy = startY + row * (rowHeight + 14);

      const isUnlocked = progress.isSkinUnlocked(skin.id);
      const isSelected = progress.selectedSkin === skin.id;
      const { reachedMilestone, hasEnoughCoins } = progress.canUnlockSkin(skin);
      const styledSkin = progress.getStyledSkin(skin);

      const slotG = scene.add.graphics();
      slotG.fillStyle(COLORS.INK, 1);
      slotG.fillRoundedRect(cx - colWidth / 2, cy - rowHeight / 2, colWidth, rowHeight, 22);

      const slotBg = isSelected
        ? 0xfff0c2
        : isUnlocked
        ? COLORS.WHITE
        : hasEnoughCoins
        ? 0xfef3c7
        : COLORS.SLOT_LOCKED;
      slotG.fillStyle(slotBg, 1);
      slotG.fillRoundedRect(
        cx - colWidth / 2 + 4,
        cy - rowHeight / 2 + 4,
        colWidth - 8,
        rowHeight - 8,
        18
      );

      if (isSelected) {
        slotG.lineStyle(4, COLORS.BTN_GREEN, 1);
        slotG.strokeRoundedRect(
          cx - colWidth / 2 + 4,
          cy - rowHeight / 2 + 4,
          colWidth - 8,
          rowHeight - 8,
          18
        );
      }

      const avatarY = cy - 42;
      drawCharacter(slotG, cx, avatarY, 58, styledSkin, !isUnlocked);
      gridContainer.add(slotG);

      // Nếu chưa mở khóa: Hiển thị dấu "?" trên bóng đen và tên là "???"
      if (!isUnlocked) {
        const qMark = applyTextOutline(
          scene.add
            .text(cx, avatarY - 2, '?', {
              fontFamily: FONT_DISPLAY,
              fontSize: '32px',
              color: '#ffc93c',
            })
            .setOrigin(0.5),
          6,
          3
        );
        gridContainer.add(qMark);
      }

      const displayName = isUnlocked ? skin.name : '???';
      const nameText = scene.add
        .text(cx, cy + 8, displayName, {
          fontFamily: FONT_TEXT,
          fontSize: '21px',
          fontStyle: '900',
          color: isUnlocked ? INK_HEX : '#334155',
        })
        .setOrigin(0.5);

      const subString = isUnlocked
        ? skin.roleTitle
        : reachedMilestone
        ? `Đã đạt mốc điểm • Giá: ${skin.cost} Xu`
        : `Mốc điểm ${skin.reqScore} • Giá: ${skin.cost} Xu`;
      const subText = scene.add
        .text(cx, cy + 31, subString, {
          fontFamily: FONT_TEXT,
          fontSize: '13px',
          fontStyle: '700',
          color: isUnlocked ? '#16a34a' : hasEnoughCoins ? '#d97706' : '#64748b',
        })
        .setOrigin(0.5);

      gridContainer.add([nameText, subText]);

      let btnFill = COLORS.BTN_GRAY;
      let btnLabel = `🔒 GIÁ ${skin.cost} XU`;

      if (isSelected) {
        btnFill = COLORS.BTN_GREEN;
        btnLabel = 'ĐANG CHỌN';
      } else if (isUnlocked) {
        btnFill = COLORS.BTN_BLUE;
        btnLabel = 'CHỌN NHÂN VẬT';
      } else if (hasEnoughCoins) {
        btnFill = COLORS.BTN_AMBER;
        btnLabel = `MỞ KHÓA (-${skin.cost} XU)`;
      }

      const cardBtn = createChunkyButton(
        scene,
        cx,
        cy + 67,
        colWidth - 26,
        44,
        btnFill,
        () => {
          if (isUnlocked) {
            soundManager.playClick();
            progress.selectSkin(skin.id);
            statusBanner.setText(`Đã trang bị nhân vật: ${skin.name}`);
            renderAll();
          } else if (progress.coins >= skin.cost) {
            // Trừ đúng số Xu của nhân vật và kích hoạt hiệu ứng Phóng To Nhân Vật!
            soundManager.playUnlock();
            progress.unlockAndSelectSkin(skin);
            statusBanner.setText(`Đã mở khóa ${skin.name} (-${skin.cost} Xu)!`);
            renderAll();
            playUnlockRevealAnimation(scene, progress.getStyledSkin(skin));
          } else {
            soundManager.playCrash();
            statusBanner.setText(
              `Cần thêm ${skin.cost - progress.coins} Xu nữa để mua nhân vật [???] này!`
            );
          }
        },
        { radius: 13, shadow: 4, outline: 3 }
      );

      cardBtn.face.add(
        applyTextOutline(
          scene.add.text(0, 0, btnLabel, textStyle(15, '900', '#ffffff')).setOrigin(0.5),
          4,
          2
        )
      );
      gridContainer.add(cardBtn.container);
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      e.preventDefault();
      currentPage = (currentPage - 1 + totalPages) % totalPages;
      soundManager.playClick();
      renderAll();
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      e.preventDefault();
      currentPage = (currentPage + 1) % totalPages;
      soundManager.playClick();
      renderAll();
    } else if (e.code === 'Escape') {
      e.preventDefault();
      soundManager.playClick();
      cleanupAndClose();
    }
  };

  window.addEventListener('keydown', onKeyDown);

  const cleanupAndClose = () => {
    window.removeEventListener('keydown', onKeyDown);
    root.destroy();
    onClose();
  };

  renderAll();

  if (!REDUCED_MOTION) {
    card.setScale(0.86).setAlpha(0);
    scene.tweens.add({
      targets: card,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  return { close: cleanupAndClose };
}
