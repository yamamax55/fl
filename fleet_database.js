const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパス
const dbPath = path.join(__dirname, 'fleet_db.db');

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
    } else {
        console.log('fleet_db SQLiteデータベースに接続しました');
        setupAdmiralTables();
    }
});

// 提督テーブルを先に作成
function setupAdmiralTables() {
    // ranksテーブル作成
    db.run(`CREATE TABLE IF NOT EXISTS ranks (
        rank_id INTEGER PRIMARY KEY AUTOINCREMENT,
        rank_name TEXT NOT NULL,
        hierarchy_order INTEGER NOT NULL
    )`, (err) => {
        if (err) {
            console.error('ranksテーブル作成エラー:', err.message);
        } else {
            // admiral_basicテーブル作成
            db.run(`CREATE TABLE IF NOT EXISTS admiral_basic (
                admiral_id INTEGER PRIMARY KEY AUTOINCREMENT,
                last_name TEXT NOT NULL,
                first_name TEXT NOT NULL,
                age INTEGER NOT NULL,
                rank_id INTEGER NOT NULL,
                FOREIGN KEY (rank_id) REFERENCES ranks(rank_id)
            )`, (err) => {
                if (err) {
                    console.error('admiral_basicテーブル作成エラー:', err.message);
                } else {
                    insertBasicData();
                }
            });
        }
    });
}

// 基本データ挿入
function insertBasicData() {
    // 階級データ
    const ranks = [
        ['元帥', 1], ['大将', 2], ['中将', 3], ['少将', 4], ['准将', 5],
        ['大佐', 6], ['中佐', 7], ['少佐', 8], ['大尉', 9], ['中尉', 10]
    ];

    const rankStmt = db.prepare('INSERT OR IGNORE INTO ranks (rank_name, hierarchy_order) VALUES (?, ?)');
    ranks.forEach(([name, order]) => {
        rankStmt.run(name, order);
    });
    
    rankStmt.finalize((err) => {
        if (err) {
            console.error('階級データ挿入エラー:', err.message);
        } else {
            // 提督データ
            const admirals = [
                ['ヤン', 'ウェンリー', 33, 1],
                ['ラインハルト', 'フォン', 22, 1],
                ['ビッテンフェルト', 'フリッツ', 35, 2],
                ['ミッターマイヤー', 'ヴォルフガング', 31, 2],
                ['ロイエンタール', 'オスカー', 33, 2]
            ];

            const admiralStmt = db.prepare('INSERT OR IGNORE INTO admiral_basic (last_name, first_name, age, rank_id) VALUES (?, ?, ?, ?)');
            admirals.forEach(([lastName, firstName, age, rankId]) => {
                admiralStmt.run(lastName, firstName, age, rankId);
            });
            
            admiralStmt.finalize((err) => {
                if (err) {
                    console.error('提督データ挿入エラー:', err.message);
                } else {
                    console.log('基本データを挿入しました');
                    initializeDatabase();
                }
            });
        }
    });
}

// データベース初期化
function initializeDatabase() {
    // fleetsテーブル作成（艦隊基本情報）
    db.run(`CREATE TABLE IF NOT EXISTS fleets (
        fleet_id INTEGER PRIMARY KEY AUTOINCREMENT,
        fleet_name TEXT NOT NULL,
        faction TEXT NOT NULL CHECK (faction IN ('Alliance', 'Empire')),
        fleet_type TEXT NOT NULL,
        ship_count INTEGER NOT NULL DEFAULT 0,
        total_firepower INTEGER NOT NULL DEFAULT 0,
        created_date TEXT DEFAULT (datetime('now')),
        status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Destroyed', 'Maintenance'))
    )`, (err) => {
        if (err) {
            console.error('fleetsテーブル作成エラー:', err.message);
        } else {
            console.log('fleetsテーブルを作成しました');
            createFleetCommandTable();
        }
    });
}

// fleet_commandテーブル作成（指揮官情報）
function createFleetCommandTable() {
    db.run(`CREATE TABLE IF NOT EXISTS fleet_command (
        command_id INTEGER PRIMARY KEY AUTOINCREMENT,
        fleet_id INTEGER NOT NULL UNIQUE,
        commander_id INTEGER UNIQUE,
        vice_commander_id INTEGER UNIQUE,
        staff_officer_id INTEGER UNIQUE,
        command_established_date TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (fleet_id) REFERENCES fleets(fleet_id) ON DELETE CASCADE,
        FOREIGN KEY (commander_id) REFERENCES admiral_basic(admiral_id),
        FOREIGN KEY (vice_commander_id) REFERENCES admiral_basic(admiral_id),
        FOREIGN KEY (staff_officer_id) REFERENCES admiral_basic(admiral_id),
        CHECK (
            (commander_id IS NULL OR (commander_id != vice_commander_id AND commander_id != staff_officer_id)) AND
            (vice_commander_id IS NULL OR (vice_commander_id != commander_id AND vice_commander_id != staff_officer_id)) AND
            (staff_officer_id IS NULL OR (staff_officer_id != commander_id AND staff_officer_id != vice_commander_id))
        )
    )`, (err) => {
        if (err) {
            console.error('fleet_commandテーブル作成エラー:', err.message);
        } else {
            console.log('fleet_commandテーブルを作成しました');
            insertFleetData();
        }
    });
}

