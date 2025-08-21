import * as PIXI from 'pixi.js';
import { Fleet } from './Fleet.js';
import { GameUI } from './GameUI.js';
import { Effects } from './Effects.js';
import { Audio } from './Audio.js';

// ゲーム管理クラス
export class Game {
    constructor() {
        this.app = null;
        this.fleets = [];
        this.ui = null;
        this.dragSelection = {
            isDragging: false,
            startX: 0,
            startY: 0,
            box: null
        };
        
        // ゲームプレイエリアの定義（UIと重ならないように）
        this.gameArea = {
            x: 300,      // 左側UIパネルを避ける
            y: 80,       // 上部UIパネルを避ける
            width: 700,  // 1280 - 300(左) - 280(右) = 700
            height: 580  // 720 - 80(上) - 60(下) = 580
        };
        
        // グローバル状態として設定
        window.gameState = this;
    }
    
    async init() {
        console.log('Galaxy RTS初期化開始...');
        
        // アプリケーション作成（非同期で初期化）
        this.app = new PIXI.Application();

        // アプリケーション初期化
        await this.app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.body.appendChild(this.app.canvas);
        console.log('PIXI Application初期化完了');

        // 艦隊作成
        this.createFleets();
        
        // UI初期化
        this.ui = new GameUI(this.app);
        
        // エフェクトシステム初期化
        this.effects = new Effects(this.app);
        
        // オーディオシステム初期化
        this.audio = new Audio();
        
        // イベント設定
        this.setupEvents();
        
        // ゲームループ開始
        this.startGameLoop();
        
        // ローディング表示を削除
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // オーディオ開始（ユーザー操作後）
        document.addEventListener('click', () => {
            this.audio.resume();
            this.audio.startBGM();
        }, { once: true });
        
        console.log('Galaxy RTS初期化完了 - Phase 4: UIシステムと演出強化');
    }
    
    createFleets() {
        // 自由惑星同盟艦隊（青色）- ゲームエリア内に配置
        for (let i = 0; i < 3; i++) {
            const fleet = new Fleet(
                this.gameArea.x + 50 + i * 60,    // x座標（ゲームエリア内）
                this.gameArea.y + 220 + i * 80,   // y座標（ゲームエリア内）
                0x0000ff,             // 青色
                `同盟第${i + 1}艦隊`,   // 名前
                'alliance',           // 陣営
                `alliance_${i}`,      // ID
                i + 1                 // 艦隊番号
            );
            this.fleets.push(fleet);
            this.app.stage.addChild(fleet);
            
            // ゴーストフリートをステージに追加
            fleet.initializeGhostFleet(this.app.stage);
        }
        
        // 銀河帝国艦隊（赤色）- ゲームエリア内に配置
        for (let i = 0; i < 3; i++) {
            const fleet = new Fleet(
                this.gameArea.x + this.gameArea.width - 110 + i * 60,  // x座標（ゲームエリア右側）
                this.gameArea.y + 220 + i * 80,                       // y座標（ゲームエリア内）
                0xff0000,             // 赤色
                `帝国第${i + 1}艦隊`,   // 名前
                'empire',             // 陣営
                `empire_${i}`,        // ID
                i + 1                 // 艦隊番号
            );
            this.fleets.push(fleet);
            this.app.stage.addChild(fleet);
            
            // ゴーストフリートをステージに追加
            fleet.initializeGhostFleet(this.app.stage);
        }
    }
    
