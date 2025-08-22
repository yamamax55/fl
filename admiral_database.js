const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパス
const dbPath = path.join(__dirname, 'admiral_db.db');

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
    } else {
        console.log('admiral_db SQLiteデータベースに接続しました');
        initializeDatabase();
    }
});

// データベース初期化
function initializeDatabase() {
    // ranksテーブル作成
    db.run(`CREATE TABLE IF NOT EXISTS ranks (
        rank_id INTEGER PRIMARY KEY AUTOINCREMENT,
        rank_name TEXT NOT NULL,
        hierarchy_order INTEGER NOT NULL
    )`, (err) => {
        if (err) {
            console.error('ranksテーブル作成エラー:', err.message);
        } else {
            insertRankData();
        }
    });
}

// 階級データ挿入
function insertRankData() {
    const ranks = [
        ['元帥', 1], ['大将', 2], ['中将', 3], ['少将', 4], ['准将', 5],
        ['大佐', 6], ['中佐', 7], ['少佐', 8], ['大尉', 9], ['中尉', 10],
        ['少尉', 11], ['准尉', 12], ['曹長', 13], ['軍曹', 14], ['伍長', 15],
        ['兵長', 16], ['上等兵', 17], ['一等兵', 18], ['二等兵', 19]
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO ranks (rank_name, hierarchy_order) VALUES (?, ?)');
    
    ranks.forEach(([name, order]) => {
        stmt.run(name, order);
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('階級データ挿入エラー:', err.message);
        } else {
            createAdmiralTables();
        }
    });
}

// 提督テーブル作成
function createAdmiralTables() {
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
            // admiral_statsテーブル作成
            db.run(`CREATE TABLE IF NOT EXISTS admiral_stats (
                stats_id INTEGER PRIMARY KEY AUTOINCREMENT,
                admiral_id INTEGER NOT NULL,
                command_stat INTEGER NOT NULL CHECK (command_stat >= 0 AND command_stat <= 120),
                administration INTEGER NOT NULL CHECK (administration >= 0 AND administration <= 120),
                intelligence INTEGER NOT NULL CHECK (intelligence >= 0 AND intelligence <= 120),
                mobility INTEGER NOT NULL CHECK (mobility >= 0 AND mobility <= 120),
                attack_stat INTEGER NOT NULL CHECK (attack_stat >= 0 AND attack_stat <= 120),
                defense_stat INTEGER NOT NULL CHECK (defense_stat >= 0 AND defense_stat <= 120),
                ground_combat INTEGER NOT NULL CHECK (ground_combat >= 0 AND ground_combat <= 120),
                air_combat INTEGER NOT NULL CHECK (air_combat >= 0 AND air_combat <= 120),
                political_ops INTEGER NOT NULL CHECK (political_ops >= 0 AND political_ops <= 120),
                intelligence_ops INTEGER NOT NULL CHECK (intelligence_ops >= 0 AND intelligence_ops <= 120),
                military_ops INTEGER NOT NULL CHECK (military_ops >= 0 AND military_ops <= 120),
                FOREIGN KEY (admiral_id) REFERENCES admiral_basic(admiral_id) ON DELETE CASCADE
            )`, (err) => {
                if (err) {
                    console.error('admiral_statsテーブル作成エラー:', err.message);
                } else {
                    insertAdmiralData();
                }
            });
        }
    });
}

// 提督データ挿入
function insertAdmiralData() {
    const admirals = [
        ['ヤン', 'ウェンリー', 33, 1],
        ['ラインハルト', 'フォン', 22, 1],
        ['ビッテンフェルト', 'フリッツ', 35, 2],
        ['ミッターマイヤー', 'ヴォルフガング', 31, 2],
        ['ロイエンタール', 'オスカー', 33, 2]
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO admiral_basic (last_name, first_name, age, rank_id) VALUES (?, ?, ?, ?)');
    
    admirals.forEach(([lastName, firstName, age, rankId]) => {
        stmt.run(lastName, firstName, age, rankId);
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('提督基本データ挿入エラー:', err.message);
        } else {
            insertAdmiralStats();
        }
    });
}

// 提督能力データ挿入
function insertAdmiralStats() {
    const stats = [
        [1, 120, 95, 115, 85, 105, 110, 70, 90, 60, 85, 75],
        [2, 118, 105, 110, 95, 115, 100, 85, 95, 90, 80, 95],
        [3, 95, 70, 75, 110, 120, 85, 95, 100, 40, 60, 90],
        [4, 110, 85, 95, 115, 105, 95, 90, 85, 70, 75, 85],
        [5, 115, 90, 105, 100, 110, 105, 80, 90, 85, 90, 95]
    ];

    const stmt = db.prepare(`INSERT OR IGNORE INTO admiral_stats 
        (admiral_id, command_stat, administration, intelligence, mobility, attack_stat, defense_stat, 
         ground_combat, air_combat, political_ops, intelligence_ops, military_ops) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    stats.forEach(([admiralId, command, admin, intel, mob, att, def, ground, air, pol, intelOps, mil]) => {
        stmt.run(admiralId, command, admin, intel, mob, att, def, ground, air, pol, intelOps, mil);
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('提督能力データ挿入エラー:', err.message);
        } else {
            console.log('提督データベースの初期化が完了しました');
            getYangInfo();
        }
    });
}

// ヤン・ウェンリーの情報取得
function getYangInfo() {
    const query = `
        SELECT 
            ab.admiral_id,
            ab.last_name,
            ab.first_name,
            ab.age,
            r.rank_name,
            r.hierarchy_order,
            ast.command_stat,
            ast.administration,
            ast.intelligence,
            ast.mobility,
            ast.attack_stat,
            ast.defense_stat,
            ast.ground_combat,
            ast.air_combat,
            ast.political_ops,
            ast.intelligence_ops,
            ast.military_ops
        FROM admiral_basic ab
        JOIN ranks r ON ab.rank_id = r.rank_id
        JOIN admiral_stats ast ON ab.admiral_id = ast.admiral_id
        WHERE ab.last_name = 'ヤン' AND ab.first_name = 'ウェンリー'
    `;

    db.get(query, (err, row) => {
        if (err) {
            console.error('ヤン・ウェンリー情報取得エラー:', err.message);
        } else if (row) {
            console.log('\n=== ヤン・ウェンリー 提督情報 ===');
            console.log(`提督ID: ${row.admiral_id}`);
            console.log(`氏名: ${row.rank_name} ${row.last_name} ${row.first_name}`);
            console.log(`年齢: ${row.age}歳`);
            console.log(`階級: ${row.rank_name} (序列: ${row.hierarchy_order})`);
            console.log('\n--- 能力値 ---');
            console.log(`統率: ${row.command_stat}`);
            console.log(`運営: ${row.administration}`);
            console.log(`情報: ${row.intelligence}`);
            console.log(`機動: ${row.mobility}`);
            console.log(`攻撃: ${row.attack_stat}`);
            console.log(`防御: ${row.defense_stat}`);
            console.log(`陸戦: ${row.ground_combat}`);
            console.log(`空戦: ${row.air_combat}`);
            console.log(`政治工作: ${row.political_ops}`);
            console.log(`情報工作: ${row.intelligence_ops}`);
            console.log(`軍事工作: ${row.military_ops}`);
        } else {
            console.log('ヤン・ウェンリーの情報が見つかりませんでした');
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

module.exports = { db };