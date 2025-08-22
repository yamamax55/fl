# Galaxy RTS - Space Fleet Strategy Simulation

## 概要

Galaxy RTSは、React + PIXI.js技術スタックで構築された宇宙艦隊戦略シミュレーションゲームです。Windows 95風のクラシカルなUIと、現代的なWeb技術を組み合わせた独特なゲーム体験を提供します。

## 主な特徴

### 🖥️ ハイブリッドアーキテクチャ
- **React DOM UI**: メニューバー、パネル、フォーム等のUI要素
- **PIXI.js Canvas**: 星図、艦隊、エフェクト等のゲーム描画
- **統合状態管理**: React Hooksとカスタムストアによるシームレスな連携

### 🎨 Windows 95風デザイン
- 立体的なボタンとパネル（outset/inset border）
- クラシカルなグレー基調のカラーパレット
- ドロップダウンメニューとステータスバー
- リサイズ可能なパネルシステム

### ⚡ 高パフォーマンス
- PIXI.js WebGLレンダリング
- React仮想DOMによる効率的なUI更新
- ゲームロジックとUI描画の分離
- リアルタイムパフォーマンス監視

### 🎮 豊富なゲーム機能
- 戦略フェーズと戦術フェーズの切り替え
- 複数陣営による艦隊戦闘
- 提督システムと能力値連動
- パン・ズーム対応の星図表示

## 技術スタック

- **Frontend**: React 19.x (JSX, Hooks)
- **Graphics**: PIXI.js 8.x (WebGL/Canvas)
- **Build Tool**: Vite 7.x
- **Styling**: CSS Modules (Windows 95風)
- **State Management**: Custom Store + React Hooks

## セットアップ手順

### 前提条件
- Node.js 18.x以上
- npm 9.x以上

### インストール
```bash
# リポジトリをクローン
git clone [repository-url]
cd fl

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### ビルド
```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## プロジェクト構造

```
fl/
├── src/
│   ├── react/                      # React UIシステム
│   │   ├── App.jsx                 # メインアプリケーション
│   │   ├── components/             # UIコンポーネント
│   │   ├── stores/uiStore.js       # 状態管理
│   │   ├── hooks/useGameBridge.js  # ゲーム統合フック
│   │   └── layout.module.css       # Windows 95風スタイル
│   ├── Game.js                     # ゲームロジック（保持）
│   ├── Fleet.js                    # 艦隊クラス（保持）
│   └── main.js                     # エントリーポイント
├── public/data/                    # ゲームデータ
└── vite.config.js                  # ビルド設定
```

## 操作方法

### UIレイアウト切替
- **表示 > レイアウト** メニューからレイアウトモードを切替
- **右パネル + 下パネル**: 標準モード
- **下パネルのみ**: 拡張モード（星図エリア最大化）

### 星図操作
- **パン**: マウスドラッグで星図を移動
- **ズーム**: マウスホイールでズームイン/アウト
- **選択**: 星系をクリックして詳細情報を表示

### パネル操作
- **リサイズ**: 下パネル上部のハンドルをドラッグして高さ調整
- **情報表示**: 選択したオブジェクトの詳細を自動表示
- **フィルター**: 右パネルで勢力・表示オプションを設定

### キーボードショートカット
- **Alt + V**: 表示メニューを開く
- **F1**: ヘルプ表示
- **Esc**: メニューを閉じる

## データファイル

### 提督データ (`public/data/admirals.json`)
```json
{
  "admirals": [
    {
      "id": 1,
      "lastName": "ハヤシ",
      "firstName": "タケシ",
      "rank": "元帥",
      "faction": "Alliance",
      "abilities": {
        "command": 120,
        "tactics": 115,
        "mobility": 85
      }
    }
  ]
}
```

### 艦隊データ (`public/data/fleets.json`)
```json
{
  "fleets": [
    {
      "id": 1,
      "name": "第1艦隊",
      "faction": "Alliance",
      "type": "主力艦隊",
      "shipCount": 12,
      "totalFirepower": 15000,
      "command": {
        "commander": 1
      }
    }
  ]
}
```

## 開発ガイド

### React コンポーネントの追加
```jsx
// src/react/components/NewComponent.jsx
import React from 'react';
import styles from '../layout.module.css';

export function NewComponent() {
  return (
    <div className={styles.button}>
      New Component
    </div>
  );
}
```

### ゲームロジックとの連携
```javascript
// useGameBridge Hook を使用
import { useGameBridge } from '../hooks/useGameBridge.js';

export function GameComponent() {
  const { executeGameAction, isInitialized } = useGameBridge();
  
  const handleAction = () => {
    executeGameAction('selectFleet', { fleetId: 1 });
  };
  
  return isInitialized ? <div>Game Ready</div> : <div>Loading...</div>;
}
```

### 状態管理
```javascript
// uiStore の使用
import { uiStore, updateStore, subscribe } from '../stores/uiStore.js';

// 状態の読み取り
const currentMode = uiStore.layoutMode;

// 状態の更新
updateStore(store => {
  store.layoutMode = 'BOTTOM_ONLY';
});

// 変更の購読
const unsubscribe = subscribe(store => {
  console.log('Layout changed:', store.layoutMode);
});
```

## 開発状況

- **Phase 14完了**: React統合 & UI近代化システム
- **Phase 13完了**: 戦略画面UI改善 & 艦隊一覧ページシステム
- **Phase 12完了**: 戦略・戦術統合システム & 艦隊管理

詳細な開発履歴は `CLAUDE.md` を参照してください。

## 著作権・ライセンス

- このプロジェクトは教育・研究目的で開発されています
- 使用されているデータは架空のものであり、特定の作品とは関係ありません
- オープンソースライセンス: ISC

## 貢献

プロジェクトへの貢献を歓迎します：

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## サポート

質問や問題がある場合は、GitHub Issuesを使用してください。