import { Game } from './Game.js';
import { TitleScreen } from './TitleScreen.js';
import { FactionSelectScreen } from './FactionSelectScreen.js';
import * as PIXI from 'pixi.js';

// グローバル状態管理
let currentScreen = 'title'; // 'title' | 'faction' | 'game'
let app = null;
let titleScreen = null;
let factionSelectScreen = null;
let game = null;
let selectedFaction = null;

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
        
        app.stage.addChild(titleScreen);
        titleScreen.show();
        
        console.log('タイトル画面初期化完了');
    } catch (error) {
        console.error('タイトル画面初期化エラー:', error);
        throw error;
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
                transitionToGame();
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

// ゲーム画面への遷移
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

// ESCキーでタイトル画面に戻る機能
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (currentScreen === 'game') {
            if (confirm('タイトル画面に戻りますか？')) {
                returnToTitle();
            }
        } else if (currentScreen === 'faction') {
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
        
        // 選択陣営をリセット
        selectedFaction = null;
        
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