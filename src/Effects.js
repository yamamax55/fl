import * as PIXI from 'pixi.js';

export class Effects {
    constructor(app) {
        this.app = app;
        this.effectsContainer = new PIXI.Container();
        this.app.stage.addChild(this.effectsContainer);
        
        this.beamEffects = [];
        this.explosionEffects = [];
        this.damageTexts = [];
        
        this.particlePool = [];
        this.textPool = [];
        
        this.maxParticles = 100;
        this.maxBeams = 20;
    }
    
    createBeamEffect(fromX, fromY, toX, toY, color = 0xff4444) {
        if (this.beamEffects.length >= this.maxBeams) {
            return;
        }
        
        const beam = new PIXI.Graphics();
        
        beam.moveTo(fromX, fromY);
        beam.lineTo(toX, toY);
        beam.stroke({ width: 3, color: color, alpha: 0.8 });
        
        beam.moveTo(fromX, fromY);
        beam.lineTo(toX, toY);
        beam.stroke({ width: 8, color: color, alpha: 0.3 });
        
        this.effectsContainer.addChild(beam);
        
        const beamEffect = {
            graphics: beam,
            startTime: Date.now(),
            duration: 200
        };
        
        this.beamEffects.push(beamEffect);
    }
    
    createExplosionEffect(x, y, color = 0xff8800) {
        const explosion = {
            x: x,
            y: y,
            particles: [],
            startTime: Date.now(),
            duration: 1000
        };
        
        for (let i = 0; i < 20; i++) {
            const particle = new PIXI.Graphics();
            particle.circle(0, 0, Math.random() * 3 + 1);
            particle.fill(color);
            
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
            duration: 1500,
            startY: y
        };
        
        this.damageTexts.push(textEffect);
    }
    
    createHealEffect(x, y, amount) {
        this.createDamageText(x, y, `+${amount}`, 0x00ff00);
    }
    
    createSelectionRing(x, y, radius = 30) {
        const ring = new PIXI.Graphics();
        ring.circle(0, 0, radius);
        ring.stroke({ width: 2, color: 0xffff00, alpha: 0.8 });
        ring.x = x;
        ring.y = y;
        
        this.effectsContainer.addChild(ring);
        
        setTimeout(() => {
            if (ring.parent) {
                this.effectsContainer.removeChild(ring);
            }
        }, 300);
    }
    
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
                this.effectsContainer.removeChild(beam.graphics);
                this.beamEffects.splice(i, 1);
            } else {
                const alpha = 1 - (elapsed / beam.duration);
                beam.graphics.alpha = alpha;
            }
        }
    }
    
    updateExplosionEffects() {
        const currentTime = Date.now();
        
        for (let i = this.explosionEffects.length - 1; i >= 0; i--) {
            const explosion = this.explosionEffects[i];
            const elapsed = currentTime - explosion.startTime;
            
            if (elapsed >= explosion.duration) {
                explosion.particles.forEach(p => {
                    this.effectsContainer.removeChild(p.graphics);
                });
                this.explosionEffects.splice(i, 1);
            } else {
                explosion.particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.life -= particle.decay;
                    
                    particle.vy += 0.1;
                    
                    particle.graphics.x = particle.x;
                    particle.graphics.y = particle.y;
                    particle.graphics.alpha = Math.max(0, particle.life);
                    
                    const scale = particle.life;
                    particle.graphics.scale.set(scale);
                });
            }
        }
    }
    
    updateDamageTexts() {
        const currentTime = Date.now();
        
        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            const damageText = this.damageTexts[i];
            const elapsed = currentTime - damageText.startTime;
            
            if (elapsed >= damageText.duration) {
                this.effectsContainer.removeChild(damageText.text);
                this.damageTexts.splice(i, 1);
            } else {
                const progress = elapsed / damageText.duration;
                damageText.text.y = damageText.startY - (progress * 50);
                damageText.text.alpha = 1 - progress;
            }
        }
    }
    
    clearAllEffects() {
        this.beamEffects.forEach(beam => {
            this.effectsContainer.removeChild(beam.graphics);
        });
        this.beamEffects = [];
        
        this.explosionEffects.forEach(explosion => {
            explosion.particles.forEach(p => {
                this.effectsContainer.removeChild(p.graphics);
            });
        });
        this.explosionEffects = [];
        
        this.damageTexts.forEach(damageText => {
            this.effectsContainer.removeChild(damageText.text);
        });
        this.damageTexts = [];
    }
}