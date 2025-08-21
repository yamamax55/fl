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
}