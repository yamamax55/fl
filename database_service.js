// ブラウザ環境用データベースサービスクラス（静的データ）
export class DatabaseService {
    constructor() {
        this.isInitialized = false;
        this.fleetData = {};
    }

    // データベース初期化（静的データをロード）
    async initialize() {
        if (this.isInitialized) return;

        // 静的な艦隊・司令官データ
        this.fleetData = {
            1: { // 同盟第1艦隊
                fleet_id: 1,
                fleet_name: '第1艦隊',
                faction: 'Alliance',
                commander_last_name: 'ヤン',
                commander_first_name: 'ウェンリー',
                commander_age: 33,
                commander_rank: '元帥',
                vice_last_name: null,
                vice_first_name: null,
                vice_age: null,
                vice_rank: null,
                staff_last_name: null,
                staff_first_name: null,
                staff_age: null,
                staff_rank: null
            },
            2: { // 同盟第2艦隊
                fleet_id: 2,
                fleet_name: '第2艦隊',
                faction: 'Alliance',
                commander_last_name: null,
                commander_first_name: null,
                commander_age: null,
                commander_rank: null,
                vice_last_name: 'ラインハルト',
                vice_first_name: 'フォン',
                vice_age: 22,
                vice_rank: '元帥',
                staff_last_name: null,
                staff_first_name: null,
                staff_age: null,
                staff_rank: null
            },
            3: { // 同盟第3艦隊
                fleet_id: 3,
                fleet_name: '第3艦隊',
                faction: 'Alliance',
                commander_last_name: null,
                commander_first_name: null,
                commander_age: null,
                commander_rank: null,
                vice_last_name: null,
                vice_first_name: null,
                vice_age: null,
                vice_rank: null,
                staff_last_name: 'ビッテンフェルト',
                staff_first_name: 'フリッツ',
                staff_age: 35,
                staff_rank: '大将'
            },
            5: { // 帝国ローエングラム艦隊
                fleet_id: 5,
                fleet_name: 'ローエングラム艦隊',
                faction: 'Empire',
                commander_last_name: 'ラインハルト',
                commander_first_name: 'フォン',
                commander_age: 22,
                commander_rank: '元帥',
                vice_last_name: null,
                vice_first_name: null,
                vice_age: null,
                vice_rank: null,
                staff_last_name: null,
                staff_first_name: null,
                staff_age: null,
                staff_rank: null
            },
            6: { // 帝国ミッターマイヤー艦隊
                fleet_id: 6,
                fleet_name: 'ミッターマイヤー艦隊',
                faction: 'Empire',
                commander_last_name: 'ミッターマイヤー',
                commander_first_name: 'ヴォルフガング',
                commander_age: 31,
                commander_rank: '大将',
                vice_last_name: null,
                vice_first_name: null,
                vice_age: null,
                vice_rank: null,
                staff_last_name: null,
                staff_first_name: null,
                staff_age: null,
                staff_rank: null
            },
            7: { // 帝国ロイエンタール艦隊
                fleet_id: 7,
                fleet_name: 'ロイエンタール艦隊',
                faction: 'Empire',
                commander_last_name: 'ロイエンタール',
                commander_first_name: 'オスカー',
                commander_age: 33,
                commander_rank: '大将',
                vice_last_name: null,
                vice_first_name: null,
                vice_age: null,
                vice_rank: null,
                staff_last_name: null,
                staff_first_name: null,
                staff_age: null,
                staff_rank: null
            }
        };

        this.isInitialized = true;
        console.log('データベースサービスが初期化されました（静的データ）');
    }

    // 艦隊の司令官情報を取得
    async getFleetCommanderInfo(fleetId) {
        if (!this.isInitialized) {
            throw new Error('データベースが初期化されていません');
        }

        return this.fleetData[fleetId] || null;
    }

    // 艦隊番号から艦隊IDを取得するマッピング
    getFleetIdByNumber(fleetNumber, faction) {
        // ゲーム内の艦隊番号とデータベースのfleet_idをマッピング
        const fleetMapping = {
            'alliance': {
                1: 1, // 第1艦隊
                2: 2, // 第2艦隊
                3: 3  // 第3艦隊
            },
            'empire': {
                1: 5, // ローエングラム艦隊
                2: 6, // ミッターマイヤー艦隊
                3: 7  // ロイエンタール艦隊
            }
        };

        return fleetMapping[faction]?.[fleetNumber] || null;
    }

    // データベース接続を閉じる
    close() {
        if (this.fleetDb) {
            this.fleetDb.close();
        }
        if (this.admiralDb) {
            this.admiralDb.close();
        }
        this.isInitialized = false;
    }
}