import * as PIXI from 'pixi.js';

export class MapSystem {
    constructor(app, gameArea) {
        this.app = app;
        this.gameArea = gameArea;
        this.currentMap = null;
        this.mapData = null;
        this.terrainContainer = null;
        this.obstacleContainer = null;
        this.isLoaded = false;
    }

    async loadMapsData() {
        try {
            const response = await fetch('/data/maps.json');
            this.mapData = await response.json();
            console.log('マップデータ読み込み完了:', this.mapData.maps.length, '個のマップ');
            this.isLoaded = true;
            return this.mapData;
        } catch (error) {
            console.error('マップデータ読み込みエラー:', error);
            throw error;
        }
    }

    getMapsList() {
        if (!this.isLoaded || !this.mapData) return [];
        
        return this.mapData.maps.map(map => ({
            id: map.id,
            name: map.name,
            description: map.description
        }));
    }

    getMapById(mapId) {
        if (!this.isLoaded || !this.mapData) return null;
        return this.mapData.maps.find(map => map.id === mapId);
    }

    setCurrentMap(mapId) {
        const map = this.getMapById(mapId);
        if (!map) {
            console.error('マップが見つかりません:', mapId);
            return false;
        }

        this.currentMap = map;
        console.log('現在のマップ設定:', map.name);
        return true;
    }

    createMapContainers(gameStage) {
        // 地形コンテナ（艦隊の下に描画）
        this.terrainContainer = new PIXI.Container();
        this.terrainContainer.x = this.gameArea.x;
        this.terrainContainer.y = this.gameArea.y;
        gameStage.addChildAt(this.terrainContainer, 0);

        // 障害物コンテナ（艦隊の上に描画）
        this.obstacleContainer = new PIXI.Container();
        this.obstacleContainer.x = this.gameArea.x;
        this.obstacleContainer.y = this.gameArea.y;
        gameStage.addChild(this.obstacleContainer);

        console.log('マップコンテナ作成完了');
    }

    renderCurrentMap() {
        if (!this.currentMap) {
            console.warn('レンダリングするマップが設定されていません');
            return;
        }

        // 既存の地形と障害物をクリア
        this.clearMap();

        // 地形を描画
        this.renderTerrains();

        // 障害物を描画
        this.renderObstacles();

        console.log(`マップ「${this.currentMap.name}」のレンダリング完了`);
    }

    renderTerrains() {
        if (!this.currentMap.terrains || !this.terrainContainer) return;

        this.currentMap.terrains.forEach(terrainGroup => {
            const terrainType = this.mapData.terrainTypes[terrainGroup.type];
            if (!terrainType) return;

            terrainGroup.areas.forEach(area => {
                const terrainGraphic = new PIXI.Graphics();
                terrainGraphic.rect(area.x, area.y, area.width, area.height);
                terrainGraphic.fill({
                    color: terrainType.color,
                    alpha: terrainType.alpha
                });

                // 地形効果の情報を保存
                terrainGraphic.terrainData = {
                    type: terrainGroup.type,
                    effect: area.effect,
                    bounds: {
                        x: area.x,
                        y: area.y,
                        width: area.width,
                        height: area.height
                    }
                };

                this.terrainContainer.addChild(terrainGraphic);
            });
        });
    }

