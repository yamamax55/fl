import * as PIXI from 'pixi.js';

export class AdmiralListScreen {
    constructor(app, admiralsData) {
        this.app = app;
        this.admiralsData = admiralsData;
        this.container = new PIXI.Container();
        this.selectedAdmiral = null;
        this.onBack = null;
        this.detailPanel = null;
        this.isDetailPanelVisible = false;
        this.filteredAdmirals = this.admiralsData.admirals;
        this.currentFilter = 'all'; // 'all', 'alliance', 'empire'
        this.currentSort = 'name'; // 'name', 'rank', 'age', 'total'
        this.cardContainers = [];
        this.comparisonMode = false;
        this.selectedAdmirals = [];
        this.compareButton = null;
        
        // 表示モード関連
        this.currentViewMode = 'card'; // 'card' | 'list'
        this.viewModeButtons = [];
        
        // スクロール関連
        this.scrollContainer = null;
        this.cardsContainer = null;
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.isScrolling = false;
        
        this.init();
    }

    init() {
        this.createBackground();
        this.createTitle();
        this.createFilterControls();
        this.createScrollContainer();
        this.createAdmiralCards();
        this.createBackButton();
        this.setupEventListeners();
    }

    createBackground() {
        // 宇宙背景
        const background = new PIXI.Graphics();
        background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        background.fill(0x000011);
        this.container.addChild(background);

        // 星空アニメーション
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            const star = new PIXI.Graphics();
            star.circle(0, 0, Math.random() * 2 + 1);
            star.fill(0xFFFFFF);
            star.x = Math.random() * this.app.screen.width;
            star.y = Math.random() * this.app.screen.height;
            star.alpha = Math.random() * 0.8 + 0.2;
            this.stars.push(star);
            this.container.addChild(star);
        }

