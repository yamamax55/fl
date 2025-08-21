import * as PIXI from 'pixi.js';

// アプリケーション作成
const app = new PIXI.Application({
    width: 1280,
    height: 720,
    backgroundColor: 0x000000
});

document.body.appendChild(app.view);

// 同盟軍艦隊（青い四角）
const allianceFleet = new PIXI.Graphics();
allianceFleet.beginFill(0x0000ff);
allianceFleet.drawRect(0, 0, 40, 40);
allianceFleet.endFill();
allianceFleet.x = 200;
allianceFleet.y = 360;

// 帝国軍艦隊（赤い四角）
const empireFleet = new PIXI.Graphics();
empireFleet.beginFill(0xff0000);
empireFleet.drawRect(0, 0, 40, 40);
empireFleet.endFill();
empireFleet.x = 1000;
empireFleet.y = 360;

// ステージに追加
app.stage.addChild(allianceFleet);
app.stage.addChild(empireFleet);

console.log('Galaxy RTS Started');