import { Game } from './Game.js';
import { TitleScreen } from './TitleScreen.js';
import { FactionSelectScreen } from './FactionSelectScreen.js';
import { AdmiralListScreen } from './AdmiralListScreen.js';
import { StrategicPhaseScreen } from './StrategicPhaseScreen.js';
import { FleetListScreen } from './FleetListScreen.js';
import admiralsData from '../public/data/admirals.json';
import * as PIXI from 'pixi.js';

// グローバル状態管理
let currentScreen = 'title'; // 'title' | 'faction' | 'admirals' | 'strategic' | 'fleets' | 'game'
let app = null;
let titleScreen = null;
let factionSelectScreen = null;
let admiralListScreen = null;
let strategicPhaseScreen = null;
let fleetListScreen = null;
let game = null;
let selectedFaction = null;
let gameState = {
    currentPhase: 'strategic', // 'strategic' | 'tactical'
    currentPlayer: 'alliance',
    turn: 1
};

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('JavaScript エラー:', e.error);
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = 'エラーが発生しました。コンソールを確認してください。';
        loading.style.color = 'red';
    }
});

// PIXI アプリケーション初期化
async function initApp() {
    try {
        app = new PIXI.Application();
        
        await app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        document.body.appendChild(app.canvas);
        console.log('PIXI Application初期化完了');
        
        return app;
    } catch (error) {
        console.error('PIXI初期化エラー:', error);
        throw error;
    }
}

// タイトル画面初期化
async function initTitleScreen() {
    try {
        titleScreen = new TitleScreen(app);
        
        // 陣営選択画面への遷移コールバック設定
        titleScreen.setOnStartCallback(() => {
            transitionToFactionSelect();
        });
        
        // 提督一覧画面への遷移コールバック設定
        titleScreen.setOnAdmiralsCallback(() => {
            transitionToAdmiralList();
        });
        
        app.stage.addChild(titleScreen);
        titleScreen.show();
        
        console.log('タイトル画面初期化完了');
    } catch (error) {
        console.error('タイトル画面初期化エラー:', error);
        throw error;
    }
}

// 提督一覧画面への遷移
async function transitionToAdmiralList() {
    try {
        console.log('提督一覧画面に遷移中...');
        
        // タイトル画面を隠す
        if (titleScreen) {
            titleScreen.hide();
            app.stage.removeChild(titleScreen);
        }
        
        // 提督一覧画面を初期化
        if (!admiralListScreen) {
            admiralListScreen = new AdmiralListScreen(app, admiralsData);
            
            // 戻るコールバック設定
            admiralListScreen.onBack = () => {
                returnToTitle();
            };
        }
        
        app.stage.addChild(admiralListScreen.getContainer());
        
        currentScreen = 'admirals';
        console.log('提督一覧画面遷移完了');
        
    } catch (error) {
        console.error('提督一覧画面遷移エラー:', error);
        returnToTitle();
    }
}

// 陣営選択画面への遷移
async function transitionToFactionSelect() {
    try {
        console.log('陣営選択画面に遷移中...');
        
        // タイトル画面を隠す
        if (titleScreen) {
            titleScreen.hide();
            app.stage.removeChild(titleScreen);
        }
        
        // 陣営選択画面を初期化
        if (!factionSelectScreen) {
            factionSelectScreen = new FactionSelectScreen(app);
            
            // コールバック設定
            factionSelectScreen.setOnFactionSelectCallback((faction) => {
                selectedFaction = faction;
                transitionToStrategicPhase();
            });
            
            factionSelectScreen.setOnBackCallback(() => {
                returnToTitle();
            });
        }
        
        app.stage.addChild(factionSelectScreen);
        factionSelectScreen.show();
        
        currentScreen = 'faction';
        console.log('陣営選択画面遷移完了');
        
    } catch (error) {
        console.error('陣営選択画面遷移エラー:', error);
        returnToTitle();
    }
}

// 戦略フェーズ画面への遷移
async function transitionToStrategicPhase() {
    try {
        console.log(`戦略フェーズ画面に遷移中... (選択陣営: ${selectedFaction})`);
        
        // 陣営選択画面を隠す
        if (factionSelectScreen) {
            factionSelectScreen.hide();
            app.stage.removeChild(factionSelectScreen);
        }
        
        // 戦略フェーズ画面を初期化
        if (!strategicPhaseScreen) {
            strategicPhaseScreen = new StrategicPhaseScreen(app);
            
            // 非同期初期化を実行
            await strategicPhaseScreen.init();
            
            // 戦術フェーズへの遷移コールバック設定
            strategicPhaseScreen.setOnBattleCallback((territoryData) => {
                transitionToTacticalPhase(territoryData);
            });
            
            // 艦隊一覧画面への遷移コールバック設定
            strategicPhaseScreen.onFleetListCallback = () => {
                transitionToFleetList();
            };
            
            // 戻るコールバック設定
            strategicPhaseScreen.setOnBackCallback(() => {
                returnToTitle();
            });
        }
        
        // 選択陣営を戦略フェーズ画面に設定
        strategicPhaseScreen.setPlayerFaction(selectedFaction);
        
        app.stage.addChild(strategicPhaseScreen.getContainer());
        strategicPhaseScreen.show();
        
        currentScreen = 'strategic';
        console.log('戦略フェーズ画面遷移完了');
        
    } catch (error) {
        console.error('戦略フェーズ画面遷移エラー:', error);
        returnToTitle();
    }
}

