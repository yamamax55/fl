import * as PIXI from 'pixi.js';

export class StrategicPhaseScreen {
    constructor(app, gameState) {
        this.app = app;
        this.gameState = gameState;
        this.container = new PIXI.Container();
        
        // 銀河マップデータ
        this.galaxyMapData = null;
        this.fleetsData = null;
        this.admiralsData = null;
        
        // 戦略フェーズの状態管理
        this.currentTurn = 1;
        this.currentPlayer = 'alliance'; // 'alliance' | 'empire'
        this.actionPoints = 3; // 1ターンあたりの行動ポイント
        this.remainingActions = this.actionPoints;
        
        // 戦略要素
        this.territories = [];
        this.resources = {
            alliance: { funds: 10000, personnel: 1000, materials: 500 },
            empire: { funds: 15000, personnel: 1500, materials: 800 }
        };
        
        // UI要素
        this.turnInfoPanel = null;
        this.resourcePanel = null;
        this.actionPanel = null;
        this.galaxyMap = null;
        this.mainInfoPanel = null;
        
        // コールバック
        this.onStartBattle = null;
        this.onEndTurn = null;
    }

    async init() {
        await this.loadGalaxyMapData();
        await this.loadFleetsData();
        await this.loadAdmiralsData();
        this.createBackground();
        this.createGalaxyMap();
        this.createTurnInfoPanel();
        this.createResourcePanel();
        this.createMainInfoPanel();
        this.createStrategicInfoPanel();
        this.createActionPanel();
        this.createNavigationButtons();
        this.setupEventListeners();
        
        console.log('戦略フェーズ画面初期化完了');
    }

