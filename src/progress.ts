import {
  SKINS,
  getSkinById,
  getDyeById,
  type SkinDefinition,
  type ColorDyeDefinition,
} from './constants';
import { ytService } from './ytgame';

/**
 * Quản lý dữ liệu lưu trữ:
 * - Kỷ lục điểm cao nhất (bestScore)
 * - Số Xu hiện có (coins)
 * - Danh sách nhân vật đã mở khóa (unlockedSkins)
 * - Nhân vật đang sử dụng (selectedSkin)
 * - Các màu nhuộm (Color Dyes) đã mở khóa và màu đang chọn cho từng nhân vật
 */
interface SaveDataShape {
  v: 2;
  bestScore: number;
  coins: number;
  unlockedSkins: string[];
  selectedSkin: string;
  unlockedDyes: string[];
  selectedDyeBySkin: Record<string, string>;
  muted: boolean;
}

class ProgressManager {
  public bestScore: number = 0;
  public coins: number = 0;
  public unlockedSkins: string[] = ['chicken'];
  public selectedSkin: string = 'chicken';
  public unlockedDyes: string[] = ['default'];
  public selectedDyeBySkin: Record<string, string> = {};
  public muted: boolean = false;
  private isLoaded: boolean = false;

  public async load(): Promise<void> {
    if (this.isLoaded) return;
    const raw = await ytService.load();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<SaveDataShape>;
        this.bestScore = Number(parsed.bestScore) || 0;
        this.coins = Number(parsed.coins) || 0;
        if (Array.isArray(parsed.unlockedSkins) && parsed.unlockedSkins.length > 0) {
          this.unlockedSkins = parsed.unlockedSkins.filter((id) =>
            SKINS.some((s) => s.id === id)
          );
        }
        if (parsed.selectedSkin && SKINS.some((s) => s.id === parsed.selectedSkin)) {
          this.selectedSkin = parsed.selectedSkin;
        }
        if (Array.isArray(parsed.unlockedDyes) && parsed.unlockedDyes.length > 0) {
          this.unlockedDyes = parsed.unlockedDyes;
        }
        if (parsed.selectedDyeBySkin && typeof parsed.selectedDyeBySkin === 'object') {
          this.selectedDyeBySkin = parsed.selectedDyeBySkin;
        }
        this.muted = !!parsed.muted;
      } catch {
        // Dự phòng về mặc định nếu lỗi JSON
      }
    }

    if (!this.unlockedSkins.includes('chicken')) {
      this.unlockedSkins.unshift('chicken');
    }
    if (!this.unlockedSkins.includes(this.selectedSkin)) {
      this.selectedSkin = 'chicken';
    }
    if (!this.unlockedDyes.includes('default')) {
      this.unlockedDyes.unshift('default');
    }
    this.isLoaded = true;
  }

  public persist(): void {
    const payload: SaveDataShape = {
      v: 2,
      bestScore: this.bestScore,
      coins: this.coins,
      unlockedSkins: this.unlockedSkins,
      selectedSkin: this.selectedSkin,
      unlockedDyes: this.unlockedDyes,
      selectedDyeBySkin: this.selectedDyeBySkin,
      muted: this.muted,
    };
    void ytService.save(JSON.stringify(payload));
  }

  public addCoins(amount: number = 1): void {
    this.coins += amount;
    this.persist();
  }

  public updateBestScore(score: number): boolean {
    if (score > this.bestScore) {
      this.bestScore = score;
      this.persist();
      void ytService.sendScore(score);
      return true;
    }
    return false;
  }

  public isSkinUnlocked(id: string): boolean {
    return this.unlockedSkins.includes(id);
  }

  /**
   * Kiểm tra điều kiện mở khóa nhân vật:
   * - Muốn mua mở khóa bắt buộc phải ĐỦ TIỀN XU (coins >= skin.cost)!
   */
  public canUnlockSkin(skin: SkinDefinition): {
    reachedMilestone: boolean;
    hasEnoughCoins: boolean;
    canUnlock: boolean;
  } {
    const reachedMilestone = this.bestScore >= skin.reqScore;
    const hasEnoughCoins = this.coins >= skin.cost;
    return {
      reachedMilestone,
      hasEnoughCoins,
      canUnlock: hasEnoughCoins,
    };
  }

  /**
   * Mở khóa nhân vật và LUÔN TRỪ TIỀN XU (this.coins -= skin.cost)
   */
  public unlockAndSelectSkin(skin: SkinDefinition): boolean {
    if (this.isSkinUnlocked(skin.id)) {
      this.selectedSkin = skin.id;
      this.persist();
      return true;
    }

    if (this.coins < skin.cost) {
      return false;
    }

    // Luôn trừ đúng số Xu của nhân vật khi mua!
    this.coins = Math.max(0, this.coins - skin.cost);
    this.unlockedSkins.push(skin.id);
    this.selectedSkin = skin.id;
    this.persist();
    return true;
  }

  public selectSkin(id: string): boolean {
    if (!this.isSkinUnlocked(id)) return false;
    this.selectedSkin = id;
    this.persist();
    return true;
  }

  /**
   * Quản lý Màu Nhuộm (Color Dyes) mua bằng Coin
   */
  public isDyeUnlocked(dyeId: string): boolean {
    return dyeId === 'default' || this.unlockedDyes.includes(dyeId);
  }

  public getSelectedDyeForSkin(skinId: string): ColorDyeDefinition {
    const dyeId = this.selectedDyeBySkin[skinId] || 'default';
    return getDyeById(dyeId);
  }

  public buyOrSelectDye(skinId: string, dye: ColorDyeDefinition): 'selected' | 'bought' | 'no_coins' {
    if (this.isDyeUnlocked(dye.id)) {
      this.selectedDyeBySkin[skinId] = dye.id;
      this.persist();
      return 'selected';
    }

    if (this.coins < dye.cost) {
      return 'no_coins';
    }

    // Trừ tiền Xu khi mua màu mới
    this.coins = Math.max(0, this.coins - dye.cost);
    this.unlockedDyes.push(dye.id);
    this.selectedDyeBySkin[skinId] = dye.id;
    this.persist();
    return 'bought';
  }

  /**
   * Lấy thông tin Skin kèm màu sắc đã đổi (nếu người chơi đã chọn màu nhuộm cho nhân vật đó)
   */
  public getStyledSkin(skinOrId: string | SkinDefinition): SkinDefinition {
    const base = typeof skinOrId === 'string' ? getSkinById(skinOrId) : skinOrId;
    const dye = this.getSelectedDyeForSkin(base.id);
    if (dye.id === 'default') return base;
    return {
      ...base,
      fill: dye.fill,
      light: dye.light,
      dark: dye.dark,
    };
  }

  public countReadyToUnlock(): number {
    return SKINS.filter(
      (s) => !this.isSkinUnlocked(s.id) && this.coins >= s.cost
    ).length;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.persist();
  }
}

export const progress = new ProgressManager();
