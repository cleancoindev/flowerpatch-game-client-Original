// ORGANIZES RENDERABLE OBJECTS //

import { Elastic, Power2, TimelineLite } from 'gsap';

import Util from '../components/Util';
import GameUtil from './gameutil';
import RenderUtil from './renderutil';
import SpriteUtil from './spriteutil';
import GameConstants from '../../config/game.json';
const gameTileType = require('../protobuf/gametile_pb');

const TILE_RAISE_SPEED = 0.5;
const TILE_LOWER_SPEED = 0.25;
const TEMP_TILE_RAISE_SPEED = 0.2;
const TEMP_TILE_LOWER_SPEED = 0.1;

class Render {
    constructor(game) {
        this.game = game;
        this.app = game.app;
        this.gameboard = game.gameboard;
        this.tileSize = GameConstants.tile.size;
        this.tileScale = GameConstants.tile.scale;
        this.tileScreenSize = this.tileSize * this.tileScale;
        this.sheets = game.sheets;
        this.model = game.model;

        // Binds
        this.onModelChange = this.onModelChange.bind(this);
        this.handleViewportChange = this.handleViewportChange.bind(this);
        this.downloadData = this.downloadData.bind(this);

        // Memory references to various overlays, sprites
        this.references = {
            stack: {}, // container of an entire vertical stack of sprites
            block: {}, // ex. sand tile
            topper: {}, // ex. tilled land, trees, rocks
            watered: {}, // i.e. watered land
            flower: {}, // ex. flowers, flags
            owner: {}, // graphics indicating you own tiles
            raised: {}, // raise and lower entire stacks
            needsDownload: {}, // offscreen objects avoid downloading data
        };

        // Render layers
        this.layers = {
            block: new PIXI.Container(), // vertical stacks
        };
        this.gameboard.addChild(this.layers.block);

        // Event handling
        this.game.events.on('account-change', (oldAccount, newAccount) => {
            this.forEachReference('owner', (container) => {
                container.children.forEach(child => {
                    child.destroy();
                })
                container.removeChildren();
            })

            const ownedTiles = this.game.model.getGameTilesOwnedByAccount(newAccount);
            ownedTiles.forEach(tile => {
                const graphic = SpriteUtil.makeTileBorder(0xFFBE44);
                const container = this.getReference('owner', tile.getX(), tile.getY());
                container.addChild(graphic);
            })
        });

        this.game.events.on('viewport-change-dejitter', this.handleViewportChange);
    }

    componentDidMount(model) {
        this.model = model;
    }

    getRenderLayer(name) {
        return this.layers[name];
    }

    handleViewportChange() {
        // Could just iterate the visible space if checking all
        // to-download items is too expensive
        this.forEachReference('needsDownload', (info, x, y) => {
            if (!this.isVisibleTile(x, y)) return;
            const { type, callData } = { ...info };
            this.downloadData(type, x, y, callData)
        })
    }

    downloadData(type, x, y, callData) {
        const account = this.game.props.account;

        switch (type) {
            case 'flower': {
                const cardID = callData.tileContent.getEthId();
                this.clearReference('needsDownload', x, y);
                Util.PostAPI.ethFlowerDB.read(cardID, account).promise
                    .then((flowerProto) => {
                        SpriteUtil.makeFlower.call(this,
                            callData.app,
                            callData.sheets,
                            callData.tileInfo,
                            callData.tileContent,
                            callData.existing,
                            flowerProto);
                        // console.log(
                        //     '[Render] Rendered FLOWER #' + cardID + ' at', x, y);
                    }).catch((err) => {
                        console.error(err);
                        console.log('[Render] Retrying failed flower download:', cardID);
                        this.downloadDataWhenVisible(type, x, y, callData);
                    });
                break;
            }
            default:
                console.warn('Unknown needsDownload type:', type);
        }
    }

    isVisibleTile(x, y) {
        const stack = this.getReference('stack', x, y);
        if (!stack) return false;
        return stack.visible;
    }

    downloadDataWhenVisible(type, x, y, callData) {
        if (this.isVisibleTile(x, y)) {
            this.downloadData(type, x, y, callData);
        } else {
            this.setReference('needsDownload', x, y, { type, callData });
        }
    }

