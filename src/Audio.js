export class Audio {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.isInitialized = false;
        this.isMuted = false;
        this.masterVolume = 0.3;
        
        this.bgmGainNode = null;
        this.sfxGainNode = null;
        this.currentBGM = null;
        
        this.soundDefinitions = {
            laser: {
                frequency: 800,
                duration: 0.1,
                type: 'square'
            },
            explosion: {
                frequency: 200,
                duration: 0.5,
                type: 'sawtooth'
            },
            select: {
                frequency: 600,
                duration: 0.05,
                type: 'sine'
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.masterVolume;
            this.masterGainNode.connect(this.audioContext.destination);
            
            this.bgmGainNode = this.audioContext.createGain();
            this.bgmGainNode.gain.value = 0.2;
            this.bgmGainNode.connect(this.masterGainNode);
            
            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.gain.value = 0.5;
            this.sfxGainNode.connect(this.masterGainNode);
            
            this.isInitialized = true;
            console.log('Audio system initialized');
            
        } catch (error) {
            console.warn('Audio system initialization failed:', error);
        }
    }
    
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('Audio context resumed');
        }
    }
    
    createSound(definition, gainNode = this.sfxGainNode) {
        if (!this.isInitialized || this.isMuted) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainControl = this.audioContext.createGain();
            
            oscillator.type = definition.type;
            oscillator.frequency.value = definition.frequency;
            
            const now = this.audioContext.currentTime;
            gainControl.gain.setValueAtTime(0, now);
            gainControl.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gainControl.gain.exponentialRampToValueAtTime(0.01, now + definition.duration);
            
            oscillator.connect(gainControl);
            gainControl.connect(gainNode);
            
            oscillator.start(now);
            oscillator.stop(now + definition.duration);
            
            return oscillator;
        } catch (error) {
            console.warn('Sound playback error:', error);
        }
    }
    
    async startBGM() {
        if (!this.isInitialized || this.isMuted || this.currentBGM) return;
        
        try {
            const playNote = (frequency, startTime, duration) => {
                const oscillator = this.audioContext.createOscillator();
                const gainControl = this.audioContext.createGain();
                
                oscillator.type = 'triangle';
                oscillator.frequency.value = frequency;
                
                gainControl.gain.setValueAtTime(0, startTime);
                gainControl.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
                gainControl.gain.linearRampToValueAtTime(0.05, startTime + duration - 0.1);
                gainControl.gain.linearRampToValueAtTime(0, startTime + duration);
                
                oscillator.connect(gainControl);
                gainControl.connect(this.bgmGainNode);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };
            
            const createBGMLoop = () => {
                const now = this.audioContext.currentTime;
                const notes = [220, 247, 262, 294, 330, 294, 262, 247];
                
                notes.forEach((freq, index) => {
                    playNote(freq, now + index * 1, 0.8);
                });
                
                this.currentBGM = setTimeout(createBGMLoop, 8000);
            };
            
            createBGMLoop();
            console.log('BGM started');
            
        } catch (error) {
            console.warn('BGM playback error:', error);
        }
    }
    
    stopBGM() {
        if (this.currentBGM) {
            clearTimeout(this.currentBGM);
            this.currentBGM = null;
            console.log('BGM stopped');
        }
    }
    
    playLaser() {
        this.createSound(this.soundDefinitions.laser);
    }
    
    playExplosion() {
        this.createSound(this.soundDefinitions.explosion);
    }
    
    playSelect() {
        this.createSound(this.soundDefinitions.select);
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
    }
    
    setBGMVolume(volume) {
        if (this.bgmGainNode) {
            this.bgmGainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    setSFXVolume(volume) {
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
        }
        
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        
        return this.isMuted;
    }
    
    destroy() {
        this.stopBGM();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}