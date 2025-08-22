// React + PIXI統合アプリケーション
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './react/App.jsx';

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('JavaScript エラー:', e.error);
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = 'エラーが発生しました。コンソールを確認してください。';
        loading.style.color = 'red';
        loading.style.display = 'block';
    }
});

// Promise拒否エラーハンドリング
window.addEventListener('unhandledrejection', function(e) {
    console.error('未処理のPromise拒否:', e.reason);
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = 'システムエラーが発生しました。';
        loading.style.color = 'red';
        loading.style.display = 'block';
    }
});

// DOM読み込み完了後にReactアプリケーションを開始
document.addEventListener('DOMContentLoaded', function() {
    console.log('Galaxy RTS - React UI 開始');
    
    // ローディング表示を更新
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = 'React UI 初期化中...';
    }
    
    // Reactアプリケーションをマウント
    const root = createRoot(document.getElementById('root'));
    
    // エラーバウンダリー付きでアプリケーションをレンダリング
    root.render(
        React.createElement(ErrorBoundary, null,
            React.createElement(App)
        )
    );
    
    // ローディング表示を非表示
    setTimeout(() => {
        if (loading) {
            loading.style.display = 'none';
        }
    }, 2000);
});

// Reactエラーバウンダリー
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('React エラーバウンダリー:', error, errorInfo);
        
        // ローディング要素にエラー表示
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `アプリケーションエラー: ${error.message}`;
            loading.style.color = 'red';
            loading.style.display = 'block';
        }
    }
    
    render() {
        if (this.state.hasError) {
            return React.createElement('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    backgroundColor: '#c0c0c0',
                    fontFamily: 'MS Sans Serif, sans-serif',
                    fontSize: '11px',
                    flexDirection: 'column'
                }
            }, [
                React.createElement('div', {
                    key: 'title',
                    style: {
                        padding: '20px',
                        border: '2px inset #c0c0c0',
                        backgroundColor: '#c0c0c0',
                        textAlign: 'center',
                        marginBottom: '10px'
                    }
                }, [
                    React.createElement('h3', { key: 'h3' }, 'アプリケーションエラー'),
                    React.createElement('p', { 
                        key: 'p',
                        style: { marginTop: '10px', color: '#666' }
                    }, 'システムの初期化中にエラーが発生しました。')
                ]),
                React.createElement('button', {
                    key: 'button',
                    onClick: () => window.location.reload(),
                    style: {
                        padding: '5px 15px',
                        border: '2px outset #c0c0c0',
                        backgroundColor: '#c0c0c0',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'inherit'
                    }
                }, '再読み込み')
            ]);
        }
        
        return this.props.children;
    }
}

// ホットリロード対応（開発時のみ）
if (import.meta.hot) {
    import.meta.hot.accept('./react/App.jsx', (newModule) => {
        console.log('ホットリロード: App.jsx');
        const root = createRoot(document.getElementById('root'));
        root.render(
            React.createElement(ErrorBoundary, null,
                React.createElement(newModule.App)
            )
        );
    });
}

console.log('Galaxy RTS - メインスクリプト読み込み完了');