// 艦隊データ挿入
function insertFleetData() {
    const fleets = [
        ['第1艦隊', 'Alliance', '主力艦隊', 12, 15000],
        ['第2艦隊', 'Alliance', '巡航艦隊', 8, 10000],
        ['第3艦隊', 'Alliance', '偵察艦隊', 6, 7500],
        ['イゼルローン要塞艦隊', 'Alliance', '要塞防衛艦隊', 20, 25000],
        ['ローエングラム艦隊', 'Empire', '皇帝直属艦隊', 25, 35000],
        ['ミッターマイヤー艦隊', 'Empire', '疾風ウォルフ艦隊', 15, 18000],
        ['ロイエンタール艦隊', 'Empire', '金銀妖瞳艦隊', 15, 18000],
        ['ビッテンフェルト艦隊', 'Empire', '黒色槍騎兵艦隊', 12, 16000]
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO fleets (fleet_name, faction, fleet_type, ship_count, total_firepower) VALUES (?, ?, ?, ?, ?)');
    
    fleets.forEach(([name, faction, type, shipCount, firepower]) => {
        stmt.run(name, faction, type, shipCount, firepower);
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('艦隊データ挿入エラー:', err.message);
        } else {
            console.log('艦隊データを挿入しました');
            insertFleetCommandData();
        }
    });
}

// 艦隊指揮官データ挿入
function insertFleetCommandData() {
    const commands = [
        [1, 1, null, null],     // 第1艦隊: ヤン・ウェンリー司令官
        [2, null, 2, null],     // 第2艦隊: ラインハルト副司令官  
        [3, null, null, 3],     // 第3艦隊: ビッテンフェルト参謀
        [4, null, null, null],  // イゼルローン: 指揮官未配属
        [5, 2, null, null],     // ローエングラム: ラインハルト司令官
        [6, 4, null, null],     // ミッターマイヤー: ミッターマイヤー司令官
        [7, 5, null, null],     // ロイエンタール: ロイエンタール司令官
        [8, 3, null, null]      // ビッテンフェルト: ビッテンフェルト司令官
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO fleet_command (fleet_id, commander_id, vice_commander_id, staff_officer_id) VALUES (?, ?, ?, ?)');
    
    commands.forEach(([fleetId, commanderId, viceCommanderId, staffOfficerId]) => {
        stmt.run(fleetId, commanderId, viceCommanderId, staffOfficerId);
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('艦隊指揮官データ挿入エラー:', err.message);
        } else {
            console.log('艦隊指揮官データを挿入しました');
            displayFleetInfo();
        }
    });
}

// 艦隊情報表示
function displayFleetInfo() {
    const query = `
        SELECT 
            f.fleet_id,
            f.fleet_name,
            f.faction,
            f.fleet_type,
            f.ship_count,
            f.total_firepower,
            f.status,
            commander.last_name || ' ' || commander.first_name as commander_name,
            commander_rank.rank_name as commander_rank,
            vice.last_name || ' ' || vice.first_name as vice_commander_name,
            vice_rank.rank_name as vice_commander_rank,
            staff.last_name || ' ' || staff.first_name as staff_officer_name,
            staff_rank.rank_name as staff_officer_rank
        FROM fleets f
        LEFT JOIN fleet_command fc ON f.fleet_id = fc.fleet_id
        LEFT JOIN admiral_basic commander ON fc.commander_id = commander.admiral_id
        LEFT JOIN ranks commander_rank ON commander.rank_id = commander_rank.rank_id
        LEFT JOIN admiral_basic vice ON fc.vice_commander_id = vice.admiral_id
        LEFT JOIN ranks vice_rank ON vice.rank_id = vice_rank.rank_id
        LEFT JOIN admiral_basic staff ON fc.staff_officer_id = staff.admiral_id
        LEFT JOIN ranks staff_rank ON staff.rank_id = staff_rank.rank_id
        ORDER BY f.faction, f.fleet_id
    `;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('艦隊情報取得エラー:', err.message);
        } else {
            console.log('\n=== 艦隊管理システム ===');
            
            // 同盟軍艦隊
            console.log('\n【自由惑星同盟艦隊】');
            rows.filter(row => row.faction === 'Alliance').forEach(row => {
                displaySingleFleet(row);
            });
            
            // 帝国軍艦隊
            console.log('\n【銀河帝国艦隊】');
            rows.filter(row => row.faction === 'Empire').forEach(row => {
                displaySingleFleet(row);
            });
        }
        
        // データベース接続を閉じる
        db.close((err) => {
            if (err) {
                console.error('データベース終了エラー:', err.message);
            } else {
                console.log('\nデータベース接続を終了しました');
            }
        });
    });
}

// 単一艦隊情報表示
function displaySingleFleet(fleet) {
    console.log(`\n--- ${fleet.fleet_name} ---`);
    console.log(`艦隊ID: ${fleet.fleet_id}`);
    console.log(`艦隊種別: ${fleet.fleet_type}`);
    console.log(`艦船数: ${fleet.ship_count}隻`);
    console.log(`総火力: ${fleet.total_firepower}`);
    console.log(`状態: ${fleet.status}`);
    
    console.log('指揮系統:');
    if (fleet.commander_name) {
        console.log(`  司令官: ${fleet.commander_rank} ${fleet.commander_name}`);
    } else {
        console.log(`  司令官: 未配属`);
    }
    
    if (fleet.vice_commander_name) {
        console.log(`  副司令官: ${fleet.vice_commander_rank} ${fleet.vice_commander_name}`);
    } else {
        console.log(`  副司令官: 未配属`);
    }
    
    if (fleet.staff_officer_name) {
        console.log(`  参謀: ${fleet.staff_officer_rank} ${fleet.staff_officer_name}`);
    } else {
        console.log(`  参謀: 未配属`);
    }
}

module.exports = { db };