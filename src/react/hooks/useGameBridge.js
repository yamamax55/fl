import { useEffect, useRef, useCallback } from 'react';
import { updateGameState, updatePerf, setSelected } from '../stores/uiStore.js';

// 既存のゲームクラスをインポート
// 注意: パスは実際のプロジェクト構造に合わせて調整
let Game, Fleet, Effects, Audio;

// 動的インポートでゲームモジュールを読み込み
async function loadGameModules() {
  try {
    const gameModule = await import('../../Game.js');
    const fleetModule = await import('../../Fleet.js');
    const effectsModule = await import('../../Effects.js');
    const audioModule = await import('../../Audio.js');
    
    Game = gameModule.Game;
    Fleet = fleetModule.Fleet;
    Effects = effectsModule.Effects;
    Audio = audioModule.Audio;
    
    return true;
  } catch (error) {
    console.error('ゲームモジュールの読み込みエラー:', error);
    return false;
  }
}

/**
 * 既存のGame.jsとReactアプリケーションを繋ぐブリッジフック
 */
export function useGameBridge() {
  const gameRef = useRef(null);
  const canvasRef = useRef(null);
  const isInitializedRef = useRef(false);
  const performanceTimerRef = useRef(null);

  // ゲーム初期化
  const initializeGame = useCallback(async (canvasElement) => {
    if (isInitializedRef.current || !canvasElement) return false;

    try {
      updateGameState({ isLoading: true, error: null });

      // ゲームモジュールを読み込み
      const modulesLoaded = await loadGameModules();
      if (!modulesLoaded) {
        throw new Error('ゲームモジュールの読み込みに失敗しました');
      }

      // PIXIアプリケーションを既存のcanvas要素にアタッチする方式に変更
      const game = new Game();
      
      // 既存のGame.jsを改修して、外部から提供されるcanvas要素を使用できるようにする
      // または、新しい初期化メソッドを作成
      if (game.initWithCanvas) {
        await game.initWithCanvas(canvasElement);
      } else {
        // フォールバック: 従来の初期化方法
        await game.init();
        // 作成されたcanvasを指定された要素に移動
        if (game.app && game.app.canvas) {
          canvasElement.appendChild(game.app.canvas);
        }
      }

      gameRef.current = game;
      canvasRef.current = canvasElement;
      
      // ゲームイベントリスナーを設定
      setupGameEventListeners(game);
      
      // パフォーマンス監視開始
      startPerformanceMonitoring();
      
      isInitializedRef.current = true;
      updateGameState({ isLoading: false });
      
      console.log('ゲーム初期化完了');
      return true;
      
    } catch (error) {
      console.error('ゲーム初期化エラー:', error);
      updateGameState({ 
        isLoading: false, 
        error: error.message || 'ゲームの初期化に失敗しました' 
      });
      return false;
    }
  }, []);

  // ゲーム破棄
  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      try {
        // ゲーム固有のクリーンアップ
        if (gameRef.current.destroy) {
          gameRef.current.destroy();
        }
        
        // PIXIアプリケーションのクリーンアップ
        if (gameRef.current.app) {
          gameRef.current.app.destroy();
        }
        
        gameRef.current = null;
      } catch (error) {
        console.error('ゲーム破棄エラー:', error);
      }
    }

    // パフォーマンス監視停止
    if (performanceTimerRef.current) {
      clearInterval(performanceTimerRef.current);
      performanceTimerRef.current = null;
    }

    isInitializedRef.current = false;
    canvasRef.current = null;
    
    updateGameState({ 
      currentPhase: 'strategic',
      isLoading: false,
      error: null
    });
    
    console.log('ゲーム破棄完了');
  }, []);

  // ゲームイベントリスナー設定
  const setupGameEventListeners = useCallback((game) => {
    if (!game) return;

    // 艦隊選択イベント
    if (game.on) {
      game.on('fleetSelected', (fleetData) => {
        setSelected('fleet', fleetData.id, fleetData);
      });

      game.on('starSelected', (starData) => {
        setSelected('star', starData.id, starData);
      });

      game.on('selectionCleared', () => {
        setSelected('none', null);
      });

      // フェーズ変更イベント
      game.on('phaseChanged', (phase) => {
        updateGameState({ currentPhase: phase });
      });
    }
  }, []);

  // パフォーマンス監視
  const startPerformanceMonitoring = useCallback(() => {
    performanceTimerRef.current = setInterval(() => {
      if (gameRef.current && gameRef.current.app) {
        const app = gameRef.current.app;
        
        updatePerf({
          fps: Math.round(app.ticker.FPS),
          // その他のパフォーマンス指標を追加
        });
      }
    }, 1000); // 1秒間隔で更新
  }, []);

  // ゲームアクション実行
  const executeGameAction = useCallback((action, params = {}) => {
    if (!gameRef.current) {
      console.warn('ゲームが初期化されていません');
      return false;
    }

    try {
      switch (action) {
        case 'selectFleet':
          if (gameRef.current.selectFleet) {
            gameRef.current.selectFleet(params.fleetId);
          }
          break;
          
        case 'moveFleet':
          if (gameRef.current.moveFleet) {
            gameRef.current.moveFleet(params.fleetId, params.position);
          }
          break;
          
        case 'startBattle':
          if (gameRef.current.startBattle) {
            gameRef.current.startBattle(params.territoryId);
          }
          break;
          
        case 'endTurn':
          if (gameRef.current.endTurn) {
            gameRef.current.endTurn();
          }
          break;
          
        default:
          console.warn(`未知のゲームアクション: ${action}`);
          return false;
      }
      
      return true;
    } catch (error) {
      console.error(`ゲームアクション実行エラー (${action}):`, error);
      return false;
    }
  }, []);

  // マウス座標更新（星図用）
  const updateMousePosition = useCallback((worldX, worldY, screenX, screenY) => {
    updatePerf({
      mouse: { x: screenX, y: screenY },
      worldMouse: { x: worldX, y: worldY }
    });
  }, []);

  // ズーム更新
  const updateZoom = useCallback((zoomLevel) => {
    updatePerf({ zoom: zoomLevel });
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      destroyGame();
    };
  }, [destroyGame]);

  return {
    // 初期化・破棄
    initializeGame,
    destroyGame,
    
    // 状態
    isInitialized: isInitializedRef.current,
    game: gameRef.current,
    
    // アクション
    executeGameAction,
    updateMousePosition,
    updateZoom,
    
    // 参照
    canvasRef
  };
}

// ゲームデータ取得用ヘルパーフック
export function useGameData() {
  // 既存のデータ取得ロジックを統合
  const getAdmirals = useCallback(async () => {
    try {
      const response = await fetch('/data/admirals.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('提督データ取得エラー:', error);
      return { admirals: [] };
    }
  }, []);

  const getFleets = useCallback(async () => {
    try {
      const response = await fetch('/data/fleets.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('艦隊データ取得エラー:', error);
      return { fleets: [] };
    }
  }, []);

  const getGalaxyMap = useCallback(async () => {
    try {
      const response = await fetch('/data/galaxy_map.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('銀河マップデータ取得エラー:', error);
      return { territories: [], routes: [] };
    }
  }, []);

  return {
    getAdmirals,
    getFleets,
    getGalaxyMap
  };
}