// 戦術フェーズ（ゲーム画面）への遷移
async function transitionToTacticalPhase(territoryData) {
    try {
        console.log(`戦術フェーズに遷移中... (戦場: ${territoryData?.name || '未定義'})`);
        
        // 戦略フェーズ画面を隠す
        if (strategicPhaseScreen) {
            strategicPhaseScreen.hide();
            app.stage.removeChild(strategicPhaseScreen.getContainer());
        }
        
        // ローディング表示
        const loadingText = new PIXI.Text({
            text: '戦術フェーズ初期化中...',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                fill: '#ffffff',
                align: 'center'
            }
        });
        loadingText.anchor.set(0.5);
        loadingText.x = 640;
        loadingText.y = 360;
        app.stage.addChild(loadingText);
        
        // ゲーム初期化（選択陣営を渡す）
        game = new Game();
        game.app = app;
        game.playerFaction = selectedFaction;
        game.battleTerritory = territoryData; // 戦場情報を設定
        
        // Game.jsのinit()を呼び出すが、PIXI Application作成部分をスキップ
        await game.initWithExistingApp();
        
        // ローディングテキストを削除
        app.stage.removeChild(loadingText);
        
        // 戦術フェーズ終了後に戦略フェーズに戻るコールバック設定
        game.setOnBattleEndCallback((result) => {
            returnToStrategicPhase(result);
        });
        
        currentScreen = 'game';
        gameState.currentPhase = 'tactical';
        console.log('戦術フェーズ遷移完了');
        
    } catch (error) {
        console.error('戦術フェーズ遷移エラー:', error);
        // エラー時は戦略フェーズに戻る
        returnToStrategicPhase();
    }
}

// 艦隊一覧画面への遷移
async function transitionToFleetList() {
    try {
        console.log('艦隊一覧画面に遷移中...');
        
        // 戦略フェーズ画面を隠す
        if (strategicPhaseScreen) {
            strategicPhaseScreen.hide();
            app.stage.removeChild(strategicPhaseScreen.getContainer());
        }
        
        // 艦隊一覧画面を初期化
        if (!fleetListScreen) {
            fleetListScreen = new FleetListScreen(app);
            
            // 非同期初期化を実行
            await fleetListScreen.init();
            
            // 戻るコールバック設定
            fleetListScreen.setOnBackCallback(() => {
                returnToStrategicPhaseFromFleetList();
            });
        }
        
        app.stage.addChild(fleetListScreen.getContainer());
        fleetListScreen.show();
        
        currentScreen = 'fleets';
        console.log('艦隊一覧画面遷移完了');
        
    } catch (error) {
        console.error('艦隊一覧画面遷移エラー:', error);
        returnToStrategicPhase();
    }
}

// 艦隊一覧画面から戦略フェーズに戻る
function returnToStrategicPhaseFromFleetList() {
    try {
        console.log('戦略フェーズに戻ります');
        
        // 艦隊一覧画面を隠す
        if (fleetListScreen) {
            fleetListScreen.hide();
            app.stage.removeChild(fleetListScreen.getContainer());
        }
        
        // 戦略フェーズ画面を再表示
        if (strategicPhaseScreen) {
            app.stage.addChild(strategicPhaseScreen.getContainer());
            strategicPhaseScreen.show();
        }
        
        currentScreen = 'strategic';
        console.log('戦略フェーズ復帰完了');
        
    } catch (error) {
        console.error('戦略フェーズ復帰エラー:', error);
        returnToTitle();
    }
}