        // 星の点滅アニメーション
        this.app.ticker.add(() => {
            this.stars.forEach(star => {
                star.alpha += (Math.random() - 0.5) * 0.02;
                star.alpha = Math.max(0.1, Math.min(1, star.alpha));
            });
        });
    }

    createTitle() {
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: 'bold',
            fill: '#FFD700',
            stroke: '#000033',
            strokeThickness: 3,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });

        const title = new PIXI.Text('提督一覧', titleStyle);
        title.anchor.set(0.5, 0);
        title.x = this.app.screen.width / 2;
        title.y = 30;
        this.container.addChild(title);

        const subtitleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: '#CCCCCC',
            align: 'center'
        });

        const subtitle = new PIXI.Text('Admiral Database - 銀河英雄伝説', subtitleStyle);
        subtitle.anchor.set(0.5, 0);
        subtitle.x = this.app.screen.width / 2;
        subtitle.y = 85;
        this.container.addChild(subtitle);
    }

    createFilterControls() {
        const filterContainer = new PIXI.Container();
        filterContainer.x = this.app.screen.width / 2;
        filterContainer.y = 120;

        // フィルターボタン群
        const filterButtons = [
            { text: '全て', filter: 'all', color: 0x444444 },
            { text: '同盟軍', filter: 'alliance', color: 0x0066CC },
            { text: '帝国軍', filter: 'empire', color: 0xCC0066 }
        ];

        const buttonWidth = 100;
        const buttonSpacing = 20;
        const totalWidth = filterButtons.length * buttonWidth + (filterButtons.length - 1) * buttonSpacing;
        const startX = -totalWidth / 2;

        this.filterButtons = [];

        filterButtons.forEach((buttonData, index) => {
            const button = this.createFilterButton(
                buttonData.text,
                buttonData.filter,
                buttonData.color,
                startX + index * (buttonWidth + buttonSpacing),
                -15,
                buttonWidth,
                30
            );
            filterContainer.addChild(button);
            this.filterButtons.push(button);
        });

        // ソートボタン群
        const sortButtons = [
            { text: '名前順', sort: 'name' },
            { text: '階級順', sort: 'rank' },
            { text: '年齢順', sort: 'age' },
            { text: '総合力順', sort: 'total' }
        ];

        const sortY = 25;
        const sortButtonWidth = 80;
        const sortTotalWidth = sortButtons.length * sortButtonWidth + (sortButtons.length - 1) * buttonSpacing;
        const sortStartX = -sortTotalWidth / 2;

        this.sortButtons = [];

        sortButtons.forEach((buttonData, index) => {
            const button = this.createSortButton(
                buttonData.text,
                buttonData.sort,
                sortStartX + index * (sortButtonWidth + buttonSpacing),
                sortY,
                sortButtonWidth,
                25
            );
            filterContainer.addChild(button);
            this.sortButtons.push(button);
        });

        // 表示モード切り替えボタン
        this.createViewModeButtons(filterContainer);

        this.container.addChild(filterContainer);
        this.updateFilterButtons();
        this.updateSortButtons();
        
        // 比較モードボタン
        this.createCompareButton(filterContainer);
    }

    createScrollContainer() {
        // スクロール可能エリアの定義
        const scrollAreaY = 180; // フィルターボタンの下
        const scrollAreaHeight = this.app.screen.height - scrollAreaY - 80; // 下部余白を考慮
        
        // スクロールコンテナ（マスク用）
        this.scrollContainer = new PIXI.Container();
        this.scrollContainer.x = 0;
        this.scrollContainer.y = scrollAreaY;
        
        // マスク領域（表示領域を制限）
        const mask = new PIXI.Graphics();
        mask.rect(0, 0, this.app.screen.width, scrollAreaHeight);
        mask.fill(0xFFFFFF);
        this.scrollContainer.mask = mask;
        this.scrollContainer.addChild(mask);
        
        // カードコンテナ（実際のカードが入る）
        this.cardsContainer = new PIXI.Container();
        this.scrollContainer.addChild(this.cardsContainer);
        
        this.container.addChild(this.scrollContainer);
    }

    createFilterButton(text, filter, color, x, y, width, height) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        container.filter = filter;

        const background = new PIXI.Graphics();
        background.roundRect(0, 0, width, height, 5);
        background.fill(color);
        background.stroke({ width: 2, color: 0x666666 });
        container.addChild(background);
        container.background = background;

        const buttonText = new PIXI.Text(text, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }));
        buttonText.anchor.set(0.5);
        buttonText.x = width / 2;
        buttonText.y = height / 2;
        container.addChild(buttonText);

        container.eventMode = 'static';
        container.cursor = 'pointer';

        container.on('pointerover', () => {
            if (this.currentFilter !== filter) {
                background.tint = 0xDDDDDD;
            }
        });

        container.on('pointerout', () => {
            if (this.currentFilter !== filter) {
                background.tint = 0xFFFFFF;
            }
        });

        container.on('pointerdown', () => {
            this.setFilter(filter);
        });

        return container;
    }

    createSortButton(text, sort, x, y, width, height) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        container.sort = sort;

        const background = new PIXI.Graphics();
        background.roundRect(0, 0, width, height, 5);
        background.fill(0x333333);
        background.stroke({ width: 1, color: 0x666666 });
        container.addChild(background);
        container.background = background;

        const buttonText = new PIXI.Text(text, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#CCCCCC'
        }));
        buttonText.anchor.set(0.5);
        buttonText.x = width / 2;
        buttonText.y = height / 2;
        container.addChild(buttonText);
        container.buttonText = buttonText;

        container.eventMode = 'static';
        container.cursor = 'pointer';

        container.on('pointerover', () => {
            if (this.currentSort !== sort) {
                background.tint = 0xDDDDDD;
            }
        });

        container.on('pointerout', () => {
            if (this.currentSort !== sort) {
                background.tint = 0xFFFFFF;
            }
        });

        container.on('pointerdown', () => {
            this.setSort(sort);
        });

        return container;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.applyFiltersAndSort();
        this.updateFilterButtons();
    }

    setSort(sort) {
        this.currentSort = sort;
        this.applyFiltersAndSort();
        this.updateSortButtons();
    }

    updateFilterButtons() {
        this.filterButtons.forEach(button => {
            const isActive = button.filter === this.currentFilter;
            if (isActive) {
                button.background.tint = 0xFFFFFF;
                button.background.stroke({ width: 3, color: 0xFFD700 });
            } else {
                button.background.tint = 0xFFFFFF;
                button.background.stroke({ width: 2, color: 0x666666 });
            }
        });
    }

    updateSortButtons() {
        this.sortButtons.forEach(button => {
            const isActive = button.sort === this.currentSort;
            if (isActive) {
                button.background.fill(0x666666);
                button.buttonText.style.fill = '#FFFFFF';
                button.background.stroke({ width: 2, color: 0xFFD700 });
            } else {
                button.background.fill(0x333333);
                button.buttonText.style.fill = '#CCCCCC';
                button.background.stroke({ width: 1, color: 0x666666 });
            }
        });
    }

    applyFiltersAndSort() {
        // フィルター適用
        let filtered = this.admiralsData.admirals;
        
        if (this.currentFilter === 'alliance') {
            filtered = filtered.filter(admiral => admiral.faction === 'Alliance');
        } else if (this.currentFilter === 'empire') {
            filtered = filtered.filter(admiral => admiral.faction === 'Empire');
        }

        // ソート適用
        filtered = [...filtered].sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.lastName.localeCompare(b.lastName);
                case 'rank':
                    const rankOrder = { '元帥': 1, '大将': 2, '中将': 3, '少将': 4, '准将': 5, '大佐': 6, '中佐': 7, '少佐': 8, '大尉': 9, '中尉': 10 };
                    return (rankOrder[a.rank] || 99) - (rankOrder[b.rank] || 99);
                case 'age':
                    return a.age - b.age;
                case 'total':
                    const totalA = Object.values(a.abilities).reduce((sum, val) => sum + val, 0);
                    const totalB = Object.values(b.abilities).reduce((sum, val) => sum + val, 0);
                    return totalB - totalA; // 降順
                default:
                    return 0;
            }
        });

        this.filteredAdmirals = filtered;
        this.refreshAdmiralCards();
    }

    refreshAdmiralCards() {
        this.refreshDisplay();
    }

    createAdmiralCards() {
        const admirals = this.filteredAdmirals;
        const cardsPerRow = 4;
        const cardWidth = 280;
        const cardHeight = 180;
        const spacing = 20;
        
        const startX = (this.app.screen.width - (cardsPerRow * cardWidth + (cardsPerRow - 1) * spacing)) / 2;
        const startY = 20; // スクロールコンテナ内での開始位置

        admirals.forEach((admiral, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            
            const cardX = startX + col * (cardWidth + spacing);
            const cardY = startY + row * (cardHeight + spacing);
            
            const cardContainer = this.createAdmiralCard(admiral, cardX, cardY, cardWidth, cardHeight);
            this.cardContainers.push(cardContainer);
            
            // カードのフェードインアニメーション
            this.animateCardIn(cardContainer, index * 50); // アニメーション間隔を短縮
        });

        // 最大スクロール量を計算
        const totalRows = Math.ceil(admirals.length / cardsPerRow);
        const totalHeight = startY + totalRows * (cardHeight + spacing);
        const visibleHeight = this.app.screen.height - 180 - 80; // スクロール可能エリアの高さ
        this.maxScrollY = Math.max(0, totalHeight - visibleHeight);

        // スクロールバーを更新
        this.updateScrollIndicator();
    }

    createAdmiralList() {
        const admirals = this.filteredAdmirals;
        const listItemHeight = 60;
        const startX = 50;
        const startY = 20;
        const listWidth = this.app.screen.width - 100;

        admirals.forEach((admiral, index) => {
            const itemY = startY + index * listItemHeight;
            const listItem = this.createAdmiralListItem(admiral, startX, itemY, listWidth, listItemHeight - 5);
            this.cardContainers.push(listItem);
            
            // リストアイテムのフェードインアニメーション
            this.animateCardIn(listItem, index * 30);
        });

        // 最大スクロール量を計算
        const totalHeight = startY + admirals.length * listItemHeight;
        const visibleHeight = this.app.screen.height - 180 - 80;
        this.maxScrollY = Math.max(0, totalHeight - visibleHeight);

        // スクロールバーを更新
        this.updateScrollIndicator();
    }

    createAdmiralListItem(admiral, x, y, width, height) {
        const itemContainer = new PIXI.Container();
        itemContainer.x = x;
        itemContainer.y = y;
        
        // アニメーション用の初期設定
        itemContainer.alpha = 0;
        itemContainer.scale.set(0.9);

        // リストアイテム背景
        const itemBg = new PIXI.Graphics();
        const factionColor = admiral.faction === 'Alliance' ? 0x001133 : 0x330011;
        itemBg.roundRect(0, 0, width, height, 8);
        itemBg.fill(factionColor);
        
        // 比較モードでの選択状態チェック
        const isSelected = this.comparisonMode && this.selectedAdmirals.some(a => a.id === admiral.id);
        const strokeColor = isSelected ? 0xFFD700 : 0x444444;
        const strokeWidth = isSelected ? 3 : 1;
        
        itemBg.stroke({ width: strokeWidth, color: strokeColor });
        itemContainer.addChild(itemBg);

        // 陣営アイコン
        const factionIcon = new PIXI.Graphics();
        factionIcon.circle(30, height / 2, 15);
        factionIcon.fill(admiral.faction === 'Alliance' ? 0x0066CC : 0xCC0066);
        itemContainer.addChild(factionIcon);

        const factionText = new PIXI.Text(
            admiral.faction === 'Alliance' ? '同' : '帝',
            new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            })
        );
        factionText.anchor.set(0.5);
        factionText.x = 30;
        factionText.y = height / 2;
        itemContainer.addChild(factionText);

        // 提督名
        const nameText = new PIXI.Text(`${admiral.lastName} ${admiral.firstName}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        }));
        nameText.x = 70;
        nameText.y = 8;
        itemContainer.addChild(nameText);

        // 階級・年齢
        const infoText = new PIXI.Text(`${admiral.rank} (${admiral.age}歳)`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#CCCCCC'
        }));
        infoText.x = 70;
        infoText.y = 32;
        itemContainer.addChild(infoText);

        // 能力値要約（上位3つ）
        const abilities = Object.entries(admiral.abilities)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        const abilityNames = {
            mobility: '機動',
            attack: '攻撃',
            defense: '防御',
            command: '指揮',
            tactics: '戦術',
            leadership: '統率',
            intelligence: '知性',
            logistics: '兵站',
            diplomacy: '外交',
            morale: '士気',
            experience: '経験'
        };

        let abilityText = abilities.map(([key, value]) => 
            `${abilityNames[key]}:${value}`
        ).join('  ');

        const abilitySummary = new PIXI.Text(abilityText, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#CCCCCC'
        }));
        abilitySummary.x = 350;
        abilitySummary.y = 15;
        itemContainer.addChild(abilitySummary);

        // 総合スコア
        const totalScore = Object.values(admiral.abilities).reduce((sum, val) => sum + val, 0);
        const scoreText = new PIXI.Text(`総合: ${totalScore}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: 'bold',
            fill: totalScore >= 1100 ? '#FFD700' : totalScore >= 1000 ? '#00FF00' : '#FFFFFF'
        }));
        scoreText.x = 600;
        scoreText.y = 15;
        itemContainer.addChild(scoreText);

        // ランク表示
        const avgScore = Math.round(totalScore / 11);
        let rank = '';
        let rankColor = '#CCCCCC';
        if (avgScore >= 110) { rank = 'S'; rankColor = '#FFD700'; }
        else if (avgScore >= 100) { rank = 'A'; rankColor = '#00FF00'; }
        else if (avgScore >= 90) { rank = 'B'; rankColor = '#00AAFF'; }
        else if (avgScore >= 80) { rank = 'C'; rankColor = '#FFAA00'; }
        else { rank = 'D'; rankColor = '#FF4444'; }

        const rankText = new PIXI.Text(`${rank}級`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: rankColor
        }));
        rankText.x = 720;
        rankText.y = 12;
        itemContainer.addChild(rankText);

        // インタラクション
        itemContainer.eventMode = 'static';
        itemContainer.cursor = 'pointer';
        
        itemContainer.on('pointerover', () => {
            itemBg.tint = 0xDDDDDD;
            itemContainer.scale.set(itemContainer.scale.x * 1.02);
        });
        
        itemContainer.on('pointerout', () => {
            itemBg.tint = 0xFFFFFF;
            itemContainer.scale.set(itemContainer.scale.x / 1.02);
        });
        
        itemContainer.on('pointerdown', () => {
            this.selectAdmiral(admiral);
        });

        this.cardsContainer.addChild(itemContainer);
        return itemContainer;
    }

    createAdmiralCard(admiral, x, y, width, height) {
        const cardContainer = new PIXI.Container();
        cardContainer.x = x;
        cardContainer.y = y;
        
        // アニメーション用の初期設定
        cardContainer.alpha = 0;
        cardContainer.scale.set(0.8);

        // カード背景
        const cardBg = new PIXI.Graphics();
        const factionColor = admiral.faction === 'Alliance' ? 0x003366 : 0x660033;
        cardBg.roundRect(0, 0, width, height, 10);
        cardBg.fill(factionColor);
        
        // 比較モードでの選択状態チェック
        const isSelected = this.comparisonMode && this.selectedAdmirals.some(a => a.id === admiral.id);
        const strokeColor = isSelected ? 0xFFD700 : 0x444444;
        const strokeWidth = isSelected ? 4 : 2;
        
        cardBg.stroke({ width: strokeWidth, color: strokeColor });
        cardContainer.addChild(cardBg);
        
        // 選択時のグロー効果
        if (isSelected) {
            this.createGlowEffect(cardContainer, 0xFFD700, 0.8);
        }

        // 陣営バッジ
        const factionBadge = new PIXI.Graphics();
        factionBadge.roundRect(width - 60, 5, 55, 25, 5);
        factionBadge.fill(admiral.faction === 'Alliance' ? 0x0066CC : 0xCC0066);
        cardContainer.addChild(factionBadge);

        const factionText = new PIXI.Text(
            admiral.faction === 'Alliance' ? '同盟' : '帝国',
            new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            })
        );
        factionText.anchor.set(0.5);
        factionText.x = width - 32;
        factionText.y = 17;
        cardContainer.addChild(factionText);

        // 提督名
        const nameStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        });
        const name = new PIXI.Text(`${admiral.lastName} ${admiral.firstName}`, nameStyle);
        name.x = 10;
        name.y = 10;
        cardContainer.addChild(name);

        // 階級・年齢
        const infoStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 14,
            fill: '#CCCCCC'
        });
        const info = new PIXI.Text(`${admiral.rank} (${admiral.age}歳)`, infoStyle);
        info.x = 10;
        info.y = 35;
        cardContainer.addChild(info);

        // 能力値バー（上位3つ）
        const abilities = Object.entries(admiral.abilities)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        const abilityNames = {
            mobility: '機動',
            attack: '攻撃',
            defense: '防御',
            command: '指揮',
            tactics: '戦術',
            leadership: '統率',
            intelligence: '知性',
            logistics: '兵站',
            diplomacy: '外交',
            morale: '士気',
            experience: '経験'
        };

        abilities.forEach(([key, value], index) => {
            const barY = 65 + index * 25;
            
            // 能力名
            const abilityLabel = new PIXI.Text(abilityNames[key], new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: '#FFFFFF'
            }));
            abilityLabel.x = 10;
            abilityLabel.y = barY;
            cardContainer.addChild(abilityLabel);

            // 能力値バー背景
            const barBg = new PIXI.Graphics();
            barBg.roundRect(60, barY + 2, 150, 12, 3);
            barBg.fill(0x333333);
            cardContainer.addChild(barBg);

            // 能力値バー
            const barFill = new PIXI.Graphics();
            const barWidth = (value / 120) * 150;
            barFill.roundRect(60, barY + 2, barWidth, 12, 3);
            const barColor = value >= 100 ? 0x00CC00 : value >= 80 ? 0xCCCC00 : 0xCC6600;
            barFill.fill(barColor);
            cardContainer.addChild(barFill);

            // 能力値テキスト
            const valueText = new PIXI.Text(value.toString(), new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 11,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }));
            valueText.x = 220;
            valueText.y = barY;
            cardContainer.addChild(valueText);
        });

        // インタラクション
        cardContainer.eventMode = 'static';
        cardContainer.cursor = 'pointer';
        
        cardContainer.on('pointerover', () => {
            cardBg.tint = 0xDDDDDD;
            this.animateCardHover(cardContainer, true);
            this.apply3DEffect(cardContainer, true);
        });
        
        cardContainer.on('pointerout', () => {
            cardBg.tint = 0xFFFFFF;
            this.animateCardHover(cardContainer, false);
            this.apply3DEffect(cardContainer, false);
        });
        
        cardContainer.on('pointermove', (event) => {
            if (cardContainer.scale.x > 1.0) { // ホバー中のみ
                this.update3DTilt(cardContainer, event);
            }
        });
        
        cardContainer.on('pointerdown', () => {
            this.selectAdmiral(admiral);
        });

        this.cardsContainer.addChild(cardContainer);
        return cardContainer;
    }

    animateCardIn(cardContainer, delay = 0) {
        setTimeout(() => {
            const duration = 500; // ミリ秒
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // イージング関数（easeOutCubic）
                const eased = 1 - Math.pow(1 - progress, 3);
                
                cardContainer.alpha = eased;
                cardContainer.scale.set(0.8 + (0.2 * eased));
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        }, delay);
    }

    animateCardHover(cardContainer, isHover) {
        const targetScale = isHover ? 1.05 : 1.0;
        const duration = 200;
        const startTime = Date.now();
        const startScale = cardContainer.scale.x;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 2);
            
            const currentScale = startScale + (targetScale - startScale) * eased;
            cardContainer.scale.set(currentScale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    animateDetailPanelIn() {
        if (!this.detailPanel) return;
        
        this.detailPanel.alpha = 0;
        this.detailPanel.scale.set(0.9);
        
        const duration = 300;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 2);
            
            this.detailPanel.alpha = eased;
            this.detailPanel.scale.set(0.9 + (0.1 * eased));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    apply3DEffect(cardContainer, isHover) {
        if (isHover) {
            // ホバー時の3D効果（DropShadowFilterの代わりにコンテナの影を作成）
            this.createCardShadow(cardContainer);
        } else {
            // 通常状態に戻す
            this.removeCardShadow(cardContainer);
            cardContainer.skew.set(0, 0);
            cardContainer.rotation = 0;
        }
    }

    createCardShadow(cardContainer) {
        // 既存の影を削除
        this.removeCardShadow(cardContainer);
        
        // 影の作成（フィルターを使わずにシンプルな影）
        const shadow = new PIXI.Graphics();
        shadow.roundRect(3, 3, 285, 185, 10); // 少し右下にずらして影効果
        shadow.fill({ color: 0x000000, alpha: 0.2 });
        
        // 影をカードの背後に追加
        cardContainer.addChildAt(shadow, 0);
        cardContainer._shadow = shadow;
    }

    removeCardShadow(cardContainer) {
        if (cardContainer._shadow) {
            cardContainer.removeChild(cardContainer._shadow);
            cardContainer._shadow.destroy();
            cardContainer._shadow = null;
        }
    }

    update3DTilt(cardContainer, event) {
        const bounds = cardContainer.getBounds();
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        
        // マウス位置を取得
        const mouseX = event.globalX;
        const mouseY = event.globalY;
        
        // カードの中心からの相対位置を計算
        const deltaX = (mouseX - centerX) / (bounds.width / 2);
        const deltaY = (mouseY - centerY) / (bounds.height / 2);
        
        // 傾き角度を計算（最大10度）
        const maxTilt = 0.1; // ラジアン
        const tiltX = deltaY * maxTilt;
        const tiltY = -deltaX * maxTilt;
        
        // 3D風の傾き効果を適用
        cardContainer.skew.set(tiltY * 0.3, tiltX * 0.3);
        cardContainer.rotation = tiltX * 0.1;
    }

    createGlowEffect(container, color = 0xFFD700, intensity = 0.5) {
        const glow = new PIXI.Graphics();
        glow.rect(-5, -5, 290, 190);
        glow.fill({ color: color, alpha: 0 });
        glow.stroke({ width: 3, color: color, alpha: intensity });
        container.addChildAt(glow, 0);
        return glow;
    }

    updateScrollIndicator() {
        // 既存のスクロールバーを削除
        if (this.scrollBar) {
            this.container.removeChild(this.scrollBar);
            this.scrollBar.destroy();
        }

        // スクロールが必要な場合のみスクロールバーを表示
        if (this.maxScrollY > 0) {
            this.createScrollBar();
        }
    }

    createScrollBar() {
        const scrollBarWidth = 8;
        const scrollBarX = this.app.screen.width - 20;
        const scrollAreaY = 180;
        const scrollAreaHeight = this.app.screen.height - scrollAreaY - 80;

        this.scrollBar = new PIXI.Container();
        this.scrollBar.x = scrollBarX;
        this.scrollBar.y = scrollAreaY;

        // スクロールバー背景
        const scrollBg = new PIXI.Graphics();
        scrollBg.rect(0, 0, scrollBarWidth, scrollAreaHeight);
        scrollBg.fill(0x333333);
        scrollBg.alpha = 0.5;
        this.scrollBar.addChild(scrollBg);

        // スクロールハンドル
        const handleHeight = Math.max(20, (scrollAreaHeight * scrollAreaHeight) / (scrollAreaHeight + this.maxScrollY));
        const handleY = (this.scrollY / this.maxScrollY) * (scrollAreaHeight - handleHeight);

        this.scrollHandle = new PIXI.Graphics();
        this.scrollHandle.rect(0, handleY, scrollBarWidth, handleHeight);
        this.scrollHandle.fill(0x666666);
        this.scrollBar.addChild(this.scrollHandle);

        this.container.addChild(this.scrollBar);
    }

    updateScrollPosition() {
        if (this.cardsContainer) {
            this.cardsContainer.y = -this.scrollY;
        }

        // スクロールハンドルの位置を更新
        if (this.scrollHandle && this.maxScrollY > 0) {
            const scrollAreaHeight = this.app.screen.height - 180 - 80;
            const handleHeight = Math.max(20, (scrollAreaHeight * scrollAreaHeight) / (scrollAreaHeight + this.maxScrollY));
            const handleY = (this.scrollY / this.maxScrollY) * (scrollAreaHeight - handleHeight);
            
            this.scrollHandle.clear();
            this.scrollHandle.rect(0, handleY, 8, handleHeight);
            this.scrollHandle.fill(0x666666);
        }
    }

    scroll(deltaY) {
        if (this.maxScrollY <= 0) return;

        this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY + deltaY));
        this.updateScrollPosition();
    }

    createViewModeButtons(filterContainer) {
        const viewModeContainer = new PIXI.Container();
        viewModeContainer.x = 320; // 比較ボタンの右側に配置
        viewModeContainer.y = 25;

        const viewModeButtons = [
            { text: 'カード', mode: 'card', icon: '⊞' },
            { text: 'リスト', mode: 'list', icon: '☰' }
        ];

        const buttonWidth = 80;
        const buttonSpacing = 10;

        viewModeButtons.forEach((buttonData, index) => {
            const button = this.createViewModeButton(
                buttonData.text,
                buttonData.mode,
                buttonData.icon,
                index * (buttonWidth + buttonSpacing),
                0,
                buttonWidth,
                25
            );
            viewModeContainer.addChild(button);
            this.viewModeButtons.push(button);
        });

        filterContainer.addChild(viewModeContainer);
        this.updateViewModeButtons();
    }

    createViewModeButton(text, mode, icon, x, y, width, height) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        container.mode = mode;

        const background = new PIXI.Graphics();
        background.roundRect(0, 0, width, height, 5);
        background.fill(0x333333);
        background.stroke({ width: 1, color: 0x666666 });
        container.addChild(background);
        container.background = background;

        const buttonText = new PIXI.Text(`${icon} ${text}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#CCCCCC',
            fontWeight: 'bold'
        }));
        buttonText.anchor.set(0.5);
        buttonText.x = width / 2;
        buttonText.y = height / 2;
        container.addChild(buttonText);
        container.buttonText = buttonText;

        container.eventMode = 'static';
        container.cursor = 'pointer';

        container.on('pointerover', () => {
            if (this.currentViewMode !== mode) {
                background.tint = 0xDDDDDD;
            }
        });

        container.on('pointerout', () => {
            if (this.currentViewMode !== mode) {
                background.tint = 0xFFFFFF;
            }
        });

        container.on('pointerdown', () => {
            this.setViewMode(mode);
        });

        return container;
    }

    setViewMode(mode) {
        if (this.currentViewMode === mode) return;
        
        this.currentViewMode = mode;
        this.updateViewModeButtons();
        this.refreshDisplay();
    }

    updateViewModeButtons() {
        this.viewModeButtons.forEach(button => {
            const isActive = button.mode === this.currentViewMode;
            if (isActive) {
                button.background.clear();
                button.background.roundRect(0, 0, 80, 25, 5);
                button.background.fill(0x0066CC);
                button.background.stroke({ width: 2, color: 0x00AAFF });
                button.buttonText.style.fill = '#FFFFFF';
            } else {
                button.background.clear();
                button.background.roundRect(0, 0, 80, 25, 5);
                button.background.fill(0x333333);
                button.background.stroke({ width: 1, color: 0x666666 });
                button.buttonText.style.fill = '#CCCCCC';
            }
        });
    }

    refreshDisplay() {
        // 既存の表示をクリア
        this.cardContainers.forEach(card => {
            this.cardsContainer.removeChild(card);
            card.destroy();
        });
        this.cardContainers = [];

        // スクロール位置をリセット
        this.scrollY = 0;
        this.cardsContainer.y = 0;

        // 表示モードに応じて再描画
        if (this.currentViewMode === 'card') {
            this.createAdmiralCards();
        } else {
            this.createAdmiralList();
        }
    }

    createCompareButton(filterContainer) {
        const compareContainer = new PIXI.Container();
        compareContainer.x = 200;
        compareContainer.y = 25;

        const button = new PIXI.Graphics();
        button.roundRect(0, 0, 100, 25, 5);
        button.fill(0x444444);
        button.stroke({ width: 2, color: 0x666666 });
        compareContainer.addChild(button);

        const buttonText = new PIXI.Text('比較モード', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }));
        buttonText.anchor.set(0.5);
        buttonText.x = 50;
        buttonText.y = 12.5;
        compareContainer.addChild(buttonText);

        compareContainer.eventMode = 'static';
        compareContainer.cursor = 'pointer';

        compareContainer.on('pointerover', () => {
            button.tint = 0xDDDDDD;
        });

        compareContainer.on('pointerout', () => {
            button.tint = 0xFFFFFF;
        });

        compareContainer.on('pointerdown', () => {
            this.toggleComparisonMode();
        });

        filterContainer.addChild(compareContainer);
        this.compareButton = { container: compareContainer, bg: button, text: buttonText };
        this.updateCompareButton();
    }

    toggleComparisonMode() {
        this.comparisonMode = !this.comparisonMode;
        this.selectedAdmirals = [];
        this.updateCompareButton();
        this.refreshAdmiralCards();
    }

    updateCompareButton() {
        if (!this.compareButton) return;
        
        const { bg, text } = this.compareButton;
        
        if (this.comparisonMode) {
            bg.clear();
            bg.roundRect(0, 0, 100, 25, 5);
            bg.fill(0x006600);
            bg.stroke({ width: 2, color: 0x00AA00 });
            text.text = `比較(${this.selectedAdmirals.length})`;
            text.style.fill = '#FFFFFF';
        } else {
            bg.clear();
            bg.roundRect(0, 0, 100, 25, 5);
            bg.fill(0x444444);
            bg.stroke({ width: 2, color: 0x666666 });
            text.text = '比較モード';
            text.style.fill = '#FFFFFF';
        }
    }

    selectAdmiralForComparison(admiral) {
        if (!this.comparisonMode) return;
        
        const index = this.selectedAdmirals.findIndex(a => a.id === admiral.id);
        
        if (index >= 0) {
            // 選択解除
            this.selectedAdmirals.splice(index, 1);
        } else if (this.selectedAdmirals.length < 3) {
            // 選択追加（最大3人まで）
            this.selectedAdmirals.push(admiral);
        }
        
        this.updateCompareButton();
        this.refreshAdmiralCards();
        
        // 2人以上選択されたら比較パネルを表示
        if (this.selectedAdmirals.length >= 2) {
            this.showComparisonPanel();
        }
    }

    showComparisonPanel() {
        if (this.detailPanel) {
            this.container.removeChild(this.detailPanel);
            this.detailPanel.destroy();
        }

        this.createComparisonPanel();
        this.isDetailPanelVisible = true;
        this.animateDetailPanelIn();
    }

    createComparisonPanel() {
        this.detailPanel = new PIXI.Container();
        
        // 半透明背景オーバーレイ
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.fill(0x000000);
        overlay.alpha = 0.7;
        overlay.eventMode = 'static';
        overlay.on('pointerdown', () => {
            this.hideDetailPanel();
        });
        this.detailPanel.addChild(overlay);

        // 比較パネル背景
        const panelWidth = 1000;
        const panelHeight = 600;
        const panelX = (this.app.screen.width - panelWidth) / 2;
        const panelY = (this.app.screen.height - panelHeight) / 2;

        const panel = new PIXI.Graphics();
        panel.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
        panel.fill(0x001122);
        panel.stroke({ width: 3, color: 0x0088FF });
        this.detailPanel.addChild(panel);

        // 閉じるボタン
        const closeButton = new PIXI.Graphics();
        closeButton.circle(panelX + panelWidth - 30, panelY + 30, 20);
        closeButton.fill(0xFF4444);
        closeButton.stroke({ width: 2, color: 0xFFFFFF });
        closeButton.eventMode = 'static';
        closeButton.cursor = 'pointer';
        closeButton.on('pointerdown', () => {
            this.hideDetailPanel();
        });
        this.detailPanel.addChild(closeButton);

        const closeX = new PIXI.Text('×', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }));
        closeX.anchor.set(0.5);
        closeX.x = panelX + panelWidth - 30;
        closeX.y = panelY + 30;
        this.detailPanel.addChild(closeX);

        // タイトル
        const title = new PIXI.Text('提督能力値比較', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFD700'
        }));
        title.x = panelX + 30;
        title.y = panelY + 30;
        this.detailPanel.addChild(title);

        // 比較コンテンツ
        this.createComparisonContent(panelX + 30, panelY + 90, panelWidth - 60);

        this.container.addChild(this.detailPanel);
    }

    createComparisonContent(startX, startY, width) {
        const admirals = this.selectedAdmirals;
        const columnWidth = width / admirals.length;

        // 提督名表示
        admirals.forEach((admiral, index) => {
            const x = startX + index * columnWidth;
            
            const nameText = new PIXI.Text(`${admiral.lastName} ${admiral.firstName}`, new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 20,
                fontWeight: 'bold',
                fill: admiral.faction === 'Alliance' ? '#0088FF' : '#FF8800'
            }));
            nameText.x = x;
            nameText.y = startY;
            this.detailPanel.addChild(nameText);

            const infoText = new PIXI.Text(`${admiral.rank} (${admiral.age}歳)`, new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#CCCCCC'
            }));
            infoText.x = x;
            infoText.y = startY + 25;
            this.detailPanel.addChild(infoText);
        });

        // 能力値比較
        const abilityNames = {
            mobility: '機動力',
            attack: '攻撃力',
            defense: '防御力',
            command: '指揮能力',
            tactics: '戦術能力',
            leadership: '統率力',
            intelligence: '知性',
            logistics: '兵站能力',
            diplomacy: '外交能力',
            morale: '士気',
            experience: '経験値'
        };

        Object.entries(abilityNames).forEach(([key, name], rowIndex) => {
            const y = startY + 70 + rowIndex * 35;
            
            // 能力名
            const abilityLabel = new PIXI.Text(name, new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }));
            abilityLabel.x = startX;
            abilityLabel.y = y;
            this.detailPanel.addChild(abilityLabel);

            // 各提督の能力値
            const values = admirals.map(admiral => admiral.abilities[key]);
            const maxValue = Math.max(...values);

            admirals.forEach((admiral, index) => {
                const x = startX + index * columnWidth;
                const value = admiral.abilities[key];
                const isMax = value === maxValue && values.filter(v => v === maxValue).length === 1;

                // バー背景
                const barBg = new PIXI.Graphics();
                barBg.roundRect(x + 80, y + 2, columnWidth - 120, 12, 3);
                barBg.fill(0x333333);
                this.detailPanel.addChild(barBg);

                // バー
                const barFill = new PIXI.Graphics();
                const fillWidth = (value / 120) * (columnWidth - 120);
                barFill.roundRect(x + 80, y + 2, fillWidth, 12, 3);
                
                let barColor = 0x666666;
                if (isMax) {
                    barColor = 0x00FF00; // 最高値は緑
                } else if (value >= 100) {
                    barColor = 0x88FF00;
                } else if (value >= 90) {
                    barColor = 0xFFFF00;
                } else if (value >= 80) {
                    barColor = 0xFF8800;
                } else {
                    barColor = 0xFF4400;
                }
                
                barFill.fill(barColor);
                this.detailPanel.addChild(barFill);

                // 数値
                const valueText = new PIXI.Text(value.toString(), new PIXI.TextStyle({
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fill: isMax ? '#00FF00' : '#FFFFFF',
                    fontWeight: isMax ? 'bold' : 'normal'
                }));
                valueText.x = x + 80 + (columnWidth - 120) + 15;
                valueText.y = y;
                this.detailPanel.addChild(valueText);
            });
        });

        // 総合評価比較
        const totals = admirals.map(admiral => 
            Object.values(admiral.abilities).reduce((sum, val) => sum + val, 0)
        );
        const maxTotal = Math.max(...totals);

        const totalY = startY + 450;
        const totalTitle = new PIXI.Text('総合評価', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#FFD700'
        }));
        totalTitle.x = startX;
        totalTitle.y = totalY;
        this.detailPanel.addChild(totalTitle);

        admirals.forEach((admiral, index) => {
            const x = startX + index * columnWidth;
            const total = totals[index];
            const isMax = total === maxTotal;

            const totalText = new PIXI.Text(`${total}`, new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 24,
                fontWeight: 'bold',
                fill: isMax ? '#FFD700' : '#FFFFFF'
            }));
            totalText.x = x + 80;
            totalText.y = totalY + 25;
            this.detailPanel.addChild(totalText);
        });
    }

    createBackButton() {
        const buttonContainer = new PIXI.Container();
        buttonContainer.x = 50;
        buttonContainer.y = this.app.screen.height - 70;

        const buttonBg = new PIXI.Graphics();
        buttonBg.roundRect(0, 0, 120, 40, 8);
        buttonBg.fill(0x444444);
        buttonBg.stroke({ width: 2, color: 0x666666 });
        buttonContainer.addChild(buttonBg);

        const buttonText = new PIXI.Text('戻る', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }));
        buttonText.anchor.set(0.5);
        buttonText.x = 60;
        buttonText.y = 20;
        buttonContainer.addChild(buttonText);

        buttonContainer.eventMode = 'static';
        buttonContainer.cursor = 'pointer';
        
        buttonContainer.on('pointerover', () => {
            buttonBg.tint = 0xBBBBBB;
        });
        
        buttonContainer.on('pointerout', () => {
            buttonBg.tint = 0xFFFFFF;
        });
        
        buttonContainer.on('pointerdown', () => {
            if (this.onBack) this.onBack();
        });

        this.container.addChild(buttonContainer);
    }

    selectAdmiral(admiral) {
        if (this.comparisonMode) {
            this.selectAdmiralForComparison(admiral);
        } else {
            this.selectedAdmiral = admiral;
            console.log('選択された提督:', admiral.lastName, admiral.firstName);
            this.showDetailPanel(admiral);
        }
    }

    showDetailPanel(admiral) {
        // 既存の詳細パネルを削除
        if (this.detailPanel) {
            this.container.removeChild(this.detailPanel);
            this.detailPanel.destroy();
        }

        this.createDetailPanel(admiral);
        this.isDetailPanelVisible = true;
        
        // 詳細パネルのフェードインアニメーション
        this.animateDetailPanelIn();
    }

    hideDetailPanel() {
        if (this.detailPanel) {
            this.container.removeChild(this.detailPanel);
            this.detailPanel.destroy();
            this.detailPanel = null;
        }
        this.isDetailPanelVisible = false;
    }

    createDetailPanel(admiral) {
        this.detailPanel = new PIXI.Container();
        
        // 半透明背景オーバーレイ
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.fill(0x000000);
        overlay.alpha = 0.7;
        overlay.eventMode = 'static';
        overlay.on('pointerdown', () => {
            this.hideDetailPanel();
        });
        this.detailPanel.addChild(overlay);

        // 詳細パネル背景
        const panelWidth = 800;
        const panelHeight = 600;
        const panelX = (this.app.screen.width - panelWidth) / 2;
        const panelY = (this.app.screen.height - panelHeight) / 2;

        const panel = new PIXI.Graphics();
        panel.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
        const factionColor = admiral.faction === 'Alliance' ? 0x001155 : 0x550011;
        panel.fill(factionColor);
        panel.stroke({ width: 3, color: admiral.faction === 'Alliance' ? 0x0088FF : 0xFF8800 });
        this.detailPanel.addChild(panel);

        // 閉じるボタン
        const closeButton = new PIXI.Graphics();
        closeButton.circle(panelX + panelWidth - 30, panelY + 30, 20);
        closeButton.fill(0xFF4444);
        closeButton.stroke({ width: 2, color: 0xFFFFFF });
        closeButton.eventMode = 'static';
        closeButton.cursor = 'pointer';
        closeButton.on('pointerdown', () => {
            this.hideDetailPanel();
        });
        this.detailPanel.addChild(closeButton);

        const closeX = new PIXI.Text('×', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }));
        closeX.anchor.set(0.5);
        closeX.x = panelX + panelWidth - 30;
        closeX.y = panelY + 30;
        this.detailPanel.addChild(closeX);

        // 提督名（大きく表示）
        const nameStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            stroke: { color: '#000000', width: 2 }
        });
        const nameText = new PIXI.Text(`${admiral.lastName} ${admiral.firstName}`, nameStyle);
        nameText.x = panelX + 30;
        nameText.y = panelY + 30;
        this.detailPanel.addChild(nameText);

        // 階級・年齢・陣営
        const infoStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#CCCCCC'
        });
        const factionName = admiral.faction === 'Alliance' ? '自由惑星同盟' : '銀河帝国';
        const infoText = new PIXI.Text(`${admiral.rank} | ${admiral.age}歳 | ${factionName}`, infoStyle);
        infoText.x = panelX + 30;
        infoText.y = panelY + 80;
        this.detailPanel.addChild(infoText);

        // 能力値詳細表示
        this.createDetailedAbilities(admiral, panelX + 30, panelY + 130, panelWidth - 60);

        // パネルをコンテナに追加
        this.container.addChild(this.detailPanel);
    }

    createDetailedAbilities(admiral, startX, startY, width) {
        const abilityNames = {
            mobility: '機動力',
            attack: '攻撃力',
            defense: '防御力',
            command: '指揮能力',
            tactics: '戦術能力',
            leadership: '統率力',
            intelligence: '知性',
            logistics: '兵站能力',
            diplomacy: '外交能力',
            morale: '士気',
            experience: '経験値'
        };

        const abilityDescriptions = {
            mobility: '艦隊の機動性と移動速度に影響',
            attack: '艦隊の攻撃力と火力に影響',
            defense: '艦隊の防御力と耐久性に影響',
            command: '艦隊の指揮統制能力に影響',
            tactics: '戦術判断力と戦闘効率に影響',
            leadership: '部下の忠誠心と士気維持に影響',
            intelligence: '情報収集と戦略立案に影響',
            logistics: '補給効率と持久戦能力に影響',
            diplomacy: '交渉能力と政治的影響力',
            morale: '艦隊全体の士気と戦闘意欲',
            experience: '実戦経験による総合的判断力'
        };

        // セクションタイトル
        const sectionTitle = new PIXI.Text('能力値詳細', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: '#FFD700'
        }));
        sectionTitle.x = startX;
        sectionTitle.y = startY;
        this.detailPanel.addChild(sectionTitle);

        // 能力値を2列で表示
        const entries = Object.entries(admiral.abilities);
        const columnWidth = (width - 40) / 2;
        const rowHeight = 35;

        entries.forEach(([key, value], index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + column * (columnWidth + 20);
            const y = startY + 50 + row * rowHeight;

            // 能力名
            const abilityLabel = new PIXI.Text(abilityNames[key], new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }));
            abilityLabel.x = x;
            abilityLabel.y = y;
            this.detailPanel.addChild(abilityLabel);

            // 能力値バー
            const barWidth = columnWidth - 80;
            const barBg = new PIXI.Graphics();
            barBg.roundRect(x + 80, y + 2, barWidth, 12, 3);
            barBg.fill(0x333333);
            this.detailPanel.addChild(barBg);

            const barFill = new PIXI.Graphics();
            const fillWidth = (value / 120) * barWidth;
            barFill.roundRect(x + 80, y + 2, fillWidth, 12, 3);
            
            // 能力値による色分け
            let barColor;
            if (value >= 110) barColor = 0x00FF00;      // 緑 (優秀)
            else if (value >= 100) barColor = 0x88FF00; // 黄緑 (良好)
            else if (value >= 90) barColor = 0xFFFF00;  // 黄 (普通)
            else if (value >= 80) barColor = 0xFF8800;  // オレンジ (やや劣る)
            else barColor = 0xFF4400;                   // 赤 (劣る)
            
            barFill.fill(barColor);
            this.detailPanel.addChild(barFill);

            // 数値表示
            const valueText = new PIXI.Text(value.toString(), new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }));
            valueText.x = x + 80 + barWidth + 10;
            valueText.y = y;
            this.detailPanel.addChild(valueText);
        });

        // 総合評価
        const totalScore = Object.values(admiral.abilities).reduce((sum, value) => sum + value, 0);
        const avgScore = Math.round(totalScore / 11);

        const totalTitle = new PIXI.Text('総合評価', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fontWeight: 'bold',
            fill: '#FFD700'
        }));
        totalTitle.x = startX;
        totalTitle.y = startY + 280;
        this.detailPanel.addChild(totalTitle);

        const totalText = new PIXI.Text(`総合スコア: ${totalScore} | 平均値: ${avgScore}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#FFFFFF'
        }));
        totalText.x = startX;
        totalText.y = startY + 310;
        this.detailPanel.addChild(totalText);

        // 評価ランク
        let rank = '';
        if (avgScore >= 110) rank = 'S級 - 伝説的名将';
        else if (avgScore >= 100) rank = 'A級 - 優秀な提督';
        else if (avgScore >= 90) rank = 'B級 - 有能な指揮官';
        else if (avgScore >= 80) rank = 'C級 - 一般的な提督';
        else rank = 'D級 - 経験不足';

        const rankText = new PIXI.Text(`評価ランク: ${rank}`, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: avgScore >= 110 ? '#FFD700' : avgScore >= 100 ? '#00FF00' : '#CCCCCC'
        }));
        rankText.x = startX;
        rankText.y = startY + 340;
        this.detailPanel.addChild(rankText);
    }

    setupEventListeners() {
        const onKeyDown = (event) => {
            if (event.code === 'Escape') {
                if (this.isDetailPanelVisible) {
                    this.hideDetailPanel();
                } else if (this.onBack) {
                    this.onBack();
                }
            }
        };

        // マウスホイールでスクロール
        const onWheel = (event) => {
            event.preventDefault();
            const scrollSpeed = 30;
            this.scroll(event.deltaY > 0 ? scrollSpeed : -scrollSpeed);
        };

        // キーボードでスクロール
        const onKeyDownScroll = (event) => {
            const scrollSpeed = 50;
            switch (event.code) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.scroll(-scrollSpeed);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.scroll(scrollSpeed);
                    break;
                case 'PageUp':
                    event.preventDefault();
                    this.scroll(-200);
                    break;
                case 'PageDown':
                    event.preventDefault();
                    this.scroll(200);
                    break;
                case 'Home':
                    event.preventDefault();
                    this.scrollY = 0;
                    this.updateScrollPosition();
                    break;
                case 'End':
                    event.preventDefault();
                    this.scrollY = this.maxScrollY;
                    this.updateScrollPosition();
                    break;
                case 'Escape':
                    if (this.isDetailPanelVisible) {
                        this.hideDetailPanel();
                    } else if (this.onBack) {
                        this.onBack();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDownScroll);
        document.addEventListener('wheel', onWheel, { passive: false });
        
        this.cleanup = () => {
            document.removeEventListener('keydown', onKeyDownScroll);
            document.removeEventListener('wheel', onWheel);
        };
    }

    destroy() {
        if (this.cleanup) {
            this.cleanup();
        }
        this.container.destroy();
    }

    getContainer() {
        return this.container;
    }
}