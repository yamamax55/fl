import * as PIXI from 'pixi.js';
import { Fleet } from './Fleet.js';
import { UI } from './UI.js';
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
        this.ui = new UI(this.app);
        
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
        // 自由惑星同盟艦隊（青色）
        for (let i = 0; i < 3; i++) {
            const fleet = new Fleet(
                150 + i * 60,         // x座標
                300 + i * 80,         // y座標
                0x0000ff,             // 青色
                `同盟第${i + 1}艦隊`,   // 名前
                'alliance',           // 陣営
                `alliance_${i}`       // ID
            );
            this.fleets.push(fleet);
            this.app.stage.addChild(fleet);
        }
        
        // 銀河帝国艦隊（赤色）
        for (let i = 0; i < 3; i++) {
            const fleet = new Fleet(
                950 + i * 60,         // x座標
                300 + i * 80,         // y座標
                0xff0000,             // 赤色
                `帝国第${i + 1}艦隊`,   // 名前
                'empire',             // 陣営
                `empire_${i}`         // ID
            );
            this.fleets.push(fleet);
            this.app.stage.addChild(fleet);
        }
    }
    
    setupEvents() {
        // マウスイベント処理
        this.app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // ポインターダウン
        this.app.canvas.addEventListener('pointerdown', (event) => {
            const rect = this.app.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (event.button === 0) { // 左クリック
                if (!event.shiftKey) {
                    // Shiftキーが押されていない場合、全選択解除
                    this.fleets.forEach(fleet => fleet.deselect());
                }
                
                // ドラッグ選択開始
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
                
            } else if (event.button === 2) { // 右クリック
                const selectedFleets = this.fleets.filter(fleet => fleet.isSelected);
                selectedFleets.forEach(fleet => {
                    fleet.moveTo(x - 20, y - 20); // 中心調整
                });
            }
        });
        
        // ポインター移動
        this.app.canvas.addEventListener('pointermove', (event) => {
            if (this.dragSelection.isDragging) {
                const rect = this.app.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
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
        this.app.canvas.addEventListener('pointerup', (event) => {
            if (this.dragSelection.isDragging && event.button === 0) {
                const rect = this.app.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
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
    
    startGameLoop() {
        this.app.ticker.add(() => {
            this.fleets.forEach(fleet => fleet.update());
            this.ui.update();
            this.effects.update();
        });
    }
}