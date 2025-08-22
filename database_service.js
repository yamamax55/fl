// ブラウザ環境向けデータベースサービス（静的インポート）
import { admiralsData } from './data/admirals.js';
import { fleetsData } from './data/fleets.js';

export class DatabaseService {
    constructor() {
        this.isInitialized = false;
        this.admiralsData = admiralsData;
        this.fleetsData = fleetsData;
        this.fleetMapping = {
            alliance: { 1: 1, 2: 2, 3: 3 },
            empire: { 1: 5, 2: 6, 3: 7 }
        };
    }
    
    async initialize() {
        // 静的インポートなので即座に初期化完了
        this.isInitialized = true;
        console.log('DatabaseService initialized with static data');
        console.log('Admirals count:', this.admiralsData.admirals.length);
        console.log('Fleets count:', this.fleetsData.fleets.length);
        return true;
    }
    
    // 艦隊番号から艦隊IDを取得
    getFleetIdByNumber(fleetNumber, faction) {
        const mapping = this.fleetMapping[faction];
        return mapping ? mapping[fleetNumber] : null;
    }
    
    // 艦隊司令官情報を取得
    async getFleetCommanderInfo(fleetId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const fleet = this.fleetsData.fleets.find(f => f.id === fleetId);
        if (!fleet) {
            console.error(`Fleet with ID ${fleetId} not found`);
            return null;
        }
        
        console.log(`Getting commander info for fleet ${fleetId}:`, fleet);
        
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
                console.log(`Commander found: ${commander.rank} ${commander.lastName} ${commander.firstName}`);
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