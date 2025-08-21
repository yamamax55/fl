# インタラクションモード仕様書

## 概要
Galaxy RTS Phase 5で実装されたデュアルモード操作システムの技術仕様

## モード一覧

### 1. 移動モード (Move Mode)
- **アクティベート**: 艦隊を1回クリック
- **視覚表示**: 緑色の選択枠 (0x00ff00)
- **操作**: 右クリック先に艦隊が移動
- **UI表示**: `[移動]`

### 2. 回転モード (Rotation Mode)  
- **アクティベート**: 艦隊をダブルクリック (300ms以内)
- **視覚表示**: 赤色の選択枠 (0xff4444)
- **操作**: 右クリック方向に艦隊が滑らかに回転
- **アニメーション**: 目標角度まで徐々に回転（0.03ラジアン/フレーム）
- **自動解除**: 回転方向確定時に選択状態を自動解除
- **UI表示**: `[回転]`

### 3. 待機モード (None Mode)
- **状態**: モード未設定または選択解除時
- **視覚表示**: 黄色の選択枠 (0xffff00) または非表示
- **UI表示**: `[待機]`

## 実装詳細

### Fleet.jsの主要機能

```javascript
// モード管理変数
this.interactionMode = 'none'; // 'none', 'move', 'rotate'
this.lastClickTime = 0; // ダブルクリック判定用
this.doubleClickDelay = 300; // ダブルクリック判定時間

// クリック処理
onPointerDown(event) {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - this.lastClickTime;
    
    if (timeSinceLastClick < this.doubleClickDelay && this.isSelected) {
        this.setRotationMode(); // ダブルクリック: 回転モード
    } else {
        this.select();
        this.setMoveMode(); // シングルクリック: 移動モード
    }
}

// モード設定
setMoveMode() {
    this.interactionMode = 'move';
    this.updateSelectionDisplay();
}

setRotationMode() {
    this.interactionMode = 'rotate'; 
    this.updateSelectionDisplay();
}

// 視覚表示更新
updateSelectionDisplay() {
    let borderColor = 0xffff00; // デフォルト黄色
    
    if (this.interactionMode === 'move') {
        borderColor = 0x00ff00; // 緑色
    } else if (this.interactionMode === 'rotate') {
        borderColor = 0xff4444; // 赤色
    }
    
    this.selectionBorder.circle(0, 0, 25);
    this.selectionBorder.stroke({ width: 2, color: borderColor, alpha: 0.8 });
}
```

### Game.jsの操作処理

```javascript
// 右クリック処理（モード別）
selectedFleets.forEach(fleet => {
    if (fleet.interactionMode === 'move') {
        fleet.moveTo(x - 20, y - 20); // 移動
    } else if (fleet.interactionMode === 'rotate') {
        fleet.rotateTo(x - 20, y - 20); // 回転（選択自動解除）
    }
});
```

### GameUI.jsの表示

```javascript
// モード表示
const modeText = fleet.interactionMode === 'move' ? '移動' : 
               fleet.interactionMode === 'rotate' ? '回転' : '待機';
const fleetInfo = new PIXI.Text(
    `${fleet.name}: HP ${fleet.currentHP}/${fleet.maxHP} [${modeText}]`,
    this.textStyle
);
```

## ユーザーエクスペリエンス

### 操作フロー
1. 同盟艦隊（青い三角形）を1回クリック → 緑色枠で移動モード
2. 右クリック → 艦隊がその地点に移動開始
3. 同じ艦隊をダブルクリック → 赤色枠で回転モード
4. 右クリック → 艦隊がその方向に**滑らかに回転開始**し、**選択状態が自動解除**

### フィードバック
- **視覚的**: 色分けされた選択枠
- **アニメーション**: 滑らかな回転アニメーション
- **UI**: 上部パネルに現在モード表示
- **音響**: 選択音とエフェクト音
- **コンソール**: 回転開始と完了のデバッグ情報（開発者向け）

## パフォーマンス考慮

### 最適化項目
- ダブルクリック判定の軽量化 (300ms タイムウィンドウ)
- 選択枠の再描画最小化
- モード変更時のみ視覚更新
- 回転アニメーション中の効率的な角度計算
- 最短回転経路の自動選択による無駄な動きの削減

### 制限事項
- 同盟艦隊のみ操作可能
- 1つの艦隊につき1つのモードのみアクティブ
- モードは選択解除時にリセット

## 拡張性

### 今後の拡張予定
- **攻撃モード**: 特定対象への集中攻撃
- **陣形モード**: 複数艦隊の隊形維持
- **巡回モード**: 指定経路の定期巡回
- **護衛モード**: 指定艦隊の護衛