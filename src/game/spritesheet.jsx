import Ground from '../../static/gamedata/World/sprites/Ground.json';
import Toppers from '../../static/gamedata/World/sprites/Toppers.json';
import Entities from '../../static/gamedata/World/sprites/Entities.json';

// Note: spritesheet creation must be synchronous
class Spritesheet {
    constructor(name, spritesheetTexture, app) {
        if (name === 'Ground') this.json = Ground;
        else if (name === 'Toppers') this.json = Toppers;
        else if (name === 'Entities') this.json = Entities;
        else {
            console.log('Spritesheet.jsx: sheet', name, 'not supported');
            return;
        }

        this.app = app;
        this.name = name;
        this.spritesheetTexture = spritesheetTexture;
        this.numRows = Math.floor(this.json.imageheight / this.json.tileheight);
        this.numCols = Math.floor(this.json.imagewidth / this.json.tilewidth);
        this.textures = [];
        this.textureInfo = [];

        for (let x = 0; x < this.numCols; x += 1) {
            const column = [];
            for (let y = 0; y < this.numRows; y += 1) {
                column.push(this.getTextureBySpritesheetPosition(x, y))
            }
            this.textures.push(column);
        }

        // Precompute an array keyed on info.ids to avoid lots of loops later
        for (let i = 0; i < this.json.tiles.length; i++) {
            const info = this.json.tiles[i];
            this.textureInfo[info.id] = info;
        }
    }

    idToXY(num) {
        return {
            x: num % this.numCols,
            y: Math.floor(num / this.numCols),
        }
    }

    getTextureByID(num) {
        const pos = this.idToXY(num);
        return this.textures[pos.x][pos.y];
    }

    getTextureBySpritesheetPosition(x, y) {
        const spritesheet = this.app.loader.resources[this.name].texture;
        const texture = new PIXI.Texture(spritesheet,
            new PIXI.Rectangle(x * 128, y * 128, 128, 128));
        return texture;
    }

    getFirstTextureByTypeTag(type) {
        let info = null;

        for (let i = 0; i < this.json.tiles.length; i++) {
            if (this.json.tiles[i].type === type) {
                info = this.json.tiles[i];
                break;
            }
        }

        if (info != null) {
            return this.getTextureByID(info.id);
        }

        console.log('[Spritesheet] ERR: no tile with type:', type);
        return null;
    }

    getTextureInfoByID(id) {
        return this.textureInfo[id];
    }
}

export default Spritesheet;