    onModelChange(gametile) {
        const tileX = gametile.getX();
        const tileY = gametile.getY();
        const tileInfo = GameUtil.getTilePositionInfo(tileX, tileY,
            this.gameboard, this.tileScreenSize);

        // Containers for various parts of a tile stack
        const containers = {
            owner: this.getReference('owner', tileX, tileY),
            topper: this.getReference('topper', tileX, tileY),
            watered: this.getReference('watered', tileX, tileY),
            flower: this.getReference('flower', tileX, tileY),
        }

        const oldSprites = {};
        Object.keys(containers).forEach(key => {
            oldSprites[key] = containers[key].children.length > 0 ?
                containers[key].children[0] : null;
        });

        // Compute the new sprites for the tile
        const newSprites = {};
        if (gametile.getOwner() === this.game.props.account) {
            newSprites.owner = SpriteUtil.makeTileBorder(0xFFBE44);
        }
        gametile.getContentList().forEach(function(content) {
            const ContentTypes = gameTileType.GameTile.Content.Type;

            switch (content.getType()) {
                case ContentTypes.TILLED:
                    newSprites.topper = this.newTilledSprite(
                        tileInfo, tileX, tileY);
                    newSprites.topper.spriteName = 'tilled';
                    break;
                case ContentTypes.PLANTED:
                    newSprites.flower = this.newFlowerSprite(
                        tileInfo, content, gametile);
                    break;
                case ContentTypes.TOPPER:
                    newSprites.topper = this.newTopperSprite(content);
                    break;
                case ContentTypes.WATERED:
                    newSprites.watered = this.newWateredSprite();
                    newSprites.watered.spriteName = 'watered';
                    break;
                default:
                    console.log('[Render] ERR Unknown Content Type:',
                        content.getType());
            }
        }.bind(this));

        Object.keys(oldSprites).forEach(async function(key) {
            const container = containers[key];
            const oldSprite = oldSprites[key];
            const newSprite = newSprites[key];

            if (oldSprite != null && newSprite != null &&
                oldSprite.spriteName != null &&
                oldSprite.spriteName === newSprite.spriteName) {
                // Skip updating a sprite with the same sprite
                return;
            }

            if (!oldSprite && newSprite) {
                newSprite.alpha = 0;
                container.addChild(newSprite);
                RenderUtil.fadeIn(this.app, newSprite, 0.025);
            }
            else if (oldSprite && newSprite) {
                newSprite.alpha = 0;
                container.addChild(newSprite);
                RenderUtil.fadeIn(this.app, newSprite, 0.025);
                await RenderUtil.fadeOut(this.app, oldSprite, 0.025);
                container.removeChild(oldSprite);
                try {
                    oldSprite.destroy();
                } catch (e) {
                    console.log('[Render] ERR destroying oldsprite:', e);
                }
            }
            else if (oldSprite && !newSprite) {
                await RenderUtil.fadeOut(this.app, oldSprite, 0.025);
                container.removeChild(oldSprite);
                try {
                    oldSprite.destroy();
                } catch (e) {
                    console.log('[Render] ERR destroying oldsprite:', e);
                }
            }
        }.bind(this));

        // console.log('[Model] Updated at (' + tileX + ',' + tileY + ')');
    }

    newTilledSprite(tileInfo, tileX, tileY) {
        const worldInfo = this.model.getWorldTileInfo(tileX, tileY);
        const texture = this.sheets.Toppers.getFirstTextureByTypeTag(worldInfo.type);

        const tilledSprite = new PIXI.Sprite(texture);
        tilledSprite.anchor.set(0.5, 1);
        tilledSprite.scale.x = this.tileScale;
        tilledSprite.scale.y = this.tileScale;

        return tilledSprite;
    }

    newWateredSprite() {
        const tag = 'watered ' + (Util.Math.randomInt(3) + 1);
        const texture = this.sheets.Toppers.getFirstTextureByTypeTag(tag);
        const flipX = Util.Math.randomInt(2) === 1;
        const flipY = Util.Math.randomInt(2) === 1;

        const wateredSprite = new PIXI.Sprite(texture);
        wateredSprite.anchor.set(0.5, flipY ? 0.5 : 1);
        wateredSprite.scale.x = (flipX ? -1 : 1) * this.tileScale;
        wateredSprite.scale.y = (flipY ? -1 : 1) * this.tileScale;

        return wateredSprite;
    }

    newFlowerSprite(tileInfo, tileContent, gameTile) {
        const flower = SpriteUtil.makeFlower(
            this.app, this.sheets, tileInfo, tileContent, null, null);

        this.downloadDataWhenVisible(
            'flower', gameTile.getX(), gameTile.getY(), {
                app: this.app,
                sheets: this.sheets,
                tileInfo,
                tileContent,
                existing: flower
            });

        return flower;
    }

