import * as PIXI from 'pixi.js';

// 艦隊クラス
class Fleet extends PIXI.Container {
    constructor(x, y, color, name) {
        super();
        
        this.name = name;
        this.targetX = x;
        this.targetY = y;
        this.isSelected = false;
        this.moveSpeed = 2; // 移動速度
        
        // 艦隊本体（四角）
        this.ship = new PIXI.Graphics();
        this.ship.rect(0, 0, 40, 40);
        this.ship.fill(color);
        this.addChild(this.ship);
        
        // 選択枠（初期は非表示）
        this.selectionBorder = new PIXI.Graphics();
        this.selectionBorder.rect(-2, -2, 44, 44);
        this.selectionBorder.stroke({ width: 2, color: 0xffff00 });
        this.selectionBorder.visible = false;
        this.addChild(this.selectionBorder);
        
        // インタラクティブ設定
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        // 初期位置設定
        this.x = x;
        this.y = y;
        
        // イベントリスナー
        this.on('pointerdown', this.onPointerDown.bind(this));
    }
    
    // クリック処理
    onPointerDown(event) {
        // 右クリックは移動処理で後で実装
        if (event.button === 0) { // 左クリック
            this.select();
        }
        event.stopPropagation();
    }
    
    // 選択状態にする
    select() {
        // 他の艦隊の選択を解除
        window.gameState.fleets.forEach(fleet => {
            if (fleet !== this) {
                fleet.deselect();
            }
        });
        
        this.isSelected = true;
        this.selectionBorder.visible = true;
        console.log(`${this.name} が選択されました`);
    }
    
    // 選択状態を解除
    deselect() {
        this.isSelected = false;
        this.selectionBorder.visible = false;
    }
    
    // 目標地点に向かって移動
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        console.log(`${this.name} が (${x}, ${y}) に移動開始`);
    }
    
    // 毎フレーム更新
    update() {
        // 目標地点との距離を計算
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 目標地点に近い場合は移動停止
        if (distance < this.moveSpeed) {
            this.x = this.targetX;
            this.y = this.targetY;
            return;
        }
        
        // 正規化した方向ベクトルで移動
        const directionX = dx / distance;
        const directionY = dy / distance;
        
        this.x += directionX * this.moveSpeed;
        this.y += directionY * this.moveSpeed;
    }
}

// ゲーム状態管理
window.gameState = {
    app: null,
    fleets: []
};

// ゲーム初期化関数
async function initGame() {
    try {
        console.log('Galaxy RTS初期化開始...');
        
        // アプリケーション作成（非同期で初期化）
        const app = new PIXI.Application();

        // アプリケーション初期化
        await app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.body.appendChild(app.canvas);
        window.gameState.app = app;
        console.log('PIXI Application初期化完了');

        // 艦隊作成
        const allianceFleet = new Fleet(200, 360, 0x0000ff, '自由惑星同盟艦隊');
        const empireFleet = new Fleet(1000, 360, 0xff0000, '銀河帝国艦隊');
        
        // ゲーム状態に追加
        window.gameState.fleets = [allianceFleet, empireFleet];

        // ステージに追加
        app.stage.addChild(allianceFleet);
        app.stage.addChild(empireFleet);

        // 右クリックでの移動処理
        app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        app.canvas.addEventListener('pointerdown', (event) => {
            if (event.button === 2) { // 右クリック
                const selectedFleet = window.gameState.fleets.find(fleet => fleet.isSelected);
                if (selectedFleet) {
                    const rect = app.canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    selectedFleet.moveTo(x - 20, y - 20); // 中心調整
                }
            }
        });

        // ゲームループ開始
        app.ticker.add(() => {
            window.gameState.fleets.forEach(fleet => fleet.update());
        });

        // ローディング表示を削除
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        console.log('Galaxy RTS初期化完了 - Phase 2: 艦隊選択と移動機能実装');
        
    } catch (error) {
        console.error('Galaxy RTS初期化エラー:', error);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = 'エラー: ' + error.message;
            loadingElement.style.color = 'red';
        }
    }
}

// ゲーム開始
initGame();