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
        
        // 上部中央ステータスバー初期化
        this.initializeCenterStatusBar();
        
        // 艦隊ステータス表示コンテナ
        this.fleetStatusContainer = new PIXI.Container();
        this.fleetStatusContainer.x = 20;
        this.fleetStatusContainer.y = 45;
        this.container.addChild(this.fleetStatusContainer);
        
        // UI初期化
        this.initializeUI();
    }
    
    // 上部中央ステータスバー初期化
    initializeCenterStatusBar() {
        // 初期戦力の記録（最初の総HP）
        this.initialAllianceHP = 0;
        this.initialEmpireHP = 0;
        this.initialForceRecorded = false;
        
        // 中央ステータスバーコンテナ
        this.centerStatusContainer = new PIXI.Container();
        this.centerStatusContainer.x = 640; // 画面中央
        this.centerStatusContainer.y = 15;
        this.container.addChild(this.centerStatusContainer);
        
        // 背景パネル
        this.statusBg = new PIXI.Graphics();
        this.statusBg.rect(-250, -5, 500, 50);
        this.statusBg.fill({ color: 0x1a1a1a, alpha: 0.8 });
        this.statusBg.stroke({ width: 1, color: 0x555555 });
        this.centerStatusContainer.addChild(this.statusBg);
        
        // 同盟軍バー（左側）
        this.allianceBarContainer = new PIXI.Container();
        this.allianceBarContainer.x = -240;
        this.allianceBarContainer.y = 5;
        this.centerStatusContainer.addChild(this.allianceBarContainer);
        
        // 同盟軍バー背景
        this.allianceBarBg = new PIXI.Graphics();
        this.allianceBarBg.rect(0, 0, 200, 20);
        this.allianceBarBg.fill({ color: 0x333333 });
        this.allianceBarBg.stroke({ width: 1, color: 0x555555 });
        this.allianceBarContainer.addChild(this.allianceBarBg);
        
        // 同盟軍HPバー
        this.allianceHPBar = new PIXI.Graphics();
        this.allianceBarContainer.addChild(this.allianceHPBar);
        
        // 同盟軍テキスト
        this.allianceText = new PIXI.Text('同盟軍: 3', this.textStyle);
        this.allianceText.x = 5;
        this.allianceText.y = 25;
        this.allianceBarContainer.addChild(this.allianceText);
        
        // 帝国軍バー（右側）
        this.empireBarContainer = new PIXI.Container();
        this.empireBarContainer.x = 40;
        this.empireBarContainer.y = 5;
        this.centerStatusContainer.addChild(this.empireBarContainer);
        
        // 帝国軍バー背景
        this.empireBarBg = new PIXI.Graphics();
        this.empireBarBg.rect(0, 0, 200, 20);
        this.empireBarBg.fill({ color: 0x333333 });
        this.empireBarBg.stroke({ width: 1, color: 0x555555 });
        this.empireBarContainer.addChild(this.empireBarBg);
        
        // 帝国軍HPバー
        this.empireHPBar = new PIXI.Graphics();
        this.empireBarContainer.addChild(this.empireHPBar);
        
        // 帝国軍テキスト
        this.empireText = new PIXI.Text('帝国軍: 3', this.textStyle);
        this.empireText.x = 5;
        this.empireText.y = 25;
        this.empireBarContainer.addChild(this.empireText);
        
        // 中央の「VS」セパレーター
        this.vsText = new PIXI.Text('VS', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        this.vsText.anchor.set(0.5);
        this.vsText.x = 0;
        this.vsText.y = 15;
        this.centerStatusContainer.addChild(this.vsText);
        
        // 選択艦隊数表示（左上に移動）
        this.selectionText = new PIXI.Text('選択艦隊: 0', this.textStyle);
        this.selectionText.x = 20;
        this.selectionText.y = 20;
        this.container.addChild(this.selectionText);
    }
    
    // 中央ステータスバー更新
    updateCenterStatusBar(allianceFleets, empireFleets) {
        // 初期戦力を記録（ゲーム開始時のみ）
        if (!this.initialForceRecorded && window.gameState && window.gameState.fleets) {
            const allAllianceFleets = window.gameState.fleets.filter(f => f.faction === 'alliance');
            const allEmpireFleets = window.gameState.fleets.filter(f => f.faction === 'empire');
            this.initialAllianceHP = allAllianceFleets.reduce((sum, fleet) => sum + fleet.maxHP, 0);
            this.initialEmpireHP = allEmpireFleets.reduce((sum, fleet) => sum + fleet.maxHP, 0);
            this.initialForceRecorded = true;
        }
        
        // 現在のHP合計計算（撃破された艦隊含む全艦隊から）
        const allAllianceFleets = window.gameState.fleets.filter(f => f.faction === 'alliance');
        const allEmpireFleets = window.gameState.fleets.filter(f => f.faction === 'empire');
        const allianceTotalHP = allAllianceFleets.reduce((sum, fleet) => sum + fleet.currentHP, 0);
        const empireTotalHP = allEmpireFleets.reduce((sum, fleet) => sum + fleet.currentHP, 0);
        
        // 初期戦力を基準とした比率計算
        const allianceRatio = this.initialAllianceHP > 0 ? allianceTotalHP / this.initialAllianceHP : 0;
        const empireRatio = this.initialEmpireHP > 0 ? empireTotalHP / this.initialEmpireHP : 0;
        
        // 同盟軍HPバー更新
        this.allianceHPBar.clear();
        if (allianceRatio > 0) {
            const barWidth = 200 * allianceRatio;
            this.allianceHPBar.rect(0, 0, barWidth, 20);
            // グラデーション効果
            const alpha = Math.max(0.7, allianceRatio);
            this.allianceHPBar.fill({ color: 0x4a9eff, alpha: alpha });
        }
        
        // 帝国軍HPバー更新
        this.empireHPBar.clear();
        if (empireRatio > 0) {
            const barWidth = 200 * empireRatio;
            this.empireHPBar.rect(0, 0, barWidth, 20);
            // グラデーション効果
            const alpha = Math.max(0.7, empireRatio);
            this.empireHPBar.fill({ color: 0xff4444, alpha: alpha });
        }
        
        // テキスト更新
        this.allianceText.text = `同盟軍 (${Math.round(allianceTotalHP)}HP)`;
        this.empireText.text = `帝国軍 (${Math.round(empireTotalHP)}HP)`;
        
        // 劣勢側の点滅効果（オプション）
        if (allianceRatio < 0.3 && allianceFleets.length > 0) {
            this.allianceBarContainer.alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
        } else {
            this.allianceBarContainer.alpha = 1;
        }
        
        if (empireRatio < 0.3 && empireFleets.length > 0) {
            this.empireBarContainer.alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
        } else {
            this.empireBarContainer.alpha = 1;
        }
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
        
        // ゲーム制御ボタン
        this.createGameControlButtons();
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
    
    // ゲーム制御ボタン作成
    createGameControlButtons() {
        const buttonWidth = 80;
        const buttonHeight = 35;
        const buttonY = 12;
        const startX = 850;
        
        // 一時停止ボタン
        this.pauseBtn = this.createButton('一時停止', startX, buttonY, buttonWidth, buttonHeight, 0x666666);
        this.pauseBtn.button.on('pointerdown', () => this.togglePause());
        this.bottomPanel.addChild(this.pauseBtn.container);
        
        // 速度変更ボタン
        this.speedBtn = this.createButton('1x', startX + 90, buttonY, 60, buttonHeight, 0x444444);
        this.speedBtn.button.on('pointerdown', () => this.changeSpeed());
        this.bottomPanel.addChild(this.speedBtn.container);
        
        // ゲーム状態
        this.isPaused = false;
        this.gameSpeed = 1;
    }
    
    // 一時停止トグル
    togglePause() {
        const ticker = window.gameState.app.ticker;
        
        if (this.isPaused) {
            ticker.start();
            this.pauseBtn.text.text = '一時停止';
            this.pauseBtn.button.clear();
            this.pauseBtn.button.rect(0, 0, 80, 35);
            this.pauseBtn.button.fill(0x666666);
            this.pauseBtn.button.stroke({ width: 1, color: 0xffffff, alpha: 0.3 });
            this.isPaused = false;
            console.log('ゲーム再開');
        } else {
            ticker.stop();
            this.pauseBtn.text.text = '再開';
            this.pauseBtn.button.clear();
            this.pauseBtn.button.rect(0, 0, 80, 35);
            this.pauseBtn.button.fill(0xaa4444);
            this.pauseBtn.button.stroke({ width: 1, color: 0xffffff, alpha: 0.3 });
            this.isPaused = true;
            console.log('ゲーム一時停止');
        }
    }
    
    // 速度変更
    changeSpeed() {
        const ticker = window.gameState.app.ticker;
        
        if (this.gameSpeed === 1) {
            this.gameSpeed = 2;
            ticker.speed = 2;
            this.speedBtn.text.text = '2x';
        } else if (this.gameSpeed === 2) {
            this.gameSpeed = 0.5;
            ticker.speed = 0.5;
            this.speedBtn.text.text = '0.5x';
        } else {
            this.gameSpeed = 1;
            ticker.speed = 1;
            this.speedBtn.text.text = '1x';
        }
        
        console.log(`ゲーム速度変更: ${this.gameSpeed}x`);
    }
    
    update() {
        const selectedFleets = window.gameState.fleets.filter(fleet => fleet.isSelected);
        this.selectionText.text = `選択艦隊: ${selectedFleets.length}`;
        
        // 各陣営の残存艦隊数とHP合計を更新
        const allianceFleets = window.gameState.fleets.filter(f => f.faction === 'alliance' && f.currentHP > 0);
        const empireFleets = window.gameState.fleets.filter(f => f.faction === 'empire' && f.currentHP > 0);
        
        // 中央ステータスバーを更新
        this.updateCenterStatusBar(allianceFleets, empireFleets);
        
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
                `防御力: ${fleet.defensePower}`,
                `射程: ${fleet.range}`,
                `移動速度: ${fleet.moveSpeed.toFixed(2)}`,
                `回転速度: ${(fleet.rotationSpeed * 1000).toFixed(1)}/s`,
                ``,
                `状態: ${this.getFleetStatus(fleet)}`,
                `モード: ${this.getFleetMode(fleet)}`,
                ``,
                `座標: (${Math.round(fleet.x)}, ${Math.round(fleet.y)})`,
            ];
            
            if (fleet.targetX !== fleet.x || fleet.targetY !== fleet.y) {
                details.push(`目標: (${Math.round(fleet.targetX)}, ${Math.round(fleet.targetY)})`);
            }
            
            // 司令官情報を追加
            if (fleet.commanderInfo) {
                details.push('');
                details.push('=== 指揮系統 ===');
                if (fleet.commanderInfo.commander_last_name) {
                    details.push(`司令官: ${fleet.commanderInfo.commander_rank || ''} ${fleet.commanderInfo.commander_last_name} ${fleet.commanderInfo.commander_first_name} (${fleet.commanderInfo.commander_age}歳)`);
                }
                if (fleet.commanderInfo.vice_last_name) {
                    details.push(`副司令官: ${fleet.commanderInfo.vice_rank || ''} ${fleet.commanderInfo.vice_last_name} ${fleet.commanderInfo.vice_first_name} (${fleet.commanderInfo.vice_age}歳)`);
                }
                if (fleet.commanderInfo.staff_last_name) {
                    details.push(`参謀: ${fleet.commanderInfo.staff_rank || ''} ${fleet.commanderInfo.staff_last_name} ${fleet.commanderInfo.staff_first_name} (${fleet.commanderInfo.staff_age}歳)`);
                }
                if (!fleet.commanderInfo.commander_last_name && !fleet.commanderInfo.vice_last_name && !fleet.commanderInfo.staff_last_name) {
                    details.push('指揮官未配属');
                }
            } else {
                details.push('');
                details.push('=== 指揮系統 ===');
                
                // データベースサービスの状態をチェック
                const dbService = window.gameState?.dbService;
                if (dbService && dbService.isInitialized) {
                    details.push('司令官情報なし');
                } else {
                    details.push('データ読み込み中...');
                }
                
                // デバッグ情報（開発時のみ）
                if (window.location.hostname === 'localhost') {
                    console.log(`Fleet ${fleet.name} (number: ${fleet.fleetNumber}) commander info:`, fleet.commanderInfo);
                    if (dbService) {
                        console.log('DatabaseService status:', dbService.isInitialized);
                    }
                }
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
            const totalDefense = selectedFleets.reduce((sum, f) => sum + f.defensePower, 0);
            
            const summary = [
                `選択艦隊数: ${selectedFleets.length}`,
                ``,
                `合計HP: ${totalHP} / ${maxHP}`,
                `合計攻撃力: ${totalAttack}`,
                `合計防御力: ${totalDefense}`,
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