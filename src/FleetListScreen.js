import * as PIXI from 'pixi.js';

export class FleetListScreen {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        
        // データ
        this.fleetsData = null;
        this.admiralsData = null;
        this.currentFleetFilter = 'all'; // 'all', 'alliance', 'empire'
        
        // UI要素
        this.fleetListContainer = null;
        
        // コールバック
        this.onBackCallback = null;
    }

    async init() {
        await this.loadData();
        this.createBackground();
        this.createHeader();
        this.createFilterButtons();
        this.createFleetList();
        this.createNavigationButtons();
        
        console.log('艦隊一覧画面初期化完了');
    }

    async loadData() {
        try {
            // 艦隊データ読み込み
            const fleetsResponse = await fetch('/data/fleets.json');
            if (fleetsResponse.ok) {
                this.fleetsData = await fleetsResponse.json();
            }

            // 提督データ読み込み
            const admiralsResponse = await fetch('/data/admirals.json');
            if (admiralsResponse.ok) {
                this.admiralsData = await admiralsResponse.json();
            }

            console.log('艦隊一覧データ読み込み完了');
        } catch (error) {
            console.error('艦隊一覧データ読み込みエラー:', error);
            this.fleetsData = { fleets: [] };
            this.admiralsData = { admirals: [] };
        }
    }

    createBackground() {
        // 黒い宇宙背景
        const background = new PIXI.Graphics();
        background.rect(0, 0, 1280, 720);
        background.fill(0x000022);
        this.container.addChild(background);

        // 星空効果
        for (let i = 0; i < 100; i++) {
            const star = new PIXI.Graphics();
            const size = Math.random() * 1.5 + 0.3;
            
            star.circle(0, 0, size);
            star.fill(0xffffff);
            star.alpha = Math.random() * 0.6 + 0.2;
            
            star.x = Math.random() * 1280;
            star.y = Math.random() * 720;
            
            this.container.addChild(star);
        }
    }

    createHeader() {
        // タイトル
        const titleText = new PIXI.Text('艦隊一覧', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            stroke: { color: '#000044', width: 3 }
        }));
        titleText.anchor.set(0.5, 0);
        titleText.x = 640;
        titleText.y = 30;
        this.container.addChild(titleText);

        // サブタイトル
        const subtitleText = new PIXI.Text('全艦隊の戦力と配備状況', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: '#CCCCCC'
        }));
        subtitleText.anchor.set(0.5, 0);
        subtitleText.x = 640;
        subtitleText.y = 80;
        this.container.addChild(subtitleText);
    }

    createFilterButtons() {
        const filterContainer = new PIXI.Container();
        filterContainer.x = 640;
        filterContainer.y = 120;

        // 全て表示ボタン
        const allButton = this.createFilterButton('全て表示', 'all', -120);
        filterContainer.addChild(allButton);

        // 自由連邦ボタン
        const allianceButton = this.createFilterButton('自由連邦', 'alliance', -20);
        filterContainer.addChild(allianceButton);

        // 銀河帝国ボタン
        const empireButton = this.createFilterButton('銀河帝国', 'empire', 80);
        filterContainer.addChild(empireButton);

        this.container.addChild(filterContainer);
    }

    createFilterButton(label, filter, x) {
        const button = new PIXI.Container();
        button.x = x;

        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 90, 35, 8);
        bg.fill(this.currentFleetFilter === filter ? 0x0066CC : 0x333333);
        bg.stroke({ width: 2, color: 0x666666 });
        button.addChild(bg);

        const text = new PIXI.Text(label, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            align: 'center'
        }));
        text.anchor.set(0.5);
        text.x = 45;
        text.y = 17;
        button.addChild(text);

        // インタラクティブ機能
        button.eventMode = 'static';
        button.cursor = 'pointer';

        button.on('pointerover', () => {
            if (this.currentFleetFilter !== filter) {
                bg.tint = 0xCCCCCC;
            }
        });

        button.on('pointerout', () => {
            bg.tint = 0xFFFFFF;
        });

        button.on('pointerdown', () => {
            this.currentFleetFilter = filter;
            this.updateFilterButtons();
            this.updateFleetList();
        });

        return button;
    }

    updateFilterButtons() {
        // フィルターボタンの状態を更新
        const filterContainer = this.container.children.find(child => 
            child.x === 640 && child.y === 120
        );
        
        if (filterContainer) {
            filterContainer.children.forEach((button, index) => {
                const filters = ['all', 'alliance', 'empire'];
                const bg = button.children[0];
                bg.clear();
                bg.roundRect(0, 0, 90, 35, 8);
                bg.fill(this.currentFleetFilter === filters[index] ? 0x0066CC : 0x333333);
                bg.stroke({ width: 2, color: 0x666666 });
            });
        }
    }

    createFleetList() {
        // メインパネル
        const mainPanel = new PIXI.Graphics();
        mainPanel.roundRect(0, 0, 1200, 480, 10);
        mainPanel.fill(0x001122);
        mainPanel.stroke({ width: 2, color: 0x0066CC });
        mainPanel.x = 40;
        mainPanel.y = 180;
        this.container.addChild(mainPanel);

        // スクロール可能な艦隊リストエリア
        this.fleetListContainer = new PIXI.Container();
        this.fleetListContainer.x = 60;
        this.fleetListContainer.y = 200;
        this.container.addChild(this.fleetListContainer);

        // マスクエリア
        const maskArea = new PIXI.Graphics();
        maskArea.rect(60, 200, 1160, 440);
        maskArea.fill(0xFFFFFF);
        this.container.addChild(maskArea);
        this.fleetListContainer.mask = maskArea;

        this.updateFleetList();
    }

    updateFleetList() {
        if (!this.fleetsData || !this.fleetsData.fleets) return;

        // 既存のリストをクリア
        this.fleetListContainer.removeChildren();

        // フィルタリング
        let filteredFleets = this.fleetsData.fleets;
        
        if (this.currentFleetFilter === 'alliance') {
            filteredFleets = filteredFleets.filter(fleet => fleet.faction === 'Alliance');
        } else if (this.currentFleetFilter === 'empire') {
            filteredFleets = filteredFleets.filter(fleet => fleet.faction === 'Empire');
        }

        // 艦隊カードを作成
        filteredFleets.forEach((fleet, index) => {
            const fleetCard = this.createFleetCard(fleet, index);
            this.fleetListContainer.addChild(fleetCard);
        });
    }

    createFleetCard(fleet, index) {
        const card = new PIXI.Container();
        
        // カードの配置（2列レイアウト）
        const cardsPerRow = 2;
        const cardWidth = 560;
        const cardHeight = 140;
        const padding = 20;
        
        card.x = (index % cardsPerRow) * (cardWidth + padding);
        card.y = Math.floor(index / cardsPerRow) * (cardHeight + padding);

        // カード背景
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, cardWidth, cardHeight, 10);
        bg.fill(fleet.faction === 'Alliance' ? 0x001144 : 0x440011);
        bg.stroke({ width: 2, color: fleet.faction === 'Alliance' ? 0x0066CC : 0xCC0066 });
        card.addChild(bg);

        // 艦隊名
        const nameText = new PIXI.Text(fleet.name, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        nameText.x = 20;
        nameText.y = 15;
        card.addChild(nameText);

        // 陣営表示
        const factionText = new PIXI.Text(fleet.faction === 'Alliance' ? '自由連邦' : '銀河帝国', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: fleet.faction === 'Alliance' ? '#0088FF' : '#FF8800'
        }));
        factionText.x = 450;
        factionText.y = 20;
        card.addChild(factionText);

        // 艦隊種別
        const typeText = new PIXI.Text(fleet.type, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#CCCCCC'
        }));
        typeText.x = 20;
        typeText.y = 45;
        card.addChild(typeText);

        // 艦船数と火力
        const statsText = new PIXI.Text(`艦船数: ${fleet.shipCount}隻`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 13,
            fill: '#FFFFFF'
        }));
        statsText.x = 20;
        statsText.y = 70;
        card.addChild(statsText);

        const firePowerText = new PIXI.Text(`総火力: ${fleet.totalFirepower.toLocaleString()}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 13,
            fill: '#FFAA00'
        }));
        firePowerText.x = 150;
        firePowerText.y = 70;
        card.addChild(firePowerText);

        // 司令官情報
        if (fleet.command && fleet.command.commander && this.admiralsData) {
            const commander = this.admiralsData.admirals.find(a => a.id === fleet.command.commander);
            if (commander) {
                const commanderText = new PIXI.Text(`司令官: ${commander.lastName} ${commander.firstName} (${commander.rank})`, new PIXI.TextStyle({
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fill: '#00CCFF'
                }));
                commanderText.x = 20;
                commanderText.y = 95;
                card.addChild(commanderText);
            }
        }

        // ステータス表示
        const statusColor = fleet.status === 'Active' ? 0x00FF00 : 
                          fleet.status === 'Damaged' ? 0xFFAA00 : 0xFF0000;
        const statusDot = new PIXI.Graphics();
        statusDot.circle(0, 0, 8);
        statusDot.fill(statusColor);
        statusDot.x = 520;
        statusDot.y = 25;
        card.addChild(statusDot);

        const statusText = new PIXI.Text(fleet.status, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 11,
            fill: '#FFFFFF'
        }));
        statusText.x = 480;
        statusText.y = 45;
        card.addChild(statusText);

        // インタラクティブ機能
        card.eventMode = 'static';
        card.cursor = 'pointer';

        card.on('pointerover', () => {
            bg.tint = 0xCCCCCC;
        });

        card.on('pointerout', () => {
            bg.tint = 0xFFFFFF;
        });

        card.on('pointerdown', () => {
            console.log(`艦隊詳細: ${fleet.name}`, fleet);
        });

        return card;
    }

    createNavigationButtons() {
        // 戻るボタン
        const backButton = new PIXI.Container();
        backButton.x = 50;
        backButton.y = 50;

        const backBg = new PIXI.Graphics();
        backBg.roundRect(0, 0, 100, 40, 8);
        backBg.fill(0x666666);
        backBg.stroke({ width: 2, color: 0x888888 });
        backButton.addChild(backBg);

        const backText = new PIXI.Text('◀ 戻る', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        backText.anchor.set(0.5);
        backText.x = 50;
        backText.y = 20;
        backButton.addChild(backText);

        // インタラクティブ機能
        backButton.eventMode = 'static';
        backButton.cursor = 'pointer';

        backButton.on('pointerover', () => {
            backBg.tint = 0xCCCCCC;
        });

        backButton.on('pointerout', () => {
            backBg.tint = 0xFFFFFF;
        });

        backButton.on('pointerdown', () => {
            if (this.onBackCallback) {
                this.onBackCallback();
            }
        });

        this.container.addChild(backButton);
    }

    setOnBackCallback(callback) {
        this.onBackCallback = callback;
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }

    getContainer() {
        return this.container;
    }

    destroy() {
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
            this.container.destroy();
        }
    }
}