// 戦略フェーズに戻る
function returnToStrategicPhase(battleResult = null) {
    try {
        console.log('戦略フェーズに戻ります', battleResult ? `(戦果: ${battleResult})` : '');
        
        // ゲーム画面のクリーンアップ
        if (game) {
            app.stage.removeChildren();
            game = null;
        }
        
        // 戦略フェーズ画面を再表示
        if (strategicPhaseScreen) {
            app.stage.addChild(strategicPhaseScreen.getContainer());
            strategicPhaseScreen.show();
            
            // 戦果があれば戦略フェーズ画面に通知
            if (battleResult) {
                strategicPhaseScreen.handleBattleResult(battleResult);
            }
        }
        
        currentScreen = 'strategic';
        gameState.currentPhase = 'strategic';
        console.log('戦略フェーズ復帰完了');
        
    } catch (error) {
        console.error('戦略フェーズ復帰エラー:', error);
        returnToTitle();
    }
}

// ゲーム画面への遷移（直接戦術フェーズ開始）
async function transitionToGame() {
    try {
        console.log(`ゲーム画面に遷移中... (選択陣営: ${selectedFaction})`);
        
        // 陣営選択画面を隠す
        if (factionSelectScreen) {
            factionSelectScreen.hide();
            app.stage.removeChild(factionSelectScreen);
        }
        
        // ローディング表示
        const loadingText = new PIXI.Text({
            text: 'Galaxy RTS 初期化中...',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                fill: '#ffffff',
                align: 'center'
            }
        });
        loadingText.anchor.set(0.5);
        loadingText.x = 640;
        loadingText.y = 360;
        app.stage.addChild(loadingText);
        
        // ゲーム初期化（選択陣営を渡す）
        game = new Game();
        game.app = app; // 既存のアプリケーションを使用
        game.playerFaction = selectedFaction; // 選択陣営を設定
        
        // Game.jsのinit()を呼び出すが、PIXI Application作成部分をスキップ
        await game.initWithExistingApp();
        
        // ローディングテキストを削除
        app.stage.removeChild(loadingText);
        
        currentScreen = 'game';
        console.log('ゲーム画面遷移完了');
        
    } catch (error) {
        console.error('ゲーム遷移エラー:', error);
        // エラー時は陣営選択画面に戻る
        if (game) {
            // ゲームのクリーンアップ
            app.stage.removeChildren();
        }
        
        // 陣営選択画面を再表示
        if (factionSelectScreen) {
            app.stage.addChild(factionSelectScreen);
            factionSelectScreen.show();
        }
        currentScreen = 'faction';
    }
}

// アプリケーション開始
async function startApp() {
    try {
        // ローディング表示更新
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = 'Galaxy RTS 初期化中...';
        }
        
        // PIXI初期化
        await initApp();
        
        // タイトル画面初期化
        await initTitleScreen();
        
        // ローディング表示を削除
        if (loadingElement) {
            loadingElement.remove();
        }
        
        console.log('Galaxy RTS 起動完了');
        
    } catch (error) {
        console.error('アプリケーション初期化エラー:', error);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = 'エラー: ' + error.message;
            loadingElement.style.color = 'red';
        }
    }
}

// ESCキーで前の画面に戻る機能
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (currentScreen === 'game') {
            if (gameState.currentPhase === 'tactical') {
                if (confirm('戦略フェーズに戻りますか？')) {
                    returnToStrategicPhase();
                }
            } else {
                if (confirm('タイトル画面に戻りますか？')) {
                    returnToTitle();
                }
            }
        } else if (currentScreen === 'strategic') {
            if (confirm('タイトル画面に戻りますか？')) {
                returnToTitle();
            }
        } else if (currentScreen === 'fleets') {
            returnToStrategicPhaseFromFleetList();
        } else if (currentScreen === 'faction' || currentScreen === 'admirals') {
            returnToTitle();
        }
    }
});

// タイトル画面に戻る
function returnToTitle() {
    try {
        console.log('タイトル画面に戻ります');
        
        // 全画面のクリーンアップ
        app.stage.removeChildren();
        
        if (game) {
            game = null;
        }
        
        if (factionSelectScreen) {
            factionSelectScreen.hide();
        }
        
        if (strategicPhaseScreen) {
            strategicPhaseScreen.hide();
            strategicPhaseScreen = null;
        }
        
        if (fleetListScreen) {
            fleetListScreen.destroy();
            fleetListScreen = null;
        }
        
        if (admiralListScreen) {
            admiralListScreen.destroy();
            admiralListScreen = null;
        }
        
        // 選択陣営とゲーム状態をリセット
        selectedFaction = null;
        gameState.currentPhase = 'strategic';
        gameState.currentPlayer = 'alliance';
        gameState.turn = 1;
        
        // タイトル画面を再表示
        if (titleScreen) {
            app.stage.addChild(titleScreen);
            titleScreen.show();
        }
        
        currentScreen = 'title';
        console.log('タイトル画面復帰完了');
        
    } catch (error) {
        console.error('タイトル画面復帰エラー:', error);
    }
}

// アプリケーション開始
startApp();