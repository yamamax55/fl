import * as PIXI from 'pixi.js';

// エフェクト管理クラス
export class Effects {
    constructor(app) {
        this.app = app;
        this.effectsContainer = new PIXI.Container();
        this.app.stage.addChild(this.effectsContainer);
        
        this.beamEffects = [];
        this.explosionEffects = [];
        this.damageTexts = [];
        
        // オブジェクトプール（再利用のため）
        this.particlePool = [];
        this.textPool = [];
        
        // パフォーマンス設定
        this.maxParticles = 100;
        this.maxBeams = 20;
    }
    
    // ビームエフェクト作成（パフォーマンス最適化版）
    createBeamEffect(fromX, fromY, toX, toY, color = 0xff4444) {
        // ビーム数制限
        if (this.beamEffects.length >= this.maxBeams) {
            return;
        }
        
        const beam = new PIXI.Graphics();
        
        // ビーム線を描画
        beam.moveTo(fromX, fromY);
        beam.lineTo(toX, toY);
        beam.stroke({ width: 3, color: color, alpha: 0.8 });
        
        // グロー効果用の太い線
        beam.moveTo(fromX, fromY);
        beam.lineTo(toX, toY);
        beam.stroke({ width: 8, color: color, alpha: 0.3 });
        
        this.effectsContainer.addChild(beam);
        
        // ビームエフェクトを配列に追加
        const beamEffect = {
            graphics: beam,
            startTime: Date.now(),
            duration: 200 // 200ms
        };
        
        this.beamEffects.push(beamEffect);
    }
    
    // 爆発パーティクルエフェクト
    createExplosionEffect(x, y, color = 0xff8800) {
        const explosion = {
            x: x,
            y: y,
            particles: [],
            startTime: Date.now(),
            duration: 1000 // 1秒
        };
        
        // パーティクルを複数作成
        for (let i = 0; i < 20; i++) {
            const particle = new PIXI.Graphics();
            particle.circle(0, 0, Math.random() * 3 + 1);
            particle.fill(color);
            
            // ランダムな初期位置と速度
            const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.5;
            const speed = Math.random() * 3 + 1;
            
            const particleData = {
                graphics: particle,
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02
            };
            
            particle.x = x;
            particle.y = y;
            this.effectsContainer.addChild(particle);
            explosion.particles.push(particleData);
        }
        
        this.explosionEffects.push(explosion);
    }
    
    // ダメージ数値ポップアップ
    createDamageText(x, y, damage, color = 0xff0000) {
        const damageStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: color,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 2
        });
        
        const damageText = new PIXI.Text(`-${damage}`, damageStyle);
        damageText.x = x;
        damageText.y = y;
        damageText.anchor.set(0.5);
        
        this.effectsContainer.addChild(damageText);
        
        const textEffect = {
            text: damageText,
            startTime: Date.now(),
            duration: 1500, // 1.5秒
            startY: y
        };
        
        this.damageTexts.push(textEffect);
    }
    
    // 回復エフェクト
    createHealEffect(x, y, amount) {
        this.createDamageText(x, y, `+${amount}`, 0x00ff00);
    }
    
    // 選択エフェクト（リング）
    createSelectionRing(x, y, radius = 30) {
        const ring = new PIXI.Graphics();
        ring.circle(0, 0, radius);
        ring.stroke({ width: 2, color: 0xffff00, alpha: 0.8 });
        ring.x = x;
        ring.y = y;
        
        this.effectsContainer.addChild(ring);
        
        const ringEffect = {
            graphics: ring,
            startTime: Date.now(),
            duration: 300,
            maxRadius: radius,
            currentRadius: 0
        };
        
        // アニメーション用の一時配列（簡単な実装）
        setTimeout(() => {
            if (ring.parent) {
                this.effectsContainer.removeChild(ring);
            }
        }, 300);
    }
    
    // エフェクトを更新
    update() {
        this.updateBeamEffects();
        this.updateExplosionEffects();
        this.updateDamageTexts();
    }
    
    updateBeamEffects() {
        const currentTime = Date.now();
        
        for (let i = this.beamEffects.length - 1; i >= 0; i--) {
            const beam = this.beamEffects[i];
            const elapsed = currentTime - beam.startTime;
            
            if (elapsed >= beam.duration) {
                // ビームエフェクトを削除
                this.effectsContainer.removeChild(beam.graphics);
                this.beamEffects.splice(i, 1);
            } else {
                // フェードアウト
                const alpha = 1 - (elapsed / beam.duration);
                beam.graphics.alpha = alpha;
            }
        }\n    }\n    \n    updateExplosionEffects() {\n        const currentTime = Date.now();\n        \n        for (let i = this.explosionEffects.length - 1; i >= 0; i--) {\n            const explosion = this.explosionEffects[i];\n            const elapsed = currentTime - explosion.startTime;\n            \n            if (elapsed >= explosion.duration) {\n                // 爆発エフェクトを削除\n                explosion.particles.forEach(p => {\n                    this.effectsContainer.removeChild(p.graphics);\n                });\n                this.explosionEffects.splice(i, 1);\n            } else {\n                // パーティクルを更新\n                explosion.particles.forEach(particle => {\n                    particle.x += particle.vx;\n                    particle.y += particle.vy;\n                    particle.life -= particle.decay;\n                    \n                    // 重力効果（下向きの加速）\n                    particle.vy += 0.1;\n                    \n                    particle.graphics.x = particle.x;\n                    particle.graphics.y = particle.y;\n                    particle.graphics.alpha = Math.max(0, particle.life);\n                    \n                    // サイズを徐々に小さく\n                    const scale = particle.life;\n                    particle.graphics.scale.set(scale);\n                });\n            }\n        }\n    }\n    \n    updateDamageTexts() {\n        const currentTime = Date.now();\n        \n        for (let i = this.damageTexts.length - 1; i >= 0; i--) {\n            const damageText = this.damageTexts[i];\n            const elapsed = currentTime - damageText.startTime;\n            \n            if (elapsed >= damageText.duration) {\n                // ダメージテキストを削除\n                this.effectsContainer.removeChild(damageText.text);\n                this.damageTexts.splice(i, 1);\n            } else {\n                // 上に移動してフェードアウト\n                const progress = elapsed / damageText.duration;\n                damageText.text.y = damageText.startY - (progress * 50);\n                damageText.text.alpha = 1 - progress;\n            }\n        }\n    }\n    \n    // すべてのエフェクトをクリア\n    clearAllEffects() {\n        // ビームエフェクトをクリア\n        this.beamEffects.forEach(beam => {\n            this.effectsContainer.removeChild(beam.graphics);\n        });\n        this.beamEffects = [];\n        \n        // 爆発エフェクトをクリア\n        this.explosionEffects.forEach(explosion => {\n            explosion.particles.forEach(p => {\n                this.effectsContainer.removeChild(p.graphics);\n            });\n        });\n        this.explosionEffects = [];\n        \n        // ダメージテキストをクリア\n        this.damageTexts.forEach(damageText => {\n            this.effectsContainer.removeChild(damageText.text);\n        });\n        this.damageTexts = [];\n    }\n}