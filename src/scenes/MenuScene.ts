import Phaser from 'phaser';
import {
  COLORS,
  FONT_DISPLAY,
  GAME_HEIGHT,
  GAME_WIDTH,
  INK_HEX,
  SAFE_MARGIN_X,
  SAFE_MARGIN_Y,
  SKINS,
  type VehicleKind,
} from '../constants';
import { progress } from '../progress';
import { soundManager } from '../audio/SoundManager';
import { ytService } from '../ytgame';
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
  playUnlockRevealAnimation,
  textStyle,
  type ChunkyButton,
} from '../ui';

let firstBoot = true;

interface DemoMover {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  dir: 1 | -1;
  kind: 'log' | VehicleKind;
  colorVariant: number;
}

export class MenuScene extends Phaser.Scene {
  private bgMoverGraphics!: Phaser.GameObjects.Graphics;
  private demoMovers: DemoMover[] = [];

  private previewAvatarGfx!: Phaser.GameObjects.Graphics;
  private previewQuestionText!: Phaser.GameObjects.Text;
  private previewNameText!: Phaser.GameObjects.Text;
  private previewRoleText!: Phaser.GameObjects.Text;
  private previewActionBtnContainer!: Phaser.GameObjects.Container;

  private coinValueText!: Phaser.GameObjects.Text;
  private bestValueText!: Phaser.GameObjects.Text;
  private unlockBadgeText!: Phaser.GameObjects.Text;

