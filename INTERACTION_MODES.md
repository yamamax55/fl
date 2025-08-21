# インタラクションモード仕様書

## 概要
Galaxy RTS Phase 5で実装されたデュアルモード操作システムの技術仕様

## モード一覧

### 1. 移動モード (Move Mode)
- **アクティベート**: 艦隊を1回クリック
- **視覚表示**: 緑色の選択枠 (0x00ff00)
- **移動プレビュー**: 移動予定地点に半透明のゴースト艦隊を表示（他艦隊選択時も移動完了まで継続表示、目標位置での艦隊向きも表示）
- **射程表示**: なし（移動時は射程を表示しない）
- **操作**: 右クリック先に艦隊が移動
- **移動機動**: 進行方向に回転完了後に移動実行（現実的な艦隊機動）
- **自動解除**: 移動先確定時に選択状態を自動解除
- **UI表示**: `[移動]`

### 2. 回転モード (Rotation Mode)  
- **アクティベート**: 艦隊をダブルクリック (300ms以内)
- **視覚表示**: 赤色の選択枠 (0xff4444)
- **射程表示**: 赤色の前方楕円形射程を表示（横90px×縦180px、前方オフセット）
- **ZOC表示**: 紫色のZOC（支配領域）範囲を表示（半径200px、敵検出・自動対応範囲）
- **操作**: 右クリック方向に艦隊が滑らかに回転
- **アニメーション**: 目標角度まで徐々に回転（0.03ラジアン/フレーム）
- **自動解除**: 回転方向確定時に選択状態を自動解除
- **UI表示**: `[回転]`

### 3. 待機モード (None Mode)
- **状態**: モード未設定または選択解除時
- **視覚表示**: 黄色の選択枠 (0xffff00) または非表示
- **移動プレビュー**: なし
- **射程表示**: なし（待機時は射程を表示しない）
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
2. 右クリック → 艦隊が**進行方向に回転してから移動開始**、**半透明ゴースト艦隊が移動先に表示**、**選択状態が自動解除**
3. 同じ艦隊をダブルクリック → 赤色枠で回転モード
4. 右クリック → 艦隊がその方向に**滑らかに回転開始**し、**選択状態が自動解除**
5. 戦闘発生時 → 敵への応戦で**滑らかな自動向き変更**（現実的な戦闘動作）

### フィードバック
- **視覚的**: 色分けされた選択枠
- **移動プレビュー**: 半透明ゴースト艦隊の継続表示（他艦隊選択時も移動完了まで表示、予定地点と向きを表示）
- **射程表示**: 回転モード時の赤色前方楕円（現実的な戦術的判断支援）
- **ZOC表示**: 回転モード時の紫色支配領域円（敵検出・自動追尾範囲表示）
- **アニメーション**: 滑らかな回転アニメーション（手動指示・自動応戦両方）
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
- 前方楕円形攻撃は艦隊の向きに依存（戦術的方向制御が重要）

## 拡張性

### 今後の拡張予定
- **攻撃モード**: 特定対象への集中攻撃
- **陣形モード**: 複数艦隊の隊形維持
- **巡回モード**: 指定経路の定期巡回
- **護衛モード**: 指定艦隊の護衛