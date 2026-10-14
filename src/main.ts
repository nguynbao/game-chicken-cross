import Phaser from 'phaser';
// Đóng gói font chữ nội bộ (@fontsource) để game tự chủ hoàn toàn trên YouTube Playables
import '@fontsource/bagel-fat-one/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/vietnamese-700.css';
import '@fontsource/nunito/latin-900.css';
import '@fontsource/nunito/vietnamese-900.css';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from './constants';
import { progress } from './progress';
import { soundManager } from './audio/SoundManager';
import { ytService } from './ytgame';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: COLORS.GRASS_LIGHT,
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER, // Căn giữa thông qua CSS Flexbox của #game-container
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [MenuScene, GameScene],
  input: {
    activePointers: 2,
  },
};

// Đảm bảo font chữ sẵn sàng trước khi vẽ lên Canvas (tối đa chờ 1.5s)
async function loadFonts() {
  const loads = Promise.all([
    document.fonts.load('64px "Bagel Fat One"', '0123456789CrossingTap'),
    document.fonts.load('700 20px "Nunito"', 'Kỷ lục Xu Cửa Hàng'),
    document.fonts.load('900 24px "Nunito"', 'Bắt đầu chơi Chơi lại'),
  ]);
  const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    await Promise.race([loads, timeout]);
  } catch {
    // Dự phòng về system font nếu lỗi
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadFonts(), progress.load()]);
  soundManager.setMuted(progress.muted || !ytService.isAudioEnabled());
  ytService.onAudioChange((enabled) => {
    soundManager.setMuted(!enabled || progress.muted);
  });
  new Phaser.Game(config);
});
