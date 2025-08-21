import * as PIXI from 'pixi.js';

// Phase 4: 包括的UIシステム
export class UI {
    constructor(app) {
        this.app = app;
        this.gameStats = {
            destroyedAlliance: 0,
            destroyedEmpire: 0,
            totalBattles: 0,
            gameStartTime: Date.now()
        };
        
        this.createTopPanel();
        this.createBottomPanel();
        this.createMiniMap();
        this.createGameControls();
    }
    
    createTopPanel() {
        // 上部パネル
        this.topContainer = new PIXI.Container();
        this.app.stage.addChild(this.topContainer);
        
        // 上部UI背景
        this.topBackground = new PIXI.Graphics();
        this.topBackground.rect(0, 0, 1280, 100);
        this.topBackground.fill({ color: 0x222222, alpha: 0.9 });
        this.topContainer.addChild(this.topBackground);
        
        // テキストスタイル
        this.headerStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        
        this.textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff
        });
        
        // ゲーム統計表示
        this.gameTitle = new PIXI.Text('Galaxy RTS - Phase 4', this.headerStyle);
        this.gameTitle.x = 20;
        this.gameTitle.y = 10;
        this.topContainer.addChild(this.gameTitle);
        
        // 艦隊統計
        this.allianceFleetText = new PIXI.Text('', this.textStyle);
        this.allianceFleetText.x = 20;
        this.allianceFleetText.y = 35;
        this.topContainer.addChild(this.allianceFleetText);
        
        this.empireFleetText = new PIXI.Text('', this.textStyle);
        this.empireFleetText.x = 20;
        this.empireFleetText.y = 55;
        this.topContainer.addChild(this.empireFleetText);
        
        // 戦闘統計
        this.battleStatsText = new PIXI.Text('', this.textStyle);
        this.battleStatsText.x = 350;
        this.battleStatsText.y = 35;
        this.topContainer.addChild(this.battleStatsText);
        
        // ゲーム時間
        this.gameTimeText = new PIXI.Text('', this.textStyle);
        this.gameTimeText.x = 350;
        this.gameTimeText.y = 55;
        this.topContainer.addChild(this.gameTimeText);
    }
    
    createBottomPanel() {
        // 下部パネル（選択ユニット情報）
        this.bottomContainer = new PIXI.Container();
        this.bottomContainer.y = 620; // 画面下部
        this.app.stage.addChild(this.bottomContainer);
        
        // 下部UI背景
        this.bottomBackground = new PIXI.Graphics();
        this.bottomBackground.rect(0, 0, 1280, 100);
        this.bottomBackground.fill({ color: 0x222222, alpha: 0.9 });
        this.bottomContainer.addChild(this.bottomBackground);
        
        // 選択艦隊情報
        this.selectionTitle = new PIXI.Text('選択中の艦隊', this.headerStyle);
        this.selectionTitle.x = 20;
        this.selectionTitle.y = 10;
        this.bottomContainer.addChild(this.selectionTitle);
        
        // 艦隊詳細情報コンテナ
        this.fleetDetailsContainer = new PIXI.Container();
        this.fleetDetailsContainer.x = 20;
        this.fleetDetailsContainer.y = 35;
        this.bottomContainer.addChild(this.fleetDetailsContainer);
    }
    
    createMiniMap() {
        // ミニマップ（右下）
        this.miniMapContainer = new PIXI.Container();
        this.miniMapContainer.x = 1280 - 220; // 右端から220px
        this.miniMapContainer.y = 720 - 170;  // 下端から170px
        this.app.stage.addChild(this.miniMapContainer);
        
        // ミニマップ背景
        this.miniMapBackground = new PIXI.Graphics();
        this.miniMapBackground.rect(0, 0, 200, 150);
        this.miniMapBackground.fill({ color: 0x000000, alpha: 0.8 });
        this.miniMapBackground.stroke({ width: 2, color: 0x666666 });
        this.miniMapContainer.addChild(this.miniMapBackground);
        
        // ミニマップタイトル
        this.miniMapTitle = new PIXI.Text('ミニマップ', {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff
        });
        this.miniMapTitle.x = 5;
        this.miniMapTitle.y = 5;
        this.miniMapContainer.addChild(this.miniMapTitle);
        
        // ミニマップ艦隊表示用コンテナ
        this.miniMapFleets = new PIXI.Container();
        this.miniMapFleets.y = 20;
        this.miniMapContainer.addChild(this.miniMapFleets);
    }
    
    createGameControls() {
        // ゲーム制御ボタン（右上）
        this.controlsContainer = new PIXI.Container();
        this.controlsContainer.x = 1280 - 270;
        this.controlsContainer.y = 10;
        this.app.stage.addChild(this.controlsContainer);
        
        // 一時停止ボタン
        this.pauseButton = new PIXI.Graphics();
        this.pauseButton.rect(0, 0, 80, 30);
        this.pauseButton.fill(0x4444aa);
        this.pauseButton.stroke({ width: 1, color: 0x6666cc });
        this.pauseButton.eventMode = 'static';
        this.pauseButton.cursor = 'pointer';
        this.controlsContainer.addChild(this.pauseButton);
        
        this.pauseText = new PIXI.Text('一時停止', {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff
        });
        this.pauseText.x = 10;
        this.pauseText.y = 8;
        this.controlsContainer.addChild(this.pauseText);
        
        // 速度制御ボタン
        this.speedButton = new PIXI.Graphics();
        this.speedButton.rect(90, 0, 80, 30);
        this.speedButton.fill(0x44aa44);
        this.speedButton.stroke({ width: 1, color: 0x66cc66 });
        this.speedButton.eventMode = 'static';
        this.speedButton.cursor = 'pointer';
        this.controlsContainer.addChild(this.speedButton);
        
        this.speedText = new PIXI.Text('通常速度', {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff
        });
        this.speedText.x = 100;
        this.speedText.y = 8;
        this.controlsContainer.addChild(this.speedText);
        
        // ミュートボタン
        this.muteButton = new PIXI.Graphics();
        this.muteButton.rect(180, 0, 60, 30);
        this.muteButton.fill(0xaa8844);
        this.muteButton.stroke({ width: 1, color: 0xccaa66 });
        this.muteButton.eventMode = 'static';
        this.muteButton.cursor = 'pointer';
        this.controlsContainer.addChild(this.muteButton);
        
        this.muteText = new PIXI.Text('音声', {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff
        });
        this.muteText.x = 195;
        this.muteText.y = 8;
        this.controlsContainer.addChild(this.muteText);
        
        // ボタンイベント
        this.pauseButton.on('pointerdown', () => this.togglePause());
        this.speedButton.on('pointerdown', () => this.cycleSpeed());
        this.muteButton.on('pointerdown', () => this.toggleMute());
    }
    
    togglePause() {
        if (window.gameState && window.gameState.app) {
            if (window.gameState.app.ticker.started) {
                window.gameState.app.ticker.stop();
                this.pauseText.text = '再開';
                this.pauseButton.clear();
                this.pauseButton.rect(0, 0, 80, 30);
                this.pauseButton.fill(0xaa4444);
                this.pauseButton.stroke({ width: 1, color: 0xcc6666 });
            } else {
                window.gameState.app.ticker.start();
                this.pauseText.text = '一時停止';
                this.pauseButton.clear();
                this.pauseButton.rect(0, 0, 80, 30);
                this.pauseButton.fill(0x4444aa);
                this.pauseButton.stroke({ width: 1, color: 0x6666cc });
            }
        }
    }
    
    cycleSpeed() {
        if (window.gameState && window.gameState.app) {
            const ticker = window.gameState.app.ticker;
            if (ticker.speed === 1) {
                ticker.speed = 2;
                this.speedText.text = '2倍速度';
            } else if (ticker.speed === 2) {
                ticker.speed = 0.5;
                this.speedText.text = '低速度';
            } else {
                ticker.speed = 1;
                this.speedText.text = '通常速度';
            }
        }
    }
    
    toggleMute() {
        if (window.gameState && window.gameState.audio) {
            const isMuted = window.gameState.audio.toggleMute();
            this.muteText.text = isMuted ? 'ミュート' : '音声';
            this.muteButton.clear();
            this.muteButton.rect(180, 0, 60, 30);
            this.muteButton.fill(isMuted ? 0xaa4444 : 0xaa8844);
            this.muteButton.stroke({ width: 1, color: isMuted ? 0xcc6666 : 0xccaa66 });
        }
    }
    
    update() {
        if (!window.gameState || !window.gameState.fleets) return;
        
        this.updateTopPanel();
        this.updateBottomPanel();
        this.updateMiniMap();
        this.checkVictoryCondition();
    }
    
    updateTopPanel() {
        const fleets = window.gameState.fleets;
        const allianceFleets = fleets.filter(f => f.faction === 'alliance' && f.currentHP > 0);
        const empireFleets = fleets.filter(f => f.faction === 'empire' && f.currentHP > 0);
        const battleFleets = fleets.filter(f => f.currentHP > 0 && f.findTarget());
        
        // 艦隊統計更新
        this.allianceFleetText.text = `同盟軍: ${allianceFleets.length}隻 (撃破: ${this.gameStats.destroyedEmpire}隻)`;
        this.empireFleetText.text = `帝国軍: ${empireFleets.length}隻 (撃破: ${this.gameStats.destroyedAlliance}隻)`;
        
        // 戦闘統計更新
        this.battleStatsText.text = `戦闘中: ${battleFleets.length}隻`;
        
        // ゲーム時間更新
        const gameTime = Math.floor((Date.now() - this.gameStats.gameStartTime) / 1000);
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        this.gameTimeText.text = `経過時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateBottomPanel() {
        const selectedFleets = window.gameState.fleets.filter(fleet => fleet.isSelected);
        
        // 既存の詳細情報をクリア
        this.fleetDetailsContainer.removeChildren();
        
        if (selectedFleets.length === 0) {
            const noSelection = new PIXI.Text('艦隊が選択されていません', this.textStyle);
            this.fleetDetailsContainer.addChild(noSelection);
            return;
        }
        
        // 選択中の艦隊の詳細情報を表示
        selectedFleets.forEach((fleet, index) => {
            const y = index * 20;
            
            // 基本情報
            const basicInfo = new PIXI.Text(
                `${fleet.name}: HP ${fleet.currentHP}/${fleet.maxHP} (${Math.round(fleet.currentHP/fleet.maxHP*100)}%)`,
                this.textStyle
            );
            basicInfo.y = y;
            this.fleetDetailsContainer.addChild(basicInfo);
            
            // 戦闘状態
            const target = fleet.findTarget();
            const statusInfo = new PIXI.Text(
                target ? `戦闘中 → ${target.name}` : '待機中',
                this.textStyle
            );
            statusInfo.x = 300;
            statusInfo.y = y;
            this.fleetDetailsContainer.addChild(statusInfo);
            
            // 位置情報
            const positionInfo = new PIXI.Text(
                `座標: (${Math.round(fleet.x)}, ${Math.round(fleet.y)})`,
                this.textStyle
            );
            positionInfo.x = 500;
            positionInfo.y = y;
            this.fleetDetailsContainer.addChild(positionInfo);
        });
    }
    
    updateMiniMap() {
        // 既存のミニマップ艦隊表示をクリア
        this.miniMapFleets.removeChildren();
        
        const scaleX = 190 / 1280; // ミニマップのスケール
        const scaleY = 120 / 720;
        
        // 各艦隊をミニマップに表示
        window.gameState.fleets.forEach(fleet => {
            if (fleet.currentHP <= 0) return;
            
            const dot = new PIXI.Graphics();
            dot.circle(0, 0, 2);
            dot.fill(fleet.faction === 'alliance' ? 0x4444ff : 0xff4444);
            dot.x = fleet.x * scaleX + 5;
            dot.y = fleet.y * scaleY;
            
            this.miniMapFleets.addChild(dot);
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