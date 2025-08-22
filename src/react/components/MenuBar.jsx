import React, { useState, useEffect, useRef } from 'react';
import { uiStore, setOpenSection, toggleLayoutMode, subscribe } from '../stores/uiStore.js';
import styles from '../layout.module.css';

export function MenuBar() {
  const [openSection, setOpenSectionLocal] = useState(uiStore.openSection);
  const [layoutMode, setLayoutMode] = useState(uiStore.layoutMode);
  const menuRef = useRef(null);

  // ストア購読
  useEffect(() => {
    const unsubscribe = subscribe((store) => {
      setOpenSectionLocal(store.openSection);
      setLayoutMode(store.layoutMode);
    });
    return unsubscribe;
  }, []);

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenSection('none');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey) {
        event.preventDefault();
        
        switch (event.key.toLowerCase()) {
          case 'f':
            setOpenSection('file');
            break;
          case 'v':
            setOpenSection('view');
            break;
          case 'e':
            setOpenSection('edit');
            break;
          case 'h':
            setOpenSection('help');
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const menuItems = [
    {
      id: 'file',
      label: 'ファイル(F)',
      items: [
        { label: '新規ゲーム', action: 'newGame', shortcut: 'Ctrl+N' },
        { label: 'ゲーム読み込み', action: 'loadGame', shortcut: 'Ctrl+O' },
        { label: 'ゲーム保存', action: 'saveGame', shortcut: 'Ctrl+S' },
        { label: '名前を付けて保存', action: 'saveAsGame' },
        { type: 'separator' },
        { label: '設定', action: 'settings' },
        { type: 'separator' },
        { label: '終了', action: 'exit', shortcut: 'Alt+F4' }
      ]
    },
    {
      id: 'view',
      label: '表示(V)',
      items: [
        { 
          label: 'レイアウト', 
          submenu: [
            { 
              label: '右パネル + 下パネル', 
              action: 'layoutRightBottom',
              checked: layoutMode === 'RIGHT_AND_BOTTOM'
            },
            { 
              label: '下パネルのみ', 
              action: 'layoutBottomOnly',
              checked: layoutMode === 'BOTTOM_ONLY'
            }
          ]
        },
        { type: 'separator' },
        { label: '星系ラベル', action: 'toggleLabels', checked: true },
        { label: '航路線', action: 'toggleRoutes', checked: true },
        { label: '勢力境界', action: 'toggleBorders' },
        { type: 'separator' },
        { label: 'ズームリセット', action: 'resetZoom', shortcut: 'Ctrl+0' },
        { label: '全体表示', action: 'fitToScreen', shortcut: 'Ctrl+1' }
      ]
    },
    {
      id: 'faction',
      label: '勢力(P)',
      items: [
        { label: '星系連邦', action: 'selectFederationFleets' },
        { label: '宇宙帝国', action: 'selectEmpireFleets' },
        { type: 'separator' },
        { label: '外交状況', action: 'diplomacyStatus' },
        { label: '同盟関係', action: 'allianceRelations' }
      ]
    },
    {
      id: 'systems',
      label: '星系(S)',
      items: [
        { label: '星系一覧', action: 'systemsList' },
        { label: '植民地', action: 'colonies' },
        { label: '交易センター', action: 'tradeCenters' },
        { label: '軍事基地', action: 'militaryBases' }
      ]
    },
    {
      id: 'fleets',
      label: '艦隊(L)',
      items: [
        { label: '艦隊一覧', action: 'fleetsList' },
        { label: '艦隊編成', action: 'fleetComposition' },
        { label: '艦隊配備', action: 'fleetDeployment' },
        { type: 'separator' },
        { label: '新規艦隊編成', action: 'newFleet' }
      ]
    },
    {
      id: 'officers',
      label: '士官(O)',
      items: [
        { label: '士官一覧', action: 'officersList' },
        { label: '人事異動', action: 'personnel' },
        { label: '昇進・昇格', action: 'promotions' },
        { type: 'separator' },
        { label: '士官学校', action: 'academy' }
      ]
    },
    {
      id: 'personal',
      label: '個人(I)',
      items: [
        { label: 'プロフィール', action: 'profile' },
        { label: '実績', action: 'achievements' },
        { label: '統計', action: 'statistics' }
      ]
    },
    {
      id: 'analysis',
      label: '解析(A)',
      items: [
        { label: '戦力分析', action: 'powerAnalysis' },
        { label: '経済分析', action: 'economicAnalysis' },
        { label: '技術分析', action: 'techAnalysis' },
        { type: 'separator' },
        { label: 'AIアドバイザー', action: 'aiAdvisor' }
      ]
    },
    {
      id: 'military',
      label: '軍事(M)',
      items: [
        { label: '作戦計画', action: 'operations' },
        { label: '戦闘シミュレーション', action: 'battleSim' },
        { label: '補給線', action: 'supplyLines' },
        { type: 'separator' },
        { label: '軍事研究', action: 'militaryResearch' }
      ]
    },
    {
      id: 'personnel',
      label: '人事(H)',
      items: [
        { label: '人事管理', action: 'hrManagement' },
        { label: '訓練計画', action: 'training' },
        { label: '退職・配置転換', action: 'transfers' }
      ]
    },
    {
      id: 'maintenance',
      label: '維持(N)',
      items: [
        { label: '艦隊整備', action: 'fleetMaintenance' },
        { label: '基地メンテナンス', action: 'baseMaintenance' },
        { label: '補給管理', action: 'supplyManagement' }
      ]
    },
    {
      id: 'map',
      label: '地図(G)',
      items: [
        { label: '星図', action: 'starMap' },
        { label: '戦術マップ', action: 'tacticalMap' },
        { label: '勢力マップ', action: 'factionMap' },
        { type: 'separator' },
        { label: 'マップ設定', action: 'mapSettings' }
      ]
    },
    {
      id: 'info',
      label: '情報(R)',
      items: [
        { label: '情報収集', action: 'intelligence' },
        { label: 'スパイ活動', action: 'espionage' },
        { label: '通信傍受', action: 'communications' }
      ]
    },
    {
      id: 'special',
      label: '特務(T)',
      items: [
        { label: '特殊作戦', action: 'specialOps' },
        { label: '極秘任務', action: 'secretMissions' },
        { label: 'エージェント', action: 'agents' }
      ]
    },
    {
      id: 'finance',
      label: '財政(C)',
      items: [
        { label: '予算管理', action: 'budget' },
        { label: '収支報告', action: 'financial' },
        { label: '投資計画', action: 'investments' },
        { type: 'separator' },
        { label: '税制', action: 'taxation' }
      ]
    },
    {
      id: 'environment',
      label: '環境(E)',
      items: [
        { label: '環境設定', action: 'environment' },
        { label: 'グラフィック設定', action: 'graphics' },
        { label: 'サウンド設定', action: 'sound' },
        { type: 'separator' },
        { label: 'ゲーム設定', action: 'gameSettings' }
      ]
    }
  ];

  const handleMenuClick = (sectionId) => {
    setOpenSection(sectionId);
  };

  const handleMenuItemClick = (action) => {
    console.log(`メニューアクション: ${action}`);
    
    // レイアウト切替の処理
    if (action === 'layoutRightBottom' || action === 'layoutBottomOnly') {
      toggleLayoutMode();
    }
    
    // その他のアクションは将来実装
    // TODO: 各メニューアクションの実装
    
    setOpenSection('none');
  };

  const renderDropdownItem = (item, index) => {
    if (item.type === 'separator') {
      return <div key={index} className={styles.dropdownSeparator} />;
    }

    if (item.submenu) {
      return (
        <div key={index} className={styles.dropdownItem}>
          {item.label}
          {/* TODO: サブメニューの実装 */}
        </div>
      );
    }

    return (
      <button
        key={index}
        className={styles.dropdownItem}
        onClick={() => handleMenuItemClick(item.action)}
      >
        <span>{item.label}</span>
        {item.shortcut && (
          <span style={{ float: 'right', marginLeft: '20px', color: '#666' }}>
            {item.shortcut}
          </span>
        )}
        {item.checked && (
          <span style={{ position: 'absolute', left: '4px' }}>✓</span>
        )}
      </button>
    );
  };

  return (
    <div className={styles.menuBar} ref={menuRef}>
      {menuItems.map((menu) => (
        <div key={menu.id} className={styles.menuItem}>
          <button
            className={`${styles.menuItem} ${openSection === menu.id ? styles.active : ''}`}
            onClick={() => handleMenuClick(menu.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleMenuClick(menu.id);
              }
            }}
          >
            {menu.label}
          </button>
          
          {openSection === menu.id && (
            <div className={styles.dropdown}>
              {menu.items.map((item, index) => renderDropdownItem(item, index))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}