    newTopperSprite(tileContent) {
        return SpriteUtil.makeTopper(this.sheets, tileContent);
    }

    setReference(type, x, y, reference) {
        const category = this.references[type];

        let col = category[x];
        if (col == null) col = {};

        col[y] = reference;
        category[x] = col;
    }

    getReference(type, x, y) {
        const category = this.references[type];

        let col = category[x];
        if (col == null) col = {};
        return col[y] || null;
    }

    forEachReference(type, func) {
        const category = this.references[type];

        Object.keys(category).forEach(x => {
            Object.keys(category[x]).forEach(y => {
                if (category[x][y] != null) func(category[x][y], x, y);
            })
        })
    }

    clearReference(type, x, y) {
        this.setReference(type, x, y, null);
    }

    // Adds sprite to a tile stack
    addToStack(x, y, sprite) {
        const stack = this.getReference('stack', x, y);

        if (stack == null) {
            console.log('[Render] ERR: no stack at', x, y);
            return;
        }

        stack.addChild(sprite);
    }

    _cancelTileRaise(x, y, position) {
        position = position == null ? 0 : position;
        const raise = this.getReference('raised', x, y);
        if (raise) {
            raise.timeline.pause().seek(position).kill();
        }
    }

    isManualRaised(x, y) {
        const info = this.getReference('raised', x, y);
        if (info == null) return false;
        else if (info.type === 'raise') return true;
        return false;
    }

    getCurrentRaiseAmount(x, y) {
        const info = this.getReference('raised', x, y);
        const stack = this.getReference('stack', x, y);
        if (info == null || stack == null) return 0;

        return stack.y - info.originals.y;
    }

    raiseTile(x, y, amountPx) {
        const oldInfo = this.getReference('raised', x, y);
        this._cancelTileRaise(x, y);

        amountPx = amountPx == null ? 32 : amountPx;
        const stack = this.getReference('stack', x, y);
        if (stack == null) return;

        const origX = oldInfo ? oldInfo.originals.x : stack.x;
        const origY = oldInfo ? oldInfo.originals.y : stack.y;

        const timeline = new TimelineLite();
        this.setReference('raised', x, y, {
            type: 'raise',
            originals: {
                x: origX,
                y: origY,
            },
            timeline,
        });

        timeline.to(stack, TILE_RAISE_SPEED, {
            y: origY - amountPx,
            ease: Elastic.easeOut,
        });
    }

    lowerTile(x, y) {
        const oldInfo = this.getReference('raised', x, y);
        if (oldInfo == null) return; // nothing to lower
        else this._cancelTileRaise(x, y, '-=0');

        const stack = this.getReference('stack', x, y);
        if (stack == null) return;

        const timeline = new TimelineLite();
        this.setReference('raised', x, y, {
            type: 'lower',
            originals: {
                x: oldInfo.originals.x,
                y: oldInfo.originals.y,
            },
            timeline,
        });

        timeline.to(stack, TILE_LOWER_SPEED, {
            y: oldInfo.originals.y,
            ease: Power2.easeInOut,
            onComplete: () => {
                this.clearReference('raised', x, y);
            }
        });
    }

    lowerAllManuallyRaised() {
        this.forEachReference('raised', (info, x, y) => {
            if (info.type === 'raise') {
                this.lowerTile(x, y);
            }
        });
    }

    // Temporarily raise+lower an entire tile stack
    tempRaiseTile(x, y, amountPx, delaySec) {
        if (this.getReference('raised', x, y)) return;

        delaySec = delaySec == null ? 2 : delaySec;
        amountPx = amountPx == null ? 32 : amountPx;
        const stack = this.getReference('stack', x, y);
        if (stack == null) return;

        const timeline = new TimelineLite();
        this.setReference('raised', x, y, {
            type: 'temp-raise',
            originals: {
                x: stack.x,
                y: stack.y,
            },
            timeline,
        });

        timeline.to(stack, TEMP_TILE_RAISE_SPEED, {
            y: stack.y - amountPx,
            ease: Elastic.easeOut,
        }).to(stack, TEMP_TILE_LOWER_SPEED, {
            y: stack.y,
            ease: Power2.easeInOut,
            onComplete: () => {
                this.clearReference('raised', x, y);
            }
        }, '+=' + delaySec);
    }
}

export default Render;