  private previewIndex: number = 0;
  private isShopOpen: boolean = false;
  private menuButtons: ChunkyButton[] = [];
  private focusedIdx: number = 0;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.GRASS_LIGHT);
    this.isShopOpen = false;
    this.menuButtons = [];
    this.focusedIdx = 0;
    this.demoMovers = [];

    // Khởi tạo vị trí xem trước đúng vào nhân vật đang được trang bị
    const activeIdx = SKINS.findIndex((s) => s.id === progress.selectedSkin);
    this.previewIndex = activeIdx >= 0 ? activeIdx : 0;

    if (firstBoot) {
      firstBoot = false;
      ytService.notifyFirstFrameReady();
      ytService.notifyGameReady();
    }

    this.createLivingBackground();
    this.createTopBar();
    this.createTitleHeader();
    this.createCharacterCarouselCard();
    this.createMainButtons();
    this.setupKeyboardNavigation();
  }

  override update(_time: number, delta: number) {
    if (!this.bgMoverGraphics || REDUCED_MOTION) return;

    const dt = Math.min(delta / 16.667, 2.5);
    this.bgMoverGraphics.clear();

    for (const m of this.demoMovers) {
      m.x += m.speed * m.dir * dt;
      if (m.dir === 1 && m.x > GAME_WIDTH + 60) {
        m.x = -m.w - 80;
      } else if (m.dir === -1 && m.x + m.w < -60) {
        m.x = GAME_WIDTH + 80;
      }

      if (m.kind === 'log') {
        drawLog(this.bgMoverGraphics, m.x, m.y, m.w, m.h);
      } else {
        drawVehicle(this.bgMoverGraphics, m.x, m.y, m.w, m.h, m.kind, m.colorVariant, m.dir, false);
      }
    }
  }

  /**
   * Phông nền sống động có đủ loại xe (Xe máy, Ô tô, Xe tải) và khúc gỗ trôi phía sau
   */
  private createLivingBackground() {
    const bg = this.add.graphics();

    const rows = Math.ceil(GAME_HEIGHT / 80);
    for (let i = 0; i < rows; i++) {
      const y = i * 80;
      bg.fillStyle(i % 2 === 0 ? COLORS.GRASS_LIGHT : COLORS.GRASS_DARK, 1);
      bg.fillRect(0, y, GAME_WIDTH, 80);
    }

    // Dải sông phía trên
    const riverY = 160;
    bg.fillStyle(COLORS.RIVER_DEEP, 1);
    bg.fillRect(0, riverY, GAME_WIDTH, 8);
    bg.fillStyle(COLORS.RIVER, 1);
    bg.fillRect(0, riverY + 8, GAME_WIDTH, 72);

    // Dải đường đôi phía dưới
    const roadY = 1040;
    bg.fillStyle(COLORS.ROAD_CURB, 1);
    bg.fillRect(0, roadY - 5, GAME_WIDTH, 170);
    bg.fillStyle(COLORS.ROAD, 1);
    bg.fillRect(0, roadY, GAME_WIDTH, 160);
    bg.fillStyle(COLORS.ROAD_DOUBLE_LINE, 0.9);
    for (let x = 20; x < GAME_WIDTH; x += 72) {
      bg.fillRoundedRect(x, roadY + 78, 42, 5, 2);
    }

    // Cây trang trí hai bên rìa
    drawSideTree(bg, 42, 420, 1.1);
    drawSideTree(bg, GAME_WIDTH - 42, 460, 1.0);
    drawSideTree(bg, 38, 860, 0.95);
    drawSideTree(bg, GAME_WIDTH - 40, 880, 1.1);

    this.bgMoverGraphics = this.add.graphics();
    this.demoMovers = [
      { x: 60, y: riverY + 11, w: 185, h: 58, speed: 1.1, dir: 1, kind: 'log', colorVariant: 0 },
      { x: 440, y: riverY + 11, w: 195, h: 58, speed: 1.1, dir: 1, kind: 'log', colorVariant: 0 },
      { x: 70, y: roadY + 11, w: 82, h: 58, speed: 2.8, dir: 1, kind: 'motorbike', colorVariant: 3 },
      { x: 380, y: roadY + 11, w: 190, h: 58, speed: 2.0, dir: 1, kind: 'truck', colorVariant: 1 },
      { x: 200, y: roadY + 91, w: 122, h: 58, speed: 2.4, dir: -1, kind: 'car', colorVariant: 0 },
      { x: 560, y: roadY + 91, w: 132, h: 58, speed: 3.0, dir: -1, kind: 'sports', colorVariant: 2 },
    ];

    // Vẽ vị trí ban đầu ngay cả khi bật Reduced Motion
    for (const m of this.demoMovers) {
      if (m.kind === 'log') {
        drawLog(this.bgMoverGraphics, m.x, m.y, m.w, m.h);
      } else {
        drawVehicle(this.bgMoverGraphics, m.x, m.y, m.w, m.h, m.kind, m.colorVariant, m.dir, false);
      }
    }
  }

  /**
   * Thanh Top Bar trong vùng an toàn (Safe Zone): Hiển thị Xu, Kỷ lục và Nút Âm thanh
   */
  private createTopBar() {
    const topY = SAFE_MARGIN_Y + 26;

    // Viên thuốc hiển thị Tiền Xu (Kem sáng + Viền mực)
    const coinPill = this.add.graphics();
    coinPill.fillStyle(COLORS.INK, 1);
    coinPill.fillRoundedRect(SAFE_MARGIN_X, topY - 30, 195, 64, 22);
    coinPill.fillStyle(COLORS.CREAM_CARD, 1);
    coinPill.fillRoundedRect(SAFE_MARGIN_X + 4, topY - 26, 187, 52, 18);
    drawCoin(coinPill, SAFE_MARGIN_X + 40, topY, 15);

    this.coinValueText = this.add
      .text(SAFE_MARGIN_X + 70, topY, `${progress.coins}`, {
        fontFamily: FONT_DISPLAY,
        fontSize: '32px',
        color: INK_HEX,
      })
      .setOrigin(0, 0.5);

    // Viên thuốc hiển thị Kỷ Lục (Đã bỏ chữ CẤP theo yêu cầu)
    const bestPill = this.add.graphics();
    bestPill.fillStyle(COLORS.INK, 1);
    bestPill.fillRoundedRect(SAFE_MARGIN_X + 208, topY - 30, 195, 64, 22);
    bestPill.fillStyle(COLORS.CREAM_CARD, 1);
    bestPill.fillRoundedRect(SAFE_MARGIN_X + 212, topY - 26, 187, 52, 18);

    this.bestValueText = this.add
      .text(SAFE_MARGIN_X + 305, topY, `KỶ LỤC: ${progress.bestScore}`, textStyle(20, '900', INK_HEX))
      .setOrigin(0.5);

    // Nút Âm thanh góc phải
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
  }

  /**
   * Cụm tiêu đề "CROSSING TAP" nổi khối 3D
   */
  private createTitleHeader() {
    const makeWord = (word: string, y: number, size: number, rot: number, color: string) => {
      const t = this.add
        .text(GAME_WIDTH / 2, y, word, {
          fontFamily: FONT_DISPLAY,
          fontSize: `${size}px`,
          color,
        })
        .setOrigin(0.5)
        .setRotation(rot);
      t.setStroke(INK_HEX, 13);
      t.setShadow(0, 10, INK_HEX, 0, true, true);
      return t;
    };

    const w1 = makeWord('Crossing', 255, 110, -0.035, '#ffffff');
    const w2 = makeWord('Tap!', 360, 108, 0.03, '#ffd93d');

    if (!REDUCED_MOTION) {
      [w1, w2].forEach((w, i) => {
        w.setScale(0.65).setAlpha(0);
        this.tweens.add({
          targets: w,
          scale: 1,
          alpha: 1,
          duration: 240,
          delay: i * 70,
          ease: 'Back.easeOut',
        });
      });
    }
  }

  /**
   * Khung Chọn Nhân Vật Trực Tiếp trên Menu (46 Nhân vật + Bóng đen Bí Ẩn [???])
   */
  private createCharacterCarouselCard() {
    const cardY = 605;
    const cardW = 590;
    const cardH = 310;

    const cardG = this.add.graphics();
    cardG.fillStyle(COLORS.INK, 1);
    cardG.fillRoundedRect(GAME_WIDTH / 2 - cardW / 2, cardY - cardH / 2 + 10, cardW, cardH, 32);
    cardG.fillRoundedRect(GAME_WIDTH / 2 - cardW / 2, cardY - cardH / 2, cardW, cardH, 32);
    cardG.fillStyle(COLORS.CREAM_CARD, 1);
    cardG.fillRoundedRect(
      GAME_WIDTH / 2 - cardW / 2 + 5,
      cardY - cardH / 2 + 5,
      cardW - 10,
      cardH - 10,
      27
    );

    // Bục tròn dưới chân nhân vật
    cardG.fillStyle(COLORS.CREAM_SLOT, 1);
    cardG.fillEllipse(GAME_WIDTH / 2, cardY - 12, 160, 46);

    // Nút chuyển Trái "<"
    const prevBtn = createChunkyButton(
      this,
      GAME_WIDTH / 2 - 215,
      cardY - 30,
      68,
      68,
      COLORS.WHITE,
      () => {
        if (this.isShopOpen) return;
        soundManager.playClick();
        this.previewIndex = (this.previewIndex - 1 + SKINS.length) % SKINS.length;
        this.tryAutoEquipPreview();
        this.refreshCarouselUI();
      },
      { radius: 18, shadow: 6, outline: 4 }
    );
    prevBtn.face.add(this.add.text(0, -2, '◀', textStyle(28, '900', INK_HEX)).setOrigin(0.5));

    // Nút chuyển Phải ">"
    const nextBtn = createChunkyButton(
      this,
      GAME_WIDTH / 2 + 215,
      cardY - 30,
      68,
      68,
      COLORS.WHITE,
      () => {
        if (this.isShopOpen) return;
        soundManager.playClick();
        this.previewIndex = (this.previewIndex + 1) % SKINS.length;
        this.tryAutoEquipPreview();
        this.refreshCarouselUI();
      },
      { radius: 18, shadow: 6, outline: 4 }
    );
    nextBtn.face.add(this.add.text(0, -2, '▶', textStyle(28, '900', INK_HEX)).setOrigin(0.5));

    this.previewAvatarGfx = this.add.graphics();
    this.previewQuestionText = applyTextOutline(
      this.add
        .text(GAME_WIDTH / 2, cardY - 46, '?', {
          fontFamily: FONT_DISPLAY,
          fontSize: '48px',
          color: '#ffc93c',
        })
        .setOrigin(0.5),
      7,
      4
    );

    this.previewNameText = this.add
      .text(GAME_WIDTH / 2, cardY + 34, '', textStyle(29, '900', INK_HEX))
      .setOrigin(0.5);

    this.previewRoleText = this.add
      .text(GAME_WIDTH / 2, cardY + 66, '', textStyle(18, '700', '#475569'))
      .setOrigin(0.5);

    this.previewActionBtnContainer = this.add.container(GAME_WIDTH / 2, cardY + 114);

    this.refreshCarouselUI();
  }

  private tryAutoEquipPreview() {
    const skin = SKINS[this.previewIndex];
    if (progress.isSkinUnlocked(skin.id)) {
      progress.selectSkin(skin.id);
    }
  }

  private refreshCarouselUI() {
    const skin = SKINS[this.previewIndex];
    const styledSkin = progress.getStyledSkin(skin);
    const isUnlocked = progress.isSkinUnlocked(skin.id);
    const isSelected = progress.selectedSkin === skin.id;
    const { reachedMilestone, canUnlock } = progress.canUnlockSkin(skin);

    this.coinValueText.setText(`${progress.coins}`);
    this.bestValueText.setText(`KỶ LỤC: ${progress.bestScore}`);

    const cardY = 605;
    this.previewAvatarGfx.clear();
    drawCharacter(this.previewAvatarGfx, GAME_WIDTH / 2, cardY - 46, 86, styledSkin, !isUnlocked);
    this.previewQuestionText.setVisible(!isUnlocked);

    // Nếu chưa mở khóa: Hiển thị tên là "???" và giá mua bằng Xu
    if (isUnlocked) {
      this.previewNameText.setText(`${skin.name} (${this.previewIndex + 1}/${SKINS.length})`);
      this.previewNameText.setColor(INK_HEX);
      this.previewRoleText.setText(isSelected ? `✓ Đang trang bị • ${skin.roleTitle}` : skin.roleTitle);
      this.previewRoleText.setColor('#16a34a');
    } else {
      this.previewNameText.setText(`??? (${this.previewIndex + 1}/${SKINS.length})`);
      this.previewNameText.setColor('#334155');
      this.previewRoleText.setText(
        reachedMilestone
          ? `Đã đạt mốc ${skin.reqScore} bước • Giá mở khóa: ${skin.cost} Xu`
          : `Mốc gợi ý: ${skin.reqScore} bước • Giá mở khóa: ${skin.cost} Xu`
      );
      this.previewRoleText.setColor(canUnlock ? '#d97706' : '#64748b');
    }

    // Nút bên dưới nhân vật đang xem trước
    this.previewActionBtnContainer.removeAll(true);
    if (!isUnlocked) {
      const btnColor = canUnlock ? COLORS.BTN_AMBER : COLORS.BTN_GRAY;
      const btnText = canUnlock
        ? `MỞ KHÓA NGAY (-${skin.cost} XU)`
        : `🔒 CẦN ${skin.cost} XU ĐỂ MỞ KHÓA`;

      const unlockBtn = createChunkyButton(
        this,
        0,
        0,
        390,
        52,
        btnColor,
        () => {
          if (canUnlock) {
            soundManager.playUnlock();
            progress.unlockAndSelectSkin(skin);
            this.refreshCarouselUI();
            this.updateUnlockNotificationBadge();
            playUnlockRevealAnimation(this, progress.getStyledSkin(skin));
          } else {
            soundManager.playCrash();
          }
        },
        { radius: 16, shadow: 5, outline: 3 }
      );
      unlockBtn.face.add(
        applyTextOutline(this.add.text(0, 0, btnText, textStyle(18, '900', '#ffffff')).setOrigin(0.5), 4, 2)
      );
      this.previewActionBtnContainer.add(unlockBtn.container);
    } else if (!isSelected) {
      const equipBtn = createChunkyButton(
        this,
        0,
        0,
        280,
        50,
        COLORS.BTN_BLUE,
        () => {
          soundManager.playClick();
          progress.selectSkin(skin.id);
          this.refreshCarouselUI();
        },
        { radius: 16, shadow: 5, outline: 3 }
      );
      equipBtn.face.add(
        applyTextOutline(this.add.text(0, 0, 'CHỌN NHÂN VẬT NÀY', textStyle(18, '900', '#ffffff')).setOrigin(0.5), 4, 2)
      );
      this.previewActionBtnContainer.add(equipBtn.container);
    } else {
      const dyeBtn = createChunkyButton(
        this,
        0,
        0,
        310,
        46,
        COLORS.BTN_BLUE,
        () => {
          if (this.isShopOpen) return;
          soundManager.playClick();
          this.openVaultAndDyeShop();
        },
        { radius: 16, shadow: 4, outline: 3 }
      );
      dyeBtn.face.add(
        applyTextOutline(this.add.text(0, 0, '🎨 ĐỔI MÀU SƠN / TỦ ĐỒ', textStyle(17, '900', '#ffffff')).setOrigin(0.5), 4, 2)
      );
      this.previewActionBtnContainer.add(dyeBtn.container);
    }
  }

  private openVaultAndDyeShop() {
    this.isShopOpen = true;
    openShopModal(this, () => {
      this.isShopOpen = false;
      const idx = SKINS.findIndex((s) => s.id === progress.selectedSkin);
      if (idx >= 0) this.previewIndex = idx;
      this.refreshCarouselUI();
      this.updateUnlockNotificationBadge();
    });
  }

  /**
   * Hai nút lớn phía dưới: BẮT ĐẦU CHƠI và NHÂN VẬT & ĐỔI MÀU [???]
   */
  private createMainButtons() {
    const playBtn = createChunkyButton(
      this,
      GAME_WIDTH / 2,
      850,
      560,
      104,
      COLORS.BTN_GREEN,
      () => {
        if (this.isShopOpen) return;
        soundManager.playClick();
        this.scene.start('GameScene');
      },
      { radius: 28, shadow: 10, outline: 5 }
    );
    playBtn.face.add(
      applyTextOutline(this.add.text(0, 0, 'BẮT ĐẦU CHƠI', textStyle(42, '900', '#ffffff')).setOrigin(0.5), 8, 5)
    );

    const vaultBtn = createChunkyButton(
      this,
      GAME_WIDTH / 2,
      978,
      560,
      82,
      COLORS.BTN_AMBER,
      () => {
        if (this.isShopOpen) return;
        soundManager.playClick();
        this.openVaultAndDyeShop();
      },
      { radius: 24, shadow: 8, outline: 4 }
    );

    this.unlockBadgeText = applyTextOutline(
      this.add.text(0, 0, '', textStyle(25, '900', '#ffffff')).setOrigin(0.5),
      6,
      3
    );
    vaultBtn.face.add(this.unlockBadgeText);
    this.updateUnlockNotificationBadge();

    this.menuButtons = [playBtn, vaultBtn];
  }

  private updateUnlockNotificationBadge() {
    const unlockedCount = progress.unlockedSkins.length;
    const readyCount = progress.countReadyToUnlock();
    if (readyCount > 0) {
      this.unlockBadgeText.setText(`46 NHÂN VẬT [???] & ĐỔI MÀU • ${readyCount} MỚI!`);
    } else {
      this.unlockBadgeText.setText(`NHÂN VẬT & ĐỔI MÀU (${unlockedCount}/${SKINS.length})`);
    }
  }

  private setupKeyboardNavigation() {
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (this.isShopOpen) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.previewIndex = (this.previewIndex - 1 + SKINS.length) % SKINS.length;
        this.tryAutoEquipPreview();
        this.refreshCarouselUI();
        soundManager.playClick();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.previewIndex = (this.previewIndex + 1) % SKINS.length;
        this.tryAutoEquipPreview();
        this.refreshCarouselUI();
        soundManager.playClick();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.focusedIdx = (this.focusedIdx + 1) % this.menuButtons.length;
        this.menuButtons.forEach((b, i) => b.setFocused(i === this.focusedIdx));
        soundManager.playClick();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        this.menuButtons[this.focusedIdx]?.trigger();
      }
    });
  }
}
