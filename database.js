const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパス
const dbPath = path.join(__dirname, 'military_ranks.db');

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
    } else {
        console.log('SQLiteデータベースに接続しました');
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
            console.error('テーブル作成エラー:', err.message);
        } else {
            console.log('ranksテーブルを作成しました');
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

    const stmt = db.prepare('INSERT INTO ranks (rank_name, hierarchy_order) VALUES (?, ?)');
    
    ranks.forEach(([name, order]) => {
        stmt.run(name, order);
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('データ挿入エラー:', err.message);
        } else {
            console.log('階級データを挿入しました');
            verifyData();
        }
    });
}

// データ確認
function verifyData() {
    db.all('SELECT * FROM ranks ORDER BY hierarchy_order', (err, rows) => {
        if (err) {
            console.error('データ取得エラー:', err.message);
        } else {
            console.log('\n登録された階級:');
            rows.forEach(row => {
                console.log(`${row.hierarchy_order}. ${row.rank_name} (ID: ${row.rank_id})`);
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

module.exports = { db };