    async loadGalaxyMapData() {
        try {
            const response = await fetch('/data/galaxy_map.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.galaxyMapData = await response.json();
            console.log('銀河マップデータ読み込み完了', this.galaxyMapData);
        } catch (error) {
            console.error('銀河マップデータ読み込みエラー:', error);
            // フォールバック: 簡易データを作成
            this.createFallbackMapData();
        }
    }

    createFallbackMapData() {
        this.galaxyMapData = {
            territories: [
                { id: 1, name: "首都", type: "capital", x: 400, y: 200, owner: "federation" },
                { id: 2, name: "帝都", type: "capital", x: 880, y: 300, owner: "empire" }
            ],
            routes: [],
            factions: {
                federation: { name: "自由連邦", color: "0x0066CC" },
                empire: { name: "銀河帝国", color: "0xCC0066" }
            }
        };
        console.log('フォールバック銀河マップデータを作成');
    }

    async loadFleetsData() {
        try {
            const response = await fetch('/data/fleets.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.fleetsData = await response.json();
            console.log('艦隊データ読み込み完了', this.fleetsData);
        } catch (error) {
            console.error('艦隊データ読み込みエラー:', error);
            this.fleetsData = { fleets: [] };
        }
    }

    async loadAdmiralsData() {
        try {
            const response = await fetch('/data/admirals.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.admiralsData = await response.json();
            console.log('提督データ読み込み完了', this.admiralsData);
        } catch (error) {
            console.error('提督データ読み込みエラー:', error);
            this.admiralsData = { admirals: [] };
        }
    }

    createBackground() {
        // 宇宙背景
        const background = new PIXI.Graphics();
        background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        background.fill(0x000022);
        this.container.addChild(background);

        // 星空
        for (let i = 0; i < 150; i++) {
            const star = new PIXI.Graphics();
            star.circle(0, 0, Math.random() * 1.5 + 0.5);
            star.fill(0xFFFFFF);
            star.alpha = Math.random() * 0.8 + 0.2;
            star.x = Math.random() * this.app.screen.width;
            star.y = Math.random() * this.app.screen.height;
            this.container.addChild(star);
        }
    }

    createGalaxyMap() {
        // 銀河地図コンテナ
        this.galaxyMap = new PIXI.Container();
        this.galaxyMap.x = 200;
        this.galaxyMap.y = 80;
        
        // 銀河地図背景（枠内に収まるよう調整）
        const mapBg = new PIXI.Graphics();
        mapBg.roundRect(0, 0, 600, 480, 10);
        mapBg.fill(0x001133);
        mapBg.stroke({ width: 2, color: 0x0066CC });
        this.galaxyMap.addChild(mapBg);
        
        // タイトル
        const mapTitle = new PIXI.Text('銀河系戦略マップ', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        mapTitle.x = 20;
        mapTitle.y = 20;
        this.galaxyMap.addChild(mapTitle);
        
        this.createTerritories();
        this.container.addChild(this.galaxyMap);
    }

    createTerritories() {
        if (!this.galaxyMapData || !this.galaxyMapData.territories) {
            console.error('銀河マップデータが読み込まれていません');
            return;
        }

        // 航路線を先に描画（星系の下に表示するため）
        this.drawRoutes();

        // 星系を描画
        this.galaxyMapData.territories.forEach(territory => {
            const territoryObj = this.createTerritory(territory);
            this.galaxyMap.addChild(territoryObj);
            this.territories.push({ ...territory, displayObject: territoryObj });
        });
    }

    drawRoutes() {
        if (!this.galaxyMapData.routes) return;

        const routeContainer = new PIXI.Graphics();
        
        this.galaxyMapData.routes.forEach(route => {
            const fromTerritory = this.galaxyMapData.territories.find(t => t.id === route.from);
            const toTerritory = this.galaxyMapData.territories.find(t => t.id === route.to);
            
            if (fromTerritory && toTerritory) {
                const routeType = this.galaxyMapData.routeTypes[route.type];
                const color = parseInt(routeType.color);
                const width = routeType.width;
                
                // 航路線を描画
                routeContainer.moveTo(fromTerritory.x, fromTerritory.y + 60);
                routeContainer.lineTo(toTerritory.x, toTerritory.y + 60);
                routeContainer.stroke({ width: width, color: color, alpha: 0.7 });
                
                // 航路タイプに応じた線のスタイル
                if (routeType.style === 'dashed') {
                    // 点線効果（簡易版）
                    const dx = toTerritory.x - fromTerritory.x;
                    const dy = toTerritory.y - fromTerritory.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const segments = Math.floor(length / 20);
                    
                    for (let i = 0; i < segments; i += 2) {
                        const startRatio = i / segments;
                        const endRatio = Math.min((i + 1) / segments, 1);
                        
                        const startX = fromTerritory.x + dx * startRatio;
                        const startY = fromTerritory.y + dy * startRatio + 60;
                        const endX = fromTerritory.x + dx * endRatio;
                        const endY = fromTerritory.y + dy * endRatio + 60;
                        
                        routeContainer.moveTo(startX, startY);
                        routeContainer.lineTo(endX, endY);
                        routeContainer.stroke({ width: width, color: color, alpha: 0.5 });
                    }
                }
            }
        });
        
        this.galaxyMap.addChild(routeContainer);
    }

    createTerritory(data) {
        const container = new PIXI.Container();
        container.x = data.x;
        container.y = data.y + 60; // タイトル分のオフセット

        // 星系タイプと所有者情報を取得
        const territoryType = this.galaxyMapData.territoryTypes[data.type];
        const faction = this.galaxyMapData.factions[data.owner];
        
        let color = faction ? parseInt(faction.color) : 0x666666;
        let size = territoryType ? territoryType.size : 15;
        
        // 星系アイコン
        const icon = new PIXI.Graphics();
        icon.circle(0, 0, size);
        icon.fill(color);
        icon.stroke({ width: 2, color: 0xFFFFFF });
        container.addChild(icon);

        // 星系タイプアイコン（中央に表示）
        if (faction && faction.symbol) {
            const symbolText = new PIXI.Text(faction.symbol, new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: size * 0.8,
                fill: '#FFFFFF',
                fontWeight: 'bold',
                align: 'center'
            }));
            symbolText.anchor.set(0.5);
            container.addChild(symbolText);
        }

        // 名前ラベル
        const nameText = new PIXI.Text(data.name, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }));
        nameText.anchor.set(0.5, 0);
        nameText.y = size + 5;
        container.addChild(nameText);

        // インタラクション
        container.eventMode = 'static';
        container.cursor = 'pointer';
        
        container.on('pointerover', () => {
            icon.tint = 0xDDDDDD;
            nameText.style.fill = '#FFFF00';
        });
        
        container.on('pointerout', () => {
            icon.tint = 0xFFFFFF;
            nameText.style.fill = '#FFFFFF';
        });
        
        container.on('pointerdown', () => {
            this.selectTerritory(data);
        });

        return container;
    }

