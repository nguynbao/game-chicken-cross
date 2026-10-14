import Phaser from 'phaser';
import {
  COLORS,
  FONT_DISPLAY,
  GAME_HEIGHT,
  GAME_WIDTH,
  INK_HEX,
  LANE_HEIGHT,
  PLAYER_SIZE,
  SAFE_MARGIN_X,
  SAFE_MARGIN_Y,
  SKINS,
  START_WORLD_Y,
  getSkinById,
  type VehicleKind,
  type WeatherKind,
} from '../constants';
import { progress } from '../progress';
import { soundManager } from '../audio/SoundManager';
import {
  REDUCED_MOTION,
  applyTextOutline,
  createChunkyButton,
  createIconButton,
  drawCharacter,
  drawCoin,
  drawLog,
  drawSideTree,
  drawVehicle,
  openShopModal,
  textStyle,
  type ChunkyButton,
} from '../ui';

// Cấu trúc dữ liệu Chướng ngại vật (Nhiều loại Xe cộ hoặc Khúc gỗ)
interface ObstacleEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  colorVariant: number;
  vehicleKind: VehicleKind;
}

type LaneType = 'grass' | 'road' | 'river';

interface LaneData {
  index: number;
  worldY: number;
  type: LaneType;
  direction: 1 | -1;
  speed: number;
  obstacles: ObstacleEntity[];
  rewarded: boolean;
  hasLeftTree: boolean;
  hasRightTree: boolean;
}

interface PlayerEntity {
  x: number;
  worldY: number;
  visualY: number;
  laneIndex: number;
  width: number;
  height: number;
  hopProgress: number;
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface SplashRipple {
  x: number;
  y: number;
  phase: number;
}

interface SnowFlake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
}

interface FogCloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speedX: number;
  alpha: number;
}

interface FloodWave {
  x: number;
  y: number;
  w: number;
  speedX: number;
  phase: number;
}

// Cấu hình màu sắc môi trường và bầu trời cho từng loại Thời tiết để nội suy (Cross-fade) mượt mà
interface WeatherVisualProfile {
  label: string;
  bannerColor: string;
  skyTint: number;
  skyAlpha: number;
  grassLight: number;
  grassDark: number;
  grassShadow: number;
  roadColor: number;
  riverColor: number;
  headlightWeight: number; // 0 -> 1: mức độ bật đèn pha xe và hào quang nhân vật
  rainWeight: number;      // 0 -> 1: mật độ mưa
  snowWeight: number;      // 0 -> 1: mật độ tuyết
  windWeight: number;      // 0 -> 1: sức gió bão
  fogWeight: number;       // 0 -> 1: độ dày sương mù
  floodWeight: number;     // 0 -> 1: mức nước lũ dâng tràn bờ
  sunWeight: number;       // 0 -> 1: tia nắng chiếu
  nightFlyWeight: number;  // 0 -> 1: đom đóm ban đêm
}

const ALL_WEATHERS: WeatherKind[] = [
  'day',
  'sunny',
  'sunset',
  'rain',
  'storm',
  'flood',
  'snow',
  'blizzard',
  'fog',
  'night',
];

const WEATHER_PROFILES: Record<WeatherKind, WeatherVisualProfile> = {
  day: {
    label: '🌤️ TRỜI QUANG',
    bannerColor: '#a7f3d0',
    skyTint: 0xffffff,
    skyAlpha: 0.0,
    grassLight: COLORS.GRASS_LIGHT,
    grassDark: COLORS.GRASS_DARK,
    grassShadow: COLORS.GRASS_SHADOW,
    roadColor: COLORS.ROAD,
    riverColor: COLORS.RIVER,
    headlightWeight: 0,
    rainWeight: 0,
    snowWeight: 0,
    windWeight: 0.05,
    fogWeight: 0,
    floodWeight: 0,
    sunWeight: 0.25,
    nightFlyWeight: 0,
  },
  sunny: {
    label: '☀️ NẮNG RỰC RỠ',
    bannerColor: '#fde047',
    skyTint: 0xfbbf24,
    skyAlpha: 0.12,
    grassLight: 0x76d346,
    grassDark: 0x64c236,
    grassShadow: 0x4ca126,
    roadColor: 0x434c5e,
    riverColor: 0x29b6f6,
    headlightWeight: 0,
    rainWeight: 0,
    snowWeight: 0,
    windWeight: 0.08,
    fogWeight: 0,
    floodWeight: 0,
    sunWeight: 1.0,
    nightFlyWeight: 0,
  },
  sunset: {
    label: '🌇 HOÀNG HÔN ĐỎ',
    bannerColor: '#fb923c',
    skyTint: 0xea580c,
    skyAlpha: 0.22,
    grassLight: 0x6ea838,
    grassDark: 0x5c942c,
    grassShadow: 0x42701c,
    roadColor: 0x3b3a4a,
    riverColor: 0x2574a9,
    headlightWeight: 0.45,
    rainWeight: 0,
    snowWeight: 0,
    windWeight: 0.15,
    fogWeight: 0.15,
    floodWeight: 0,
    sunWeight: 0.65,
    nightFlyWeight: 0.35,
  },
  rain: {
    label: '🌧️ MƯA RÀO',
    bannerColor: '#7dd3fc',
    skyTint: 0x1e3a8a,
    skyAlpha: 0.2,
    grassLight: 0x4ea845,
    grassDark: 0x419639,
    grassShadow: 0x2f7829,
    roadColor: 0x2d3544,
    riverColor: 0x1b88ca,
    headlightWeight: 0.35,
    rainWeight: 0.68,
    snowWeight: 0,
    windWeight: 0.3,
    fogWeight: 0.15,
    floodWeight: 0.1,
    sunWeight: 0,
    nightFlyWeight: 0,
  },
  storm: {
    label: '⛈️ GIÔNG BÃO SẤM CHỚP',
    bannerColor: '#c084fc',
    skyTint: 0x0f172a,
    skyAlpha: 0.42,
    grassLight: 0x3d8a3f,
    grassDark: 0x327834,
    grassShadow: 0x235c26,
    roadColor: 0x232936,
    riverColor: 0x15659c,
    headlightWeight: 0.9,
    rainWeight: 1.0,
    snowWeight: 0,
    windWeight: 0.95,
    fogWeight: 0.25,
    floodWeight: 0.3,
    sunWeight: 0,
    nightFlyWeight: 0,
  },
  flood: {
    label: '🌊 BÃO LŨ DÂNG CAO',
    bannerColor: '#38bdf8',
    skyTint: 0x0e4f63,
    skyAlpha: 0.3,
    grassLight: 0x3c9d7c,
    grassDark: 0x2f8769,
    grassShadow: 0x1e6b52,
    roadColor: 0x2b3e4c,
    riverColor: 0x0ea5e9,
    headlightWeight: 0.6,
    rainWeight: 0.85,
    snowWeight: 0,
    windWeight: 0.75,
    fogWeight: 0.2,
    floodWeight: 1.0,
    sunWeight: 0,
    nightFlyWeight: 0,
  },
  snow: {
    label: '❄️ TUYẾT ĐẦU MÙA',
    bannerColor: '#e0f2fe',
    skyTint: 0xcffafe,
    skyAlpha: 0.18,
    grassLight: 0xdbeafe,
    grassDark: 0xbfdbfe,
    grassShadow: 0x93c5fd,
    roadColor: 0x475569,
    riverColor: 0x38bdf8,
    headlightWeight: 0.2,
    rainWeight: 0,
    snowWeight: 0.65,
    windWeight: 0.22,
    fogWeight: 0.15,
    floodWeight: 0,
    sunWeight: 0,
    nightFlyWeight: 0,
  },
  blizzard: {
    label: '🌨️ BÃO TUYẾT BẮC CỰC',
    bannerColor: '#bae6fd',
    skyTint: 0x94a3b8,
    skyAlpha: 0.32,
    grassLight: 0xeff6ff,
    grassDark: 0xdbeafe,
    grassShadow: 0x93c5fd,
    roadColor: 0x526277,
    riverColor: 0x60a5fa,
    headlightWeight: 0.75,
    rainWeight: 0,
    snowWeight: 1.0,
    windWeight: 1.0,
    fogWeight: 0.55,
    floodWeight: 0,
    sunWeight: 0,
    nightFlyWeight: 0,
  },
  fog: {
    label: '🌫️ SƯƠNG MÙ DÀY ĐẶC',
    bannerColor: '#cbd5e1',
    skyTint: 0xcbd5e1,
    skyAlpha: 0.26,
    grassLight: 0x5da854,
    grassDark: 0x4f9647,
    grassShadow: 0x3c7a35,
    roadColor: 0x434d5c,
    riverColor: 0x3b8ea5,
    headlightWeight: 0.65,
    rainWeight: 0,
    snowWeight: 0,
    windWeight: 0.15,
    fogWeight: 1.0,
    floodWeight: 0,
    sunWeight: 0,
    nightFlyWeight: 0.2,
  },
  night: {
    label: '🌙 ĐÊM ĐOM ĐÓM',
    bannerColor: '#c4b5fd',
    skyTint: 0x090d16,
    skyAlpha: 0.46,
    grassLight: 0x3c7d32,
    grassDark: 0x316928,
    grassShadow: 0x224d1b,
    roadColor: 0x222834,
    riverColor: 0x166496,
    headlightWeight: 1.0,
    rainWeight: 0,
    snowWeight: 0,
    windWeight: 0.08,
    fogWeight: 0.08,
    floodWeight: 0,
    sunWeight: 0,
    nightFlyWeight: 1.0,
  },
};

