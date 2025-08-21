import * as PIXI from 'pixi.js';

// UI管理クラス
export class GameUI {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        
        // ゲーム統計初期化
        this.gameStats = {
            destroyedAlliance: 0,
            destroyedEmpire: 0,
            gameStartTime: Date.now()
        };
        
        // ゲーム状態フラグ
        this.gameEnded = false;
        
        // UI背景（上部パネル）
        this.topBackground = new PIXI.Graphics();
        this.topBackground.rect(0, 0, 1280, 80);
        this.topBackground.fill({ color: 0x333333, alpha: 0.8 });
        this.container.addChild(this.topBackground);
        
        // 左側艦隊情報パネル
        this.leftPanel = new PIXI.Container();
        this.leftPanelBg = new PIXI.Graphics();
        this.leftPanelBg.rect(0, 0, 300, 640);
        this.leftPanelBg.fill({ color: 0x2a2a2a, alpha: 0.9 });
        this.leftPanelBg.stroke({ width: 1, color: 0x555555 });
        this.leftPanel.addChild(this.leftPanelBg);
        this.leftPanel.x = 0;
        this.leftPanel.y = 80;
        this.container.addChild(this.leftPanel);
        
        // 右側戦術情報パネル
        this.rightPanel = new PIXI.Container();
        this.rightPanelBg = new PIXI.Graphics();
        this.rightPanelBg.rect(0, 0, 280, 640);
        this.rightPanelBg.fill({ color: 0x2a2a2a, alpha: 0.9 });
        this.rightPanelBg.stroke({ width: 1, color: 0x555555 });
        this.rightPanel.addChild(this.rightPanelBg);
        this.rightPanel.x = 1000;
        this.rightPanel.y = 80;
        this.container.addChild(this.rightPanel);
        
        // 下部コマンドパネル
        this.bottomPanel = new PIXI.Container();
        this.bottomPanelBg = new PIXI.Graphics();
        this.bottomPanelBg.rect(0, 0, 1280, 60);
        this.bottomPanelBg.fill({ color: 0x333333, alpha: 0.8 });
        this.bottomPanelBg.stroke({ width: 1, color: 0x555555 });
        this.bottomPanel.addChild(this.bottomPanelBg);
        this.bottomPanel.x = 0;
        this.bottomPanel.y = 660;
        this.container.addChild(this.bottomPanel);
        
