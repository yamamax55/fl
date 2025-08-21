import * as PIXI from 'pixi.js';

// 艦隊クラス
export class Fleet extends PIXI.Container {
    constructor(x, y, color, name, faction, id) {
        super();
        
        this.id = id;
        this.name = name;
        this.faction = faction; // 'empire' or 'alliance'
        this.targetX = x;
        this.targetY = y;
        this.isSelected = false;
        this.moveSpeed = 2; // 移動速度
        this.maxHP = 10000; // 最大HP
        this.currentHP = 10000; // 現在のHP
        this.attackPower = 1000; // 攻撃力
        this.range = 150; // 射程距離
        this.lastAttackTime = 0; // 最後の攻撃時間
        this.attackCooldown = 1000; // 攻撃間隔（ミリ秒）
        
        // 艦隊本体（四角）
        this.ship = new PIXI.Graphics();
        this.ship.rect(0, 0, 40, 40);
        this.ship.fill(color);
        this.addChild(this.ship);
        
        // HPバー背景
        this.hpBarBg = new PIXI.Graphics();
        this.hpBarBg.rect(0, -10, 40, 4);
        this.hpBarBg.fill(0x333333);
        this.addChild(this.hpBarBg);
        
        // HPバー
        this.hpBar = new PIXI.Graphics();
        this.updateHPBar();
        this.addChild(this.hpBar);
        
        // 選択枠（初期は非表示）
        this.selectionBorder = new PIXI.Graphics();
        this.selectionBorder.rect(-2, -2, 44, 44);
        this.selectionBorder.stroke({ width: 2, color: 0xffff00 });
        this.selectionBorder.visible = false;
        this.addChild(this.selectionBorder);
        
        // インタラクティブ設定
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        // 初期位置設定
        this.x = x;
        this.y = y;
        
        // イベントリスナー
        this.on('pointerdown', this.onPointerDown.bind(this));
    }
    
    // HPバーを更新
    updateHPBar() {
        this.hpBar.clear();
        const hpRatio = this.currentHP / this.maxHP;
        const barWidth = 40 * hpRatio;
        
        // HPに応じて色を変更
        let color = 0x00ff00; // 緑
        if (hpRatio < 0.5) color = 0xffff00; // 黄色
        if (hpRatio < 0.25) color = 0xff0000; // 赤
        
        this.hpBar.rect(0, -10, barWidth, 4);
        this.hpBar.fill(color);
    }
    
    // クリック処理
    onPointerDown(event) {
        // 右クリックは移動処理で後で実装
        if (event.button === 0) { // 左クリック
            this.select();
        }
        event.stopPropagation();
    }
    
    // 選択状態にする
    select() {
        // 他の艦隊の選択を解除
        window.gameState.fleets.forEach(fleet => {
            if (fleet !== this) {
                fleet.deselect();
            }
        });
        
        this.isSelected = true;
        this.selectionBorder.visible = true;
        console.log(`${this.name} が選択されました`);
    }
    
    // 選択状態を解除
    deselect() {
        this.isSelected = false;
        this.selectionBorder.visible = false;
    }
    
    // 目標地点に向かって移動
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        console.log(`${this.name} が (${x}, ${y}) に移動開始`);
    }
    
    // ダメージを受ける
    takeDamage(damage) {
        this.currentHP -= damage;
        if (this.currentHP < 0) this.currentHP = 0;
        this.updateHPBar();
        
        if (this.currentHP <= 0) {
            console.log(`${this.name} が撃破されました！`);
            return true; // 撃破
        }
        return false;
    }
    
    // 攻撃可能な敵を検索
    findTarget() {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            return null; // クールダウン中
        }
        
        const enemies = window.gameState.fleets.filter(fleet => 
            fleet.faction !== this.faction && 
            fleet.currentHP > 0 &&
            this.getDistanceTo(fleet) <= this.range
        );
        
        // 最も近い敵を選択
        if (enemies.length > 0) {
            return enemies.reduce((closest, enemy) => 
                this.getDistanceTo(enemy) < this.getDistanceTo(closest) ? enemy : closest
            );
        }
        return null;
    }
    
    // 他の艦隊との距離を計算
    getDistanceTo(otherFleet) {
        const dx = this.x - otherFleet.x;
        const dy = this.y - otherFleet.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 攻撃実行
    attack(target) {
        const currentTime = Date.now();
        this.lastAttackTime = currentTime;
        
        const isDestroyed = target.takeDamage(this.attackPower);
        console.log(`${this.name} が ${target.name} を攻撃！ (残りHP: ${target.currentHP})`);
        
        if (isDestroyed) {
            // 撃破された艦隊をゲームから除去
            window.gameState.app.stage.removeChild(target);
            window.gameState.fleets = window.gameState.fleets.filter(f => f !== target);
        }
    }
    
    // 毎フレーム更新
    update() {
        // HPが0以下の場合は何もしない
        if (this.currentHP <= 0) return;
        
        // 移動処理
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance >= this.moveSpeed) {
            const directionX = dx / distance;
            const directionY = dy / distance;
            this.x += directionX * this.moveSpeed;
            this.y += directionY * this.moveSpeed;
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
        }
        
        // 戦闘処理
        const target = this.findTarget();
        if (target) {
            this.attack(target);
        }
    }
}