/**
 * ============================================================================
 * BỘ MÁY NGẪU NHIÊN KHÍ HẬU ĐA TẦNG PHỨC TẠP (ComplexStochasticClimateEngine)
 * Kết hợp:
 * 1. Bộ sinh số giả ngẫu nhiên hỗn hợp SplitMix32 + Xorshift128* + Mulberry32
 * 2. Biến đổi Box-Muller tạo phân phối chuẩn Gaussian
 * 3. Nhiễu phân dạng nhiều tầng (1D Fractal Brownian Motion - fBm Perlin Noise)
 * 4. Ma trận chuyển trạng thái Markov kết hợp Vector Khí quyển (Nhiệt độ, Độ ẩm, Áp suất, Độ hỗn loạn gió)
 * Giúp mỗi trận đấu có một kịch bản thời tiết hoàn toàn độc bản và chuyển tiếp tự nhiên!
 * ============================================================================
 */
class ComplexStochasticClimateEngine {
  private s0: number = 1;
  private s1: number = 2;
  private s2: number = 3;
  private s3: number = 4;
  private permutation: Uint8Array = new Uint8Array(512);

  // Các biến trạng thái khí quyển của trận hiện tại
  public temperature: number = 22; // -18°C -> +40°C
  public humidity: number = 0.5;   // 0.0 -> 1.0
  public pressure: number = 1013;  // 960 -> 1035 hPa
  public windChaos: number = 0.2;  // 0.0 -> 1.0
  private matchSeedOffset: number = 0;

  constructor() {
    this.reseedForNewMatch(1);
  }

  /**
   * Khởi tạo hạt giống (Seed) phức tạp từ thời gian thực, hiệu năng phần cứng và số thứ tự trận
   */
  public reseedForNewMatch(matchCounter: number) {
    const now = Date.now();
    const perf = typeof performance !== 'undefined' ? Math.floor(performance.now() * 1000) : 0;
    const randBits = Math.floor(Math.random() * 0xffffffff);
    const rawSeed = (now ^ (perf << 7) ^ randBits ^ (matchCounter * 0x9e3779b9)) >>> 0;

    // Khởi tạo 4 thanh ghi trạng thái bằng thuật toán băm SplitMix32
    let z = rawSeed;
    const splitMix = () => {
      z = (z + 0x9e3779b9) >>> 0;
      let t = z ^ (z >>> 16);
      t = Math.imul(t, 0x21f0aaad) >>> 0;
      t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97) >>> 0;
      return (t ^ (t >>> 15)) >>> 0;
    };

    this.s0 = splitMix() || 0x12345678;
    this.s1 = splitMix() || 0x87654321;
    this.s2 = splitMix() || 0xabcdef01;
    this.s3 = splitMix() || 0x10fedcba;
    this.matchSeedOffset = (splitMix() % 10000) * 0.137;

    // Xây dựng bảng hoán vị 512 phần tử (Fisher-Yates Shuffle) cho hàm nhiễu fBm
    const base = new Uint8Array(256);
    for (let i = 0; i < 256; i++) base[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(this.nextFloat() * (i + 1));
      const tmp = base[i];
      base[i] = base[j];
      base[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.permutation[i] = base[i & 255];
    }

    // Khởi tạo ngẫu nhiên đặc trưng khí hậu gốc của ván đấu này
    this.temperature = Phaser.Math.Clamp(16 + this.nextGaussian() * 15, -16, 40);
    this.humidity = Phaser.Math.Clamp(0.52 + this.nextGaussian() * 0.28, 0.05, 0.98);
    this.pressure = Phaser.Math.Clamp(1008 + this.nextGaussian() * 18, 960, 1038);
    this.windChaos = Phaser.Math.Clamp(Math.abs(this.nextGaussian() * 0.45), 0.05, 1.0);
  }

