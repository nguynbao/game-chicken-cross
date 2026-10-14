import Phaser from 'phaser';
// Self-hosted fonts (@fontsource) for 100% offline/sandboxed compliance on YouTube Playables
import '@fontsource/bagel-fat-one/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-900.css';
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
    autoCenter: Phaser.Scale.NO_CENTER,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [MenuScene, GameScene],
  input: {
    activePointers: 2,
  },
};

async function loadFonts() {
  const loads = Promise.all([
    document.fonts.load('64px "Bagel Fat One"', '0123456789CrossingTap!?'),
    document.fonts.load('700 20px "Nunito"', 'Best Score Coins Heroes Shop'),
    document.fonts.load('900 24px "Nunito"', 'PLAY NOW UNLOCK EQUIPPED'),
  ]);
  const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    await Promise.race([loads, timeout]);
  } catch {
    // Fallback to system fonts if loading fails
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadFonts(), progress.load()]);
  soundManager.setMuted(progress.muted || !ytService.isAudioEnabled());

  ytService.onAudioChange((enabled) => {
    soundManager.setMuted(!enabled || progress.muted);
  });

  const game = new Phaser.Game(config);

  // Handle YouTube Playables pause & resume lifecycle events
  ytService.onLifecycleChange(
    () => {
      game.scene.getScenes(true).forEach((s) => s.scene.pause());
    },
    () => {
      game.scene.getScenes(false).forEach((s) => {
        if (s.scene.isPaused()) {
          s.scene.resume();
        }
      });
    }
  );
});
