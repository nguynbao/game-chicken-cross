# Crossing Tap - YouTube Playables Edition 🐔

Tựa game 2D Arcade **Crossing Tap** (lối chơi vượt chướng ngại vật lấy cảm hứng từ Crossy Road) được tối ưu hóa cho **YouTube Playables**, thiết bị di động và trình duyệt máy tính. Xây dựng trên cùng nền tảng công nghệ chuẩn với **Block Blast** và **Single Line**: **Phaser 3 + TypeScript + Vite**.

---

## 🌟 Công Nghệ & Kiến Trúc Chuẩn

1. **Nền tảng Phaser 3 + TypeScript + Vite:**
   - Độ phân giải logic chuẩn dọc `720x1280` kết hợp `Phaser.Scale.FIT` và CSS Flexbox căn giữa mọi tỷ lệ màn hình (điện thoại dọc, máy tính bảng, iframe 16:9).
   - Font chữ tự đóng gói nội bộ (`@fontsource/bagel-fat-one` & `@fontsource/nunito` hỗ trợ đầy đủ tiếng Việt) giúp gói build hoạt động độc lập 100%, không gọi mạng ngoài.

2. **Tích hợp YouTube Playables SDK (`src/ytgame.ts`):**
   - Hỗ trợ đầy đủ vòng đời `firstFrameReady()`, `gameReady()`, đồng bộ âm thanh hệ thống (`isAudioEnabled`, `onAudioEnabledChange`) và lưu trữ đám mây (`saveData` / `loadData`) kèm cơ chế dự phòng `localStorage`.

3. **Âm thanh tổng hợp Web Audio API (`src/audio/SoundManager.ts` - 0 KB tải ngoài):**
   - Tự động tổng hợp hiệu ứng âm thanh thời gian thực: nhảy (`playJump`), nhặt xu (`playCoin`), mở khóa nhân vật (`playUnlock`), va chạm xe (`playCrash`), rơi xuống nước (`playSplash`).

4. **Ứng dụng chuẩn `game-ui-design` Skill:**
   - **Safe Zone (5% Margin)**: Toàn bộ HUD Điểm số, Xu, nút Home, Shop và Âm thanh nằm trong vùng an toàn 90% Title Safe.
   - **Readability Under Motion**: Chữ có viền mực đậm (`INK_HEX`) và đổ bóng cứng, đảm bảo đọc rõ trên mọi nền cỏ, mặt đường và dòng sông.
   - **Controller-First & Multi-Input**: Hỗ trợ Chạm (Touch), Click chuột, Bàn phím (`Space`, `W`, `ArrowUp`, `Escape`) và Tay cầm (`Gamepad API`).
   - **Redundant Encoding (Hỗ trợ người mù màu)**: Phân biệt nhân vật và chướng ngại vật bằng cả màu sắc lẫn chi tiết hình học (mào/mỏ Gà, má Ếch, tai/ria Mèo, kính chắn gió định hướng xe).

---

## 📂 Cấu Trúc Dự Án

```text
chicken cross/
├── index.html                 # Entry HTML tích hợp YouTube Playables SDK
├── package.json               # Cấu hình dependencies (Phaser 3, Fontsource, TypeScript, Vite)
├── tsconfig.json              # Cấu hình TypeScript Strict Mode
├── vite.config.ts             # Cấu hình Vite (base: './', inline assets)
├── public/
│   └── favicon.svg            # Biểu tượng game
└── src/
    ├── main.ts                # Khởi tạo Phaser Game & nạp font chữ
    ├── constants.ts           # Kích thước 720x1280, Safe Zone, bảng màu & cấu hình 3 Skins
    ├── ytgame.ts              # Wrapper YouTube Playables SDK + LocalStorage fallback
    ├── progress.ts            # Quản lý lưu trữ Kỷ lục, Số Coin và Skin đã mở khóa
    ├── ui.ts                  # Hệ thống nút bấm Chunky, Vector Icons, vẽ Nhân vật/Xe/Gỗ & Shop Modal
    ├── audio/
    │   └── SoundManager.ts    # Bộ tổng hợp âm thanh Web Audio API (0KB)
    └── scenes/
        ├── MenuScene.ts       # Màn hình chính, xem trước Nhân vật & mở Cửa Hàng
        └── GameScene.ts       # Lối chơi chính (init, generateMap, update, checkCollision, draw)
```

---

## 🚀 Cài Đặt & Chạy Dự Án

```bash
npm install
npm run dev      # Chạy máy chủ phát triển tại http://localhost:3002
npm run build    # Kiểm tra kiểu TypeScript (tsc) và đóng gói vào thư mục dist/
```