    renderObstacles() {
        if (!this.currentMap.obstacles || !this.obstacleContainer) return;

        this.currentMap.obstacles.forEach(obstacle => {
            const obstacleType = this.mapData.obstacleTypes[obstacle.type];
            if (!obstacleType) return;

            const obstacleGraphic = new PIXI.Graphics();
            obstacleGraphic.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5);
            obstacleGraphic.fill(obstacleType.color);
            obstacleGraphic.stroke({ width: 2, color: 0x222222 });

            // 障害物情報を保存
            obstacleGraphic.obstacleData = {
                type: obstacle.type,
                bounds: {
                    x: obstacle.x,
                    y: obstacle.y,
                    width: obstacle.width,
                    height: obstacle.height
                }
            };

            this.obstacleContainer.addChild(obstacleGraphic);
        });
    }

    clearMap() {
        if (this.terrainContainer) {
            this.terrainContainer.removeChildren();
        }
        if (this.obstacleContainer) {
            this.obstacleContainer.removeChildren();
        }
    }

    // 指定座標の地形効果を取得
    getTerrainEffectAt(x, y) {
        if (!this.terrainContainer) return null;

        // ゲーム座標からマップ座標に変換
        const mapX = x - this.gameArea.x;
        const mapY = y - this.gameArea.y;

        for (let i = this.terrainContainer.children.length - 1; i >= 0; i--) {
            const terrain = this.terrainContainer.children[i];
            if (terrain.terrainData) {
                const bounds = terrain.terrainData.bounds;
                if (mapX >= bounds.x && mapX <= bounds.x + bounds.width &&
                    mapY >= bounds.y && mapY <= bounds.y + bounds.height) {
                    return terrain.terrainData.effect;
                }
            }
        }

        return null;
    }

    // 指定座標に障害物があるかチェック
    hasObstacleAt(x, y, width = 20, height = 20) {
        if (!this.obstacleContainer) return false;

        // ゲーム座標からマップ座標に変換
        const mapX = x - this.gameArea.x;
        const mapY = y - this.gameArea.y;

        for (const obstacle of this.obstacleContainer.children) {
            if (obstacle.obstacleData) {
                const bounds = obstacle.obstacleData.bounds;
                // 矩形同士の衝突判定
                if (mapX < bounds.x + bounds.width &&
                    mapX + width > bounds.x &&
                    mapY < bounds.y + bounds.height &&
                    mapY + height > bounds.y) {
                    return true;
                }
            }
        }

        return false;
    }

    // スポーン地点を取得
    getSpawnPoints(faction) {
        if (!this.currentMap) return [];
        
        const spawnPoints = this.currentMap.spawnPoints[faction.toLowerCase()];
        if (!spawnPoints) return [];

        // ゲーム座標に変換
        return spawnPoints.map(point => ({
            x: point.x + this.gameArea.x,
            y: point.y + this.gameArea.y
        }));
    }

    // 移動可能な位置に調整
    adjustPositionForObstacles(targetX, targetY, fleetSize = 20) {
        if (!this.hasObstacleAt(targetX, targetY, fleetSize, fleetSize)) {
            return { x: targetX, y: targetY };
        }

        // 障害物を避ける位置を探す
        const searchRadius = 50;
        const stepSize = 10;

        for (let radius = stepSize; radius <= searchRadius; radius += stepSize) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const testX = targetX + Math.cos(angle) * radius;
                const testY = targetY + Math.sin(angle) * radius;

                // ゲーム領域内かチェック
                if (testX >= this.gameArea.x && testX <= this.gameArea.x + this.gameArea.width &&
                    testY >= this.gameArea.y && testY <= this.gameArea.y + this.gameArea.height) {
                    
                    if (!this.hasObstacleAt(testX, testY, fleetSize, fleetSize)) {
                        return { x: testX, y: testY };
                    }
                }
            }
        }

        // 適切な位置が見つからない場合は元の位置を返す
        return { x: targetX, y: targetY };
    }

    destroy() {
        this.clearMap();
        
        if (this.terrainContainer && this.terrainContainer.parent) {
            this.terrainContainer.parent.removeChild(this.terrainContainer);
            this.terrainContainer.destroy();
        }
        
        if (this.obstacleContainer && this.obstacleContainer.parent) {
            this.obstacleContainer.parent.removeChild(this.obstacleContainer);
            this.obstacleContainer.destroy();
        }

        this.currentMap = null;
        this.mapData = null;
        this.isLoaded = false;
        
        console.log('マップシステム破棄完了');
    }
}