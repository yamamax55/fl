import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useGameBridge } from '../hooks/useGameBridge.js';
import { uiStore, updatePerf, setSelected, subscribe } from '../stores/uiStore.js';
import styles from '../layout.module.css';

export function StarMapCanvas() {
  const canvasRef = useRef(null);
  const pixiAppRef = useRef(null);
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  const { initializeGame, destroyGame, updateMousePosition, updateZoom } = useGameBridge();

  // PIXI アプリケーション初期化
  useEffect(() => {
    let mounted = true;

    const initializePixi = async () => {
      if (!containerRef.current || pixiAppRef.current) return;

      try {
        // PIXI Application を作成
        const app = new PIXI.Application();
        
        await app.init({
          width: 800,
          height: 600,
          backgroundColor: 0x000011,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true
        });

        if (!mounted) {
          app.destroy();
          return;
        }

        // canvas を DOM に追加
        containerRef.current.appendChild(app.canvas);
        pixiAppRef.current = app;

        // 星図を作成
        await createStarMap(app);

        // ゲームブリッジと連携
        const gameInitialized = await initializeGame(app.canvas);
        
        if (gameInitialized && mounted) {
          setIsInitialized(true);
          console.log('星図初期化完了');
        }

      } catch (err) {
        console.error('PIXI初期化エラー:', err);
        if (mounted) {
          setError('星図の初期化に失敗しました: ' + err.message);
        }
      }
    };

    initializePixi();

    return () => {
      mounted = false;
      if (pixiAppRef.current) {
        destroyGame();
        pixiAppRef.current.destroy();
        pixiAppRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [initializeGame, destroyGame]);

  // リサイズハンドリング
  useEffect(() => {
    const handleResize = () => {
      if (pixiAppRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        pixiAppRef.current.renderer.resize(rect.width, rect.height);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // 初回サイズ調整
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isInitialized]);

  // 星図作成
  const createStarMap = async (app) => {
    try {
      // 銀河マップデータを取得
      const response = await fetch('/data/galaxy_map.json');
      const galaxyData = await response.json();

      // コンテナ作成
      const mapContainer = new PIXI.Container();
      app.stage.addChild(mapContainer);

      // パン・ズーム機能の基本実装
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };
      let zoomLevel = 1.0;

      // 背景
      const background = new PIXI.Graphics();
      background.rect(0, 0, app.screen.width, app.screen.height);
      background.fill(0x000022);
      mapContainer.addChild(background);

      // 星空効果
      createStarField(mapContainer, app.screen.width, app.screen.height);

      // 航路線を描画
      if (galaxyData.routes) {
        drawRoutes(mapContainer, galaxyData);
      }

      // 星系を描画
      if (galaxyData.territories) {
        drawTerritories(mapContainer, galaxyData);
      }

      // インタラクション設定
      mapContainer.eventMode = 'static';
      
      // マウスイベント
      mapContainer.on('pointerdown', (event) => {
        isDragging = true;
        dragStart = { x: event.global.x, y: event.global.y };
        app.canvas.style.cursor = 'grabbing';
      });

      mapContainer.on('pointermove', (event) => {
        // マウス座標更新
        const localPos = event.getLocalPosition(mapContainer);
        updateMousePosition(localPos.x, localPos.y, event.global.x, event.global.y);

        if (isDragging) {
          const dx = event.global.x - dragStart.x;
          const dy = event.global.y - dragStart.y;
          
          mapContainer.x += dx;
          mapContainer.y += dy;
          
          dragStart = { x: event.global.x, y: event.global.y };
        }
      });

      mapContainer.on('pointerup', () => {
        isDragging = false;
        app.canvas.style.cursor = 'grab';
      });

      mapContainer.on('pointerupoutside', () => {
        isDragging = false;
        app.canvas.style.cursor = 'grab';
      });

      // ホイールズーム
      app.canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.5, Math.min(3.0, zoomLevel * zoomFactor));
        
        if (newZoom !== zoomLevel) {
          const mousePos = { x: event.offsetX, y: event.offsetY };
          
          // ズーム中心をマウス位置にする
          const worldPos = {
            x: (mousePos.x - mapContainer.x) / mapContainer.scale.x,
            y: (mousePos.y - mapContainer.y) / mapContainer.scale.y
          };
          
          mapContainer.scale.set(newZoom);
          
          mapContainer.x = mousePos.x - worldPos.x * newZoom;
          mapContainer.y = mousePos.y - worldPos.y * newZoom;
          
          zoomLevel = newZoom;
          updateZoom(zoomLevel);
        }
      });

      app.canvas.style.cursor = 'grab';

    } catch (error) {
      console.error('星図作成エラー:', error);
      throw error;
    }
  };

  // 星空効果
  const createStarField = (container, width, height) => {
    for (let i = 0; i < 200; i++) {
      const star = new PIXI.Graphics();
      const size = Math.random() * 1.5 + 0.5;
      
      star.circle(0, 0, size);
      star.fill(0xffffff);
      star.alpha = Math.random() * 0.8 + 0.2;
      
      star.x = Math.random() * width;
      star.y = Math.random() * height;
      
      container.addChild(star);
    }
  };

  // 航路線描画
  const drawRoutes = (container, galaxyData) => {
    const routes = galaxyData.routes || [];
    const territories = galaxyData.territories || [];
    
    routes.forEach(route => {
      const fromTerritory = territories.find(t => t.id === route.from);
      const toTerritory = territories.find(t => t.to === route.to);
      
      if (fromTerritory && toTerritory) {
        const line = new PIXI.Graphics();
        line.moveTo(fromTerritory.x, fromTerritory.y);
        line.lineTo(toTerritory.x, toTerritory.y);
        line.stroke({ width: 1, color: 0x333366, alpha: 0.6 });
        container.addChild(line);
      }
    });
  };

  // 星系描画
  const drawTerritories = (container, galaxyData) => {
    const territories = galaxyData.territories || [];
    
    territories.forEach(territory => {
      const node = new PIXI.Container();
      
      // 星系の円
      const circle = new PIXI.Graphics();
      const color = getFactionColor(territory.owner);
      const size = getTerritorySize(territory.type);
      
      circle.circle(0, 0, size);
      circle.fill(color);
      circle.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
      
      // 星系名ラベル
      const label = new PIXI.Text(territory.name, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffffff,
        align: 'center'
      });
      label.anchor.set(0.5);
      label.y = size + 15;
      
      node.addChild(circle);
      node.addChild(label);
      
      node.x = territory.x;
      node.y = territory.y;
      
      // インタラクション
      node.eventMode = 'static';
      node.cursor = 'pointer';
      
      node.on('pointerdown', (event) => {
        event.stopPropagation();
        setSelected('star', territory.id, territory);
        console.log('星系選択:', territory.name);
      });
      
      node.on('pointerover', () => {
        circle.tint = 0xcccccc;
      });
      
      node.on('pointerout', () => {
        circle.tint = 0xffffff;
      });
      
      container.addChild(node);
    });
  };

  // 勢力色取得
  const getFactionColor = (owner) => {
    switch (owner) {
      case 'federation':
      case 'alliance':
        return 0x4488ff;
      case 'empire':
        return 0xff4444;
      case 'neutral':
      default:
        return 0x888888;
    }
  };

  // 星系サイズ取得
  const getTerritorySize = (type) => {
    switch (type) {
      case 'capital':
        return 12;
      case 'fortress':
        return 10;
      case 'planet':
        return 8;
      case 'trade_center':
        return 9;
      case 'research':
        return 8;
      case 'mining':
        return 7;
      default:
        return 6;
    }
  };

  if (error) {
    return (
      <div className={styles.starMapArea}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'white',
          backgroundColor: '#001122',
          flexDirection: 'column'
        }}>
          <h3>エラー</h3>
          <p>{error}</p>
          <button 
            className={styles.button}
            onClick={() => window.location.reload()}
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.starMapArea}>
      <div 
        ref={containerRef}
        className={styles.starMapCanvas}
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
      />
      
      {!isInitialized && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '5px'
        }}>
          星図を初期化中...
        </div>
      )}
    </div>
  );
}