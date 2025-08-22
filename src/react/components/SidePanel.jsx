import React, { useState, useEffect } from 'react';
import { uiStore, updateFilters, subscribe } from '../stores/uiStore.js';
import { useGameData } from '../hooks/useGameBridge.js';
import styles from '../layout.module.css';

export function SidePanel() {
  const [isOpen, setIsOpen] = useState(uiStore.panels.sidePanel.isOpen);
  const [layoutMode, setLayoutMode] = useState(uiStore.layoutMode);
  const [activeTab, setActiveTab] = useState('factions');
  const [filters, setFilters] = useState(uiStore.filters);
  const [fleets, setFleets] = useState([]);
  const [admirals, setAdmirals] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getFleets, getAdmirals } = useGameData();

  // ストア購読
  useEffect(() => {
    const unsubscribe = subscribe((store) => {
      setIsOpen(store.panels.sidePanel.isOpen);
      setLayoutMode(store.layoutMode);
      setFilters(store.filters);
    });
    return unsubscribe;
  }, []);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fleetsData, admiralsData] = await Promise.all([
          getFleets(),
          getAdmirals()
        ]);
        
        setFleets(fleetsData.fleets || []);
        setAdmirals(admiralsData.admirals || []);
      } catch (error) {
        console.error('データ読み込みエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getFleets, getAdmirals]);

  // レイアウトモードがBOTTOM_ONLYの場合は非表示
  if (layoutMode === 'BOTTOM_ONLY' || !isOpen) {
    return null;
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const renderFactionsTab = () => (
    <div className={styles.sidePanelContent}>
      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>勢力フィルター</div>
        
        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="radio"
              name="faction"
              value=""
              checked={filters.faction === null}
              onChange={() => handleFilterChange('faction', null)}
              style={{ marginRight: '5px' }}
            />
            すべて表示
          </label>
          
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="radio"
              name="faction"
              value="alliance"
              checked={filters.faction === 'alliance'}
              onChange={() => handleFilterChange('faction', 'alliance')}
              style={{ marginRight: '5px' }}
            />
            星系連邦
          </label>
          
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="radio"
              name="faction"
              value="empire"
              checked={filters.faction === 'empire'}
              onChange={() => handleFilterChange('faction', 'empire')}
              style={{ marginRight: '5px' }}
            />
            宇宙帝国
          </label>
        </div>
      </div>

      <div className={styles.groupBox}>
        <div className={styles.groupBoxTitle}>表示オプション</div>
        
        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={filters.showLinks}
              onChange={(e) => handleFilterChange('showLinks', e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            航路線を表示
          </label>
          
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={filters.showLabels}
              onChange={(e) => handleFilterChange('showLabels', e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            星系ラベルを表示
          </label>
        </div>
      </div>
    </div>
  );

  const renderFleetsTab = () => (
    <div className={styles.sidePanelContent}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          データ読み込み中...
        </div>
      ) : (
        <div className={styles.list}>
          {fleets
            .filter(fleet => !filters.faction || fleet.faction?.toLowerCase() === filters.faction)
            .map((fleet, index) => (
            <div key={fleet.id || index} className={styles.listItem}>
              <div style={{ fontWeight: 'bold' }}>{fleet.name}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                {fleet.faction} | {fleet.type} | {fleet.shipCount}隻
              </div>
              {fleet.command?.commander && (
                <div style={{ fontSize: '9px', color: '#444' }}>
                  司令官: {fleet.command.commander}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAdmiralsTab = () => (
    <div className={styles.sidePanelContent}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          データ読み込み中...
        </div>
      ) : (
        <div className={styles.list}>
          {admirals
            .filter(admiral => !filters.faction || admiral.faction?.toLowerCase() === filters.faction)
            .map((admiral, index) => (
            <div key={admiral.id || index} className={styles.listItem}>
              <div style={{ fontWeight: 'bold' }}>
                {admiral.lastName} {admiral.firstName}
              </div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                {admiral.rank} | {admiral.faction} | {admiral.age}歳
              </div>
              <div style={{ fontSize: '9px', color: '#444' }}>
                指揮:{admiral.command} 戦術:{admiral.tactics} 機動:{admiral.mobility}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'factions':
        return renderFactionsTab();
      case 'fleets':
        return renderFleetsTab();
      case 'admirals':
        return renderAdmiralsTab();
      default:
        return renderFactionsTab();
    }
  };

  return (
    <div className={styles.sidePanel}>
      <div className={styles.sidePanelHeader}>
        情報パネル
      </div>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'factions' ? styles.active : ''}`}
          onClick={() => setActiveTab('factions')}
        >
          勢力
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'fleets' ? styles.active : ''}`}
          onClick={() => setActiveTab('fleets')}
        >
          艦隊
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'admirals' ? styles.active : ''}`}
          onClick={() => setActiveTab('admirals')}
        >
          士官
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {renderContent()}
      </div>
    </div>
  );
}