import Alvita from '../../static/gamedata/World/Alvita.json';

const gameTileProto = require('../protobuf/gametile_pb');

class Model {
    constructor(game, onModelChange, onViewportChange) {
        this.game = game;
        this.tileScreenWidth = game.tileSize * game.tileScale;
        this.world = Alvita;
        this.sheets = game.sheets;
        this.gameTiles = {};
        this.viewport = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            zoom: 1,
        };
        this.handlers = {
            change: onModelChange,
            viewport: onViewportChange,
        }
    }

    updateViewport(x, y, width, height, zoom) {
        this.viewport = { x, y, width, height, zoom };
        if (this.handlers.viewport) this.handlers.viewport(this.viewport);
    }

    getViewport() {
        return this.viewport;
    }

    mapSize() {
        return {
            width: this.world.width,
            height: this.world.height,
            tileScreenWidth: this.tileScreenWidth,
        };
    }

    getWorldTileInfo(x, y) {
        // TODO need to know which layer
        const layerID = 0;
        const layer = this.world.layers[layerID];
        // TODO should read start num from spritesheet
        const spritesheetStartNum = 1;
        const tilePos = (y * layer.width) + x;
        const tileID = layer.data[tilePos] - spritesheetStartNum;
        const textureInfo = this.sheets.Ground.getTextureInfoByID(tileID);
        return textureInfo
    }

    updateGameTile(gametile) {
        let col = this.gameTiles[gametile.getX()];
        if (col == null) col = {};

        // Compare old GameTile to new to skip duplicate updates
        let oldGametile = col[gametile.getY()]
        if (oldGametile != null) {
            oldGametile = oldGametile.gametile;
            const oldTimestamp = oldGametile.getLastChangedTimestamp();
            const newTimestamp = gametile.getLastChangedTimestamp();
            if (oldTimestamp === newTimestamp) {
                // no update necessary, gametiles are the same
                return;
            }
        }

        // console.log('[Model] updated at (' +
        //     gametile.getX() + ', ' + gametile.getY() + ')');

        col[gametile.getY()] = {
            gametile
        };
        this.gameTiles[gametile.getX()] = col;

        if (this.handlers.change) {
            this.handlers.change(gametile);
        }
    }

    getGameTile(x, y) {
        let col = this.gameTiles[x];
        if (col == null) col = {};
        return col[y] || null;
    }

    isFlowerPlanted(id) {
        return !!this.getGameTileByFlower(id);
    }

    // TODO keep an index of currently active flowers to make this fast
    getGameTileByFlower(id) {
        const cols = Object.values(this.gameTiles);
        for (let i = 0; i < cols.length; i++) {
            const tiles = Object.values(cols[i]);
            for (let j = 0; j < tiles.length; j++) {
                const contents = tiles[j].gametile.getContentList();
                for (let k = 0; k < contents.length; k++) {
                    const planted = gameTileProto.GameTile.Content.Type.PLANTED;
                    if (contents[k].getType() === planted &&
                        contents[k].getEthId() === id) {
                        return tiles[j].gametile;
                    }
                }
            }
        }
        return null;
    }

    getGameTilesOwnedByAccount(account) {
        const results = [];
        const cols = Object.values(this.gameTiles);
        for (let i = 0; i < cols.length; i++) {
            const tiles = Object.values(cols[i]);
            for (let j = 0; j < tiles.length; j++) {
                const gametile = tiles[j].gametile;
                if (gametile.getOwner() === account) {
                    results.push(gametile);
                }
            }
        }
        return results;
    }
}

export default Model;
