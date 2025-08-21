import * as PIXI from 'pixi.js';

// UI管理クラス
export class GameUI {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        
        // UI背景
        this.background = new PIXI.Graphics();
        this.background.rect(0, 0, 1280, 80);
        this.background.fill({ color: 0x333333, alpha: 0.8 });
        this.container.addChild(this.background);
        
        // テキストスタイル
        this.textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff
        });
        
        // 選択艦隊数表示
        this.selectionText = new PIXI.Text('選択艦隊: 0', this.textStyle);
        this.selectionText.x = 20;
        this.selectionText.y = 20;
        this.container.addChild(this.selectionText);
        
        // 艦隊ステータス表示コンテナ
        this.fleetStatusContainer = new PIXI.Container();
        this.fleetStatusContainer.x = 20;
        this.fleetStatusContainer.y = 45;
        this.container.addChild(this.fleetStatusContainer);
    }
    
    update() {
        const selectedFleets = window.gameState.fleets.filter(fleet => fleet.isSelected);
        this.selectionText.text = `選択艦隊: ${selectedFleets.length}`;
        
        // 既存の艦隊ステータス表示をクリア
        this.fleetStatusContainer.removeChildren();
        
        // 選択中の艦隊の詳細情報を表示
        selectedFleets.forEach((fleet, index) => {
            const fleetInfo = new PIXI.Text(
                `${fleet.name}: HP ${fleet.currentHP}/${fleet.maxHP}`,
                this.textStyle
            );
            fleetInfo.x = index * 200;
            fleetInfo.y = 0;
            this.fleetStatusContainer.addChild(fleetInfo);
        });
    }
    
    // 撃破統計を更新
    recordDestroy(destroyedFleet) {
        if (destroyedFleet.faction === 'alliance') {
            this.gameStats.destroyedAlliance++;
        } else {
            this.gameStats.destroyedEmpire++;
        }
    }
    
    // 勝利条件チェック
    checkVictoryCondition() {
        const allianceFleets = window.gameState.fleets.filter(f => f.faction === 'alliance' && f.currentHP > 0);
        const empireFleets = window.gameState.fleets.filter(f => f.faction === 'empire' && f.currentHP > 0);
        
        if (allianceFleets.length === 0) {
            this.showGameOver('帝国軍の勝利！', 'defeat');
            return true;
        } else if (empireFleets.length === 0) {
            this.showGameOver('同盟軍の勝利！', 'victory');
            return true;
        }
        return false;
    }
    
    showGameOver(message, result) {
        // ゲーム終了画面
        this.gameOverContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameOverContainer);
        
        // 背景オーバーレイ
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, 1280, 720);
        overlay.fill({ color: 0x000000, alpha: 0.8 });
        this.gameOverContainer.addChild(overlay);
        
        // 結果表示
        const resultStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fill: result === 'victory' ? 0x00ff00 : 0xff0000,
            fontWeight: 'bold'
        });
        
        const resultText = new PIXI.Text(message, resultStyle);
        resultText.anchor.set(0.5);
        resultText.x = 640;
        resultText.y = 300;
        this.gameOverContainer.addChild(resultText);
        
        // 統計情報
        const statsText = new PIXI.Text(
            `戦闘結果:\n` +
            `同盟軍撃破: ${this.gameStats.destroyedEmpire}隻\n` +
            `帝国軍撃破: ${this.gameStats.destroyedAlliance}隻\n` +
            `総戦闘時間: ${Math.floor((Date.now() - this.gameStats.gameStartTime) / 1000)}秒`,
            {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                align: 'center'
            }
        );
        statsText.anchor.set(0.5);
        statsText.x = 640;
        statsText.y = 400;
        this.gameOverContainer.addChild(statsText);
        
        // リトライボタン
        const retryButton = new PIXI.Graphics();
        retryButton.rect(0, 0, 200, 50);
        retryButton.fill(0x4444aa);
        retryButton.stroke({ width: 2, color: 0x6666cc });
        retryButton.x = 540;
        retryButton.y = 500;
        retryButton.eventMode = 'static';
        retryButton.cursor = 'pointer';
        this.gameOverContainer.addChild(retryButton);
        
        const retryText = new PIXI.Text('リトライ', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        retryText.anchor.set(0.5);
        retryText.x = 640;
        retryText.y = 525;
        this.gameOverContainer.addChild(retryText);
        
        // リトライ機能
        retryButton.on('pointerdown', () => {
            location.reload(); // ページをリロードして再開
        });
        
        // ゲームを停止
        if (window.gameState && window.gameState.app) {
            window.gameState.app.ticker.stop();
        }
    }
}