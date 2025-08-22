import React, { useState, useEffect } from 'react';
import { uiStore, subscribe } from '../stores/uiStore.js';
import styles from '../layout.module.css';

export function StatusBar() {
  const [perf, setPerf] = useState(uiStore.perf);
  const [gameState, setGameState] = useState(uiStore.game);

  // ストア購読
  useEffect(() => {
    const unsubscribe = subscribe((store) => {
      setPerf(store.perf);
      setGameState(store.game);
    });
    return unsubscribe;
  }, []);

  // FPS表示用の色計算
  const getFpsColor = (fps) => {
    if (fps >= 50) return '#00ff00';
    if (fps >= 30) return '#ffff00';
    return '#ff0000';
  };

  // ズームレベルのパーセント表示
  const getZoomPercent = (zoom) => {
    return Math.round(zoom * 100);
  };

  // マウス座標の表示形式
  const formatCoordinate = (coord) => {
    return Math.round(coord);
  };

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusLeft}>
        <span>ヘルプは [F1] キーを押してください</span>
        {gameState.isLoading && (
          <span style={{ marginLeft: '20px', color: '#0066cc' }}>
            • 読み込み中...
          </span>
        )}
        {gameState.error && (
          <span style={{ marginLeft: '20px', color: '#cc0000' }}>
            • エラー: {gameState.error}
          </span>
        )}
      </div>
      
      <div className={styles.statusRight}>
        {/* FPS表示 */}
        <div className={styles.statusItem}>
          <span style={{ color: getFpsColor(perf.fps) }}>
            FPS: {perf.fps || 0}
          </span>
        </div>
        
        {/* ズーム表示 */}
        <div className={styles.statusItem}>
          ズーム: {getZoomPercent(perf.zoom)}%
        </div>
        
        {/* マウス座標（スクリーン） */}
        <div className={styles.statusItem}>
          座標: {formatCoordinate(perf.mouse.x)}, {formatCoordinate(perf.mouse.y)}
        </div>
        
        {/* マウス座標（ワールド） */}
        <div className={styles.statusItem}>
          ワールド: {formatCoordinate(perf.worldMouse.x)}, {formatCoordinate(perf.worldMouse.y)}
        </div>
        
        {/* ゲーム状態 */}
        <div className={styles.statusItem}>
          {gameState.currentPhase === 'strategic' ? '戦略' : '戦術'}フェーズ
        </div>
        
        {/* ターン表示 */}
        <div className={styles.statusItem}>
          Turn {gameState.turn}
        </div>
        
        {/* 時刻表示 */}
        <div className={styles.statusItem}>
          {new Date().toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}