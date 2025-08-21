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
        this.facing = 0; // 向き（ラジアン）
        this.shipColor = color;
        
        // 艦隊本体（三角形）
        this.ship = new PIXI.Graphics();
        this.drawShip();
        this.addChild(this.ship);
        
        // HPバー背景
        this.hpBarBg = new PIXI.Graphics();
        this.hpBarBg.rect(-20, -25, 40, 4);
        this.hpBarBg.fill(0x333333);
        this.addChild(this.hpBarBg);
        
        // HPバー
        this.hpBar = new PIXI.Graphics();
        this.updateHPBar();
        this.addChild(this.hpBar);
        
        // 選択枠（初期は非表示）
        this.selectionBorder = new PIXI.Graphics();
        this.selectionBorder.circle(0, 0, 25);
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
    
    // 艦隊の三角形描画
    drawShip() {
        this.ship.clear();
        
        // 三角形の座標（上向きの矢印形状）
        const points = [
            0, -15,    // 先端（上）
            -12, 10,   // 左下
            12, 10     // 右下
        ];
        
        this.ship.poly(points);
        this.ship.fill(this.shipColor);
        this.ship.stroke({ width: 1, color: 0xffffff, alpha: 0.8 });
        
        // 向きに応じて回転
        this.ship.rotation = this.facing;
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
        
        this.hpBar.rect(-20, -25, barWidth, 4);
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
        
        // 選択エフェクト
        if (window.gameState.effects) {
            window.gameState.effects.createSelectionRing(this.x, this.y);
        }
        
        // 選択音再生
        if (window.gameState.audio) {
            window.gameState.audio.playSelect();
        }
        
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
        
        // ビームエフェクト作成
        if (window.gameState.effects) {
            const beamColor = this.faction === 'alliance' ? 0x4444ff : 0xff4444;
            window.gameState.effects.createBeamEffect(this.x, this.y, target.x, target.y, beamColor);
            
            // ダメージテキスト表示
            window.gameState.effects.createDamageText(target.x, target.y - 30, this.attackPower);
        }
        
        // レーザー音再生
        if (window.gameState.audio) {
            window.gameState.audio.playLaser();
        }
        
        const isDestroyed = target.takeDamage(this.attackPower);
        console.log(`${this.name} が ${target.name} を攻撃！ (残りHP: ${target.currentHP})`);
        
        if (isDestroyed) {
            // 爆発エフェクト作成
            if (window.gameState.effects) {
                window.gameState.effects.createExplosionEffect(target.x, target.y);
            }
            
            // 爆発音再生
            if (window.gameState.audio) {
                window.gameState.audio.playExplosion();
            }
            
            // 撃破統計更新
            if (window.gameState.ui) {
                window.gameState.ui.recordDestroy(target);
            }
            
            // 撃破された艦隊をゲームから除去
            window.gameState.app.stage.removeChild(target);
            window.gameState.fleets = window.gameState.fleets.filter(f => f !== target);
        }
    }
    
    // 向きを更新
    updateFacing(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const newFacing = Math.atan2(dy, dx) + Math.PI / 2; // 上向きを0として調整
        
        // 向きが変わった場合のみ再描画
        if (Math.abs(this.facing - newFacing) > 0.1) {
            this.facing = newFacing;
            this.drawShip();
        }
    }
    
    // 画面内にいるかチェック（パフォーマンス最適化）
    isOnScreen() {
        const margin = 100; // マージン
        return this.x >= -margin && this.x <= 1280 + margin &&
               this.y >= -margin && this.y <= 720 + margin;
    }
    
    // 毎フレーム更新
    update() {
        // HPが0以下の場合は何もしない
        if (this.currentHP <= 0) return;
        
        // 画面外の場合は処理を軽量化
        const onScreen = this.isOnScreen();
        
        // 移動処理
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance >= this.moveSpeed) {
            const directionX = dx / distance;
            const directionY = dy / distance;
            this.x += directionX * this.moveSpeed;
            this.y += directionY * this.moveSpeed;
            
            // 画面内の場合のみ向きを詳細更新
            if (onScreen) {
                this.updateFacing(this.targetX, this.targetY);
            }
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
        }
        
        // 戦闘処理
        const target = this.findTarget();
        if (target) {
            // 攻撃対象に向きを変更
            if (onScreen) {
                this.updateFacing(target.x, target.y);
            }
            this.attack(target);
        }
    }
}