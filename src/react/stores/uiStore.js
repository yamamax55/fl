// UI状態管理ストア
export const uiStore = {
  // レイアウト設定
  layoutMode: 'RIGHT_AND_BOTTOM', // 'RIGHT_AND_BOTTOM' | 'BOTTOM_ONLY'
  openSection: 'none', // 'file' | 'view' | 'faction' | 'systems' | 'fleets' | ...
  
  // 選択状態
  selected: { 
    type: 'none', // 'none' | 'star' | 'fleet' | 'admiral'
    id: null,
    data: null
  },
  
  // フィルター設定
  filters: { 
    faction: null, // null | 'alliance' | 'empire'
    showLinks: true,
    showLabels: true
  },
  
  // パフォーマンス情報
  perf: { 
    fps: 0,
    zoom: 1.0,
    mouse: { x: 0, y: 0 },
    worldMouse: { x: 0, y: 0 }
  },
  
  // パネル設定
  panels: {
    sidePanel: {
      isOpen: true,
      width: 300
    },
    infoPanel: {
      height: 200,
      minHeight: 150,
      maxHeight: window.innerHeight * 0.5
    }
  },
  
  // ゲーム状態
  game: {
    currentPhase: 'strategic', // 'strategic' | 'tactical'
    currentPlayer: 'alliance',
    turn: 1,
    isLoading: false,
    error: null
  }
};

// 購読者管理
const subscribers = new Set();

// 状態変更通知
export function notify() {
  subscribers.forEach(callback => callback(uiStore));
}

// 購読
export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// 状態更新ヘルパー
export function updateStore(updater) {
  if (typeof updater === 'function') {
    updater(uiStore);
  } else {
    Object.assign(uiStore, updater);
  }
  notify();
}

// 選択状態更新
export function setSelected(type, id, data = null) {
  updateStore(store => {
    store.selected = { type, id, data };
  });
}

// レイアウトモード切替
export function toggleLayoutMode() {
  updateStore(store => {
    store.layoutMode = store.layoutMode === 'RIGHT_AND_BOTTOM' 
      ? 'BOTTOM_ONLY' 
      : 'RIGHT_AND_BOTTOM';
    
    // BOTTOM_ONLYの場合はサイドパネルを閉じる
    if (store.layoutMode === 'BOTTOM_ONLY') {
      store.panels.sidePanel.isOpen = false;
    } else {
      store.panels.sidePanel.isOpen = true;
    }
  });
}

// メニューセクション切替
export function setOpenSection(section) {
  updateStore(store => {
    store.openSection = store.openSection === section ? 'none' : section;
  });
}

// パフォーマンス情報更新
export function updatePerf(perfData) {
  updateStore(store => {
    Object.assign(store.perf, perfData);
  });
}

// フィルター更新
export function updateFilters(filters) {
  updateStore(store => {
    Object.assign(store.filters, filters);
  });
}

// パネル高さ更新
export function updateInfoPanelHeight(height) {
  updateStore(store => {
    const minHeight = store.panels.infoPanel.minHeight;
    const maxHeight = store.panels.infoPanel.maxHeight;
    store.panels.infoPanel.height = Math.max(minHeight, Math.min(maxHeight, height));
  });
}

// ゲーム状態更新
export function updateGameState(gameData) {
  updateStore(store => {
    Object.assign(store.game, gameData);
  });
}

// 初期化
export function initializeStore() {
  // ウィンドウリサイズ時の最大高さ更新
  const handleResize = () => {
    updateStore(store => {
      store.panels.infoPanel.maxHeight = window.innerHeight * 0.5;
      // 現在の高さが最大高さを超えている場合は調整
      if (store.panels.infoPanel.height > store.panels.infoPanel.maxHeight) {
        store.panels.infoPanel.height = store.panels.infoPanel.maxHeight;
      }
    });
  };
  
  window.addEventListener('resize', handleResize);
  
  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}