        // テキストスタイル
        this.textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff
        });
        
        this.headerStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        
        this.smallTextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xcccccc
        });
        
        // 選択艦隊数表示
        this.selectionText = new PIXI.Text('選択艦隊: 0', this.textStyle);
        this.selectionText.x = 20;
        this.selectionText.y = 20;
        this.container.addChild(this.selectionText);
        
        // 陣営艦隊数表示
        this.allianceCountText = new PIXI.Text('同盟軍: 0', this.textStyle);
        this.allianceCountText.x = 300;
        this.allianceCountText.y = 20;
        this.container.addChild(this.allianceCountText);
        
        this.empireCountText = new PIXI.Text('帝国軍: 0', this.textStyle);
        this.empireCountText.x = 450;
        this.empireCountText.y = 20;
        this.container.addChild(this.empireCountText);
        
        // 艦隊ステータス表示コンテナ
        this.fleetStatusContainer = new PIXI.Container();
        this.fleetStatusContainer.x = 20;
        this.fleetStatusContainer.y = 45;
        this.container.addChild(this.fleetStatusContainer);
        
        // UI初期化
        this.initializeUI();
    }
    
    // UI初期化
    initializeUI() {
        this.initializeLeftPanel();
        this.initializeRightPanel();
        this.initializeBottomPanel();
    }
    
    // 左側艦隊情報パネル初期化
    initializeLeftPanel() {
        // パネルタイトル
        const leftTitle = new PIXI.Text('艦隊情報', this.headerStyle);
        leftTitle.x = 15;
        leftTitle.y = 15;
        this.leftPanel.addChild(leftTitle);
        
        // 選択艦隊詳細コンテナ
        this.selectedFleetContainer = new PIXI.Container();
        this.selectedFleetContainer.x = 15;
        this.selectedFleetContainer.y = 50;
        this.leftPanel.addChild(this.selectedFleetContainer);
    }
    
    // 右側戦術情報パネル初期化
    initializeRightPanel() {
        // パネルタイトル
        const rightTitle = new PIXI.Text('戦術情報', this.headerStyle);
        rightTitle.x = 15;
        rightTitle.y = 15;
        this.rightPanel.addChild(rightTitle);
        
        // 戦況表示コンテナ
        this.battleStatusContainer = new PIXI.Container();
        this.battleStatusContainer.x = 15;
        this.battleStatusContainer.y = 50;
        this.rightPanel.addChild(this.battleStatusContainer);
        
        // 戦力比グラフコンテナ
        this.forceRatioContainer = new PIXI.Container();
        this.forceRatioContainer.x = 15;
        this.forceRatioContainer.y = 150;
        this.rightPanel.addChild(this.forceRatioContainer);
    }
    
    // 下部コマンドパネル初期化
    initializeBottomPanel() {
        // モード切替ボタン
        this.createModeButtons();
        
        // アクションボタン
        this.createActionButtons();
    }
    
    // モード切替ボタン作成
    createModeButtons() {
        const buttonWidth = 120;
        const buttonHeight = 35;
        const buttonY = 12;
        const startX = 400;
        
        // 移動モードボタン
        this.moveButton = this.createButton('移動モード', startX, buttonY, buttonWidth, buttonHeight, 0x00aa00);
        this.moveButton.button.on('pointerdown', () => this.setAllSelectedFleetsMode('move'));
        this.bottomPanel.addChild(this.moveButton.container);
        
        // 回転モードボタン
        this.rotateButton = this.createButton('回転モード', startX + 130, buttonY, buttonWidth, buttonHeight, 0xaa4444);
        this.rotateButton.button.on('pointerdown', () => this.setAllSelectedFleetsMode('rotate'));
        this.bottomPanel.addChild(this.rotateButton.container);
    }
    
    // アクションボタン作成
    createActionButtons() {
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonY = 12;
        const startX = 50;
        
        // 全選択ボタン
        const selectAllBtn = this.createButton('全選択', startX, buttonY, buttonWidth, buttonHeight, 0x4444aa);
        selectAllBtn.button.on('pointerdown', () => this.selectAllAlliance());
        this.bottomPanel.addChild(selectAllBtn.container);
        
        // 選択解除ボタン
        const deselectBtn = this.createButton('選択解除', startX + 110, buttonY, buttonWidth, buttonHeight, 0xaa6644);
        deselectBtn.button.on('pointerdown', () => this.deselectAll());
        this.bottomPanel.addChild(deselectBtn.container);
        
        // 停止命令ボタン
        const stopBtn = this.createButton('停止', startX + 220, buttonY, buttonWidth, buttonHeight, 0xaa4444);
        stopBtn.button.on('pointerdown', () => this.stopAllSelected());
        this.bottomPanel.addChild(stopBtn.container);
    }
    
    // ボタン作成ヘルパー
    createButton(text, x, y, width, height, color) {
        const container = new PIXI.Container();
        
        const button = new PIXI.Graphics();
        button.rect(0, 0, width, height);
        button.fill(color);
        button.stroke({ width: 1, color: 0xffffff, alpha: 0.3 });
        button.eventMode = 'static';
        button.cursor = 'pointer';
        container.addChild(button);
        
        const buttonText = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        buttonText.anchor.set(0.5);
        buttonText.x = width / 2;
        buttonText.y = height / 2;
        container.addChild(buttonText);
        
        container.x = x;
        container.y = y;
        
        // ホバーエフェクト
        button.on('pointerover', () => {
            button.tint = 0xcccccc;
        });
        button.on('pointerout', () => {
            button.tint = 0xffffff;
        });
        
        return { container, button, text: buttonText };
    }
    
    // 選択艦隊のモード設定
    setAllSelectedFleetsMode(mode) {
        const selectedFleets = window.gameState.fleets.filter(fleet => 
            fleet.isSelected && fleet.faction === 'alliance'
        );
        selectedFleets.forEach(fleet => {
            if (mode === 'move') {
                fleet.setMoveMode();
            } else if (mode === 'rotate') {
                fleet.setRotationMode();
            }
        });
    }
    
    // 全同盟艦隊選択
    selectAllAlliance() {
        window.gameState.fleets.forEach(fleet => {
            if (fleet.faction === 'alliance' && fleet.currentHP > 0) {
                fleet.select();
            }
        });
    }
    
    // 全選択解除
    deselectAll() {
        window.gameState.fleets.forEach(fleet => fleet.deselect());
    }
    
    // 選択艦隊停止
    stopAllSelected() {
        const selectedFleets = window.gameState.fleets.filter(fleet => fleet.isSelected);
        selectedFleets.forEach(fleet => {
            fleet.targetX = fleet.x;
            fleet.targetY = fleet.y;
            fleet.isWaitingToMove = false;
            if (fleet.ghostFleet) {
                fleet.ghostFleet.visible = false;
            }
        });
    }
    
    update() {
        const selectedFleets = window.gameState.fleets.filter(fleet => fleet.isSelected);
        this.selectionText.text = `選択艦隊: ${selectedFleets.length}`;
        
        // 各陣営の残存艦隊数を更新
        const allianceFleets = window.gameState.fleets.filter(f => f.faction === 'alliance' && f.currentHP > 0);
        const empireFleets = window.gameState.fleets.filter(f => f.faction === 'empire' && f.currentHP > 0);
        
        this.allianceCountText.text = `同盟軍: ${allianceFleets.length}`;
        this.empireCountText.text = `帝国軍: ${empireFleets.length}`;
        
        // 勝利条件チェック（ゲーム終了していない場合のみ）
        if (!this.gameEnded) {
            this.checkVictoryCondition();
        }
        
        // 既存の艦隊ステータス表示をクリア
        this.fleetStatusContainer.removeChildren();
        
        // 選択中の艦隊の詳細情報を表示
        selectedFleets.forEach((fleet, index) => {
            const modeText = fleet.interactionMode === 'move' ? '移動' : 
                           fleet.interactionMode === 'rotate' ? '回転' : '待機';
            const fleetInfo = new PIXI.Text(
                `${fleet.name}: HP ${fleet.currentHP}/${fleet.maxHP} [${modeText}]`,
                this.textStyle
            );
            fleetInfo.x = index * 200;
            fleetInfo.y = 0;
            this.fleetStatusContainer.addChild(fleetInfo);
        });
        
        // 新しいUIパネルを更新
        this.updateLeftPanel(selectedFleets);
        this.updateRightPanel(allianceFleets, empireFleets);
    }
    
    // 左側パネル更新（選択艦隊詳細）
    updateLeftPanel(selectedFleets) {
        // 既存の内容をクリア
        this.selectedFleetContainer.removeChildren();
        
        if (selectedFleets.length === 0) {
            const noSelectionText = new PIXI.Text('艦隊が選択されていません', this.smallTextStyle);
            noSelectionText.x = 0;
            noSelectionText.y = 0;
            this.selectedFleetContainer.addChild(noSelectionText);
            return;
        }
        
        let yOffset = 0;
        
        if (selectedFleets.length === 1) {
            // 単一艦隊選択時の詳細表示
            const fleet = selectedFleets[0];
            const details = [
                `艦隊: ${fleet.name}`,
                `番号: ${fleet.fleetNumber}`,
                `HP: ${fleet.currentHP} / ${fleet.maxHP}`,
                `攻撃力: ${fleet.attackPower}`,
                `射程: ${fleet.range}`,
                `速度: ${fleet.moveSpeed}`,
                ``,
                `状態: ${this.getFleetStatus(fleet)}`,
                `モード: ${this.getFleetMode(fleet)}`,
                ``,
                `座標: (${Math.round(fleet.x)}, ${Math.round(fleet.y)})`,
            ];
            
            if (fleet.targetX !== fleet.x || fleet.targetY !== fleet.y) {
                details.push(`目標: (${Math.round(fleet.targetX)}, ${Math.round(fleet.targetY)})`);
            }
            
            details.forEach(detail => {
                if (detail !== '') {
                    const text = new PIXI.Text(detail, this.textStyle);
                    text.x = 0;
                    text.y = yOffset;
                    this.selectedFleetContainer.addChild(text);
                }
                yOffset += 20;
            });
        } else {
            // 複数艦隊選択時の概要表示
            const totalHP = selectedFleets.reduce((sum, f) => sum + f.currentHP, 0);
            const maxHP = selectedFleets.reduce((sum, f) => sum + f.maxHP, 0);
            const totalAttack = selectedFleets.reduce((sum, f) => sum + f.attackPower, 0);
            
            const summary = [
                `選択艦隊数: ${selectedFleets.length}`,
                ``,
                `合計HP: ${totalHP} / ${maxHP}`,
                `合計攻撃力: ${totalAttack}`,
                ``,
                `艦隊リスト:`
            ];
            
            summary.forEach(line => {
                if (line !== '') {
                    const text = new PIXI.Text(line, this.textStyle);
                    text.x = 0;
                    text.y = yOffset;
                    this.selectedFleetContainer.addChild(text);
                }
                yOffset += 20;
            });
            
            // 個別艦隊リスト
            selectedFleets.forEach(fleet => {
                const fleetLine = `• ${fleet.name} (${fleet.fleetNumber}) HP:${fleet.currentHP}`;
                const text = new PIXI.Text(fleetLine, this.smallTextStyle);
                text.x = 10;
                text.y = yOffset;
                this.selectedFleetContainer.addChild(text);
                yOffset += 16;
            });
        }
    }
    
    // 右側パネル更新（戦術情報）
    updateRightPanel(allianceFleets, empireFleets) {
        // 戦況表示を更新
        this.battleStatusContainer.removeChildren();
        
        const allianceHP = allianceFleets.reduce((sum, f) => sum + f.currentHP, 0);
        const allianceMaxHP = allianceFleets.reduce((sum, f) => sum + f.maxHP, 0);
        const empireHP = empireFleets.reduce((sum, f) => sum + f.currentHP, 0);
        const empireMaxHP = empireFleets.reduce((sum, f) => sum + f.maxHP, 0);
        
        const battleInfo = [
            '戦況',
            '',
            `同盟軍: ${allianceFleets.length}隻`,
            `HP: ${allianceHP} / ${allianceMaxHP}`,
            '',
            `帝国軍: ${empireFleets.length}隻`,
            `HP: ${empireHP} / ${empireMaxHP}`,
            '',
            `撃破: 同盟${this.gameStats.destroyedAlliance} 帝国${this.gameStats.destroyedEmpire}`,
        ];
        
        let yOffset = 0;
        battleInfo.forEach(info => {
            if (info !== '') {
                const text = new PIXI.Text(info, this.textStyle);
                text.x = 0;
                text.y = yOffset;
                this.battleStatusContainer.addChild(text);
            }
            yOffset += 20;
        });
        
        // 戦力比グラフを更新
        this.updateForceRatioGraph(allianceHP, allianceMaxHP, empireHP, empireMaxHP);
    }
    
    // 戦力比グラフ更新
    updateForceRatioGraph(allianceHP, allianceMaxHP, empireHP, empireMaxHP) {
        this.forceRatioContainer.removeChildren();
        
        const graphTitle = new PIXI.Text('戦力比', this.textStyle);
        graphTitle.x = 0;
        graphTitle.y = 0;
        this.forceRatioContainer.addChild(graphTitle);
        
        const totalMaxHP = allianceMaxHP + empireMaxHP;
        const totalCurrentHP = allianceHP + empireHP;
        
        if (totalMaxHP > 0) {
            const barWidth = 200;
            const barHeight = 20;
            const barY = 30;
            
            // 背景バー
            const bgBar = new PIXI.Graphics();
            bgBar.rect(0, barY, barWidth, barHeight);
            bgBar.fill(0x333333);
            bgBar.stroke({ width: 1, color: 0x666666 });
            this.forceRatioContainer.addChild(bgBar);
            
            // 同盟軍バー
            const allianceRatio = allianceHP / totalMaxHP;
            const allianceBarWidth = barWidth * allianceRatio;
            if (allianceBarWidth > 0) {
                const allianceBar = new PIXI.Graphics();
                allianceBar.rect(0, barY, allianceBarWidth, barHeight);
                allianceBar.fill(0x4444ff);
                this.forceRatioContainer.addChild(allianceBar);
            }
            
            // 帝国軍バー
            const empireRatio = empireHP / totalMaxHP;
            const empireBarWidth = barWidth * empireRatio;
            if (empireBarWidth > 0) {
                const empireBar = new PIXI.Graphics();
                empireBar.rect(barWidth - empireBarWidth, barY, empireBarWidth, barHeight);
                empireBar.fill(0xff4444);
                this.forceRatioContainer.addChild(empireBar);
            }
            
            // パーセンテージ表示
            const alliancePercent = Math.round((allianceHP / totalCurrentHP) * 100) || 0;
            const empirePercent = Math.round((empireHP / totalCurrentHP) * 100) || 0;
            
            const percentText = new PIXI.Text(
                `同盟 ${alliancePercent}% : ${empirePercent}% 帝国`, 
                this.smallTextStyle
            );
            percentText.x = 0;
            percentText.y = barY + 30;
            this.forceRatioContainer.addChild(percentText);
        }
    }
    
    // 艦隊状態取得
    getFleetStatus(fleet) {
        if (fleet.currentHP <= 0) return '撃破';
        if (fleet.isInCombat) return '戦闘中';
        if (fleet.isRotating) return '回転中';
        if (fleet.isWaitingToMove) return '回転待機';
        if (fleet.targetX !== fleet.x || fleet.targetY !== fleet.y) return '移動中';
        return '待機';
    }
    
    // 艦隊モード取得
    getFleetMode(fleet) {
        switch (fleet.interactionMode) {
            case 'move': return '移動モード';
            case 'rotate': return '回転モード';
            default: return '待機モード';
        }
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
            this.gameEnded = true;
            this.showGameOver('帝国軍の勝利！', 'defeat');
            return true;
        } else if (empireFleets.length === 0) {
            this.gameEnded = true;
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