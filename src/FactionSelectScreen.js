import * as PIXI from 'pixi.js';

export class FactionSelectScreen extends PIXI.Container {
    constructor(app) {
        super();
        this.app = app;
        this.onFactionSelectCallback = null;
        this.selectedFaction = null;
        
        this.createBackground();
        this.createTitle();
        this.createFactionCards();
        this.createBackButton();
        this.startAnimation();
    }
    
    createBackground() {
        // 黒い宇宙背景
        const background = new PIXI.Graphics();
        background.rect(0, 0, 1280, 720);
        background.fill(0x000011);
        this.addChild(background);
        
        // 星空効果
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            const star = new PIXI.Graphics();
            const size = Math.random() * 1.5 + 0.3;
            
            star.circle(0, 0, size);
            star.fill(0xffffff);
            star.alpha = Math.random() * 0.6 + 0.2;
            
            star.x = Math.random() * 1280;
            star.y = Math.random() * 720;
            star.blinkSpeed = Math.random() * 0.015 + 0.005;
            star.blinkPhase = Math.random() * Math.PI * 2;
            
            this.stars.push(star);
            this.addChild(star);
        }
    }
    
    createTitle() {
        // タイトル
        const titleText = new PIXI.Text({
            text: '陣営選択',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 48,
                fontWeight: 'bold',
                fill: '#ffffff',
                stroke: { color: '#000044', width: 3 },
                align: 'center'
            }
        });
        
        titleText.anchor.set(0.5);
        titleText.x = 640;
        titleText.y = 100;
        this.addChild(titleText);
        
        // サブタイトル
        const subtitleText = new PIXI.Text({
            text: 'プレイする陣営を選択してください',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                fill: '#cccccc',
                align: 'center'
            }
        });
        
        subtitleText.anchor.set(0.5);
        subtitleText.x = 640;
        subtitleText.y = 150;
        this.addChild(subtitleText);
    }
    
    createFactionCards() {
        this.factionCards = [];
        
        // 自由連邦カード
        const allianceCard = this.createFactionCard({
            faction: 'alliance',
            name: '自由連邦',
            description: [
                '民主主義を掲げる自由連邦',
                '',
                '特徴:',
                '• 防御的戦術に優れる',
                '• 戦術的多様性と柔軟性',
                '• フロンティア要塞の防衛力',
                '• 個人の自由と民主的判断'
            ],
            color: 0x0066cc,
            x: 320,
            emblem: '★'
        });
        
        // 銀河帝国カード
        const empireCard = this.createFactionCard({
            faction: 'empire',
            name: '銀河帝国',
            description: [
                '強力な統一帝国',
                '',
                '特徴:',
                '• 攻撃的戦術に優れる',
                '• 精鋭艦隊指揮官たち',
                '• 圧倒的な艦隊戦力',
                '• 規律と統制による組織力'
            ],
            color: 0xcc0000,
            x: 960,
            emblem: '♔'
        });
        
        this.factionCards.push(allianceCard, empireCard);
        this.addChild(allianceCard);
        this.addChild(empireCard);
    }
    
    createFactionCard(config) {
        const container = new PIXI.Container();
        container.x = config.x;
        container.y = 250;
        container.faction = config.faction;
        container.isSelected = false;
        
        // カード背景
        const cardBg = new PIXI.Graphics();
        cardBg.rect(-150, -100, 300, 350);
        cardBg.fill(0x222222);
        cardBg.stroke({ color: config.color, width: 3 });
        container.addChild(cardBg);
        container.cardBg = cardBg;
        
        // エンブレム
        const emblem = new PIXI.Text({
            text: config.emblem,
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 64,
                fill: config.color,
                align: 'center'
            }
        });
        emblem.anchor.set(0.5);
        emblem.y = -50;
        container.addChild(emblem);
        
        // 陣営名
        const nameText = new PIXI.Text({
            text: config.name,
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 28,
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center'
            }
        });
        nameText.anchor.set(0.5);
        nameText.y = 20;
        container.addChild(nameText);
        
        // 説明文
        const descriptionText = new PIXI.Text({
            text: config.description.join('\n'),
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 16,
                fill: '#cccccc',
                align: 'center',
                wordWrap: true,
                wordWrapWidth: 280
            }
        });
        descriptionText.anchor.set(0.5, 0);
        descriptionText.y = 50;
        container.addChild(descriptionText);
        
        // 選択ボタン
        const selectButton = new PIXI.Container();
        selectButton.y = 200;
        
        const buttonBg = new PIXI.Graphics();
        buttonBg.rect(-60, -15, 120, 30);
        buttonBg.fill(config.color);
        selectButton.addChild(buttonBg);
        
        const buttonText = new PIXI.Text({
            text: '選択',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 18,
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center'
            }
        });
        buttonText.anchor.set(0.5);
        selectButton.addChild(buttonText);
        
        container.addChild(selectButton);
        container.selectButton = selectButton;
        container.buttonBg = buttonBg;
        container.buttonText = buttonText;
        
        // インタラクティブ設定
        container.eventMode = 'static';
        container.cursor = 'pointer';
        
        // ホバーエフェクト
        container.on('pointerenter', () => {
            if (!container.isSelected) {
                cardBg.clear();
                cardBg.rect(-150, -100, 300, 350);
                cardBg.fill(0x333333);
                cardBg.stroke({ color: config.color, width: 4 });
                
                emblem.style.fill = this.lightenColor(config.color);
                container.scale.set(1.05);
            }
        });
        
        container.on('pointerleave', () => {
            if (!container.isSelected) {
                cardBg.clear();
                cardBg.rect(-150, -100, 300, 350);
                cardBg.fill(0x222222);
                cardBg.stroke({ color: config.color, width: 3 });
                
                emblem.style.fill = config.color;
                container.scale.set(1.0);
            }
        });
        
        // クリックイベント
        container.on('pointerdown', () => {
            this.selectFaction(config.faction);
        });
        
        return container;
    }
    
    createBackButton() {
        const backButton = new PIXI.Container();
        backButton.x = 100;
        backButton.y = 650;
        
        const buttonBg = new PIXI.Graphics();
        buttonBg.rect(-40, -15, 80, 30);
        buttonBg.fill(0x666666);
        buttonBg.stroke({ color: 0xaaaaaa, width: 2 });
        backButton.addChild(buttonBg);
        
        const buttonText = new PIXI.Text({
            text: '戻る',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 18,
                fill: '#ffffff',
                align: 'center'
            }
        });
        buttonText.anchor.set(0.5);
        backButton.addChild(buttonText);
        
        // インタラクティブ設定
        backButton.eventMode = 'static';
        backButton.cursor = 'pointer';
        
        backButton.on('pointerenter', () => {
            buttonBg.clear();
            buttonBg.rect(-40, -15, 80, 30);
            buttonBg.fill(0x888888);
            buttonBg.stroke({ color: 0xcccccc, width: 2 });
        });
        
        backButton.on('pointerleave', () => {
            buttonBg.clear();
            buttonBg.rect(-40, -15, 80, 30);
            buttonBg.fill(0x666666);
            buttonBg.stroke({ color: 0xaaaaaa, width: 2 });
        });
        
        backButton.on('pointerdown', () => {
            if (this.onBackCallback) {
                this.onBackCallback();
            }
        });
        
        this.addChild(backButton);
    }
    
    selectFaction(faction) {
        console.log(`陣営選択: ${faction}`);
        
        // 前回の選択をリセット
        this.factionCards.forEach(card => {
            card.isSelected = false;
            card.scale.set(1.0);
            card.cardBg.clear();
            card.cardBg.rect(-150, -100, 300, 350);
            card.cardBg.fill(0x222222);
            const color = card.faction === 'alliance' ? 0x0066cc : 0xcc0000;
            card.cardBg.stroke({ color: color, width: 3 });
        });
        
        // 新しい選択を設定
        const selectedCard = this.factionCards.find(card => card.faction === faction);
        if (selectedCard) {
            selectedCard.isSelected = true;
            selectedCard.scale.set(1.1);
            selectedCard.cardBg.clear();
            selectedCard.cardBg.rect(-150, -100, 300, 350);
            selectedCard.cardBg.fill(0x444444);
            const color = faction === 'alliance' ? 0x0066cc : 0xcc0000;
            selectedCard.cardBg.stroke({ color: this.lightenColor(color), width: 5 });
        }
        
        this.selectedFaction = faction;
        
        // 決定ボタンを表示
        if (!this.confirmButton) {
            this.createConfirmButton();
        }
        this.confirmButton.visible = true;
    }
    
    createConfirmButton() {
        this.confirmButton = new PIXI.Container();
        this.confirmButton.x = 640;
        this.confirmButton.y = 650;
        this.confirmButton.visible = false;
        
        const buttonBg = new PIXI.Graphics();
        buttonBg.rect(-80, -20, 160, 40);
        buttonBg.fill(0x00aa00);
        buttonBg.stroke({ color: 0x00ff00, width: 3 });
        this.confirmButton.addChild(buttonBg);
        
        const buttonText = new PIXI.Text({
            text: 'ゲーム開始',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 20,
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center'
            }
        });
        buttonText.anchor.set(0.5);
        this.confirmButton.addChild(buttonText);
        
        // インタラクティブ設定
        this.confirmButton.eventMode = 'static';
        this.confirmButton.cursor = 'pointer';
        
        this.confirmButton.on('pointerenter', () => {
            buttonBg.clear();
            buttonBg.rect(-80, -20, 160, 40);
            buttonBg.fill(0x00cc00);
            buttonBg.stroke({ color: 0x00ff00, width: 4 });
            this.confirmButton.scale.set(1.05);
        });
        
        this.confirmButton.on('pointerleave', () => {
            buttonBg.clear();
            buttonBg.rect(-80, -20, 160, 40);
            buttonBg.fill(0x00aa00);
            buttonBg.stroke({ color: 0x00ff00, width: 3 });
            this.confirmButton.scale.set(1.0);
        });
        
        this.confirmButton.on('pointerdown', () => {
            if (this.onFactionSelectCallback && this.selectedFaction) {
                this.onFactionSelectCallback(this.selectedFaction);
            }
        });
        
        this.addChild(this.confirmButton);
    }
    
    lightenColor(color) {
        // 色を明るくする簡単な関数
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        
        const lightenFactor = 1.5;
        const newR = Math.min(255, Math.floor(r * lightenFactor));
        const newG = Math.min(255, Math.floor(g * lightenFactor));
        const newB = Math.min(255, Math.floor(b * lightenFactor));
        
        return (newR << 16) | (newG << 8) | newB;
    }
    
    startAnimation() {
        let time = 0;
        
        const animate = () => {
            if (!this.visible) return;
            
            time += 0.016;
            
            // 星の点滅効果
            this.stars.forEach(star => {
                star.alpha = 0.2 + Math.sin(time * star.blinkSpeed + star.blinkPhase) * 0.4;
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // キーボード操作
    setupKeyboardControls() {
        this.keyboardHandler = (event) => {
            if (!this.visible) return;
            
            switch (event.key) {
                case '1':
                    this.selectFaction('alliance');
                    break;
                case '2':
                    this.selectFaction('empire');
                    break;
                case 'Enter':
                    if (this.selectedFaction && this.confirmButton && this.confirmButton.visible) {
                        if (this.onFactionSelectCallback) {
                            this.onFactionSelectCallback(this.selectedFaction);
                        }
                    }
                    break;
                case 'Escape':
                    if (this.onBackCallback) {
                        this.onBackCallback();
                    }
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyboardHandler);
    }
    
    removeKeyboardControls() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
    }
    
    setOnFactionSelectCallback(callback) {
        this.onFactionSelectCallback = callback;
    }
    
    setOnBackCallback(callback) {
        this.onBackCallback = callback;
    }
    
    show() {
        this.visible = true;
        this.setupKeyboardControls();
    }
    
    hide() {
        this.visible = false;
        this.removeKeyboardControls();
    }
}