    createTurnInfoPanel() {
        this.turnInfoPanel = new PIXI.Container();
        this.turnInfoPanel.x = 20;
        this.turnInfoPanel.y = 20;

        // パネル背景
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 160, 120, 8);
        bg.fill(0x112233);
        bg.stroke({ width: 2, color: 0x0088CC });
        this.turnInfoPanel.addChild(bg);

        // タイトル
        const title = new PIXI.Text('ターン情報', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        title.x = 10;
        title.y = 10;
        this.turnInfoPanel.addChild(title);

        // ターン数
        this.turnText = new PIXI.Text(`ターン: ${this.currentTurn}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#CCCCCC'
        }));
        this.turnText.x = 10;
        this.turnText.y = 35;
        this.turnInfoPanel.addChild(this.turnText);

        // 現在のプレイヤー
        this.playerText = new PIXI.Text(`${this.getPlayerName(this.currentPlayer)}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: this.currentPlayer === 'alliance' ? '#0066CC' : '#CC0066',
            fontWeight: 'bold'
        }));
        this.playerText.x = 10;
        this.playerText.y = 55;
        this.turnInfoPanel.addChild(this.playerText);

        // 残り行動ポイント
        this.actionText = new PIXI.Text(`行動: ${this.remainingActions}/${this.actionPoints}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#FFAA00'
        }));
        this.actionText.x = 10;
        this.actionText.y = 75;
        this.turnInfoPanel.addChild(this.actionText);

        this.container.addChild(this.turnInfoPanel);
    }

    createResourcePanel() {
        this.resourcePanel = new PIXI.Container();
        this.resourcePanel.x = 20;
        this.resourcePanel.y = 160;

        // パネル背景
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 160, 140, 8);
        bg.fill(0x112233);
        bg.stroke({ width: 2, color: 0x0088CC });
        this.resourcePanel.addChild(bg);

        // タイトル
        const title = new PIXI.Text('資源状況', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        title.x = 10;
        title.y = 10;
        this.resourcePanel.addChild(title);

        // リソース表示
        const resources = this.resources[this.currentPlayer];
        
        this.fundsText = new PIXI.Text(`資金: ${resources.funds}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#00FF00'
        }));
        this.fundsText.x = 10;
        this.fundsText.y = 35;
        this.resourcePanel.addChild(this.fundsText);

        this.personnelText = new PIXI.Text(`人員: ${resources.personnel}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#CCCCFF'
        }));
        this.personnelText.x = 10;
        this.personnelText.y = 55;
        this.resourcePanel.addChild(this.personnelText);

        this.materialsText = new PIXI.Text(`物資: ${resources.materials}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#FFCCCC'
        }));
        this.materialsText.x = 10;
        this.materialsText.y = 75;
        this.resourcePanel.addChild(this.materialsText);

        this.container.addChild(this.resourcePanel);
    }

    createMainInfoPanel() {
        this.mainInfoPanel = new PIXI.Container();
        this.mainInfoPanel.x = 820;
        this.mainInfoPanel.y = 80;

        // 背景パネル
        const panelBg = new PIXI.Graphics();
        panelBg.roundRect(0, 0, 440, 480, 10);
        panelBg.fill(0x001122);
        panelBg.stroke({ width: 2, color: 0x0066CC });
        this.mainInfoPanel.addChild(panelBg);

        // タイトル
        const titleText = new PIXI.Text('艦隊管理', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        titleText.x = 20;
        titleText.y = 15;
        this.mainInfoPanel.addChild(titleText);

        // 艦隊一覧ボタン
        this.createFleetListButton();

        // 情報表示エリア
        this.createInfoDisplayArea();

        this.container.addChild(this.mainInfoPanel);
    }

    createFleetListButton() {
        const button = new PIXI.Container();
        button.x = 20;
        button.y = 60;

        // ボタン背景
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 400, 50, 8);
        bg.fill(0x0066CC);
        bg.stroke({ width: 2, color: 0x0088FF });
        button.addChild(bg);

        // ボタンテキスト
        const text = new PIXI.Text('艦隊一覧', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        text.anchor.set(0.5);
        text.x = 200;
        text.y = 25;
        button.addChild(text);

        // アイコン
        const icon = new PIXI.Text('🚢', new PIXI.TextStyle({
            fontSize: 20,
            fill: '#FFFFFF'
        }));
        icon.x = 30;
        icon.y = 18;
        button.addChild(icon);

        // インタラクティブ機能
        button.eventMode = 'static';
        button.cursor = 'pointer';

        button.on('pointerover', () => {
            bg.tint = 0xCCCCCC;
        });

        button.on('pointerout', () => {
            bg.tint = 0xFFFFFF;
        });

        button.on('pointerdown', () => {
            this.openFleetListPage();
        });

        this.mainInfoPanel.addChild(button);
    }

    createInfoDisplayArea() {
        // 艦隊管理説明エリア
        const infoContainer = new PIXI.Container();
        infoContainer.x = 20;
        infoContainer.y = 130;

        // 説明テキスト
        const descText = new PIXI.Text('艦隊一覧ボタンをクリックして\n全艦隊の詳細情報を確認できます。\n\n各艦隊の戦力、司令官、配備状況\nなどを管理し、戦略を立てましょう。', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#CCCCCC',
            wordWrap: true,
            wordWrapWidth: 380
        }));
        descText.y = 0;
        infoContainer.addChild(descText);

        // 簡易艦隊統計
        this.updateFleetCount(infoContainer);

        this.mainInfoPanel.addChild(infoContainer);
    }

    createStrategicInfoPanel() {
        this.strategicInfoPanel = new PIXI.Container();
        this.strategicInfoPanel.x = 20;
        this.strategicInfoPanel.y = 320;

        // 背景パネル
        const panelBg = new PIXI.Graphics();
        panelBg.roundRect(0, 0, 160, 250, 10);
        panelBg.fill(0x001122);
        panelBg.stroke({ width: 2, color: 0x0066CC });
        this.strategicInfoPanel.addChild(panelBg);

        // タイトル
        const titleText = new PIXI.Text('戦略情報', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        titleText.x = 10;
        titleText.y = 10;
        this.strategicInfoPanel.addChild(titleText);

        // 情報表示エリア
        const infoContainer = new PIXI.Container();
        infoContainer.x = 10;
        infoContainer.y = 40;

        // 戦況概要
        const situationText = new PIXI.Text('戦況概要', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            fill: '#CCCCFF'
        }));
        situationText.y = 0;
        infoContainer.addChild(situationText);

        // プレイヤー陣営表示
        const factionText = new PIXI.Text(`プレイヤー:\n${this.getPlayerName(this.currentPlayer)}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 10,
            fill: '#FFFFFF'
        }));
        factionText.y = 20;
        infoContainer.addChild(factionText);

        // 艦隊数表示
        this.updateStrategicFleetCount(infoContainer);

        // 戦略ヒント
        const hintText = new PIXI.Text('戦略ヒント:\n• 右側艦隊一覧で戦力確認\n• 戦闘開始で戦術フェーズ\n• 資源管理に注意\n• 外交も重要な要素', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 9,
            fill: '#AAAAAA',
            wordWrap: true,
            wordWrapWidth: 135
        }));
        hintText.y = 120;
        infoContainer.addChild(hintText);

        this.strategicInfoPanel.addChild(infoContainer);
        this.container.addChild(this.strategicInfoPanel);
    }

    updateStrategicFleetCount(container) {
        if (!this.fleetsData || !this.fleetsData.fleets) return;

        const allianceFleets = this.fleetsData.fleets.filter(f => f.faction === 'Alliance').length;
        const empireFleets = this.fleetsData.fleets.filter(f => f.faction === 'Empire').length;

        const fleetCountText = new PIXI.Text(`艦隊数:\n連邦: ${allianceFleets}隻\n帝国: ${empireFleets}隻`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 10,
            fill: '#FFFFFF'
        }));
        fleetCountText.y = 55;
        container.addChild(fleetCountText);
    }

    updateFleetCount(container) {
        if (!this.fleetsData || !this.fleetsData.fleets) return;

        const allianceFleets = this.fleetsData.fleets.filter(f => f.faction === 'Alliance').length;
        const empireFleets = this.fleetsData.fleets.filter(f => f.faction === 'Empire').length;

        const fleetCountText = new PIXI.Text(`艦隊数:\n自由連邦: ${allianceFleets}隻\n銀河帝国: ${empireFleets}隻`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#FFFFFF'
        }));
        fleetCountText.y = 120;
        container.addChild(fleetCountText);
    }

    openFleetListPage() {
        console.log('艦隊一覧ページを開く');
        // 艦隊一覧専用ページへの遷移処理
        if (this.onFleetListCallback) {
            this.onFleetListCallback();
        }
    }

    createActionPanel() {
        this.actionPanel = new PIXI.Container();
        this.actionPanel.x = 20;
        this.actionPanel.y = 580;

        // パネル背景
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 160, 140, 8);
        bg.fill(0x112233);
        bg.stroke({ width: 2, color: 0x0088CC });
        this.actionPanel.addChild(bg);

        // タイトル
        const title = new PIXI.Text('戦略行動', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        title.x = 10;
        title.y = 10;
        this.actionPanel.addChild(title);

        // 行動ボタン
        const actions = [
            { text: '艦隊派遣', action: 'deploy_fleet' },
            { text: '戦闘開始', action: 'start_battle' },
            { text: '建設', action: 'construction' },
            { text: '補給', action: 'supply' },
            { text: '外交', action: 'diplomacy' },
            { text: 'ターン終了', action: 'end_turn' }
        ];

        actions.forEach((actionData, index) => {
            const button = this.createActionButton(actionData.text, actionData.action, index);
            this.actionPanel.addChild(button);
        });

        this.container.addChild(this.actionPanel);
    }

    createActionButton(text, action, index) {
        const button = new PIXI.Container();
        button.x = 10;
        button.y = 40 + index * 30;

        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 135, 25, 5);
        bg.fill(action === 'end_turn' ? 0x664400 : 0x334455);
        bg.stroke({ width: 1, color: 0x666666 });
        button.addChild(bg);

        const buttonText = new PIXI.Text(text, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#FFFFFF'
        }));
        buttonText.anchor.set(0.5);
        buttonText.x = 67.5;
        buttonText.y = 12.5;
        button.addChild(buttonText);

        button.eventMode = 'static';
        button.cursor = 'pointer';

        button.on('pointerover', () => {
            bg.tint = 0xDDDDDD;
        });

        button.on('pointerout', () => {
            bg.tint = 0xFFFFFF;
        });

        button.on('pointerdown', () => {
            this.handleAction(action);
        });

        return button;
    }

    createNavigationButtons() {
        // 戻るボタン
        const backButton = new PIXI.Container();
        backButton.x = this.app.screen.width - 120;
        backButton.y = this.app.screen.height - 60;

        const backBg = new PIXI.Graphics();
        backBg.roundRect(0, 0, 100, 40, 8);
        backBg.fill(0x666666);
        backBg.stroke({ width: 2, color: 0x888888 });
        backButton.addChild(backBg);

        const backText = new PIXI.Text('メインメニュー', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }));
        backText.anchor.set(0.5);
        backText.x = 50;
        backText.y = 20;
        backButton.addChild(backText);

        backButton.eventMode = 'static';
        backButton.cursor = 'pointer';

        backButton.on('pointerover', () => {
            backBg.tint = 0xDDDDDD;
        });

        backButton.on('pointerout', () => {
            backBg.tint = 0xFFFFFF;
        });

        backButton.on('pointerdown', () => {
            // メインメニューに戻る処理
            console.log('メインメニューに戻る');
            if (this.onBackCallback) {
                this.onBackCallback();
            }
        });

        this.container.addChild(backButton);
    }

    setupEventListeners() {
        // ESCキーでメニューに戻る
        const keyHandler = (event) => {
            if (!this.container.visible) return;
            
            if (event.key === 'Escape') {
                console.log('ESCキーが押されました - メインメニューへ');
                if (this.onBackCallback) {
                    this.onBackCallback();
                }
            }
        };
        
        document.addEventListener('keydown', keyHandler);
    }

    selectTerritory(territory) {
        console.log(`星系選択: ${territory.name} (${territory.owner})`);
        
        // 選択した星系に応じた行動を提示
        this.showTerritoryActions(territory);
    }

    showTerritoryActions(territory) {
        // 星系固有の行動オプションを表示
        console.log(`${territory.name}での利用可能な行動を表示`);
    }

    handleAction(action) {
        console.log(`戦略行動実行: ${action}`);

        switch (action) {
            case 'deploy_fleet':
                this.deployFleet();
                break;
            case 'start_battle':
                this.startBattle();
                break;
            case 'construction':
                this.construction();
                break;
            case 'supply':
                this.supply();
                break;
            case 'diplomacy':
                this.diplomacy();
                break;
            case 'end_turn':
                this.endTurn();
                break;
        }
    }

    deployFleet() {
        if (this.remainingActions <= 0) {
            console.log('行動ポイントが不足しています');
            return;
        }

        console.log('艦隊派遣を実行');
        this.remainingActions--;
        this.updateUI();
    }

    startBattle() {
        if (this.remainingActions <= 0) {
            console.log('行動ポイントが不足しています');
            return;
        }

        console.log('戦闘開始 - 戦術フェーズに移行');
        
        if (this.onStartBattle) {
            this.onStartBattle();
        }

        this.remainingActions--;
        this.updateUI();
    }

    construction() {
        if (this.remainingActions <= 0) {
            console.log('行動ポイントが不足しています');
            return;
        }

        console.log('建設を実行');
        this.remainingActions--;
        this.updateUI();
    }

    supply() {
        if (this.remainingActions <= 0) {
            console.log('行動ポイントが不足しています');
            return;
        }

        console.log('補給を実行');
        this.remainingActions--;
        this.updateUI();
    }

    diplomacy() {
        if (this.remainingActions <= 0) {
            console.log('行動ポイントが不足しています');
            return;
        }

        console.log('外交交渉を実行');
        this.remainingActions--;
        this.updateUI();
    }

    endTurn() {
        console.log(`${this.getPlayerName(this.currentPlayer)}のターン終了`);

        // プレイヤー切り替え
        if (this.currentPlayer === 'alliance') {
            this.currentPlayer = 'empire';
        } else {
            this.currentPlayer = 'alliance';
            this.currentTurn++; // 両プレイヤーのターンが終わったらターン数増加
        }

        // 行動ポイントリセット
        this.remainingActions = this.actionPoints;

        // リソース更新
        this.updateResources();

        this.updateUI();

        if (this.onEndTurn) {
            this.onEndTurn();
        }
    }

    updateResources() {
        // リソース自動増加（簡易版）
        const playerResources = this.resources[this.currentPlayer];
        playerResources.funds += 1000;
        playerResources.personnel += 50;
        playerResources.materials += 25;

        console.log(`${this.getPlayerName(this.currentPlayer)}のリソースが更新されました`);
    }

    updateUI() {
        // ターン情報更新
        this.turnText.text = `ターン: ${this.currentTurn}`;
        this.playerText.text = this.getPlayerName(this.currentPlayer);
        this.playerText.style.fill = this.currentPlayer === 'alliance' ? '#0066CC' : '#CC0066';
        this.actionText.text = `行動: ${this.remainingActions}/${this.actionPoints}`;

        // リソース情報更新
        const resources = this.resources[this.currentPlayer];
        this.fundsText.text = `資金: ${resources.funds}`;
        this.personnelText.text = `人員: ${resources.personnel}`;
        this.materialsText.text = `物資: ${resources.materials}`;
    }

    getPlayerName(player) {
        // JSONデータから陣営名を取得
        if (this.galaxyMapData && this.galaxyMapData.factions) {
            const factionKey = player === 'alliance' ? 'federation' : 'empire';
            const faction = this.galaxyMapData.factions[factionKey];
            if (faction) {
                return faction.name;
            }
        }
        // フォールバック
        return player === 'alliance' ? '自由連邦' : '銀河帝国';
    }

    show() {
        this.container.visible = true;
        this.updateUI();
        console.log('戦略フェーズ画面表示');
    }

    hide() {
        this.container.visible = false;
        console.log('戦略フェーズ画面非表示');
    }

    getContainer() {
        return this.container;
    }

    setOnStartBattle(callback) {
        this.onStartBattle = callback;
    }

    setOnEndTurn(callback) {
        this.onEndTurn = callback;
    }

    // プレイヤー陣営設定
    setPlayerFaction(faction) {
        this.playerFaction = faction;
        this.currentPlayer = faction;
        console.log(`プレイヤー陣営設定: ${faction}`);
        this.updateUI();
    }

    // 戦闘コールバック設定
    setOnBattleCallback(callback) {
        this.onBattleCallback = callback;
    }

    // 戻るコールバック設定
    setOnBackCallback(callback) {
        this.onBackCallback = callback;
    }

    // 戦闘結果処理
    handleBattleResult(result) {
        console.log('戦闘結果を処理:', result);
        
        // 勝利条件による領土変更や資源更新
        if (result.winner === this.playerFaction) {
            console.log('戦闘勝利！戦略的優位を獲得');
            // 勝利時のボーナス
            const resources = this.resources[this.playerFaction];
            resources.funds += 2000;
            resources.materials += 100;
        } else {
            console.log('戦闘敗北...戦略的見直しが必要');
        }
        
        this.updateUI();
    }

    // 戦闘開始を修正してコールバックを呼び出す
    startBattle() {
        if (this.remainingActions <= 0) {
            console.log('行動ポイントが不足しています');
            return;
        }

        console.log('戦闘開始 - 戦術フェーズに移行');
        
        // 戦場データを作成（簡易版）
        const territoryData = {
            name: '戦術戦闘',
            type: 'battle',
            mapId: Math.floor(Math.random() * 6) + 1 // ランダムマップ選択
        };
        
        if (this.onBattleCallback) {
            this.onBattleCallback(territoryData);
        }

        this.remainingActions--;
        this.updateUI();
    }

    destroy() {
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
            this.container.destroy();
        }
        console.log('戦略フェーズ画面破棄完了');
    }
}