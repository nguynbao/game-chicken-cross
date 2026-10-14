/**
 * Tích hợp YouTube Playables SDK chính thức kèm cơ chế dự phòng localStorage
 * Tham khảo chuẩn từ dự án Block Blast & Single Line
 */

export interface YTGameSDK {
  IN_PLAYABLES_ENV?: boolean;
  game: {
    firstFrameReady: () => void;
    gameReady: () => void;
    loadData?: () => Promise<string | null>;
    saveData?: (data: string) => Promise<void>;
  };
  system?: {
    isAudioEnabled?: () => boolean;
    onAudioEnabledChange?: (callback: (enabled: boolean) => void) => void;
    onPause?: (callback: () => void) => void;
    onResume?: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    ytgame?: YTGameSDK;
  }
}

const LOCAL_STORAGE_KEY = 'crossing_tap_save_v1';

class YouTubePlayablesService {
  private sdk: YTGameSDK | null = null;
  private audioCallback: ((enabled: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ytgame) {
      this.sdk = window.ytgame;
      try {
        this.sdk.system?.onAudioEnabledChange?.((enabled) => {
          this.audioCallback?.(enabled);
        });
      } catch (e) {
        console.warn('[YouTube Playables] Không thể gắn listener âm thanh:', e);
      }
    }
  }

  public notifyFirstFrameReady() {
    try {
      this.sdk?.game?.firstFrameReady?.();
    } catch {
      // Bỏ qua lỗi ngoài môi trường Playables
    }
  }

  public notifyGameReady() {
    try {
      this.sdk?.game?.gameReady?.();
    } catch {
      // Bỏ qua lỗi ngoài môi trường Playables
    }
  }

  public isAudioEnabled(): boolean {
    try {
      return this.sdk?.system?.isAudioEnabled?.() ?? true;
    } catch {
      return true;
    }
  }

  public onAudioChange(cb: (enabled: boolean) => void) {
    this.audioCallback = cb;
  }

  public async save(data: string): Promise<void> {
    try {
      if (this.sdk?.game?.saveData) {
        await this.sdk.game.saveData(data);
      }
    } catch (e) {
      console.warn('[YouTube Playables] Lỗi saveData:', e);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }

  public async load(): Promise<string> {
    try {
      if (this.sdk?.game?.loadData) {
        const cloudData = await this.sdk.game.loadData();
        if (cloudData) return cloudData;
      }
    } catch (e) {
      console.warn('[YouTube Playables] Lỗi loadData, chuyển sang localStorage:', e);
    }

    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }
}

export const ytService = new YouTubePlayablesService();
