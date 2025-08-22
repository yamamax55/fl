import React, { useEffect, useState } from 'react';
import { MenuBar } from './components/MenuBar.jsx';
import { SidePanel } from './components/SidePanel.jsx';
import { InfoPanel } from './components/InfoPanel.jsx';
import { StatusBar } from './components/StatusBar.jsx';
import { StarMapCanvas } from './components/StarMapCanvas.jsx';
import { uiStore, initializeStore, subscribe } from './stores/uiStore.js';
import styles from './layout.module.css';

export function App() {
  const [layoutMode, setLayoutMode] = useState(uiStore.layoutMode);
  const [isInitialized, setIsInitialized] = useState(false);

  // ストア購読とアプリケーション初期化
  useEffect(() => {
    // UIストア初期化
    const cleanup = initializeStore();
    
    // ストア変更購読
    const unsubscribe = subscribe((store) => {
      setLayoutMode(store.layoutMode);
    });

    setIsInitialized(true);
    console.log('Galaxy RTS - React UI 初期化完了');

    // クリーンアップ
    return () => {
      cleanup();
      unsubscribe();
    };
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event) => {
      // F1キー - ヘルプ
      if (event.key === 'F1') {
        event.preventDefault();
        console.log('ヘルプ表示（未実装）');
        // TODO: ヘルプダイアログの実装
      }
      
      // Escキー - メニューを閉じる
      if (event.key === 'Escape') {
        // メニューが開いている場合は閉じる
        if (uiStore.openSection !== 'none') {
          // メニューを閉じる処理はMenuBarコンポーネントで処理される
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // エラーハンドリング
  useEffect(() => {
    const handleError = (event) => {
      console.error('グローバルエラー:', event.error);
      // TODO: エラー通知システムの実装
    };

    const handleUnhandledRejection = (event) => {
      console.error('未処理のPromise拒否:', event.reason);
      // TODO: エラー通知システムの実装
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#c0c0c0',
        fontFamily: 'MS Sans Serif, sans-serif',
        fontSize: '11px'
      }}>
        <div style={{
          padding: '20px',
          border: '2px inset #c0c0c0',
          backgroundColor: '#c0c0c0',
          textAlign: 'center'
        }}>
          <div>Galaxy RTS</div>
          <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
            初期化中...
          </div>
        </div>
      </div>
    );
  }

  const appClassName = layoutMode === 'BOTTOM_ONLY' 
    ? `${styles.app} ${styles.layoutBottomOnly}` 
    : styles.app;

  return (
    <div className={appClassName}>
      {/* メニューバー */}
      <MenuBar />
      
      {/* メインコンテンツエリア */}
      <div className={styles.mainContent}>
        {/* 星図キャンバス */}
        <StarMapCanvas />
        
        {/* 右サイドパネル */}
        <SidePanel />
      </div>
      
      {/* 下部情報パネル */}
      <InfoPanel />
      
      {/* ステータスバー */}
      <StatusBar />
    </div>
  );
}