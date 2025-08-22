import * as PIXI from 'pixi.js';

// 艦隊クラス
export class Fleet extends PIXI.Container {
    constructor(x, y, color, name, faction, id, fleetNumber) {
        super();
        
        this.id = id;
        this.name = name;
        this.faction = faction; // 'empire' or 'alliance'
        this.fleetNumber = fleetNumber; // 艦隊番号（1, 2, 3など）
        this.targetX = x;
        this.targetY = y;
        this.isSelected = false;
        this.baseMoveSpeed = 2; // 基本移動速度
        this.moveSpeed = 2; // 実際の移動速度（提督能力で調整）
        this.maxHP = 10000; // 最大HP
        this.currentHP = 10000; // 現在のHP
        this.baseAttackPower = 1000; // 基本攻撃力
        this.attackPower = 1000; // 実際の攻撃力（提督能力で調整）
        this.baseDefensePower = 100; // 基本防御力
        this.defensePower = 100; // 実際の防御力（提督能力で調整）
        this.range = 150; // 射程距離
        this.lastAttackTime = 0; // 最後の攻撃時間
        this.attackCooldown = 1000; // 攻撃間隔（ミリ秒）
        // 陣営による初期向き設定（対峙配置）
        this.facing = faction === 'alliance' ? Math.PI / 2 : -Math.PI / 2; // 同盟軍：右向き、帝国軍：左向き
        this.shipColor = color;
        
        // インタラクションモード管理
        this.interactionMode = 'none'; // 'none', 'move', 'rotate'
        this.lastClickTime = 0; // ダブルクリック判定用
        this.doubleClickDelay = 300; // ダブルクリック判定時間（ミリ秒）
        
        // 回転アニメーション管理
        this.targetFacing = this.facing; // 目標回転角度
        this.baseRotationSpeed = 0.03; // 基本回転速度（ラジアン/フレーム）
        this.rotationSpeed = 0.03; // 実際の回転速度（提督能力で調整）
        this.isRotating = false; // 回転中フラグ
        
        // 移動状態管理
        this.isWaitingToMove = false; // 回転完了待ちで移動待機中フラグ
        this.isMoving = false; // 移動中フラグ
        this.lastMoveCancelTime = 0; // 最後に移動がキャンセルされた時刻
        this.moveCancelCooldown = 6000; // 移動キャンセル後のクールダウン時間（6秒）
        
        // 直接移動（ドラッグ&ドロップ）システム
        this.isDragging = false; // ドラッグ中フラグ
        this.dragStartX = 0; // ドラッグ開始X座標
        this.dragStartY = 0; // ドラッグ開始Y座標
        this.isDirectMoving = false; // 直接移動中フラグ（回転なし）
        this.directMoveSpeed = 0.8; // 直接移動時の速度倍率（通常より遅い）
        
        // ZOC（Zone of Control）システム
        this.zocRange = 200; // ZOC範囲（ピクセル）
        this.zocTarget = null; // ZOC内の追跡対象
        this.isZOCRotating = false; // ZOC自動回転中フラグ
        
        // 戦闘時視界特例システム
        this.isInCombat = false; // 戦闘中フラグ
        this.lastCombatTime = 0; // 最後の戦闘時刻
        this.combatVisibilityDuration = 1000; // 戦闘後の視界継続時間（ミリ秒）
        
        // 艦隊本体（三角形）
        this.ship = new PIXI.Container();
        this.shipGraphics = new PIXI.Graphics();
        this.drawShip();
        this.ship.addChild(this.shipGraphics);
        
        // 艦隊番号テキスト
        this.fleetNumberText = new PIXI.Text({
            text: this.fleetNumber.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fontWeight: 'bold',
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 1, alpha: 0.8 },
                align: 'center'
            }
        });
        this.fleetNumberText.anchor.set(0.5, 0.5);
        this.fleetNumberText.x = 0;
        this.fleetNumberText.y = 0;
        this.ship.addChild(this.fleetNumberText);
        
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
        
        // 射程表示枠（回転モード時のみ表示、前方楕円形）
        this.rangeEllipse = new PIXI.Graphics();
        this.drawRangeEllipse();
        this.rangeEllipse.visible = false;
        this.addChild(this.rangeEllipse);
        
        // ZOC範囲表示（回転モード時のみ表示、円形）
        this.zocCircle = new PIXI.Graphics();
        this.drawZOCRange();
        this.zocCircle.visible = false;
        this.addChild(this.zocCircle);
        
        // 移動予定地点プレビュー（移動モード時のみ表示）
        this.ghostFleet = new PIXI.Container();
        this.ghostFleetGraphics = new PIXI.Graphics();
        this.ghostFleet.addChild(this.ghostFleetGraphics);
        
        // ゴースト艦隊番号テキスト
        this.ghostFleetNumberText = new PIXI.Text({
            text: this.fleetNumber.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fontWeight: 'bold',
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 1, alpha: 0.4 },
                align: 'center'
            }
        });
        this.ghostFleetNumberText.anchor.set(0.5, 0.5);
        this.ghostFleetNumberText.x = 0;
        this.ghostFleetNumberText.y = 0;
        this.ghostFleetNumberText.alpha = 0.5; // 半透明
        this.ghostFleet.addChild(this.ghostFleetNumberText);
        
        this.drawGhostFleet();
        this.ghostFleet.visible = false;
        // ゴーストフリートはゲームステージに直接追加
        
        // インタラクティブ設定
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        // 初期位置設定
        this.x = x;
        this.y = y;
        
        // 司令官情報（Game.jsで設定される）
        this.commanderInfo = null;
        
        // イベントリスナー
        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointermove', this.onPointerMove.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerupoutside', this.onPointerUp.bind(this));
    }
    
    // ゲームステージにゴーストフリートを追加
    initializeGhostFleet(gameStage) {
        if (gameStage && this.ghostFleet) {
            gameStage.addChild(this.ghostFleet);
        }
    }
    
    // 艦隊の三角形描画
    drawShip() {
        this.shipGraphics.clear();
        
        // 三角形の座標（上向きの矢印形状）
        const points = [
            0, -15,    // 先端（上）
            -12, 10,   // 左下
            12, 10     // 右下
        ];
        
        this.shipGraphics.poly(points);
        this.shipGraphics.fill(this.shipColor);
        this.shipGraphics.stroke({ width: 1, color: 0xffffff, alpha: 0.8 });
        
        // 向きに応じて回転（shipコンテナ全体を回転）
        this.ship.rotation = this.facing;
    }
    
    // 提督の能力値に基づいて艦隊性能を更新
    updateFleetPerformance() {
        if (!this.commanderInfo) {
            // 司令官未配属時はデフォルト値を使用
            this.moveSpeed = this.baseMoveSpeed;
            this.rotationSpeed = this.baseRotationSpeed;
            this.attackPower = this.baseAttackPower;
            this.defensePower = this.baseDefensePower;
            return;
        }
        
        // 各能力値を取得（司令官、副司令官、参謀の順で優先）
        let mobilityValue = null;
        let attackValue = null;
        let defenseValue = null;
        
        if (this.commanderInfo.commander_last_name) {
            mobilityValue = this.getCommanderAbility('commander', 'mobility');
            attackValue = this.getCommanderAbility('commander', 'attack');
            defenseValue = this.getCommanderAbility('commander', 'defense');
        } else if (this.commanderInfo.vice_last_name) {
            mobilityValue = this.getCommanderAbility('vice', 'mobility');
            attackValue = this.getCommanderAbility('vice', 'attack');
            defenseValue = this.getCommanderAbility('vice', 'defense');
        } else if (this.commanderInfo.staff_last_name) {
            mobilityValue = this.getCommanderAbility('staff', 'mobility');
            attackValue = this.getCommanderAbility('staff', 'attack');
            defenseValue = this.getCommanderAbility('staff', 'defense');
        }
        
        // 機動能力の適用
        if (mobilityValue !== null) {
            // 移動速度計算（機動能力 60-120 → 速度倍率 0.8-2.0）
            const mobilityRatio = Math.max(0.8, Math.min(2.0, (mobilityValue - 60) / 30 + 0.8));
            this.moveSpeed = this.baseMoveSpeed * mobilityRatio;
            
            // 回転速度計算（機動能力 60-120 → 回転倍率 0.7-1.8）
            const rotationRatio = Math.max(0.7, Math.min(1.8, (mobilityValue - 60) / 40 + 0.7));
            this.rotationSpeed = this.baseRotationSpeed * rotationRatio;
        } else {
            this.moveSpeed = this.baseMoveSpeed;
            this.rotationSpeed = this.baseRotationSpeed;
        }
        
        // 攻撃力の適用
        if (attackValue !== null) {
            // 攻撃力計算（攻撃能力 60-120 → 攻撃倍率 0.7-1.8）
            const attackRatio = Math.max(0.7, Math.min(1.8, (attackValue - 60) / 30 + 0.7));
            this.attackPower = Math.round(this.baseAttackPower * attackRatio);
        } else {
            this.attackPower = this.baseAttackPower;
        }
        
        // 防御力の適用
        if (defenseValue !== null) {
            // 防御力計算（防御能力 60-120 → 防御倍率 0.8-2.0）
            const defenseRatio = Math.max(0.8, Math.min(2.0, (defenseValue - 60) / 30 + 0.8));
            this.defensePower = Math.round(this.baseDefensePower * defenseRatio);
        } else {
            this.defensePower = this.baseDefensePower;
        }
        
        console.log(`${this.name}: 機動${mobilityValue}, 攻撃${attackValue}, 防御${defenseValue} → 移動${this.moveSpeed.toFixed(2)}, 攻撃${this.attackPower}, 防御${this.defensePower}`);
    }
    
    // 司令官の能力値を取得（JSONデータベース）
    getCommanderAbility(position, abilityType) {
        if (!this.commanderInfo) return null;
        
        let admiralId = null;
        if (position === 'commander') {
            // 司令官の提督IDを取得するため、データベースサービスから検索
            const lastName = this.commanderInfo.commander_last_name;
            const firstName = this.commanderInfo.commander_first_name;
            if (lastName && firstName) {
                admiralId = this.findAdmiralId(lastName, firstName);
            }
        } else if (position === 'vice') {
            const lastName = this.commanderInfo.vice_last_name;
            const firstName = this.commanderInfo.vice_first_name;
            if (lastName && firstName) {
                admiralId = this.findAdmiralId(lastName, firstName);
            }
        } else if (position === 'staff') {
            const lastName = this.commanderInfo.staff_last_name;
            const firstName = this.commanderInfo.staff_first_name;
            if (lastName && firstName) {
                admiralId = this.findAdmiralId(lastName, firstName);
            }
        }
        
        if (!admiralId) return null;
        
        // DatabaseServiceから能力値を取得
        const dbService = window.gameState?.dbService;
        if (!dbService) return 75; // デフォルト値
        
        const abilities = dbService.getAdmiralAbilities(admiralId);
        return abilities ? abilities[abilityType] || 75 : 75;
    }
    
    // 提督名から提督IDを検索
    findAdmiralId(lastName, firstName) {
        const dbService = window.gameState?.dbService;
        if (!dbService || !dbService.admiralsData) return null;
        
        const admiral = dbService.admiralsData.admirals.find(a => 
            a.lastName === lastName && a.firstName === firstName
        );
        
        return admiral ? admiral.id : null;
    }
    
    // 前方射程楕円を描画
    drawRangeEllipse() {
        this.rangeEllipse.clear();
        
        // 前方方向の楕円形射程（縦長で前方に延びる形状）
        const ellipseWidth = this.range * 0.6; // 横幅は射程の60%
        const ellipseHeight = this.range * 1.2; // 縦は射程の120%
        
        // 楕円を描画（中心より前方寄りに配置）
        this.rangeEllipse.ellipse(0, -this.range * 0.2, ellipseWidth, ellipseHeight);
        this.rangeEllipse.stroke({ width: 1, color: 0xff4444, alpha: 0.3 });
        this.rangeEllipse.fill({ color: 0xff4444, alpha: 0.1 });
        
        // 艦隊の向きに応じて回転
        this.rangeEllipse.rotation = this.facing;
    }
    
    // ZOC範囲を描画
    drawZOCRange() {
        this.zocCircle.clear();
        
        // 円形のZOC範囲
        this.zocCircle.circle(0, 0, this.zocRange);
        this.zocCircle.stroke({ width: 2, color: 0x9900ff, alpha: 0.4 });
        this.zocCircle.fill({ color: 0x9900ff, alpha: 0.08 });
    }
    
    // 移動予定地点のゴースト艦隊を描画
    drawGhostFleet() {
        this.ghostFleetGraphics.clear();
        
        // 薄い三角形の座標（実際の艦隊と同じ形状）
        const points = [
            0, -15,    // 先端（上）
            -12, 10,   // 左下
            12, 10     // 右下
        ];
        
        // 半透明で薄く描画
        this.ghostFleetGraphics.poly(points);
        this.ghostFleetGraphics.fill({ color: this.shipColor, alpha: 0.3 });
        this.ghostFleetGraphics.stroke({ width: 1, color: this.shipColor, alpha: 0.5 });
        
        // 移動先の位置に配置
        this.updateGhostPosition();
    }
    
    // ゴースト艦隊の位置と向きを更新
    updateGhostPosition() {
        if (!this.ghostFleet) return;
        
        // 移動予定地点に配置（絶対座標で設定）
        this.ghostFleet.x = this.targetX;
        this.ghostFleet.y = this.targetY;
        
        // 移動方向に向きを設定
        if (this.targetX !== this.x || this.targetY !== this.y) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const targetFacing = Math.atan2(dy, dx) + Math.PI / 2;
            this.ghostFleet.rotation = targetFacing; // コンテナ全体を回転（番号も一緒に回転）
        }
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
    
    
    // 選択状態にする
    select() {
        console.log(`${this.name}.select() 呼び出し - faction: ${this.faction}, playerFaction: ${window.gameState?.playerFaction}`);
        
        // プレイヤー陣営の艦隊のみ選択可能
        if (this.faction === window.gameState?.playerFaction) {
            window.gameState.fleets.forEach(fleet => {
                if (fleet !== this && fleet.faction === this.faction) {
                    // 他の艦隊のゴーストフリートの状態を保存
                    const wasGhostVisible = fleet.ghostFleet && fleet.ghostFleet.visible && 
                                          (fleet.targetX !== fleet.x || fleet.targetY !== fleet.y);
                    
                    fleet.deselect();
                    
                    // 移動中の艦隊のゴーストフリートを復元
                    if (wasGhostVisible) {
                        fleet.drawGhostFleet();
                        fleet.ghostFleet.visible = true;
                    }
                }
            });
            
            this.isSelected = true;
            console.log(`${this.name} 選択完了: isSelected = ${this.isSelected}`);
            
            // 選択エフェクト
            if (window.gameState.effects) {
                window.gameState.effects.createSelectionRing(this.x, this.y);
            }
            
            // 選択音再生
            if (window.gameState.audio) {
                window.gameState.audio.playSelect();
            }
            
            console.log(`${this.name} が選択されました (位置: ${Math.round(this.x)}, ${Math.round(this.y)})`);
        } else {
            console.log(`${this.name} 選択失敗: プレイヤー陣営ではありません (faction: ${this.faction}, playerFaction: ${window.gameState?.playerFaction})`);
        }
    }
    
    // 選択状態を解除
    deselect() {
        this.isSelected = false;
        this.selectionBorder.visible = false;
        this.rangeEllipse.visible = false; // 射程表示も隠す
        this.zocCircle.visible = false; // ZOC表示も隠す
        // ゴースト艦隊は移動中の場合は表示し続ける
        if (this.targetX === this.x && this.targetY === this.y) {
            this.ghostFleet.visible = false; // 移動予定がない場合のみ隠す
        }
        this.interactionMode = 'none';
        this.updateSelectionDisplay();
    }
    
    // 移動モードに設定
    setMoveMode() {
        this.interactionMode = 'move';
        this.updateSelectionDisplay();
        console.log(`${this.name}: 移動モードに設定`);
    }
    
    // 回転モードに設定  
    setRotationMode() {
        this.interactionMode = 'rotate';
        this.updateSelectionDisplay();
        console.log(`${this.name}: 回転モードに設定`);
    }
    
    // 選択表示を更新（モードに応じて色を変更）
    updateSelectionDisplay() {
        if (!this.isSelected) {
            // 選択されていない場合はすべての表示を隠す
            this.rangeEllipse.visible = false;
            this.zocCircle.visible = false;
            this.ghostFleet.visible = false;
            return;
        }
        
        this.selectionBorder.clear();
        let borderColor = 0xffff00; // デフォルト黄色
        
        if (this.interactionMode === 'move') {
            borderColor = 0x00ff00; // 緑色（移動モード）
            this.rangeEllipse.visible = false; // 移動モードでは射程を隠す
            this.zocCircle.visible = false; // 移動モードではZOCを隠す
            // 移動モードでは移動予定地点にゴースト艦隊を表示
            if (this.targetX !== this.x || this.targetY !== this.y) {
                this.drawGhostFleet();
                this.ghostFleet.visible = true;
            } else {
                this.ghostFleet.visible = false;
            }
        } else if (this.interactionMode === 'rotate') {
            borderColor = 0xff4444; // 赤色（回転モード）
            // 回転モードでは前方楕円射程とZOCを同時表示
            this.drawRangeEllipse();
            this.rangeEllipse.visible = true;
            this.drawZOCRange();
            this.zocCircle.visible = true;
            this.ghostFleet.visible = false; // 回転モードではゴースト艦隊を隠す
        } else {
            this.rangeEllipse.visible = false; // 待機モードでは射程を隠す
            this.zocCircle.visible = false; // 待機モードではZOCを隠す
            // 待機モードでも移動中の場合はゴースト艦隊を表示し続ける
            if (this.targetX !== this.x || this.targetY !== this.y) {
                this.drawGhostFleet();
                this.ghostFleet.visible = true;
            } else {
                this.ghostFleet.visible = false;
            }
        }
        
        this.selectionBorder.circle(0, 0, 25);
        this.selectionBorder.stroke({ width: 2, color: borderColor, alpha: 0.8 });
        this.selectionBorder.visible = true;
    }
    
    // 目標地点に向かって移動
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        
        // 移動方向を計算
        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 距離が十分ある場合のみ回転してから移動
        if (distance > 10) {
            const moveDirection = Math.atan2(dy, dx) + Math.PI / 2; // 上向きを0として調整
            
            // 移動方向に回転を設定し、移動待機状態にする
            this.targetFacing = moveDirection;
            this.isRotating = true;
            this.isWaitingToMove = true;
            
            console.log(`${this.name} が (${x}, ${y}) への移動準備：回転完了後に移動開始`);
        } else {
            // 距離が短い場合は直接移動
            this.isWaitingToMove = false;
            console.log(`${this.name} が (${x}, ${y}) に即座に移動開始`);
        }
        
        // ゴースト艦隊の位置を更新
        this.updateGhostPosition();
        
        // 移動先が確定したので選択を解除
        this.deselect();
        
        // 移動開始フラグを設定
        this.isMoving = true;
        
        // 選択解除後もゴースト艦隊を表示
        if (this.targetX !== this.x || this.targetY !== this.y) {
            this.drawGhostFleet();
            this.ghostFleet.visible = true;
        }
    }
    
    // 移動をキャンセルする（交戦時に使用）
    cancelMove() {
        const currentTime = Date.now();
        
        // クールダウン中は移動キャンセルを無効化
        if (currentTime - this.lastMoveCancelTime < this.moveCancelCooldown) {
            const remainingTime = Math.ceil((this.moveCancelCooldown - (currentTime - this.lastMoveCancelTime)) / 1000);
            console.log(`${this.name}: 移動キャンセルクールダウン中 (残り${remainingTime}秒)`);
            return;
        }
        
        if (this.isMoving) {
            console.log(`${this.name}: 交戦により移動をキャンセル`);
            this.targetX = this.x;
            this.targetY = this.y;
            this.isMoving = false;
            this.isWaitingToMove = false;
            this.lastMoveCancelTime = currentTime; // キャンセル時刻を記録
            
            // ゴースト艦隊を隠す
            if (this.ghostFleet) {
                this.ghostFleet.visible = false;
            }
        }
    }
    
    // 指定方向に回転（目標角度を設定）
    rotateTo(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const targetAngle = Math.atan2(dy, dx) + Math.PI / 2; // 上向きを0として調整
        
        this.targetFacing = targetAngle;
        this.isRotating = true;
        
        // 回転方向が決まったので選択を解除
        this.deselect();
        
        console.log(`${this.name} が角度 ${Math.round(targetAngle * 180 / Math.PI)}度 への回転開始（選択解除）`);
    }
    
    // 滑らかな回転処理
    updateRotation() {
        if (!this.isRotating) return;
        
        // 現在の角度と目標角度の差を計算
        let angleDiff = this.targetFacing - this.facing;
        
        // 角度を-π～πの範囲に正規化（最短回転方向を選択）
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // 目標角度に十分近い場合は回転完了
        if (Math.abs(angleDiff) < 0.01) {
            this.facing = this.targetFacing;
            this.isRotating = false;
            console.log(`${this.name} 回転完了: ${Math.round(this.facing * 180 / Math.PI)}度`);
            
            // 移動待機中だった場合、移動開始
            if (this.isWaitingToMove) {
                this.isWaitingToMove = false;
                console.log(`${this.name} 回転完了により移動開始`);
            }
        } else {
            // 回転方向を決定して少しずつ回転
            const rotationDirection = Math.sign(angleDiff);
            const rotationAmount = Math.min(Math.abs(angleDiff), this.rotationSpeed);
            
            this.facing += rotationDirection * rotationAmount;
        }
        
        // 艦隊の描画を更新
        this.drawShip();
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
            this.isInAttackRange(fleet)
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
    
    // 前方楕円形攻撃範囲内にいるかチェック
    isInAttackRange(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        // 攻撃者の向きに応じて座標変換
        const cos = Math.cos(-this.facing);
        const sin = Math.sin(-this.facing);
        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;
        
        // 楕円の半径（描画と同じ比率）
        const ellipseWidth = this.range * 0.6; // 横幅60%
        const ellipseHeight = this.range * 1.2; // 縦120%
        const offsetY = -this.range * 0.2; // 前方オフセット
        
        // 楕円判定（中心からのオフセットを考慮）
        const adjustedY = rotatedY - offsetY;
        const ellipseTest = (rotatedX * rotatedX) / (ellipseWidth * ellipseWidth) + 
                           (adjustedY * adjustedY) / (ellipseHeight * ellipseHeight);
        
        return ellipseTest <= 1.0;
    }
    
    // ZOC範囲内にいるかチェック
    isInZOCRange(otherFleet) {
        return this.getDistanceTo(otherFleet) <= this.zocRange;
    }
    
    // ZOC内の最も近い敵を検索
    findNearestEnemyInZOC() {
        // 手動回転中やゲーム終了時は無効
        if (this.isRotating || this.currentHP <= 0) {
            return null;
        }
        
        const enemies = window.gameState.fleets.filter(fleet => 
            fleet.faction !== this.faction && 
            fleet.currentHP > 0 &&
            this.isInZOCRange(fleet)
        );
        
        // 最も近い敵を選択
        if (enemies.length > 0) {
            return enemies.reduce((closest, enemy) => 
                this.getDistanceTo(enemy) < this.getDistanceTo(closest) ? enemy : closest
            );
        }
        return null;
    }
    
    // ZOC自動回転処理
    updateZOCRotation() {
        // 手動回転中は無効
        if (this.isRotating) {
            this.isZOCRotating = false;
            this.zocTarget = null;
            return;
        }
        
        const nearestEnemy = this.findNearestEnemyInZOC();
        
        if (nearestEnemy) {
            // ZOC内に敵がいる場合
            this.zocTarget = nearestEnemy;
            this.isZOCRotating = true;
            
            // 敵の方向を計算
            const dx = nearestEnemy.x - this.x;
            const dy = nearestEnemy.y - this.y;
            const targetFacing = Math.atan2(dy, dx) + Math.PI / 2;
            
            // 滑らかに回転
            let angleDiff = targetFacing - this.facing;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            if (Math.abs(angleDiff) > 0.05) {
                const rotationDirection = Math.sign(angleDiff);
                const rotationAmount = Math.min(Math.abs(angleDiff), this.rotationSpeed * 0.8);
                this.facing += rotationDirection * rotationAmount;
                this.drawShip();
            }
        } else {
            // ZOC内に敵がいない場合
            this.isZOCRotating = false;
            this.zocTarget = null;
        }
    }
    
    // 艦隊の完全削除処理
    destroy() {
        try {
            // ゴースト艦隊をステージから削除
            if (this.ghostFleet && this.ghostFleet.parent) {
                this.ghostFleet.parent.removeChild(this.ghostFleet);
                this.ghostFleet.destroy();
                console.log(`${this.name} のゴースト艦隊を削除`);
            }
            
            // 選択状態をクリア
            this.deselect();
            
            // 本体をステージから削除
            if (this.parent) {
                this.parent.removeChild(this);
            }
            
            console.log(`${this.name} を完全削除しました`);
        } catch (error) {
            console.error(`${this.name} 削除中にエラー:`, error);
        }
    }
    
    // 攻撃実行
    attack(target) {
        const currentTime = Date.now();
        this.lastAttackTime = currentTime;
        
        // 交戦開始時に移動をキャンセル（攻撃側と被攻撃側両方）
        this.cancelMove();
        target.cancelMove();
        
        // ダメージ計算（攻撃力 - 防御力、最小ダメージは攻撃力の20%）
        const baseDamage = this.attackPower;
        const reducedDamage = baseDamage - target.defensePower;
        const finalDamage = Math.max(Math.round(baseDamage * 0.2), reducedDamage);
        
        // ビームエフェクト作成
        if (window.gameState.effects) {
            const beamColor = this.faction === 'alliance' ? 0x4444ff : 0xff4444;
            window.gameState.effects.createBeamEffect(this.x, this.y, target.x, target.y, beamColor);
            
            // ダメージテキスト表示
            window.gameState.effects.createDamageText(target.x, target.y - 30, finalDamage);
        }
        
        // レーザー音再生
        if (window.gameState.audio) {
            window.gameState.audio.playLaser();
        }
        
        // 戦闘状態を両艦隊に設定（戦闘時視界特例のため）
        this.isInCombat = true;
        this.lastCombatTime = currentTime;
        target.isInCombat = true;
        target.lastCombatTime = currentTime;
        
        const isDestroyed = target.takeDamage(finalDamage);
        console.log(`${this.name} が ${target.name} を攻撃！ ダメージ: ${finalDamage} (攻撃${baseDamage} - 防御${target.defensePower}) 残りHP: ${target.currentHP}`);
        
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
            
            // 撃破された艦隊を完全削除（ゴースト艦隊も含む）
            target.destroy();
            window.gameState.fleets = window.gameState.fleets.filter(f => f !== target);
        }
    }
    
    // 向きを滑らかに更新（戦闘時の応戦など）
    updateFacing(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const newFacing = Math.atan2(dy, dx) + Math.PI / 2; // 上向きを0として調整
        
        // 現在の角度と目標角度の差を計算
        let angleDiff = newFacing - this.facing;
        
        // 角度を-π～πの範囲に正規化（最短回転方向を選択）
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // 目標角度に十分近い場合は完了
        if (Math.abs(angleDiff) < 0.05) {
            this.facing = newFacing;
            this.drawShip();
        } else if (Math.abs(angleDiff) > 0.1) {
            // 滑らかな回転（戦闘時の自動向き調整）
            const rotationDirection = Math.sign(angleDiff);
            const rotationAmount = Math.min(Math.abs(angleDiff), this.rotationSpeed * 0.7); // 戦闘時は少し速め
            
            this.facing += rotationDirection * rotationAmount;
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
        
        // 回転アニメーション処理
        this.updateRotation();
        
        // 画面外の場合は処理を軽量化
        const onScreen = this.isOnScreen();
        
        // 移動処理（回転待機中でない場合のみ）
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (!this.isWaitingToMove && distance >= this.moveSpeed) {
            const directionX = dx / distance;
            const directionY = dy / distance;
            const oldX = this.x;
            const oldY = this.y;
            
            // 直接移動時は速度を調整
            const currentMoveSpeed = this.isDirectMoving ? 
                this.moveSpeed * this.directMoveSpeed : this.moveSpeed;
            
            this.x += directionX * currentMoveSpeed;
            this.y += directionY * currentMoveSpeed;
            
            // ゴースト艦隊の位置を移動に合わせて更新
            this.updateGhostPosition();
            
            // デバッグログ（移動中のみ）
            if (distance > 10) { // 10ピクセル以上離れている時のみ表示
                console.log(`${this.name} 移動中: (${Math.round(oldX)},${Math.round(oldY)}) -> (${Math.round(this.x)},${Math.round(this.y)}) 目標:(${Math.round(this.targetX)},${Math.round(this.targetY)})`);
            }
            
            // 画面内で回転モードでない場合、かつ直接移動中でない場合のみ向きを詳細更新
            if (onScreen && this.interactionMode !== 'rotate' && !this.isRotating && !this.isDirectMoving) {
                this.updateFacing(this.targetX, this.targetY);
            }
        } else if (!this.isWaitingToMove) {
            this.x = this.targetX;
            this.y = this.targetY;
            
            // 移動完了フラグをリセット
            this.isMoving = false;
            this.isDirectMoving = false; // 直接移動フラグもリセット
            
            // 目標に到達したらゴースト艦隊を隠す
            if (this.ghostFleet && this.ghostFleet.visible) {
                this.ghostFleet.visible = false;
            }
        }
        
        // ZOC処理（画面内の艦隊のみ）
        if (onScreen) {
            this.updateZOCRotation();
        }
        
        // 戦闘処理
        const target = this.findTarget();
        if (target) {
            // 攻撃対象に向きを変更（手動回転中・ZOC回転中を除く）
            if (onScreen && this.interactionMode !== 'rotate' && !this.isRotating && !this.isZOCRotating) {
                this.updateFacing(target.x, target.y);
            }
            this.attack(target);
        }
    }
    
    // ポインターダウン処理
    onPointerDown(event) {
        console.log(`艦隊クリック: ${this.name} (${this.faction}) - プレイヤー陣営: ${window.gameState?.playerFaction}`);
        if (event.button === 0 && this.faction === window.gameState.playerFaction) { // 左クリック - 艦隊選択（プレイヤー陣営のみ）
            const currentTime = Date.now();
            const timeSinceLastClick = currentTime - (this.lastClickTime || 0);
            this.lastClickTime = currentTime;
            
            if (timeSinceLastClick < this.doubleClickDelay && this.isSelected) {
                // ダブルクリック: 回転モード
                this.setRotationMode();
            } else {
                // シングルクリック: 選択して移動モード
                this.select();
                this.setMoveMode();
            }
            
            event.stopPropagation();
            console.log(`${this.name}: 選択されました (モード: ${this.interactionMode})`);
        } else {
            console.log(`${this.name}: 選択できません - 理由: button=${event.button}, faction=${this.faction}, playerFaction=${window.gameState?.playerFaction}, isSelected=${this.isSelected}`);
        }
        
        if (event.button === 2 && this.isSelected) { // 右クリック - ドラッグ開始
            event.stopPropagation();
            this.isDragging = true;
            this.dragStartX = event.global.x;
            this.dragStartY = event.global.y;
            
            // ドラッグ開始時にゴースト艦隊を表示
            if (this.ghostFleet) {
                this.ghostFleet.visible = true;
                this.ghostFleet.x = this.x;
                this.ghostFleet.y = this.y;
                this.ghostFleet.rotation = this.facing; // 現在の向きを維持
            }
            
            console.log(`${this.name}: 右クリックドラッグ開始`);
        }
    }
    
    // ドラッグ中の処理
    onPointerMove(event) {
        if (this.isDragging && this.isSelected) {
            const currentX = event.global.x;
            const currentY = event.global.y;
            
            // ゲームエリア内に制限
            const gameArea = window.gameState?.gameArea;
            if (gameArea) {
                const margin = 30;
                const constrainedX = Math.max(gameArea.x + margin, 
                                    Math.min(gameArea.x + gameArea.width - margin, currentX));
                const constrainedY = Math.max(gameArea.y + margin, 
                                    Math.min(gameArea.y + gameArea.height - margin, currentY));
                
                // ゴースト艦隊の位置を更新
                if (this.ghostFleet) {
                    this.ghostFleet.x = constrainedX;
                    this.ghostFleet.y = constrainedY;
                    // 向きは変更せず現在の向きを維持
                }
            }
        }
    }
    
    // ドラッグ終了
    onPointerUp(event) {
        if (this.isDragging && this.isSelected) {
            const endX = event.global.x;
            const endY = event.global.y;
            const dragDistance = Math.sqrt(
                Math.pow(endX - this.dragStartX, 2) + 
                Math.pow(endY - this.dragStartY, 2)
            );
            
            // 最小ドラッグ距離をチェック（誤操作防止）
            if (dragDistance >= 20) {
                // ゲームエリア内に制限
                const gameArea = window.gameState?.gameArea;
                if (gameArea) {
                    const margin = 30;
                    const constrainedX = Math.max(gameArea.x + margin, 
                                        Math.min(gameArea.x + gameArea.width - margin, endX));
                    const constrainedY = Math.max(gameArea.y + margin, 
                                        Math.min(gameArea.y + gameArea.height - margin, endY));
                    
                    // 直接移動を実行（回転なし）
                    this.directMoveTo(constrainedX, constrainedY);
                    console.log(`${this.name}: 直接移動指示 -> (${Math.round(constrainedX)}, ${Math.round(constrainedY)})`);
                }
            } else {
                // ドラッグ距離が短い場合はゴースト艦隊を隠す
                if (this.ghostFleet) {
                    this.ghostFleet.visible = true;
                }
            }
            
            this.isDragging = false;
        }
    }
    
    // 直接移動（回転なし）
    directMoveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isDirectMoving = true;
        this.isWaitingToMove = false; // 回転待機をスキップ
        this.isMoving = true;
        
        // ゴースト艦隊の最終位置を設定
        if (this.ghostFleet) {
            this.ghostFleet.x = x;
            this.ghostFleet.y = y;
            this.ghostFleet.rotation = this.facing; // 現在の向きを維持
            this.ghostFleet.visible = true;
        }
        
        // 選択状態を解除
        this.deselect();
    }
}