  /**
   * Bộ sinh số ngẫu nhiên Xorshift128+ kết hợp Mulberry32 trả về số thực [0, 1)
   */
  public nextFloat(): number {
    let t = this.s3;
    const s = this.s0;
    this.s3 = this.s2;
    this.s2 = this.s1;
    this.s1 = s;
    t ^= (t << 11) >>> 0;
    t ^= t >>> 8;
    this.s0 = (t ^ s ^ (s >>> 19)) >>> 0;

    let m = (this.s0 + this.s1) >>> 0;
    m = Math.imul(m ^ (m >>> 15), m | 1) >>> 0;
    m ^= m + Math.imul(m ^ (m >>> 7), m | 61);
    return ((m ^ (m >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Phân phối chuẩn Gaussian (Box-Muller Transform) với kỳ vọng 0, độ lệch chuẩn 1
   */
  public nextGaussian(): number {
    const u1 = Math.max(1e-7, this.nextFloat());
    const u2 = this.nextFloat();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  /**
   * Nhiễu Gradient 1D kết hợp 4 tầng Octave (Fractal Brownian Motion - fBm)
   */
  public fbm1D(x: number, octaves: number = 4): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.gradientNoise1D(x * frequency + this.matchSeedOffset * (i + 1)) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.52;
      frequency *= 2.07;
    }
    return total / maxValue; // [-1, 1]
  }

  private gradientNoise1D(x: number): number {
    const xi = Math.floor(x) & 255;
    const xf = x - Math.floor(x);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10); // Quintic Perlin curve
    const g0 = (this.permutation[xi] & 1) === 0 ? xf : -xf;
    const g1 = (this.permutation[xi + 1] & 1) === 0 ? xf - 1 : -(xf - 1);
    return g0 + u * (g1 - g0);
  }

  /**
   * Chọn thời tiết khởi đầu ngẫu nhiên cho ván đấu (mỗi trận một bầu không khí khác nhau!)
   */
  public pickInitialMatchWeather(): WeatherKind {
    return this.selectNextWeather(null, 0);
  }

  /**
   * Tính toán số bước chân cho tới lần chuyển thời tiết tiếp theo (biến thiên ngẫu nhiên từ 8 -> 17 bước)
   */
  public computeNextWeatherStepInterval(currentScore: number): number {
    const noiseMod = (this.fbm1D(currentScore * 0.09) + 1) * 0.5; // 0 -> 1
    const gaussMod = this.nextGaussian() * 2.2;
    return Math.round(Phaser.Math.Clamp(9 + noiseMod * 5 + gaussMod, 7, 16));
  }

  /**
   * Cập nhật biến động khí quyển theo bước đi và chọn trạng thái Thời tiết tiếp theo
   * bằng Ma trận Markov + Trọng số vật lý khí quyển
   */
  public selectNextWeather(current: WeatherKind | null, stepIndex: number): WeatherKind {
    // 1. Tiến hóa các thông số khí quyển bằng nhiễu fBm đa tầng + bước nhảy ngẫu nhiên
    const tNoise = this.fbm1D(stepIndex * 0.07 + 11.3, 4);
    const hNoise = this.fbm1D(stepIndex * 0.09 + 47.9, 4);
    const pNoise = this.fbm1D(stepIndex * 0.06 + 93.1, 4);

    this.temperature = Phaser.Math.Clamp(
      this.temperature * 0.65 + (14 + tNoise * 26 + this.nextGaussian() * 6) * 0.35,
      -18,
      40
    );
    this.humidity = Phaser.Math.Clamp(
      this.humidity * 0.6 + (0.5 + hNoise * 0.45 + this.nextGaussian() * 0.12) * 0.4,
      0.05,
      1.0
    );
    this.pressure = Phaser.Math.Clamp(
      this.pressure * 0.62 + (1005 + pNoise * 32 + this.nextGaussian() * 9) * 0.38,
      955,
      1038
    );
    this.windChaos = Phaser.Math.Clamp(
      0.5 * this.windChaos + 0.5 * Math.abs(this.fbm1D(stepIndex * 0.12 + 5.7, 3)) + this.nextFloat() * 0.25,
      0.05,
      1.0
    );

    // 2. Tính điểm tương thích khí hậu (Fitness Score) cho cả 10 loại thời tiết
    const weights: Record<WeatherKind, number> = {
      day: 1.2 + (this.pressure > 1010 ? 1.4 : 0.4),
      sunny: 1.0 + (this.temperature > 22 && this.humidity < 0.65 ? 2.4 : 0.5),
      sunset: 1.1 + (Math.abs(this.temperature - 20) < 12 ? 1.5 : 0.6),
      rain: 1.2 + (this.humidity > 0.55 && this.temperature > 4 ? 2.2 : 0.6),
      storm: 1.0 + (this.pressure < 998 && this.windChaos > 0.45 ? 2.6 : 0.7),
      flood: 0.95 + (this.humidity > 0.68 && this.pressure < 995 ? 2.8 : 0.65),
      snow: 1.1 + (this.temperature < 5 ? 2.6 : 0.65),
      blizzard: 0.9 + (this.temperature < 0 && this.windChaos > 0.5 ? 2.8 : 0.55),
      fog: 1.05 + (this.humidity > 0.6 && this.windChaos < 0.45 ? 2.1 : 0.6),
      night: 1.15 + (this.pressure > 1005 ? 1.4 : 0.8),
    };

    // 3. Nhân với Ma trận chuyển tiếp Markov để mạch thời tiết vừa tự nhiên vừa bất ngờ
    if (current) {
      const markovBoost: Partial<Record<WeatherKind, Partial<Record<WeatherKind, number>>>> = {
        day: { sunny: 1.7, sunset: 1.6, rain: 1.5, fog: 1.4, snow: 1.3 },
        sunny: { sunset: 2.0, storm: 1.5, day: 1.3, night: 1.4 },
        sunset: { night: 2.3, fog: 1.6, storm: 1.4, snow: 1.3 },
        rain: { storm: 2.2, flood: 2.3, fog: 1.6, day: 1.3 },
        storm: { flood: 2.5, rain: 1.6, night: 1.5, fog: 1.4 },
        flood: { fog: 1.8, day: 1.6, sunset: 1.5, night: 1.4 },
        snow: { blizzard: 2.4, fog: 1.5, night: 1.6, day: 1.3 },
        blizzard: { snow: 1.8, night: 1.7, fog: 1.5, day: 1.4 },
        fog: { rain: 1.7, snow: 1.7, flood: 1.6, night: 1.5, sunny: 1.4 },
        night: { day: 1.9, fog: 1.7, snow: 1.5, storm: 1.5, sunny: 1.4 },
      };

      const row = markovBoost[current] || {};
      for (const w of ALL_WEATHERS) {
        if (w === current) {
          weights[w] = 0; // Luôn chuyển sang thời tiết mới khác với thời tiết hiện tại
        } else {
          weights[w] *= (row[w] ?? 1.0) * (0.75 + this.nextFloat() * 0.65);
        }
      }
    } else {
      // Ở đầu ván đấu: mọi loại thời tiết (Nắng, Mưa, Tuyết, Bão lũ, Sương mù, Hoàng hôn, Đêm...) đều có cơ hội xuất hiện!
      for (const w of ALL_WEATHERS) {
        weights[w] *= 0.8 + this.nextFloat() * 0.9;
      }
    }

    // 4. Rút thăm có trọng số (Roulette Wheel Selection)
    let sum = 0;
    for (const w of ALL_WEATHERS) sum += weights[w];
    let pick = this.nextFloat() * sum;
    for (const w of ALL_WEATHERS) {
      pick -= weights[w];
      if (pick <= 0) return w;
    }
    return 'day';
  }
}

const climateEngine = new ComplexStochasticClimateEngine();
let globalMatchCount = 0;

export class GameScene extends Phaser.Scene {
  private worldGraphics!: Phaser.GameObjects.Graphics;
  private weatherGraphics!: Phaser.GameObjects.Graphics;

  private lanes: LaneData[] = [];
  private highestLaneIndex: number = 0;
  private player!: PlayerEntity;

  private score: number = 0;
  private runCoinsEarned: number = 0;
  private startingBestScore: number = 0;
  private cameraOffsetY: number = 0;
  private targetCameraOffsetY: number = 0;

  // Hệ thống nội suy chuyển tiếp Thời tiết mượt mà (prevWeather -> currentWeather)
  private prevWeather: WeatherKind = 'day';
  private currentWeather: WeatherKind = 'day';
  private weatherTransition: number = 1; // 0.0 -> 1.0 (kéo dài ~3.2 giây)
  private nextWeatherChangeScore: number = 10;

  // Các hệ hạt Thời tiết
  private rainDrops: RainDrop[] = [];
  private splashRipples: SplashRipple[] = [];
  private snowFlakes: SnowFlake[] = [];
  private fogClouds: FogCloud[] = [];
  private floodWaves: FloodWave[] = [];

  // Hiệu ứng Sấm chớp (Lightning) cho Giông bão
  private lightningFlashAlpha: number = 0;
  private lightningBoltPoints: { x: number; y: number }[] = [];
  private nextLightningTimer: number = 2200;

  private onboardingPulseTime: number = 0;

  private isGameOver: boolean = false;
  private isShopOpen: boolean = false;
  private gamepadJumpHeld: boolean = false;

  // Các phần tử HUD
  private scoreText!: Phaser.GameObjects.Text;
  private weatherPillText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private onboardingContainer!: Phaser.GameObjects.Container;
  private promptLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * ============================================================================
   * 1. HÀM KHỞI TẠO GAME (init)
   * Khởi tạo hạt giống khí hậu mới cho trận đấu, chọn ngẫu nhiên thời tiết đầu trận,
   * khởi tạo các hạt mưa, bông tuyết, mây sương mù, sóng lũ và bản đồ.
   * ============================================================================
   */
  init() {
    this.score = 0;
    this.runCoinsEarned = 0;
    this.startingBestScore = progress.bestScore;
    this.cameraOffsetY = 0;
    this.targetCameraOffsetY = 0;
    this.lanes = [];
    this.highestLaneIndex = -5;
    this.isGameOver = false;
    this.isShopOpen = false;
    this.gamepadJumpHeld = false;
    this.onboardingPulseTime = 0;
    this.lightningFlashAlpha = 0;
    this.lightningBoltPoints = [];
    this.nextLightningTimer = 1800 + Math.random() * 2400;

    // Gieo hạt giống khí hậu phức tạp mới cho trận đấu này
    globalMatchCount += 1;
    climateEngine.reseedForNewMatch(globalMatchCount);
    const startWeather = climateEngine.pickInitialMatchWeather();
    this.prevWeather = startWeather;
    this.currentWeather = startWeather;
    this.weatherTransition = 1;
    this.nextWeatherChangeScore = climateEngine.computeNextWeatherStepInterval(0);

    const startY = START_WORLD_Y + (LANE_HEIGHT - PLAYER_SIZE) / 2;
    this.player = {
      x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
      laneIndex: 0,
      worldY: startY,
      visualY: startY,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      hopProgress: 0,
    };

    // 1. Khởi tạo hạt mưa & gợn nước
    this.rainDrops = [];
    for (let i = 0; i < 64; i++) {
      this.rainDrops.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        len: 22 + Math.random() * 20,
        speed: 15 + Math.random() * 8,
      });
    }

    this.splashRipples = [];
    for (let i = 0; i < 18; i++) {
      this.splashRipples.push({
        x: 50 + Math.random() * (GAME_WIDTH - 100),
        y: 140 + Math.random() * (GAME_HEIGHT - 260),
        phase: Math.random(),
      });
    }

    // 2. Khởi tạo bông tuyết (cho Tuyết rơi & Bão tuyết)
    this.snowFlakes = [];
    for (let i = 0; i < 60; i++) {
      this.snowFlakes.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        radius: 2.5 + Math.random() * 4.5,
        speedY: 2.2 + Math.random() * 3.2,
        swayAmp: 0.8 + Math.random() * 1.8,
        swayFreq: 1.2 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 3. Khởi tạo các dải sương mù trôi ngang
    this.fogClouds = [];
    for (let i = 0; i < 9; i++) {
      this.fogClouds.push({
        x: Math.random() * GAME_WIDTH,
        y: 120 + i * 125 + Math.random() * 40,
        w: 280 + Math.random() * 220,
        h: 64 + Math.random() * 42,
        speedX: (i % 2 === 0 ? 1 : -1) * (0.45 + Math.random() * 0.55),
        alpha: 0.16 + Math.random() * 0.14,
      });
    }

    // 4. Khởi tạo các luồng sóng lũ dâng
    this.floodWaves = [];
    for (let i = 0; i < 16; i++) {
      this.floodWaves.push({
        x: Math.random() * GAME_WIDTH,
        y: 140 + i * 70,
        w: 90 + Math.random() * 110,
        speedX: 2.2 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Sinh trước 22 làn đường đầu tiên
    this.generateMap(18);
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.GRASS_LIGHT);

    // Lớp Graphics vẽ thế giới 2D
    this.worldGraphics = this.add.graphics().setDepth(1);
    // Lớp Graphics vẽ hiệu ứng Thời tiết đa tầng
    this.weatherGraphics = this.add.graphics().setDepth(10);

    this.createHUD();
    this.setupControls();
    this.draw();
  }

  /**
   * ============================================================================
   * 2. HÀM SINH BẢN ĐỒ TĂNG DẦN ĐỘ KHÓ & ĐA DẠNG LOẠI XE (generateMap)
   * ============================================================================
   */
  private generateMap(upToLaneIndex: number) {
    while (this.highestLaneIndex < 2) {
      this.highestLaneIndex++;
      this.pushGrassLane(this.highestLaneIndex);
    }

    while (this.highestLaneIndex < upToLaneIndex) {
      const startIdx = this.highestLaneIndex + 1;

      if (startIdx <= 8) {
        const baseSpeed = 2.0 + Math.random() * 0.5;
        this.pushRoadLane(++this.highestLaneIndex, 1, baseSpeed, 0);
        const grassCount = startIdx < 6 ? 2 : 1;
        for (let g = 0; g < grassCount; g++) {
          this.pushGrassLane(++this.highestLaneIndex);
        }
      } else if (startIdx <= 18) {
        const dir: 1 | -1 = this.highestLaneIndex % 2 === 0 ? -1 : 1;
        const speed = 2.5 + Math.random() * 0.8 + (startIdx - 8) * 0.04;
        const colorVar = dir === 1 ? 0 : 1;
        this.pushRoadLane(++this.highestLaneIndex, dir, speed, colorVar);

        const grassCount = Math.random() < 0.45 ? 2 : 1;
        for (let g = 0; g < grassCount; g++) {
          this.pushGrassLane(++this.highestLaneIndex);
        }
      } else if (startIdx <= 30) {
        const firstDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
        const secondDir: 1 | -1 = firstDir === 1 ? -1 : 1;
        const baseSpeed = 2.9 + (startIdx - 18) * 0.05;

        this.pushRoadLane(++this.highestLaneIndex, firstDir, baseSpeed + Math.random() * 0.6, 0);
        this.pushRoadLane(++this.highestLaneIndex, secondDir, baseSpeed + 0.3 + Math.random() * 0.7, 2);

        const grassCount = Math.random() < 0.5 ? 2 : 1;
        for (let g = 0; g < grassCount; g++) {
          this.pushGrassLane(++this.highestLaneIndex);
        }
      } else {
        const speedScaling = Math.min((startIdx - 30) * 0.045, 3.2);
        const roll = Math.random();

        if (roll < 0.44) {
          const riverLanes = startIdx > 45 && Math.random() < 0.55 ? 2 : 1;
          let logDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;

          for (let r = 0; r < riverLanes; r++) {
            const logSpeed = 1.7 + Math.random() * 1.1 + speedScaling * 0.55;
            this.pushRiverLane(++this.highestLaneIndex, logDir, logSpeed);
            logDir = logDir === 1 ? -1 : 1;
          }
        } else {
          const roadLanes = startIdx > 55 && Math.random() < 0.35 ? 3 : 2;
          let carDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;

          for (let r = 0; r < roadLanes; r++) {
            const carSpeed = 3.2 + Math.random() * 1.2 + speedScaling;
            this.pushRoadLane(++this.highestLaneIndex, carDir, carSpeed, r);
            carDir = carDir === 1 ? -1 : 1;
          }
        }

        const grassCount = Math.random() < 0.35 ? 2 : 1;
        for (let g = 0; g < grassCount; g++) {
          this.pushGrassLane(++this.highestLaneIndex);
        }
      }
    }

    const minKeepIndex = this.player.laneIndex - 7;
    this.lanes = this.lanes.filter((l) => l.index >= minKeepIndex);
  }

  private pushGrassLane(idx: number) {
    const laneWorldY = START_WORLD_Y - idx * LANE_HEIGHT;
    this.lanes.push({
      index: idx,
      worldY: laneWorldY,
      type: 'grass',
      direction: 1,
      speed: 0,
      obstacles: [],
      rewarded: true,
      hasLeftTree: idx > 0 && Math.abs(idx * 73) % 3 !== 0,
      hasRightTree: idx > 0 && Math.abs(idx * 41) % 3 !== 0,
    });
  }

  private pickVehicleForLane(idx: number, speed: number): { kind: VehicleKind; width: number } {
    const roll = Math.random();
    if (idx <= 5) {
      if (roll < 0.4) return { kind: 'motorbike', width: 78 };
      return { kind: 'car', width: 118 };
    }
    if (speed > 4.2 && roll < 0.45) {
      return { kind: 'sports', width: 126 };
    }
    if (roll < 0.24) {
      return { kind: 'motorbike', width: 78 };
    } else if (roll < 0.52) {
      return { kind: 'car', width: 118 };
    } else if (roll < 0.72) {
      return { kind: 'van', width: 142 };
    } else if (roll < 0.86) {
      return { kind: 'sports', width: 126 };
    } else {
      return { kind: 'truck', width: 188 };
    }
  }

  private pushRoadLane(idx: number, direction: 1 | -1, speed: number, colorSeed: number) {
    const laneWorldY = START_WORLD_Y - idx * LANE_HEIGHT;
    const spec = this.pickVehicleForLane(idx, speed);
    const vehicleCount =
      spec.kind === 'truck' || idx <= 8 ? 1 : Math.random() < 0.58 ? 2 : 1;
    const vehicleHeight = LANE_HEIGHT - 22;
    const spacing = (GAME_WIDTH + 210) / vehicleCount;
    const obstacles: ObstacleEntity[] = [];

    const adjustedSpeed =
      spec.kind === 'truck'
        ? speed * 0.85
        : spec.kind === 'motorbike' || spec.kind === 'sports'
        ? speed * 1.08
        : speed;

    for (let i = 0; i < vehicleCount; i++) {
      obstacles.push({
        x: i * spacing + Math.random() * 55,
        y: laneWorldY + 11,
        width: spec.width,
        height: vehicleHeight,
        colorVariant: (colorSeed + i + idx) % 4,
        vehicleKind: spec.kind,
      });
    }

    this.lanes.push({
      index: idx,
      worldY: laneWorldY,
      type: 'road',
      direction,
      speed: adjustedSpeed,
      obstacles,
      rewarded: false,
      hasLeftTree: false,
      hasRightTree: false,
    });
  }

  private pushRiverLane(idx: number, direction: 1 | -1, speed: number) {
    const laneWorldY = START_WORLD_Y - idx * LANE_HEIGHT;
    const logCount = Math.random() < 0.6 ? 3 : 2;
    const logWidth = 175 + Math.floor(Math.random() * 40);
    const logHeight = LANE_HEIGHT - 16;
    const spacing = (GAME_WIDTH + 200) / logCount;
    const obstacles: ObstacleEntity[] = [];

    for (let i = 0; i < logCount; i++) {
      obstacles.push({
        x: i * spacing,
        y: laneWorldY + 8,
        width: logWidth,
        height: logHeight,
        colorVariant: 0,
        vehicleKind: 'car',
      });
    }

    this.lanes.push({
      index: idx,
      worldY: laneWorldY,
      type: 'river',
      direction,
      speed,
      obstacles,
      rewarded: false,
      hasLeftTree: false,
      hasRightTree: false,
    });
  }

  /**
   * Thực hiện bước nhảy tiến lên phía trước 1 làn đường.
   */
  private jumpForward() {
    if (this.isGameOver || this.isShopOpen) return;

    const previousLane = this.lanes.find((l) => l.index === this.player.laneIndex);

    soundManager.playJump();

    this.player.laneIndex += 1;
    this.player.worldY =
      START_WORLD_Y - this.player.laneIndex * LANE_HEIGHT + (LANE_HEIGHT - PLAYER_SIZE) / 2;
    this.player.hopProgress = REDUCED_MOTION ? 0 : 1;

    // 1. Thưởng Tiền Xu khi vượt qua Đường lộ hoặc Sông
    if (previousLane && !previousLane.rewarded && (previousLane.type === 'road' || previousLane.type === 'river')) {
      previousLane.rewarded = true;
      const coinBonus = previousLane.type === 'river' ? 2 : 1;
      progress.addCoins(coinBonus);
      this.runCoinsEarned += coinBonus;
      this.coinText.setText(`${progress.coins}`);
      soundManager.playCoin();

      const px = this.player.x + this.player.width / 2;
      const py = this.player.worldY + this.cameraOffsetY;
      this.spawnFloatingRewardText(px, py, `+${coinBonus} XU`);
    }

    // 2. Cập nhật Điểm số & Kiểm tra kịch bản chuyển Thời tiết ngẫu nhiên của trận
    if (this.player.laneIndex > this.score) {
      this.score = this.player.laneIndex;
      this.scoreText.setText(`${this.score}`);

      if (!REDUCED_MOTION) {
        this.tweens.killTweensOf(this.scoreText);
        this.scoreText.setScale(1);
        this.tweens.add({
          targets: this.scoreText,
          scale: 1.12,
          duration: 75,
          yoyo: true,
        });
      }

      progress.updateBestScore(this.score);
      this.checkDynamicWeatherEvolution(this.score);
    }

    // 3. Ẩn cụm Onboarding mượt mà sau khi nhảy bước thứ 2
    if (this.score === 2 && this.onboardingContainer.alpha > 0) {
      this.tweens.killTweensOf(this.onboardingContainer);
      this.tweens.add({
        targets: this.onboardingContainer,
        scale: 1.12,
        alpha: 0,
        y: this.onboardingContainer.y - 25,
        duration: REDUCED_MOTION ? 10 : 280,
        ease: 'Back.easeIn',
      });
    }

    this.targetCameraOffsetY = this.player.laneIndex * LANE_HEIGHT;
    this.generateMap(this.player.laneIndex + 18);
  }

  /**
   * Khi đạt tới mốc bước ngẫu nhiên của trận -> Sinh thời tiết mới bằng thuật toán khí hậu phức tạp
   * và bắt đầu quá trình chuyển màu/hạt mượt mà (Cross-fade)
   */
  private checkDynamicWeatherEvolution(curScore: number) {
    if (curScore >= this.nextWeatherChangeScore) {
      const nextWeather = climateEngine.selectNextWeather(this.currentWeather, curScore);
      this.nextWeatherChangeScore =
        curScore + climateEngine.computeNextWeatherStepInterval(curScore);
      this.transitionToWeather(nextWeather, true);
    }
  }

  private transitionToWeather(weather: WeatherKind, showBanner: boolean) {
    if (weather === this.currentWeather) return;
    this.prevWeather = this.currentWeather;
    this.currentWeather = weather;
    this.weatherTransition = REDUCED_MOTION ? 1 : 0;

    const profile = WEATHER_PROFILES[weather];
    this.weatherPillText.setText(profile.label);

    if (showBanner) {
      this.showWeatherBanner(profile.label, profile.bannerColor);
    }
  }

  private showWeatherBanner(message: string, colorHex: string) {
    const banner = applyTextOutline(
      this.add
        .text(GAME_WIDTH / 2, 275, message, textStyle(28, '900', colorHex))
        .setOrigin(0.5)
        .setDepth(45),
      7,
      4
    );

    if (REDUCED_MOTION) {
      this.time.delayedCall(900, () => banner.destroy());
      return;
    }

    banner.setScale(0.6).setAlpha(0);
    this.tweens.add({
      targets: banner,
      scale: 1,
      alpha: 1,
      duration: 240,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: banner,
          y: 235,
          alpha: 0,
          delay: 750,
          duration: 320,
          onComplete: () => banner.destroy(),
        });
      },
    });
  }

