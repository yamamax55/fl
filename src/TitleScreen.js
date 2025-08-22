import * as PIXI from 'pixi.js';

export class TitleScreen extends PIXI.Container {
    constructor(app) {
        super();
        this.app = app;
        this.onStartCallback = null;
        
        this.createBackground();
        this.createTitle();
        this.createStars();
        this.createMenu();
        this.startAnimation();
    }
    
    createBackground() {
        // 黒い宇宙背景
        const background = new PIXI.Graphics();
        background.rect(0, 0, 1280, 720);
        background.fill(0x000000);
        this.addChild(background);
        
        // グラデーション効果
        const gradient = new PIXI.Graphics();
        gradient.rect(0, 0, 1280, 720);
        gradient.fill(0x001122);
        this.addChild(gradient);
    }
    
    createStars() {
        // 背景の星々
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            const star = new PIXI.Graphics();
            const size = Math.random() * 2 + 0.5;
            const brightness = Math.random() * 0.8 + 0.2;
            
            star.circle(0, 0, size);
            star.fill(0xffffff);
            star.alpha = brightness;
            
            star.x = Math.random() * 1280;
            star.y = Math.random() * 720;
            
            // ランダムな点滅速度
            star.blinkSpeed = Math.random() * 0.02 + 0.005;
            star.blinkPhase = Math.random() * Math.PI * 2;
            
            this.stars.push(star);
            this.addChild(star);
        }
    }
    
    createTitle() {
        // メインタイトル
        const titleText = new PIXI.Text({
            text: 'GALAXY RTS',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 72,
                fontWeight: 'bold',
                fill: '#00ffff',
                stroke: { color: '#000044', width: 4 },
                dropShadow: {
                    color: '#0088ff',
                    blur: 10,
                    distance: 5
                },
                align: 'center'
            }
        });
        
        titleText.anchor.set(0.5);
        titleText.x = 640;
        titleText.y = 200;
        this.addChild(titleText);
        this.titleText = titleText;
        
        // サブタイトル
        const subtitleText = new PIXI.Text({
            text: '銀河英雄伝説 - 艦隊戦術シミュレーション',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                fill: '#cccccc',
                stroke: { color: '#000022', width: 2 },
                align: 'center'
            }
        });
        
        subtitleText.anchor.set(0.5);
        subtitleText.x = 640;
        subtitleText.y = 280;
        this.addChild(subtitleText);
    }
    
    createMenu() {
        // メニューコンテナ
        this.menuContainer = new PIXI.Container();
        this.menuContainer.x = 640;
        this.menuContainer.y = 400;
        this.addChild(this.menuContainer);
        
        // メニューアイテム
        const menuItems = [
            { text: 'ゲーム開始', action: 'start' },
            { text: '設定', action: 'settings' },
            { text: 'ヘルプ', action: 'help' },
            { text: '終了', action: 'exit' }
        ];
        
        this.menuButtons = [];
        
        menuItems.forEach((item, index) => {
            const button = this.createMenuButton(item.text, item.action, index);
            this.menuContainer.addChild(button);
            this.menuButtons.push(button);
        });
        
        // 選択中のメニューインデックス
        this.selectedMenuIndex = 0;
        this.updateMenuSelection();
    }
    
    createMenuButton(text, action, index) {
        const container = new PIXI.Container();
        container.y = index * 60;
        container.action = action;
        
        // ボタン背景
        const background = new PIXI.Graphics();
        background.rect(-150, -20, 300, 40);
        background.fill(0x001144);
        background.stroke({
            color: 0x0088ff,
            width: 2
        });
        container.addChild(background);
        container.background = background;
        
        // ボタンテキスト
        const buttonText = new PIXI.Text({
            text: text,
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 28,
                fill: '#ffffff',
                align: 'center'
            }
        });
        
        buttonText.anchor.set(0.5);
        container.addChild(buttonText);
        container.buttonText = buttonText;
        
        // インタラクティブ設定
        container.eventMode = 'static';
        container.cursor = 'pointer';
        
        // ホバーエフェクト
        container.on('pointerenter', () => {
            if (!container.isSelected) {
                background.clear();
                background.rect(-150, -20, 300, 40);
                background.fill(0x002266);
                background.stroke({
                    color: 0x00aaff,
                    width: 2
                });
                buttonText.style.fill = '#00ffff';
            }
        });
        
        container.on('pointerleave', () => {
            if (!container.isSelected) {
                background.clear();
                background.rect(-150, -20, 300, 40);
                background.fill(0x001144);
                background.stroke({
                    color: 0x0088ff,
                    width: 2
                });
                buttonText.style.fill = '#ffffff';
            }
        });
        
        // クリックイベント
        container.on('pointerdown', () => {
            this.handleMenuAction(action);
        });
        
        return container;
    }
    
    updateMenuSelection() {
        this.menuButtons.forEach((button, index) => {
            const isSelected = index === this.selectedMenuIndex;
            button.isSelected = isSelected;
            
            if (isSelected) {
                button.background.clear();
                button.background.rect(-150, -20, 300, 40);
                button.background.fill(0x003388);
                button.background.stroke({
                    color: 0x00ffff,
                    width: 3
                });
                button.buttonText.style.fill = '#00ffff';
            } else {
                button.background.clear();
                button.background.rect(-150, -20, 300, 40);
                button.background.fill(0x001144);
                button.background.stroke({
                    color: 0x0088ff,
                    width: 2
                });
                button.buttonText.style.fill = '#ffffff';
            }
        });
    }
    
    handleMenuAction(action) {
        switch (action) {
            case 'start':
                console.log('陣営選択画面へ');
                if (this.onStartCallback) {
                    this.onStartCallback();
                }
                break;
            case 'settings':
                console.log('設定画面（未実装）');
                break;
            case 'help':
                console.log('ヘルプ画面（未実装）');
                break;
            case 'exit':
                console.log('ゲーム終了');
                if (confirm('ゲームを終了しますか？')) {
                    window.close();
                }
                break;
        }
    }
    
    startAnimation() {
        // タイトルアニメーション
        let time = 0;
        
        const animate = () => {
            time += 0.016; // 約60FPS
            
            // タイトルの浮遊効果
            if (this.titleText) {
                this.titleText.y = 200 + Math.sin(time * 2) * 10;
                this.titleText.alpha = 0.8 + Math.sin(time * 3) * 0.2;
            }
            
            // 星の点滅効果
            this.stars.forEach(star => {
                star.alpha = 0.2 + Math.sin(time * star.blinkSpeed + star.blinkPhase) * 0.6;
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // キーボード操作
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (!this.visible) return;
            
            switch (event.key) {
                case 'ArrowUp':
                    this.selectedMenuIndex = Math.max(0, this.selectedMenuIndex - 1);
                    this.updateMenuSelection();
                    break;
                case 'ArrowDown':
                    this.selectedMenuIndex = Math.min(this.menuButtons.length - 1, this.selectedMenuIndex + 1);
                    this.updateMenuSelection();
                    break;
                case 'Enter':
                    const selectedButton = this.menuButtons[this.selectedMenuIndex];
                    if (selectedButton) {
                        this.handleMenuAction(selectedButton.action);
                    }
                    break;
                case 'Escape':
                    this.handleMenuAction('exit');
                    break;
            }
        });
    }
    
    setOnStartCallback(callback) {
        this.onStartCallback = callback;
    }
    
    show() {
        this.visible = true;
        this.setupKeyboardControls();
    }
    
    hide() {
        this.visible = false;
    }
}