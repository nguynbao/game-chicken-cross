/**
 * Official YouTube Playables SDK v1 Integration with localStorage Fallback
 * Supports:
 * - ytgame.game.firstFrameReady() & ytgame.game.gameReady()
 * - ytgame.game.saveData() & ytgame.game.loadData()
 * - ytgame.engagement.sendScore({ value })
 * - ytgame.system.isAudioEnabled(), onAudioEnabledChange(), onPause(), onResume()
 * - ytgame.health.logError() & logWarning()
 */

export interface YTGameSDK {
  IN_PLAYABLES_ENV?: boolean;
  SDK_VERSION?: string;
  game: {
    firstFrameReady: () => void;
    gameReady: () => void;
    loadData?: () => Promise<string | null>;
    saveData?: (data: string) => Promise<void>;
  };
  engagement?: {
    sendScore?: (score: { value: number }) => Promise<void>;
  };
  system?: {
    isAudioEnabled?: () => boolean;
    onAudioEnabledChange?: (callback: (enabled: boolean) => void) => (() => void) | void;
    onPause?: (callback: () => void) => (() => void) | void;
    onResume?: (callback: () => void) => (() => void) | void;
    getLanguage?: () => Promise<string>;
  };
  health?: {
    logError?: () => void;
    logWarning?: () => void;
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
  private pauseCallback: (() => void) | null = null;
  private resumeCallback: (() => void) | null = null;
  private firstFrameSent: boolean = false;
  private gameReadySent: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && window.ytgame) {
      this.sdk = window.ytgame;
      try {
        this.sdk.system?.onAudioEnabledChange?.((enabled) => {
          this.audioCallback?.(enabled);
        });
        this.sdk.system?.onPause?.(() => {
          this.pauseCallback?.();
        });
        this.sdk.system?.onResume?.(() => {
          this.resumeCallback?.();
        });
      } catch (e) {
        console.warn('[YouTube Playables] Failed to register system listeners:', e);
      }
    }
  }

  public isPlayablesEnv(): boolean {
    return !!(this.sdk && this.sdk.IN_PLAYABLES_ENV);
  }

  public notifyFirstFrameReady() {
    if (this.firstFrameSent) return;
    this.firstFrameSent = true;
    try {
      this.sdk?.game?.firstFrameReady?.();
    } catch {
      // Ignore outside Playables environment
    }
  }

  public notifyGameReady() {
    if (this.gameReadySent) return;
    this.gameReadySent = true;
    try {
      this.sdk?.game?.gameReady?.();
    } catch {
      // Ignore outside Playables environment
    }
  }

  public async sendScore(score: number): Promise<void> {
    if (score <= 0) return;
    try {
      if (this.sdk?.engagement?.sendScore) {
        await this.sdk.engagement.sendScore({ value: Math.floor(score) });
      }
    } catch (e) {
      console.warn('[YouTube Playables] sendScore error:', e);
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

  public onLifecycleChange(onPause: () => void, onResume: () => void) {
    this.pauseCallback = onPause;
    this.resumeCallback = onResume;
  }

  public async save(data: string): Promise<void> {
    try {
      if (this.sdk?.game?.saveData) {
        await this.sdk.game.saveData(data);
      }
    } catch (e) {
      console.warn('[YouTube Playables] saveData error:', e);
      this.sdk?.health?.logWarning?.();
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch {
      // Ignore if localStorage is blocked
    }
  }

  public async load(): Promise<string> {
    try {
      if (this.sdk?.game?.loadData) {
        const cloudData = await this.sdk.game.loadData();
        if (cloudData) return cloudData;
      }
    } catch (e) {
      console.warn('[YouTube Playables] loadData error, falling back to localStorage:', e);
      this.sdk?.health?.logWarning?.();
    }

    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }
}

export const ytService = new YouTubePlayablesService();
