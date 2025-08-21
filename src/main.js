import { Game } from './Game.js';

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('JavaScript エラー:', e.error);
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = 'エラーが発生しました。コンソールを確認してください。';
        loading.style.color = 'red';
    }
});

// ゲーム開始
async function startGame() {
    try {
        const game = new Game();
        await game.init();
    } catch (error) {
        console.error('Galaxy RTS初期化エラー:', error);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = 'エラー: ' + error.message;
            loadingElement.style.color = 'red';
        }
    }
}

startGame();