    setupEvents() {
        // マウスイベント処理
        this.app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // 右クリック移動専用処理（canvas直接）
        this.app.canvas.addEventListener('pointerdown', (event) => {
            if (event.button === 2) { // 右クリック
                event.preventDefault();
                const rect = this.app.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                const selectedFleets = this.fleets.filter(fleet => fleet.isSelected);
                console.log(`右クリック操作: 選択艦隊数=${selectedFleets.length}, 目標座標=(${x}, ${y})`);
                
                selectedFleets.forEach(fleet => {
                    if (fleet.interactionMode === 'move') {
                        console.log(`${fleet.name} が (${x}, ${y}) に移動指示`);
                        fleet.moveTo(x - 20, y - 20); // 中心調整
                    } else if (fleet.interactionMode === 'rotate') {
                        console.log(`${fleet.name} が (${x}, ${y}) 方向に回転指示`);
                        fleet.rotateTo(x - 20, y - 20); // 中心調整
                    }
                });
                return;
            }
        });
        
        // 選択処理（ステージレベル）
        this.app.stage.addEventListener('pointerdown', (event) => {
            const x = event.global.x;
            const y = event.global.y;
            
            // ゲームエリア外のクリックは無視
            if (!this.isInGameArea(x, y)) {
                return;
            }
            
            // 艦隊がクリックされたかチェック
            let fleetClicked = false;
            for (const fleet of this.fleets) {
                const bounds = fleet.getBounds();
                if (x >= bounds.x && x <= bounds.x + bounds.width &&
                    y >= bounds.y && y <= bounds.y + bounds.height) {
                    fleetClicked = true;
                    break;
                }
            }
            
            if (event.button === 0) { // 左クリック
                if (!fleetClicked && !event.shiftKey) {
                    // 艦隊がクリックされておらず、Shiftキーも押されていない場合のみ全選択解除
                    this.fleets.forEach(fleet => fleet.deselect());
                }
                
                // ドラッグ選択開始（艦隊クリック時は除外、ゲームエリア内のみ）
                if (!fleetClicked && this.isInGameArea(x, y)) {
                    this.dragSelection.isDragging = true;
                    this.dragSelection.startX = x;
                    this.dragSelection.startY = y;
                    
                    // 選択ボックス作成
                    const selectionBox = new PIXI.Graphics();
                    selectionBox.rect(0, 0, 1, 1);
                    selectionBox.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
                    selectionBox.fill({ color: 0xffffff, alpha: 0.1 });
                    selectionBox.x = x;
                    selectionBox.y = y;
                    this.dragSelection.box = selectionBox;
                    this.app.stage.addChild(selectionBox);
                }
            }
        });
        
        // ポインター移動
        this.app.stage.addEventListener('pointermove', (event) => {
            if (this.dragSelection.isDragging) {
                const x = event.global.x;
                const y = event.global.y;
                
                const startX = this.dragSelection.startX;
                const startY = this.dragSelection.startY;
                const width = x - startX;
                const height = y - startY;
                
                // 選択ボックスを更新
                const box = this.dragSelection.box;
                if (box) {
                    box.clear();
                    box.rect(0, 0, Math.abs(width), Math.abs(height));
                    box.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
                    box.fill({ color: 0xffffff, alpha: 0.1 });
                    box.x = Math.min(startX, x);
                    box.y = Math.min(startY, y);
                }
            }
        });
        
        // ポインターアップ
        this.app.stage.addEventListener('pointerup', (event) => {
            if (this.dragSelection.isDragging && event.button === 0) {
                const x = event.global.x;
                const y = event.global.y;
                
                const startX = this.dragSelection.startX;
                const startY = this.dragSelection.startY;
                
                // 範囲選択
                const minX = Math.min(startX, x);
                const maxX = Math.max(startX, x);
                const minY = Math.min(startY, y);
                const maxY = Math.max(startY, y);
                
                // 範囲内の味方艦隊を選択（プレイヤーは同盟軍を操作）
                this.fleets.forEach(fleet => {
                    if (fleet.faction === 'alliance' && 
                        fleet.x >= minX && fleet.x <= maxX && 
                        fleet.y >= minY && fleet.y <= maxY) {
                        fleet.select();
                    }
                });
                
                // 選択ボックスを削除
                if (this.dragSelection.box) {
                    this.app.stage.removeChild(this.dragSelection.box);
                    this.dragSelection.box = null;
                }
                this.dragSelection.isDragging = false;
            }
        });
    }
    
    // 戦場の霊（Fog of War）システム - ZOCベースの視界管理
    updateVisibility() {
        // 帝国艦隊の視認性を判定
        const empireFleets = this.fleets.filter(fleet => fleet.faction === 'empire' && fleet.currentHP > 0);
        const allianceFleets = this.fleets.filter(fleet => fleet.faction === 'alliance' && fleet.currentHP > 0);
        
        empireFleets.forEach(empireFleet => {
            const currentTime = Date.now();
            
            // 戦闘状態の時間経過をチェック
            if (empireFleet.isInCombat && (currentTime - empireFleet.lastCombatTime) > empireFleet.combatVisibilityDuration) {
                empireFleet.isInCombat = false;
            }
            
            // 視認性判定：ZOC内 または 戦闘中
            const isInZOC = allianceFleets.some(allianceFleet => 
                allianceFleet.isInZOCRange(empireFleet)
            );
            const isInCombat = empireFleet.isInCombat;
            const isVisible = isInZOC || isInCombat;
            
            // 艦隊本体、HPバー、番号を連動表示/非表示
            empireFleet.visible = isVisible;
            
            // デバッグログ（戦闘状態時のみ）
            if (isInCombat && !isInZOC) {
                console.log(`${empireFleet.name} 戦闘特例表示中 (ZOC外だが戦闘中)`);
            }
        });
        
        // 同盟艦隊も戦闘状態をリセット（時間経過チェック）
        allianceFleets.forEach(allianceFleet => {
            const currentTime = Date.now();
            if (allianceFleet.isInCombat && (currentTime - allianceFleet.lastCombatTime) > allianceFleet.combatVisibilityDuration) {
                allianceFleet.isInCombat = false;
            }
            allianceFleet.visible = true; // 同盟艦隊は常に表示
        });
    }
    
    // ゲームエリア内かどうかチェック
    isInGameArea(x, y) {
        return x >= this.gameArea.x && 
               x <= this.gameArea.x + this.gameArea.width &&
               y >= this.gameArea.y && 
               y <= this.gameArea.y + this.gameArea.height;
    }
    
    // 艦隊の移動をゲームエリア内に制限
    constrainToGameArea(fleet) {
        const margin = 30; // 艦隊サイズを考慮したマージン
        
        fleet.targetX = Math.max(this.gameArea.x + margin, 
                        Math.min(this.gameArea.x + this.gameArea.width - margin, fleet.targetX));
        fleet.targetY = Math.max(this.gameArea.y + margin, 
                        Math.min(this.gameArea.y + this.gameArea.height - margin, fleet.targetY));
        
        // 現在位置も制限
        fleet.x = Math.max(this.gameArea.x + margin, 
                  Math.min(this.gameArea.x + this.gameArea.width - margin, fleet.x));
        fleet.y = Math.max(this.gameArea.y + margin, 
                  Math.min(this.gameArea.y + this.gameArea.height - margin, fleet.y));
    }
    
    startGameLoop() {
        this.app.ticker.add(() => {
            this.fleets.forEach(fleet => {
                fleet.update();
                // 艦隊をゲームエリア内に制限
                this.constrainToGameArea(fleet);
            });
            this.updateVisibility(); // 毎フレーム視界更新
            this.ui.update();
            this.effects.update();
        });
    }
}