  /**
   * Nội suy mượt mà giữa 2 mã màu Hex (0xRRGGBB) theo hệ số t in [0, 1]
   */
  private lerpHexColor(c1: number, c2: number, t: number): number {
    if (t <= 0) return c1;
    if (t >= 1) return c2;
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Tính toán cấu hình Thời tiết đã được nội suy mượt (SmoothStep Cross-Fade) ở khung hình hiện tại
   */
  private getBlendedWeatherState() {
    const rawT = Phaser.Math.Clamp(this.weatherTransition, 0, 1);
    // Đường cong SmoothStep t^2 * (3 - 2t) giúp chuyển cảnh bầu trời cực kỳ êm dịu, tự nhiên
    const t = rawT * rawT * (3 - 2 * rawT);
    const p1 = WEATHER_PROFILES[this.prevWeather];
    const p2 = WEATHER_PROFILES[this.currentWeather];

    return {
      t,
      skyTint: this.lerpHexColor(p1.skyTint, p2.skyTint, t),
      skyAlpha: Phaser.Math.Linear(p1.skyAlpha, p2.skyAlpha, t),
      grassLight: this.lerpHexColor(p1.grassLight, p2.grassLight, t),
      grassDark: this.lerpHexColor(p1.grassDark, p2.grassDark, t),
      grassShadow: this.lerpHexColor(p1.grassShadow, p2.grassShadow, t),
      roadColor: this.lerpHexColor(p1.roadColor, p2.roadColor, t),
      riverColor: this.lerpHexColor(p1.riverColor, p2.riverColor, t),
      headlightWeight: Phaser.Math.Linear(p1.headlightWeight, p2.headlightWeight, t),
      rainWeight: Phaser.Math.Linear(p1.rainWeight, p2.rainWeight, t),
      snowWeight: Phaser.Math.Linear(p1.snowWeight, p2.snowWeight, t),
      windWeight: Phaser.Math.Linear(p1.windWeight, p2.windWeight, t),
      fogWeight: Phaser.Math.Linear(p1.fogWeight, p2.fogWeight, t),
      floodWeight: Phaser.Math.Linear(p1.floodWeight, p2.floodWeight, t),
      sunWeight: Phaser.Math.Linear(p1.sunWeight, p2.sunWeight, t),
      nightFlyWeight: Phaser.Math.Linear(p1.nightFlyWeight, p2.nightFlyWeight, t),
    };
  }

  /**
   * ============================================================================
   * 3. HÀM CẬP NHẬT TRẠNG THÁI (update)
   * ============================================================================
   */
  override update(_time: number, delta: number) {
    if (!this.worldGraphics) return;

    this.pollGamepadInput();

    if (this.isGameOver || this.isShopOpen) return;

    const timeScale = Math.min(delta / 16.667, 2.5);
    this.onboardingPulseTime += delta * 0.005;

    // 1. Tiến trình chuyển giao Thời tiết mượt mà (~3.2 giây để hoàn tất chuyển trời)
    if (this.weatherTransition < 1) {
      this.weatherTransition = Math.min(1, this.weatherTransition + (delta / 3200));
    }

    const blended = this.getBlendedWeatherState();

    // 2. Cuộn Camera mượt theo nhân vật
    if (REDUCED_MOTION) {
      this.cameraOffsetY = this.targetCameraOffsetY;
      this.player.visualY = this.player.worldY;
      this.player.hopProgress = 0;
    } else {
      this.cameraOffsetY += (this.targetCameraOffsetY - this.cameraOffsetY) * 0.22 * timeScale;
      this.player.visualY += (this.player.worldY - this.player.visualY) * 0.35 * timeScale;
      if (this.player.hopProgress > 0) {
        this.player.hopProgress = Math.max(0, this.player.hopProgress - 0.11 * timeScale);
      }
    }

    // 3. Di chuyển Xe cộ và Khúc gỗ
    const wrapDistance = 210;
    for (let i = 0; i < this.lanes.length; i++) {
      const lane = this.lanes[i];
      if (lane.type === 'road' || lane.type === 'river') {
        const stepX = lane.speed * lane.direction * timeScale;

        for (let j = 0; j < lane.obstacles.length; j++) {
          const obs = lane.obstacles[j];
          obs.x += stepX;

          if (lane.direction === 1 && obs.x > GAME_WIDTH + 40) {
            obs.x = -obs.width - wrapDistance + 40;
          } else if (lane.direction === -1 && obs.x + obs.width < -40) {
            obs.x = GAME_WIDTH + wrapDistance - 40;
          }
        }
      }
    }

    // 4. Cập nhật các hiệu ứng Hạt Thời tiết (Mưa, Tuyết, Sương mù, Bão lũ, Sấm chớp)
    if (!REDUCED_MOTION) {
      this.updateWeatherParticles(delta, timeScale, blended);
    }

    // 5. Kiểm tra va chạm
    this.checkCollision(timeScale);

    // 6. Vẽ đồ họa thế giới & hiệu ứng thời tiết
    this.draw(blended);
  }

  private updateWeatherParticles(
    delta: number,
    timeScale: number,
    blended: ReturnType<GameScene['getBlendedWeatherState']>
  ) {
    // A. Cập nhật hạt mưa & vòng nước bắn khi có mưa / giông bão / bão lũ
    if (blended.rainWeight > 0.02) {
      const windSlant = 0.25 + blended.windWeight * 0.45;
      const speedMul = 0.85 + blended.rainWeight * 0.45;
      for (const drop of this.rainDrops) {
        drop.x -= drop.speed * windSlant * timeScale;
        drop.y += drop.speed * speedMul * timeScale;
        if (drop.y > GAME_HEIGHT + 30) {
          drop.y = -30;
          drop.x = Math.random() * (GAME_WIDTH + 180);
        }
        if (drop.x < -50) {
          drop.x = GAME_WIDTH + 50;
        }
      }
      for (const sp of this.splashRipples) {
        sp.phase += (0.03 + blended.rainWeight * 0.025) * timeScale;
        if (sp.phase >= 1) {
          sp.phase = 0;
          sp.x = 50 + Math.random() * (GAME_WIDTH - 100);
          sp.y = 140 + Math.random() * (GAME_HEIGHT - 260);
        }
      }
    }

    // B. Cập nhật bông tuyết rơi & bão tuyết
    if (blended.snowWeight > 0.02) {
      const blizzardPush = blended.windWeight > 0.6 ? -4.8 * blended.windWeight : -0.6;
      for (const flake of this.snowFlakes) {
        flake.phase += 0.03 * flake.swayFreq * timeScale;
        flake.x += (Math.sin(flake.phase) * flake.swayAmp + blizzardPush) * timeScale;
        flake.y += flake.speedY * (0.8 + blended.snowWeight * 0.9) * timeScale;

        if (flake.y > GAME_HEIGHT + 20) {
          flake.y = -20;
          flake.x = Math.random() * GAME_WIDTH;
        }
        if (flake.x < -25) flake.x = GAME_WIDTH + 20;
        if (flake.x > GAME_WIDTH + 25) flake.x = -20;
      }
    }

    // C. Cập nhật các dải sương mù trôi ngang
    if (blended.fogWeight > 0.02) {
      for (const cloud of this.fogClouds) {
        cloud.x += cloud.speedX * timeScale;
        if (cloud.speedX > 0 && cloud.x - cloud.w / 2 > GAME_WIDTH + 60) {
          cloud.x = -cloud.w / 2 - 50;
        } else if (cloud.speedX < 0 && cloud.x + cloud.w / 2 < -60) {
          cloud.x = GAME_WIDTH + cloud.w / 2 + 50;
        }
      }
    }

    // D. Cập nhật dòng nước lũ dâng cuồn cuộn
    if (blended.floodWeight > 0.02) {
      for (const fw of this.floodWaves) {
        fw.x += fw.speedX * timeScale;
        fw.phase += 0.05 * timeScale;
        if (fw.x > GAME_WIDTH + 120) {
          fw.x = -fw.w - 60;
        }
      }
    }

    // E. Cập nhật tia chớp (Lightning) khi đang Giông bão hoặc Bão lũ
    if (this.currentWeather === 'storm' || (this.currentWeather === 'flood' && blended.windWeight > 0.6)) {
      this.nextLightningTimer -= delta;
      if (this.nextLightningTimer <= 0) {
        this.triggerLightningStrike();
        this.nextLightningTimer = 2400 + climateEngine.nextFloat() * 3800;
      }
    }
    if (this.lightningFlashAlpha > 0) {
      this.lightningFlashAlpha = Math.max(0, this.lightningFlashAlpha - 0.045 * timeScale);
    }
  }

  /**
   * Tạo tia sét phân nhánh trên bầu trời khi trời Giông bão
   */
  private triggerLightningStrike() {
    this.lightningFlashAlpha = 0.78;
    this.lightningBoltPoints = [];
    let curX = 120 + climateEngine.nextFloat() * (GAME_WIDTH - 240);
    let curY = 0;
    this.lightningBoltPoints.push({ x: curX, y: curY });

    const segments = 7;
    for (let i = 0; i < segments; i++) {
      curX += (climateEngine.nextFloat() - 0.5) * 95;
      curY += 55 + climateEngine.nextFloat() * 45;
      this.lightningBoltPoints.push({ x: curX, y: curY });
    }
  }

  /**
   * ============================================================================
   * 4. HÀM XỬ LÝ VA CHẠM & THUA CUỘC (checkCollision)
   * ============================================================================
   */
  private checkCollision(timeScale: number) {
    const currentLane = this.lanes.find((l) => l.index === this.player.laneIndex);
    if (!currentLane) return;

    if (currentLane.type === 'road') {
      const pad = 7;
      const px = this.player.x + pad;
      const py = this.player.worldY + pad;
      const pw = this.player.width - pad * 2;
      const ph = this.player.height - pad * 2;

      for (let i = 0; i < currentLane.obstacles.length; i++) {
        const car = currentLane.obstacles[i];
        if (this.rectsOverlap(px, py, pw, ph, car.x, car.y, car.width, car.height)) {
          soundManager.playCrash();
          this.triggerGameOver('Bạn đã va chạm với phương tiện trên đường!');
          return;
        }
      }
    }

    if (currentLane.type === 'river') {
      let standingLog: ObstacleEntity | null = null;
      const playerCenterX = this.player.x + this.player.width / 2;

      for (let i = 0; i < currentLane.obstacles.length; i++) {
        const log = currentLane.obstacles[i];
        if (playerCenterX >= log.x - 8 && playerCenterX <= log.x + log.width + 8) {
          standingLog = log;
          break;
        }
      }

      if (standingLog) {
        this.player.x += currentLane.speed * currentLane.direction * timeScale;

        if (
          this.player.x < -this.player.width * 0.5 ||
          this.player.x + this.player.width > GAME_WIDTH + this.player.width * 0.5
        ) {
          soundManager.playSplash();
          this.triggerGameOver('Bạn đã bị dòng nước cuốn trôi khỏi màn hình!');
          return;
        }
      } else {
        soundManager.playSplash();
        this.triggerGameOver('Bạn đã rơi xuống dòng sông sâu!');
        return;
      }
    } else {
      this.player.x = Phaser.Math.Clamp(this.player.x, 48, GAME_WIDTH - this.player.width - 48);
    }
  }

  private rectsOverlap(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * ============================================================================
   * 5. HÀM VẼ ĐỒ HỌA (draw)
   * Vẽ thế giới với màu sắc được nội suy mượt mà theo thời tiết (Tuyết phủ, Lũ dâng,
   * Hoàng hôn, Đêm tối...) cùng các lớp hiệu ứng hạt đa tầng.
   * ============================================================================
   */
  private draw(blendedState?: ReturnType<GameScene['getBlendedWeatherState']>) {
    if (!this.worldGraphics || !this.weatherGraphics) return;
    const g = this.worldGraphics;
    g.clear();

    const blended = blendedState ?? this.getBlendedWeatherState();
    const camY = this.cameraOffsetY;
    const showHeadlights = blended.headlightWeight > 0.45;

    // 1. Vẽ nền các làn đường với bảng màu nội suy theo Thời tiết hiện tại
    for (let i = 0; i < this.lanes.length; i++) {
      const lane = this.lanes[i];
      const screenY = lane.worldY + camY;

      if (screenY < -LANE_HEIGHT * 2 || screenY > GAME_HEIGHT + LANE_HEIGHT * 2) {
        continue;
      }

      const prevLane = this.lanes[i - 1];
      const nextLane = this.lanes[i + 1];

      if (lane.type === 'grass') {
        g.fillStyle(lane.index % 2 === 0 ? blended.grassLight : blended.grassDark, 1);
        g.fillRect(0, screenY, GAME_WIDTH, LANE_HEIGHT);

        g.fillStyle(blended.grassShadow, 0.45);
        g.fillRect(0, screenY + LANE_HEIGHT - 5, GAME_WIDTH, 5);

        // Nếu đang có Bão lũ (floodWeight > 0) -> Vẽ vũng nước lũ dâng tràn trên mặt cỏ!
        if (blended.floodWeight > 0.05) {
          g.fillStyle(0x0ea5e9, blended.floodWeight * 0.38);
          g.fillRect(0, screenY + 12, GAME_WIDTH, LANE_HEIGHT - 24);
          g.fillStyle(0xbae6fd, blended.floodWeight * 0.35);
          const waveOffset = (Math.sin(this.onboardingPulseTime * 2 + lane.index) * 18);
          g.fillRoundedRect(80 + waveOffset, screenY + 26, 140, 8, 4);
          g.fillRoundedRect(420 - waveOffset, screenY + 48, 160, 8, 4);
        }

        // Nếu đang có Tuyết rơi / Bão tuyết -> Vẽ các mảng tuyết trắng đọng trên bãi cỏ
        if (blended.snowWeight > 0.05) {
          g.fillStyle(0xffffff, blended.snowWeight * 0.45);
          const snowPatchX = ((Math.abs(lane.index) * 197) % (GAME_WIDTH - 220)) + 70;
          g.fillRoundedRect(snowPatchX, screenY + 18, 95, 16, 8);
        }

        g.fillStyle(blended.grassShadow, 0.7);
        const tuftX = ((Math.abs(lane.index) * 163) % (GAME_WIDTH - 180)) + 90;
        g.fillRoundedRect(tuftX, screenY + 34, 18, 7, 3.5);
      } else if (lane.type === 'road') {
        g.fillStyle(blended.roadColor, 1);
        g.fillRect(0, screenY, GAME_WIDTH, LANE_HEIGHT);

        const isBottomOfRoadGroup = !prevLane || prevLane.type !== 'road';
        const isTopOfRoadGroup = !nextLane || nextLane.type !== 'road';

        if (isTopOfRoadGroup) {
          g.fillStyle(COLORS.ROAD_CURB, 1);
          g.fillRect(0, screenY, GAME_WIDTH, 6);
          g.fillStyle(COLORS.INK, 0.35);
          g.fillRect(0, screenY + 6, GAME_WIDTH, 3);
        }
        if (isBottomOfRoadGroup) {
          g.fillStyle(COLORS.ROAD_CURB, 1);
          g.fillRect(0, screenY + LANE_HEIGHT - 6, GAME_WIDTH, 6);
        }

        if (!isTopOfRoadGroup) {
          g.fillStyle(COLORS.ROAD_DOUBLE_LINE, 0.92);
          for (let dx = 18; dx < GAME_WIDTH; dx += 68) {
            g.fillRoundedRect(dx, screenY - 3, 38, 6, 3);
          }
        }

        g.fillStyle(COLORS.WHITE, 0.25);
        for (let dx = 36; dx < GAME_WIDTH; dx += 96) {
          g.fillRoundedRect(dx, screenY + LANE_HEIGHT / 2 - 2, 36, 4, 2);
        }
      } else if (lane.type === 'river') {
        g.fillStyle(blended.riverColor, 1);
        g.fillRect(0, screenY, GAME_WIDTH, LANE_HEIGHT);

        const isTopOfRiver = !nextLane || nextLane.type !== 'river';
        if (isTopOfRiver) {
          g.fillStyle(COLORS.RIVER_DEEP, 1);
          g.fillRect(0, screenY, GAME_WIDTH, 8);
        }

        g.fillStyle(COLORS.RIVER_FOAM, 0.4 + blended.floodWeight * 0.25);
        for (let wx = 40; wx < GAME_WIDTH; wx += 130) {
          g.fillRoundedRect(wx, screenY + 24, 44, 5, 2.5);
          g.fillRoundedRect(wx + 55, screenY + 56, 32, 5, 2.5);
        }
      }

      // 2. Vẽ Chướng ngại vật và Cây bên lề cỏ
      if (lane.type === 'grass') {
        if (lane.hasLeftTree) {
          drawSideTree(g, 28, screenY + LANE_HEIGHT / 2, 0.92);
        }
        if (lane.hasRightTree) {
          drawSideTree(g, GAME_WIDTH - 28, screenY + LANE_HEIGHT / 2, 0.92);
        }
      } else {
        for (let j = 0; j < lane.obstacles.length; j++) {
          const obs = lane.obstacles[j];
          const obsScreenY = obs.y + camY;
          if (lane.type === 'river') {
            drawLog(g, obs.x, obsScreenY, obs.width, obs.height);
          } else {
            drawVehicle(
              g,
              obs.x,
              obsScreenY,
              obs.width,
              obs.height,
              obs.vehicleKind,
              obs.colorVariant,
              lane.direction,
              showHeadlights
            );
          }
        }
      }
    }

    // 3. Hiệu ứng Onboarding trực quan trên mặt đất khi mới bắt đầu (score < 2)
    const hopLift = Math.sin(this.player.hopProgress * Math.PI) * 18;
    const hopScale = 1 + Math.sin(this.player.hopProgress * Math.PI) * 0.14;
    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.visualY + camY + this.player.height / 2 - hopLift;

    if (this.score < 2) {
      const pulse = REDUCED_MOTION ? 0.5 : (Math.sin(this.onboardingPulseTime * 2.2) + 1) * 0.5;
      g.lineStyle(4, 0xffd166, 0.85 - pulse * 0.45);
      g.strokeCircle(playerCenterX, playerCenterY + 6, 38 + pulse * 18);

      for (let step = 1; step <= 2; step++) {
        const targetY =
          playerCenterY -
          step * LANE_HEIGHT +
          (REDUCED_MOTION ? 0 : Math.sin(this.onboardingPulseTime * 3 - step) * 5);
        const alpha = step === 1 ? 0.88 : 0.52;
        g.fillStyle(0xffd166, alpha * 0.32);
        g.fillCircle(playerCenterX, targetY, 24);
        g.fillStyle(0xffffff, alpha);
        g.fillTriangle(
          playerCenterX,
          targetY - 12,
          playerCenterX - 14,
          targetY + 8,
          playerCenterX + 14,
          targetY + 8
        );
      }
    }

    // 4. Vẽ Nhân vật của người chơi
    const baseSkin = getSkinById(progress.selectedSkin);
    const styledSkin = progress.getStyledSkin(baseSkin);
    drawCharacter(g, playerCenterX, playerCenterY, this.player.width * hopScale, styledSkin, false);

    // 5. Vẽ lớp hiệu ứng Thời tiết đa tầng đã nội suy mượt mà
    this.drawBlendedWeatherOverlay(playerCenterX, playerCenterY, blended);
  }

  /**
   * Vẽ toàn bộ hiệu ứng bầu trời, tia nắng, mưa, bão lũ, tuyết rơi, bão tuyết, sương mù, sấm chớp
   * theo trọng số nội suy mượt mà (không bao giờ bị giật hay cắt cảnh đột ngột)
   */
  private drawBlendedWeatherOverlay(
    playerX: number,
    playerY: number,
    blended: ReturnType<GameScene['getBlendedWeatherState']>
  ) {
    const wg = this.weatherGraphics;
    wg.clear();

    // 1. Lớp phủ màu bầu trời nội suy mượt mà
    if (blended.skyAlpha > 0.005) {
      wg.fillStyle(blended.skyTint, blended.skyAlpha);
      wg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // 2. Tia nắng chiếu xiên (Trời Nắng / Hoàng Hôn / Trời Quang)
    if (blended.sunWeight > 0.02) {
      const sunAlpha = blended.sunWeight * 0.14;
      const sway = REDUCED_MOTION ? 0 : Math.sin(this.onboardingPulseTime * 0.5) * 28;
      wg.fillStyle(0xfef08a, sunAlpha);
      wg.fillTriangle(0, 0, 260 + sway, 0, GAME_WIDTH, 680);
      wg.fillTriangle(260 + sway, 0, 520 + sway, 0, GAME_WIDTH, 420);
      wg.fillCircle(70, 90, 95 * blended.sunWeight);
    }

    // 3. Dòng nước lũ cuồn cuộn (Bão Lũ Dâng Cao)
    if (blended.floodWeight > 0.02) {
      const wAlpha = blended.floodWeight;
      for (const fw of this.floodWaves) {
        const bobY = fw.y + Math.sin(fw.phase) * 8;
        wg.fillStyle(0x38bdf8, wAlpha * 0.28);
        wg.fillRoundedRect(fw.x, bobY, fw.w, 12, 6);
        wg.fillStyle(0xe0f2fe, wAlpha * 0.42);
        wg.fillRoundedRect(fw.x + 12, bobY + 3, fw.w * 0.6, 5, 2.5);
      }
    }

    // 4. Hạt mưa rơi & vòng nước bắn (Mưa Rào / Giông Bão / Bão Lũ)
    if (blended.rainWeight > 0.02) {
      const rAlpha = blended.rainWeight * 0.72;
      const slant = 0.25 + blended.windWeight * 0.42;
      wg.lineStyle(2.5, 0xbae6fd, rAlpha);
      for (const drop of this.rainDrops) {
        wg.lineBetween(drop.x, drop.y, drop.x - drop.len * slant, drop.y + drop.len);
      }

      for (const sp of this.splashRipples) {
        const radius = 4 + sp.phase * 15;
        const alpha = (1 - sp.phase) * 0.55 * blended.rainWeight;
        wg.lineStyle(2, 0xe0f2fe, alpha);
        wg.strokeEllipse(sp.x, sp.y, radius * 2.2, radius);
      }
    }

    // 5. Tuyết rơi & Bão tuyết Bắc Cực (Snow / Blizzard)
    if (blended.snowWeight > 0.02) {
      const sAlpha = blended.snowWeight * 0.88;
      for (const flake of this.snowFlakes) {
        wg.fillStyle(0xffffff, sAlpha);
        wg.fillCircle(flake.x, flake.y, flake.radius);
        wg.fillStyle(0xe0f2fe, sAlpha * 0.45);
        wg.fillCircle(flake.x, flake.y, flake.radius * 1.45);
      }

      // Viền băng giá quanh mép màn hình khi Bão tuyết mạnh
      if (blended.windWeight > 0.5) {
        const frostAlpha = (blended.windWeight - 0.5) * blended.snowWeight * 0.45;
        wg.lineStyle(18, 0xe0f2fe, frostAlpha);
        wg.strokeRect(9, 9, GAME_WIDTH - 18, GAME_HEIGHT - 18);
      }
    }

    // 6. Các lớp Sương Mù trôi bồng bềnh (Fog / Blizzard / Sunset)
    if (blended.fogWeight > 0.02) {
      for (const cloud of this.fogClouds) {
        const cAlpha = cloud.alpha * blended.fogWeight;
        wg.fillStyle(0xe2e8f0, cAlpha);
        wg.fillEllipse(cloud.x, cloud.y, cloud.w, cloud.h);
        wg.fillStyle(0xffffff, cAlpha * 0.65);
        wg.fillEllipse(cloud.x - cloud.w * 0.15, cloud.y - 8, cloud.w * 0.65, cloud.h * 0.7);
      }
    }

    // 7. Vệt gió quét ngang khi có Bão lớn (Giông bão / Bão tuyết / Bão lũ)
    if (blended.windWeight > 0.55) {
      const gustAlpha = (blended.windWeight - 0.5) * 0.35;
      wg.lineStyle(2, 0xf1f5f9, gustAlpha);
      for (let i = 0; i < 7; i++) {
        const gx = ((GAME_WIDTH * 2 - ((this.onboardingPulseTime * 260 + i * 170) % (GAME_WIDTH + 300))) - 150);
        const gy = 140 + i * 155;
        wg.lineBetween(gx, gy, gx + 120, gy - 22);
      }
    }

    // 8. Hào quang ấm quanh nhân vật & Đom đóm khi trời tối / sương mù / bão đêm
    if (blended.headlightWeight > 0.25) {
      const haloAlpha = blended.headlightWeight * 0.15;
      wg.fillStyle(0xfde047, haloAlpha);
      wg.fillCircle(playerX, playerY, 88);
      wg.fillStyle(0xfef9c3, haloAlpha * 0.75);
      wg.fillCircle(playerX, playerY, 48);
    }

    if (blended.nightFlyWeight > 0.05) {
      for (let i = 0; i < 10; i++) {
        const fx = ((i * 137 + 60) % (GAME_WIDTH - 80)) + 40;
        const fy = ((i * 211 + Math.floor(this.cameraOffsetY * 0.4)) % (GAME_HEIGHT - 160)) + 80;
        const glow =
          (REDUCED_MOTION ? 0.7 : 0.4 + 0.5 * Math.sin(this.onboardingPulseTime * 1.6 + i)) *
          blended.nightFlyWeight;
        wg.fillStyle(0xbef264, glow * 0.35);
        wg.fillCircle(fx, fy, 10);
        wg.fillStyle(0xfef08a, glow);
        wg.fillCircle(fx, fy, 3.5);
      }
    }

    // 9. Tia Sấm Chớp (Lightning Flash & Bolt) khi đang Giông bão
    if (this.lightningFlashAlpha > 0.01) {
      wg.fillStyle(0xf8fafc, this.lightningFlashAlpha * 0.55);
      wg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      if (this.lightningBoltPoints.length > 1) {
        wg.lineStyle(6, 0xe0f2fe, this.lightningFlashAlpha);
        for (let i = 0; i < this.lightningBoltPoints.length - 1; i++) {
          const pA = this.lightningBoltPoints[i];
          const pB = this.lightningBoltPoints[i + 1];
          wg.lineBetween(pA.x, pA.y, pB.x, pB.y);
        }
      }
    }
  }

  private spawnFloatingRewardText(screenX: number, screenY: number, label: string) {
    const floatTxt = applyTextOutline(
      this.add
        .text(screenX, screenY - 12, label, {
          fontFamily: FONT_DISPLAY,
          fontSize: '32px',
          color: '#ffd166',
        })
        .setOrigin(0.5)
        .setDepth(50),
      6,
      3
    );

    if (REDUCED_MOTION) {
      this.time.delayedCall(380, () => floatTxt.destroy());
      return;
    }

    this.tweens.add({
      targets: floatTxt,
      y: screenY - 72,
      alpha: 0,
      duration: 460,
      ease: 'Quad.easeOut',
      onComplete: () => floatTxt.destroy(),
    });
  }

  /**
   * Giao diện HUD
   */
  private createHUD() {
    const topY = SAFE_MARGIN_Y + 26;

    // 1. Nút Home góc trái
    createIconButton(this, SAFE_MARGIN_X + 32, topY, 'home', () => {
      if (this.isShopOpen) return;
      soundManager.playClick();
      this.scene.start('MenuScene');
    }).container.setDepth(20);

    // 2. Viên thuốc Tiền Xu
    const coinPill = this.add.graphics().setDepth(20);
    coinPill.fillStyle(COLORS.INK, 1);
    coinPill.fillRoundedRect(SAFE_MARGIN_X + 76, topY - 32, 156, 64, 20);
    coinPill.fillStyle(COLORS.CREAM_CARD, 1);
    coinPill.fillRoundedRect(SAFE_MARGIN_X + 80, topY - 28, 148, 52, 16);
    drawCoin(coinPill, SAFE_MARGIN_X + 108, topY - 2, 14);

    this.coinText = this.add
      .text(SAFE_MARGIN_X + 134, topY - 2, `${progress.coins}`, {
        fontFamily: FONT_DISPLAY,
        fontSize: '30px',
        color: INK_HEX,
      })
      .setOrigin(0, 0.5)
      .setDepth(21);

    // 3. Điểm số chính ở giữa và Huy hiệu Thời tiết (Chạm vào để thử chuyển ngẫu nhiên sang thời tiết tiếp theo)
    this.scoreText = applyTextOutline(
      this.add
        .text(GAME_WIDTH / 2, topY + 14, '0', {
          fontFamily: FONT_DISPLAY,
          fontSize: '92px',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setDepth(20),
      11,
      8
    );

    const weatherBtn = createChunkyButton(
      this,
      GAME_WIDTH / 2,
      topY + 86,
      250,
      40,
      COLORS.INK,
      () => {
        if (this.isShopOpen || this.isGameOver) return;
        soundManager.playClick();
        const nextWeather = climateEngine.selectNextWeather(this.currentWeather, this.score + 1);
        this.transitionToWeather(nextWeather, true);
      },
      { radius: 20, shadow: 3, outline: 2 }
    );
    weatherBtn.container.setDepth(20);

    this.weatherPillText = this.add
      .text(0, 0, WEATHER_PROFILES[this.currentWeather].label, textStyle(15, '900', '#ffd166'))
      .setOrigin(0.5);
    weatherBtn.face.add(this.weatherPillText);

    // 4. Nút mở Bộ Sưu Tập Nhân Vật [???] & Nút Âm thanh góc phải
    createIconButton(
      this,
      GAME_WIDTH - SAFE_MARGIN_X - 108,
      topY,
      'shop',
      () => {
        if (this.isShopOpen || this.isGameOver) return;
        soundManager.playClick();
        this.isShopOpen = true;
        openShopModal(this, () => {
          this.isShopOpen = false;
          this.coinText.setText(`${progress.coins}`);
          this.draw();
        });
      },
      COLORS.BTN_AMBER
    ).container.setDepth(20);

    const soundBtn = createIconButton(
      this,
      GAME_WIDTH - SAFE_MARGIN_X - 32,
      topY,
      soundManager.isMuted() ? 'muted' : 'sound',
      () => {
        const muted = soundManager.toggleMute();
        progress.setMuted(muted);
        soundBtn.setIcon(muted ? 'muted' : 'sound');
      }
    );
    soundBtn.container.setDepth(20);

    // 5. Cụm Onboarding sinh động
    this.onboardingContainer = this.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT - SAFE_MARGIN_Y - 56)
      .setDepth(22);

    const tapBadge = this.add.container(0, -64);
    const tapRing = this.add.graphics();
    tapRing.lineStyle(4, 0xffd166, 0.9);
    tapRing.strokeCircle(0, 0, 34);
    tapRing.fillStyle(COLORS.INK, 0.85);
    tapRing.fillCircle(0, 0, 28);
    const tapIcon = this.add.text(0, 0, '👆', { fontSize: '30px' }).setOrigin(0.5);
    tapBadge.add([tapRing, tapIcon]);

    const promptBg = this.add.graphics();
    promptBg.fillStyle(COLORS.INK, 1);
    promptBg.fillRoundedRect(-270, -28, 540, 56, 28);
    promptBg.fillStyle(COLORS.CREAM_CARD, 1);
    promptBg.fillRoundedRect(-265, -23, 530, 46, 23);

    this.promptLabel = this.add
      .text(0, 0, 'CHẠM HOẶC CLICK ĐỂ NHẢY QUA ĐƯỜNG!', textStyle(20, '900', INK_HEX))
      .setOrigin(0.5);

    this.onboardingContainer.add([tapBadge, promptBg, this.promptLabel]);

    if (!REDUCED_MOTION) {
      this.tweens.add({
        targets: tapBadge,
        y: -78,
        scale: 1.12,
        duration: 460,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.tweens.add({
        targets: this.onboardingContainer,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private setupControls() {
    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        if (this.isGameOver || this.isShopOpen) return;
        if (currentlyOver && currentlyOver.length > 0) return;

        if (pointer.wasTouch) {
          this.promptLabel.setText('Chạm vào màn hình để nhảy tiến lên!');
        } else {
          this.promptLabel.setText('Click chuột hoặc nhấn [Space] để nhảy!');
        }

        this.jumpForward();
      }
    );

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (this.isGameOver || this.isShopOpen) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        this.promptLabel.setText('Nhấn [Space] hoặc [Mũi tên Lên] để nhảy!');
        this.jumpForward();
      }
    });
  }

  private pollGamepadInput() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads[0];
    if (!pad) return;

    const jumpBtn = !!(pad.buttons[0]?.pressed || pad.buttons[12]?.pressed);
    if (jumpBtn && !this.gamepadJumpHeld) {
      this.gamepadJumpHeld = true;
      this.promptLabel.setText('Nhấn nút [A] hoặc [D-Pad Lên] để nhảy!');
      if (!this.isGameOver && !this.isShopOpen) {
        this.jumpForward();
      }
    } else if (!jumpBtn) {
      this.gamepadJumpHeld = false;
    }
  }

  /**
   * Màn hình Game Over
   */
  private triggerGameOver(reason: string) {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (!REDUCED_MOTION) {
      this.cameras.main.shake(150, 0.012);
    }

    const overlay = this.add.graphics().setDepth(200);
    overlay.fillStyle(COLORS.INK, 0.74);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(201);

    const cardW = 580;
    const cardH = 660;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.INK, 1);
    panel.fillRoundedRect(-cardW / 2, -cardH / 2 + 12, cardW, cardH, 36);
    panel.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 36);
    panel.fillStyle(COLORS.CREAM_CARD, 1);
    panel.fillRoundedRect(-cardW / 2 + 6, -cardH / 2 + 6, cardW - 12, cardH - 12, 30);
    modal.add(panel);

    modal.add(
      this.add.text(0, -252, 'THUA CUỘC!', textStyle(48, '900', '#e11d48')).setOrigin(0.5)
    );
    modal.add(
      this.add.text(0, -198, reason, textStyle(21, '700', '#475569')).setOrigin(0.5)
    );

    const statBox = this.add.graphics();
    statBox.fillStyle(COLORS.CREAM_SLOT, 1);
    statBox.fillRoundedRect(-230, -152, 460, 175, 24);
    modal.add(statBox);

    const finalScoreTxt = applyTextOutline(
      this.add
        .text(0, -90, `${this.score}`, {
          fontFamily: FONT_DISPLAY,
          fontSize: '96px',
          color: '#ffffff',
        })
        .setOrigin(0.5),
      9,
      6
    );
    modal.add(finalScoreTxt);

    const isNewBest = this.score > this.startingBestScore && this.score > 0;
    const summaryText = isNewBest
      ? `★ KỶ LỤC MỚI!  •  +${this.runCoinsEarned} XU LƯỢT NÀY`
      : `KỶ LỤC: ${progress.bestScore}  •  +${this.runCoinsEarned} XU LƯỢT NÀY`;

    const summaryLine = this.add
      .text(0, -8, summaryText, textStyle(21, '900', isNewBest ? '#e11d48' : INK_HEX))
      .setOrigin(0.5);
    modal.add(summaryLine);

    const readyCount = progress.countReadyToUnlock();
    const unlockNoticeText = this.add
      .text(
        0,
        54,
        readyCount > 0
          ? `🎉 Có ${readyCount} nhân vật bí ẩn [???] đủ Xu để mở khóa!`
          : `Đã mở khóa ${progress.unlockedSkins.length}/${SKINS.length} nhân vật`,
        textStyle(19, '900', readyCount > 0 ? '#d97706' : '#64748b')
      )
      .setOrigin(0.5);
    modal.add(unlockNoticeText);

    const gameOverButtons: ChunkyButton[] = [];
    let focusIdx = 0;

    const restartBtn = createChunkyButton(
      this,
      0,
      135,
      460,
      86,
      COLORS.BTN_GREEN,
      () => {
        if (this.isShopOpen) return;
        soundManager.playClick();
        cleanupKeyListener();
        this.scene.restart();
      },
      { radius: 24, shadow: 8, outline: 4 }
    );
    restartBtn.face.add(
      applyTextOutline(this.add.text(0, 0, 'CHƠI LẠI (RESTART)', textStyle(30, '900', '#ffffff')).setOrigin(0.5), 6, 4)
    );
    modal.add(restartBtn.container);
    gameOverButtons.push(restartBtn);

    const shopBtn = createChunkyButton(
      this,
      0,
      242,
      460,
      78,
      COLORS.BTN_AMBER,
      () => {
        if (this.isShopOpen) return;
        soundManager.playClick();
        this.isShopOpen = true;
        openShopModal(this, () => {
          this.isShopOpen = false;
          this.coinText.setText(`${progress.coins}`);
          const newReady = progress.countReadyToUnlock();
          unlockNoticeText.setText(
            newReady > 0
              ? `🎉 Có ${newReady} nhân vật bí ẩn [???] đủ Xu để mở khóa!`
              : `Đã mở khóa ${progress.unlockedSkins.length}/${SKINS.length} nhân vật`
          );
          this.draw();
        });
      },
      { radius: 22, shadow: 6, outline: 4 }
    );
    shopBtn.face.add(
      applyTextOutline(
        this.add
          .text(
            0,
            0,
            readyCount > 0 ? `NHÂN VẬT [???] & ĐỔI MÀU (${readyCount})` : 'NHÂN VẬT [???] & ĐỔI MÀU',
            textStyle(24, '900', '#ffffff')
          )
          .setOrigin(0.5),
        6,
        3
      )
    );
    modal.add(shopBtn.container);
    gameOverButtons.push(shopBtn);

    restartBtn.setFocused(true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (this.isShopOpen) return;
      if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        focusIdx = (focusIdx + 1) % gameOverButtons.length;
        gameOverButtons.forEach((b, i) => b.setFocused(i === focusIdx));
        soundManager.playClick();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        gameOverButtons[focusIdx]?.trigger();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const cleanupKeyListener = () => {
      window.removeEventListener('keydown', onKeyDown);
    };
    this.events.once('shutdown', cleanupKeyListener);

    if (!REDUCED_MOTION) {
      modal.setScale(0.78).setAlpha(0);
      this.tweens.add({
        targets: modal,
        scale: 1,
        alpha: 1,
        duration: 210,
        ease: 'Back.easeOut',
      });
    }
  }
}
