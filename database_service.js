// ブラウザ環境向けデータベースサービス（JSONデータ）
export class DatabaseService {
    constructor() {
        this.isInitialized = false;
        this.admiralsData = null;
        this.fleetsData = null;
        this.fleetMapping = {
            alliance: { 1: 1, 2: 2, 3: 3 },
            empire: { 1: 5, 2: 6, 3: 7 }
        };
    }
    
    async initialize() {
        try {
            // JSONデータを非同期で読み込み
            const [admiralsResponse, fleetsResponse] = await Promise.all([
                fetch('/data/admirals.json'),
                fetch('/data/fleets.json')
            ]);
            
            this.admiralsData = await admiralsResponse.json();
            this.fleetsData = await fleetsResponse.json();
            
            this.isInitialized = true;
            console.log('DatabaseService initialized with JSON data');
            return true;
        } catch (error) {
            console.error('Failed to initialize DatabaseService:', error);
            console.error('Error details:', error.message);
            this.isInitialized = false;
            return false;
        }
    }
    
    // 艦隊番号から艦隊IDを取得
    getFleetIdByNumber(fleetNumber, faction) {
        const mapping = this.fleetMapping[faction];
        return mapping ? mapping[fleetNumber] : null;
    }
    
    // 艦隊司令官情報を取得
    async getFleetCommanderInfo(fleetId) {
        if (!this.isInitialized) {
            const initResult = await this.initialize();
            if (!initResult) {
                console.error('Failed to initialize database service');
                return null;
            }
        }
        
        if (!this.fleetsData || !this.fleetsData.fleets) {
            console.error('Fleet data not available');
            return null;
        }
        
        const fleet = this.fleetsData.fleets.find(f => f.id === fleetId);
        if (!fleet) {
            console.error(`Fleet with ID ${fleetId} not found`);
            return null;
        }
        
        // 司令官情報を組み立て
        const commanderInfo = {
            fleet_id: fleet.id,
            fleet_name: fleet.name,
            faction: fleet.faction,
            fleet_type: fleet.type,
            ship_count: fleet.shipCount,
            total_firepower: fleet.totalFirepower,
            status: fleet.status,
            commander_last_name: null,
            commander_first_name: null,
            commander_age: null,
            commander_rank: null,
            vice_last_name: null,
            vice_first_name: null,
            vice_age: null,
            vice_rank: null,
            staff_last_name: null,
            staff_first_name: null,
            staff_age: null,
            staff_rank: null
        };
        
        // 司令官情報を追加
        if (fleet.command.commander) {
            const commander = this.getAdmiralById(fleet.command.commander);
            if (commander) {
                commanderInfo.commander_last_name = commander.lastName;
                commanderInfo.commander_first_name = commander.firstName;
                commanderInfo.commander_age = commander.age;
                commanderInfo.commander_rank = commander.rank;
            }
        }
        
        // 副司令官情報を追加
        if (fleet.command.viceCommander) {
            const viceCommander = this.getAdmiralById(fleet.command.viceCommander);
            if (viceCommander) {
                commanderInfo.vice_last_name = viceCommander.lastName;
                commanderInfo.vice_first_name = viceCommander.firstName;
                commanderInfo.vice_age = viceCommander.age;
                commanderInfo.vice_rank = viceCommander.rank;
            }
        }
        
        // 参謀情報を追加
        if (fleet.command.staffOfficer) {
            const staffOfficer = this.getAdmiralById(fleet.command.staffOfficer);
            if (staffOfficer) {
                commanderInfo.staff_last_name = staffOfficer.lastName;
                commanderInfo.staff_first_name = staffOfficer.firstName;
                commanderInfo.staff_age = staffOfficer.age;
                commanderInfo.staff_rank = staffOfficer.rank;
            }
        }
        
        return commanderInfo;
    }
    
    // 提督IDから提督情報を取得
    getAdmiralById(admiralId) {
        if (!this.admiralsData || !this.admiralsData.admirals) {
            console.error('Admiral data not available');
            return null;
        }
        
        const admiral = this.admiralsData.admirals.find(admiral => admiral.id === admiralId);
        if (!admiral) {
            console.error(`Admiral with ID ${admiralId} not found`);
            return null;
        }
        
        return admiral;
    }
    
    // 提督の能力値を取得
    getAdmiralAbilities(admiralId) {
        const admiral = this.getAdmiralById(admiralId);
        return admiral ? admiral.abilities : null;
    }
    
    // データベース接続を閉じる（互換性のため残す）
    close() {
        this.isInitialized = false;
    }
}