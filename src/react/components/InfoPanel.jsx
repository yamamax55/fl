import React, { useState, useEffect, useRef } from 'react';
import { uiStore, updateInfoPanelHeight, toggleLayoutMode, subscribe } from '../stores/uiStore.js';
import styles from '../layout.module.css';

export function InfoPanel() {
  const [selected, setSelected] = useState(uiStore.selected);
  const [layoutMode, setLayoutMode] = useState(uiStore.layoutMode);
  const [panelHeight, setPanelHeight] = useState(uiStore.panels.infoPanel.height);
  const [gameState, setGameState] = useState(uiStore.game);
  const panelRef = useRef(null);
  const isResizing = useRef(false);

  // ストア購読
  useEffect(() => {
    const unsubscribe = subscribe((store) => {
      setSelected(store.selected);
      setLayoutMode(store.layoutMode);
      setPanelHeight(store.panels.infoPanel.height);
      setGameState(store.game);
    });
    return unsubscribe;
  }, []);

  // リサイズハンドリング
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current || !panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const newHeight = window.innerHeight - e.clientY;
      const minHeight = uiStore.panels.infoPanel.minHeight;
      const maxHeight = uiStore.panels.infoPanel.maxHeight;
      
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      updateInfoPanelHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = () => {
    isResizing.current = true;
  };

  // ダミーデータ生成関数
  const generateDummyData = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: now.toLocaleTimeString('ja-JP'),
      turn: gameState.turn || 1,
      budget: (Math.random() * 1000000 + 500000).toFixed(0),
      income: (Math.random() * 50000 + 25000).toFixed(0),
      expenses: (Math.random() * 40000 + 20000).toFixed(0),
      fleetCount: Math.floor(Math.random() * 20 + 10),
      systemCount: Math.floor(Math.random() * 50 + 25),
      population: (Math.random() * 500 + 200).toFixed(1)
    };
  };

  const dummyData = generateDummyData();

  const renderLeftSection = () => (
    <div className={styles.infoPanelSection}>
      <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>ゲーム情報</h4>
      
      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>日時・ターン</div>
        <div style={{ marginTop: '8px', fontSize: '10px' }}>
          <div>日付: {dummyData.date}</div>
          <div>時刻: {dummyData.time}</div>
          <div>ターン: {dummyData.turn}</div>
          <div>フェーズ: {gameState.currentPhase === 'strategic' ? '戦略' : '戦術'}</div>
        </div>
      </div>

      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>国力・予算</div>
        <div style={{ marginTop: '8px', fontSize: '10px' }}>
          <div>予算: {Number(dummyData.budget).toLocaleString()} Credits</div>
          <div>収入: +{Number(dummyData.income).toLocaleString()} /ターン</div>
          <div>支出: -{Number(dummyData.expenses).toLocaleString()} /ターン</div>
          <div>人口: {dummyData.population}億人</div>
        </div>
      </div>

      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>戦力概要</div>
        <div style={{ marginTop: '8px', fontSize: '10px' }}>
          <div>艦隊数: {dummyData.fleetCount}</div>
          <div>保有星系: {dummyData.systemCount}</div>
          <div>軍事力: {Math.floor(Math.random() * 1000 + 500)}</div>
        </div>
      </div>
    </div>
  );

  const renderCenterSection = () => (
    <div className={styles.infoPanelSection}>
      <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>選択オブジェクト</h4>
      
      {selected.type === 'none' ? (
        <div style={{ color: '#666', fontStyle: 'italic' }}>
          オブジェクトが選択されていません
        </div>
      ) : (
        <div>
          <div className={styles.groupBox}>
            <div className={styles.groupBoxTitle}>
              {selected.type === 'star' ? '星系情報' : 
               selected.type === 'fleet' ? '艦隊情報' : 
               selected.type === 'admiral' ? '士官情報' : '詳細'}
            </div>
            <div style={{ marginTop: '8px', fontSize: '10px' }}>
              {selected.data ? (
                <>
                  <div><strong>名前:</strong> {selected.data.name}</div>
                  {selected.data.type && (
                    <div><strong>種別:</strong> {selected.data.type}</div>
                  )}
                  {selected.data.owner && (
                    <div><strong>所有:</strong> {selected.data.owner}</div>
                  )}
                  {selected.data.faction && (
                    <div><strong>陣営:</strong> {selected.data.faction}</div>
                  )}
                  {selected.data.shipCount && (
                    <div><strong>艦船数:</strong> {selected.data.shipCount}隻</div>
                  )}
                  {selected.data.totalFirepower && (
                    <div><strong>火力:</strong> {selected.data.totalFirepower.toLocaleString()}</div>
                  )}
                  {selected.data.rank && (
                    <div><strong>階級:</strong> {selected.data.rank}</div>
                  )}
                  {selected.data.age && (
                    <div><strong>年齢:</strong> {selected.data.age}歳</div>
                  )}
                  {selected.data.resources && (
                    <div>
                      <div><strong>資源:</strong></div>
                      <div style={{ marginLeft: '10px' }}>
                        {selected.data.resources.funds && (
                          <div>資金: {selected.data.resources.funds.toLocaleString()}</div>
                        )}
                        {selected.data.resources.personnel && (
                          <div>人員: {selected.data.resources.personnel.toLocaleString()}</div>
                        )}
                        {selected.data.resources.materials && (
                          <div>物資: {selected.data.resources.materials.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>ID: {selected.id}</div>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div style={{ marginTop: '10px' }}>
            {selected.type === 'star' && (
              <div>
                <button className={styles.button} style={{ marginRight: '5px', fontSize: '10px' }}>
                  詳細表示
                </button>
                <button className={styles.button} style={{ fontSize: '10px' }}>
                  艦隊派遣
                </button>
              </div>
            )}
            {selected.type === 'fleet' && (
              <div>
                <button className={styles.button} style={{ marginRight: '5px', fontSize: '10px' }}>
                  艦隊詳細
                </button>
                <button className={styles.button} style={{ fontSize: '10px' }}>
                  移動命令
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderRightSection = () => (
    <div className={styles.infoPanelSection}>
      <h4 style={{ margin: '0 0 10px 0', color: '#000080' }}>レイアウト・設定</h4>
      
      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>表示レイアウト</div>
        <div style={{ marginTop: '8px' }}>
          <button
            className={`${styles.toggleButton} ${layoutMode === 'RIGHT_AND_BOTTOM' ? styles.active : ''}`}
            onClick={toggleLayoutMode}
            style={{ fontSize: '10px', marginBottom: '5px', width: '100%' }}
          >
            右パネル + 下パネル
          </button>
          <button
            className={`${styles.toggleButton} ${layoutMode === 'BOTTOM_ONLY' ? styles.active : ''}`}
            onClick={toggleLayoutMode}
            style={{ fontSize: '10px', width: '100%' }}
          >
            下パネルのみ
          </button>
        </div>
      </div>

      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>パネル設定</div>
        <div style={{ marginTop: '8px', fontSize: '10px' }}>
          <div>高さ: {panelHeight}px</div>
          <div style={{ marginTop: '5px' }}>
            <button 
              className={styles.button}
              onClick={() => updateInfoPanelHeight(200)}
              style={{ fontSize: '9px', marginRight: '3px' }}
            >
              小
            </button>
            <button 
              className={styles.button}
              onClick={() => updateInfoPanelHeight(300)}
              style={{ fontSize: '9px', marginRight: '3px' }}
            >
              中
            </button>
            <button 
              className={styles.button}
              onClick={() => updateInfoPanelHeight(400)}
              style={{ fontSize: '9px' }}
            >
              大
            </button>
          </div>
        </div>
      </div>

      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>クイックアクション</div>
        <div style={{ marginTop: '8px' }}>
          <button className={styles.button} style={{ fontSize: '10px', width: '100%', marginBottom: '3px' }}>
            全体表示
          </button>
          <button className={styles.button} style={{ fontSize: '10px', width: '100%', marginBottom: '3px' }}>
            ズームリセット
          </button>
          <button className={styles.button} style={{ fontSize: '10px', width: '100%' }}>
            設定
          </button>
        </div>
      </div>
    </div>
  );

  const panelStyle = {
    height: `${panelHeight}px`,
    transition: isResizing.current ? 'none' : 'height 0.2s ease'
  };

  const className = layoutMode === 'BOTTOM_ONLY' 
    ? `${styles.infoPanel} ${styles.infoPanelExpanded}` 
    : styles.infoPanel;

  return (
    <div ref={panelRef} className={className} style={panelStyle}>
      <div 
        className={styles.resizeHandle}
        onMouseDown={handleResizeStart}
        title="ドラッグして高さを調整"
      />
      
      <div className={styles.infoPanelHeader}>
        <span>情報パネル</span>
        <span style={{ fontSize: '10px', color: '#ccc' }}>
          {layoutMode === 'BOTTOM_ONLY' ? '拡張モード' : '標準モード'}
        </span>
      </div>
      
      <div className={styles.infoPanelContent}>
        {renderLeftSection()}
        {renderCenterSection()}
        {renderRightSection()}
      </div>
    </div>
  );
}