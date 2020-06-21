import PropTypes from 'prop-types';
const Viewport = require('pixi-viewport');
const Cull = require('pixi-cull');
import NanoEvents from 'nanoevents';
require('gsap/PixiPlugin');
const gameTileProto = require('../protobuf/gametile_pb.js');

import Util from '../components/Util';
import GameUtil from './gameutil';
import GameConstants from '../../config/game.json';
import Model from './model.jsx';
import Spritesheet from './spritesheet.jsx';
import LoadingWaterFill from './loading/water-fill.jsx';
import LoadingTitleScreen from './loading/titlescreen.jsx';
import Keyboard from './keyboard.jsx';
import Audio from './audio.jsx';
import Render from './render.jsx';
import Netcode from './netcode.jsx';
import TileSelection from './tileselection.jsx';
import ToolSelection from './toolselection.jsx';
import Environmental from './environmental';

const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

class Game {
    constructor() {
        // binds
        this.handlePan = this.handlePan.bind(this);
        this.handlePanToTopLeft = this.handlePanToTopLeft.bind(this);
        this.handlePanToFlower = this.handlePanToFlower.bind(this);
        this.handleBoardClick = this.handleBoardClick.bind(this);
        this.handleToolSelected = this.handleToolSelected.bind(this);
        this.handleViewportChange = this.handleViewportChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.disableMouseEvents = this.disableMouseEvents.bind(this);
        this.enableMouseEvents = this.enableMouseEvents.bind(this);

        // timers
        this.viewportChangeDejitterID = -1;

        // constants
        // DEPRECATED: moving this to constants.json
        this.tileSize = 128;
        this.tileScale = 0.5;
        this.tileScreenSize = this.tileSize * this.tileScale;

        // variables
        this.props = {};
        this.loadComplete = false;
        this.tileSelection = null;
        this.lastAccount = null;

        // events:
        //  - board-click
        //  - account-change
        //  - viewport-change
        //  - viewport-change-dejitter
        this.events = new NanoEvents();
        this.events.once = function(event, callback) {
            const unbind = this.on(event, function (...args) {
                unbind();
                callback(...args);
            })
            return unbind;
        }.bind(this.events);

        // core game
        this.app = null;
        this.gameboard = null;
        this.model = null;
        this.sheets = {
            Ground: null,
            Toppers: null,
            Entities: null,
        };
        this.render = null;
        this.netcode = null;
        this.keyboard = null;
        this.audio = null;
        this.environmental = null;
        this.cull = null;
    }

    componentDidMount() {
        document.body.style.overflow = 'hidden';
        const canvas = this.props.canvasRef.current;

        // Create Pixi Application
        // resolution of 2 seems to work well even on non-retina
        // but resolution of 1 may be faster
        window.PIXI.RESOLUTION = 2;
        this.app = new window.PIXI.Application({
            view: canvas,
            resizeTo: canvas,
            width: this.props.width,
            height: this.props.height,
            clearBeforeRender: false,
            transparent: true,
            sharedLoader: false,
            sharedTicker: false,
            resolution: 2,
        });

        this.gameboard = new Viewport({
            interaction: this.app.renderer.plugins.interaction,
        });
        this.app.stage.addChild(this.gameboard);

        // Core Asset Loading
        if (this.app.loader.resources.Ground == null) {
            this.app.loader
                .add('Ground', '/gamedata/World/sprites/Ground.png?v=' +
                    window.CONFIG.GAME_VERSION)
                .add('Toppers', '/gamedata/World/sprites/Toppers.png?v=' +
                    window.CONFIG.GAME_VERSION)
                .add('Entities', '/gamedata/World/sprites/Entities.png?v=' +
                    window.CONFIG.GAME_VERSION)
                .load(this.onLoadComplete.bind(this));
        } else {
            this.onLoadComplete();
        }
    }

    componentWillUnmount() {
        document.body.style.overflow = 'initial';

        clearTimeout(this.viewportChangeDejitterID);

        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }

        if (this.keyboard) {
            this.keyboard.componentWillUnmount();
            this.keyboard = null;
        }

        if (this.audio) {
            this.audio.componentWillUnmount();
            this.audio = null;
        }

        if (this.netcode) {
            this.netcode.componentWillUnmount();
            this.netcode = null;
        }

        if (this.environmental) {
            this.environmental.componentWillUnmount();
            this.environmental = null;
        }

        console.log('[Game] Unmounted');
    }

    componentWillReceiveProps(props) {
        PropTypes.checkPropTypes(Game.propTypes, props, 'prop', 'Game');
        this.props = props;
        console.log('[Game] Received Props', props);
        if (this.lastAccount !== props.account) {
            const old = this.lastAccount;
            this.lastAccount = props.account;
            this.events.emit('account-change', old, props.account);
        }

        if (this.app != null) {
            const renderer = this.app.renderer;

            renderer.resize(this.props.width, this.props.height);
            if (this.gameboard != null) {
                this.gameboard.resize(this.props.width, this.props.height);
                if (this.cull != null) {
                    this.cull.cull(this.gameboard.getVisibleBounds());
                }
            }

            this.handlePan(0, 0); // to update viewport model
        }

        if (this.netcode) {
            this.netcode.componentWillReceiveProps(this.props);
        }
    }

    // Pans x tiles horizontally, and y tiles vertically, relative to the
    // current viewport. So {x = 1, y = -1} pans one tile right and one tile up.
    // Also updates the model to have the current viewport
    handlePan(x, y) {
        this.gameboard.x += -x * this.tileScreenSize;
        this.gameboard.y += -y * (this.tileScreenSize / 4);

        if (this.model != null && this.loadComplete) {
            this.model.updateViewport(
                (-1 * this.gameboard.x), (-1 * this.gameboard.y),
                this.props.width, this.props.height, this.gameboard.scale.x);
        }
    }

    // Pans such that tile x, y is on the top left corner of the screen
    handlePanToTopLeft(x, y) {
        const firstTileInfo = GameUtil.getFirstTileInfo(
            this.gameboard, this.tileScreenSize);

        this.gameboard.x = -1 * (firstTileInfo.x + (x * this.tileScreenSize));
        this.gameboard.y = -1 * (firstTileInfo.y + (y * this.tileScreenSize / 4));

        this.handlePan(0, 0); // for model update
    }

    // Pans such that tile x, y is centered
    handlePanToCenter(x, y) {
        const tileinfo = GameUtil.getTilePositionInfo(x, y, this.gameboard,
            GameConstants.tile.size * GameConstants.tile.scale);
        this.gameboard.moveCenter(tileinfo.midX, tileinfo.midY);
        this.handlePan(0, 0); // for model update
    }

    handlePanToFlower(flowerID) {
        const gametile = this.model.getGameTileByFlower(flowerID);
        const tileinfo = GameUtil.getTilePositionInfo(
            gametile.getX(), gametile.getY(), this.gameboard,
            GameConstants.tile.size * GameConstants.tile.scale);
        this.gameboard.moveCenter(tileinfo.midX, tileinfo.midY);
        this.handlePan(0, 0); // for model update
    }

    disableMouseEvents() {
        if (this.gameboard == null || this.tileSelection == null) return;
        this.gameboard.off('pointermove', this.tileSelection.mouseMove);
        this.gameboard.off('pointerdown', this.tileSelection.mouseDown);
        this.gameboard.off('pointerup', this.tileSelection.mouseUp);
    }

    enableMouseEvents() {
        if (this.gameboard == null || this.tileSelection == null) return;
        this.disableMouseEvents();
        this.gameboard.on('pointermove', this.tileSelection.mouseMove);
        this.gameboard.on('pointerdown', this.tileSelection.mouseDown);
        this.gameboard.on('pointerup', this.tileSelection.mouseUp);
    }

    handleFocus() {
        if (this.gameboard) {
            if (this.gameboard.plugins.pinch) {
                this.gameboard.plugins.pinch.paused = false;
            }
            if (this.gameboard.plugins.wheel) {
                this.gameboard.plugins.wheel.paused = false;
            }
            this.enableMouseEvents();
        }
    }

    handleBlur() {
        if (this.gameboard) {
            if (this.gameboard.plugins.pinch) {
                this.gameboard.plugins.pinch.paused = true;
            }
            if (this.gameboard.plugins.wheel) {
                this.gameboard.plugins.wheel.paused = true;
            }
            this.disableMouseEvents();
            if (this.tileSelection) this.tileSelection.hide();
            setTimeout(function() {
                if (this.tileSelection) this.tileSelection.hide();
            }.bind(this), 500);
        }
    }

    handleViewportChange(viewportInfo) {
        if (this.events) this.events.emit('viewport-change', viewportInfo);

        clearTimeout(this.viewportChangeDejitterID);
        this.viewportChangeDejitterID = setTimeout(function() {
            if (!this.events) return;
            this.events.emit('viewport-change-dejitter', viewportInfo);
        }.bind(this), 10);
    }

    // Note: boardEvent has untransformed info about tile positions. I.e.
    // it's not affected by the current zoom level
    handleBoardClick(boardEvent) {
        const layerID = 0; // needs to be layer-aware eventually
        const layer = this.model.world.layers[layerID];
        const tilePos = (boardEvent.tileY * layer.width) + boardEvent.tileX;
        const firstgid = this.model.world.tilesets[layerID].firstgid;
        const tileID = layer.data[tilePos] - firstgid;
        const groundTexture = this.sheets.Ground.getTextureByID(tileID);
        const groundInfo = this.sheets.Ground.getTextureInfoByID(tileID);
        const curToolInfo = this.toolselection.getCurrent();
        let gameTile = this.model.getGameTile(boardEvent.tileX, boardEvent.tileY);
        if (gameTile != null) {
            gameTile = gameTile.gametile;
        }

        // Handle storing viewport position in localstorage
        Util.TimedLocalStorage.save('viewport-center', {
            tileX: boardEvent.tileX,
            tileY: boardEvent.tileY,
        }, MONTH_IN_MS);

        // Compute Tile Content
        let spritesheetID = this.model.world.layers[1].data[tilePos];
        if (spritesheetID <= 0 && gameTile != null) {
            // no topper in the map, but may be in gametile
            const topperContent =
                Util.Protobuf.GameTile.getFirstTopperContent(gameTile);
            if (topperContent != null) {
                spritesheetID = topperContent.getTopperId();
            }
        } else {
            // adjust world id by firstgid to get spritesheet id
            spritesheetID -= this.model.world.tilesets[2].firstgid;
        }

        // Look Up Texture
        let topperInfo = null;
        let topperTexture = null;
        if (spritesheetID > 0) {
            topperInfo =
                this.sheets.Toppers.getTextureInfoByID(spritesheetID) || null;
            topperTexture =
                this.sheets.Toppers.getTextureByID(spritesheetID) || null;
        }

        // Handle Water Texture Specially
        let wateredTexture = this.render.getReference('watered',
            boardEvent.tileX, boardEvent.tileY);
        if (wateredTexture && wateredTexture.children.length > 0) {
            wateredTexture = wateredTexture.children[0].texture;
        } else {
            wateredTexture = null;
        }

        // Trigger click sound
        this.audio.click();

        // Emit board click event, which GameUI listens for
        this.events.emit('board-click', {
            boardEvent, groundInfo, groundTexture,
            curToolInfo, gameTile, topperInfo, topperTexture,
            wateredTexture
        });

        console.log('[Board Click] Tile (' +
            boardEvent.tileX + ', ' +
            boardEvent.tileY + ') - ' +
            groundInfo.type);
    }

    handleToolSelected(toolInfo) {
        if (this.toolselection) this.toolselection.setTool(toolInfo);
    }

    initModules() {
        // Spritesheet Wrappers
        this.sheets.Ground = new Spritesheet('Ground',
            this.app.loader.resources.Ground.texture, this.app);
        this.sheets.Toppers = new Spritesheet('Toppers',
            this.app.loader.resources.Toppers.texture, this.app);
        this.sheets.Entities = new Spritesheet('Entities',
            this.app.loader.resources.Entities.texture, this.app);

        // Core Modules
        this.render = new Render(this);
        this.model = new Model(this,
            this.render.onModelChange,
            this.handleViewportChange);
        this.render.componentDidMount(this.model);
        this.netcode = new Netcode(this);
        this.audio = new Audio();
        this.toolselection = new ToolSelection(this);
        this.tileSelection = new TileSelection(
            this.gameboard, this.model, this.render, this.handleBoardClick);
        this.environmental = new Environmental(this);

        // Input Handling
        this.keyboard = new Keyboard();
        this.keyboard.on('ArrowUp', this.handlePan.bind(this, 0, -4));
        this.keyboard.on('ArrowRight', this.handlePan.bind(this, 1, 0));
        this.keyboard.on('ArrowDown', this.handlePan.bind(this, 0, 4));
        this.keyboard.on('ArrowLeft', this.handlePan.bind(this, -1, 0));
    }

    // Start game after loading is all complete
    async onLoadComplete() {
        this.initModules();

        // Global Filters
        this.app.stage.filters = [];

        // Title Screen Sequence
        await Util.Promises.sleep(250);
        const title = new LoadingTitleScreen(this.app);
        await title.run();

        // Water Fill Sequence
        const waterFill = new LoadingWaterFill(
            this.app, this.sheets.Ground,
            this.tileSize, this.tileScale);
        await waterFill.run();

        // Gameboard Load Sequence
        this.app.stage.addChild(this.gameboard);
        await this.loadLayer(0);

        // Compute Viewport Starting Position
        let startX = 60;
        let startY = 118;
        const savedViewportCenter = Util.TimedLocalStorage.load('viewport-center');

        if (this.props.startTileX && this.props.startTileY) {
            startX = this.props.startTileX;
            startY = this.props.startTileY;
        } else if (savedViewportCenter) {
            startX = savedViewportCenter.tileX;
            startY = savedViewportCenter.tileY;
        }

        // Center the given tile vertically + horizontally. Things to consider:
        // - handlePan works in "tiles" as its unit of movement
        // - we need the firstTileInfo to get the map's offset from (0, 0)
        // - due to isometric staggered, you need to offset X if Y is odd
        const firstTileInfo = GameUtil.getFirstTileInfo(
            this.gameboard, this.tileScreenSize);
        startY = startY + 1 -
            (firstTileInfo.y / this.tileScreenSize / 2) -
            (this.props.height / this.tileScreenSize * 2);
        const offset = startY % 2 === 1 ? 0.5 : 0;
        startX = startX + 0.5 + offset +
            (firstTileInfo.x / this.tileScreenSize) -
            (this.props.width / this.tileScreenSize / 2);
        this.handlePan(startX, startY);

        // Enable User Action & Gameboard Culling
        this.cull = new Cull.Simple();
        const blockLayer = this.render.getRenderLayer('block');
        this.cull.addList(blockLayer.children, true);
        this.cull.cull(this.gameboard.getVisibleBounds());
        this.app.ticker.add(function() {
            if (this.gameboard.dirty) {
                this.cull.cull(this.gameboard.getVisibleBounds());
                this.gameboard.dirty = false;
            }
        }.bind(this));
        this.gameboard
            .drag()
            .pinch()
            .wheel()
            .clampZoom({
                minWidth: this.props.width / 2,
                maxWidth: (this.model.mapSize().width * this.tileSize) / 6,
            })
            .decelerate({ friction: 0.92 });
        this.handleFocus();

        // Listen on PIXI-Viewport Events
        this.gameboard.on('moved', function() {
            this.handlePan(0, 0);
        }.bind(this));
        this.gameboard.on('zoomed', function() {
            this.handlePan(0, 0);
        }.bind(this));

        // Remove Unneeded Elements
        waterFill.destroy();
        title.destroy();

        // Start Game Update Loop
        this.netcode.gameUpdateLoop();
        this.environmental.start('rain');
        this.loadComplete = true;
        this.handlePan(0, 0); // to update viewport model
        this.props.onGameLoaded && this.props.onGameLoaded();

        console.log('[Game] Mounted');
    }

    getBreedingPartnersFor(tileX, tileY) {
        let originalGameTile = this.model.getGameTile(tileX, tileY);
        if (originalGameTile == null) return [];
        originalGameTile = originalGameTile.gametile;

        const myAccount = this.props.account;
        let lookingForSelf = false;
        if (originalGameTile.getOwner() !== myAccount) {
            lookingForSelf = true;
        }

        const surrounding = Util.Math.surrounding8IsoTiles(
            tileX, tileY).filter(function(point) {
                let gametile = this.model.getGameTile(point[0], point[1]);
                if (gametile == null || gametile.gametile == null) return false;
                gametile = gametile.gametile;

                const content = Util.Protobuf.GameTile.getFirstFlowerContent(gametile);
                if (content == null) return false;

                if (content.getGrowthStage() <
                    gameTileProto.GameTile.Content.GrowthStage.ADULT) {
                    return false;
                }

                if (lookingForSelf && gametile.getOwner() !== myAccount) {
                    return false;
                }

                return true;
        }.bind(this));

        return surrounding;
    }

    async raiseBreedingPartnersFor(tileX, tileY) {
        const self = this;
        const surrounding = this.getBreedingPartnersFor(tileX, tileY);

        setTimeout(async function() {
            for (let i = 0; i < surrounding.length; i++) {
                const location = surrounding[i];
                self.raiseTile(location[0], location[1], 32);
                if (i < surrounding.length - 1) await Util.Promises.sleep(100);
            }
        }.bind(this), 0);

        return surrounding;
    }

    raiseTile(tileX, tileY) {
        if (this.render) this.render.raiseTile(tileX, tileY, 32);
    }

    lowerTile(tileX, tileY) {
        if (this.render) this.render.lowerTile(tileX, tileY);
    }

    lowerAllManuallyRaised() {
        if (this.render) this.render.lowerAllManuallyRaised();
    }

    isManualRaised(tileX, tileY) {
        if (this.render) this.render.isManualRaised(tileX, tileY);
    }

    makeTileSprite(x, y, texture) {
        // Tiles need to be drawn at an offset to achieve our effect
        const offsetY = 64 * this.tileScale;
        const offsetX = 0;

        // Compute tile position (nicely centered on x axis)
        let startX = Math.round(this.app.screen.width / 2);
        let startY = 0;
        startX -= Math.floor(startX / this.tileScreenSize) * this.tileScreenSize;
        if (startX < this.tileScreenSize / 2) startX += this.tileScreenSize;
        startX += (x * this.tileScreenSize) +
            (Math.abs(y % 2) === 1 ? this.tileScreenSize / 2 : 0);
        startY += (y * (this.tileScreenSize / 4));

        // Create sprite
        const tileSprite = new PIXI.Sprite(texture);
        tileSprite.anchor.set(0.5);
        tileSprite.scale.x = this.tileScale;
        tileSprite.scale.y = this.tileScale;
        tileSprite.x = startX + offsetX;
        tileSprite.y = startY + offsetY;

        return tileSprite;
    }

    // Loads world tiles
    async loadLayer(layerID) {
        const blockLayer = this.render.getRenderLayer('block');
        blockLayer.interactive = true;
        blockLayer.buttonMode = true;
        const world = this.model.world;
        const layer = world.layers[layerID];
        const firstgid = this.model.world.tilesets[layerID].firstgid;
        // TODO find appropriate firstgid in Alvita.json rather than hardcoding
        const topperLayer = world.layers[1];
        const topperFirstgid = this.model.world.tilesets[2].firstgid;

        for (let i = 0; i < layer.data.length; i++) {
            const tileNum = layer.data[i];
            const topperTileNum = topperLayer.data[i];

            const tileX = i % 100;
            const tileY = Math.floor(i / 100);

            const tile = this.sheets.Ground.getTextureByID(
                tileNum - firstgid);
            const sprite = this.makeTileSprite(tileX, tileY, tile);

            let topperTile, topperSprite;
            if (topperTileNum - topperFirstgid >= 0) {
                topperTile = this.sheets.Toppers.getTextureByID(
                    topperTileNum - topperFirstgid);
                topperSprite = this.makeTileSprite(tileX, tileY, topperTile);
                topperSprite.y = -1 * this.tileSize * this.tileScale * 0.5;
                topperSprite.x = 0;
            }

            // TODO stack containers should be pre-created in render
            const stack = new PIXI.Container();
            stack.x = sprite.x;
            stack.y = sprite.y;
            sprite.x = 0;
            sprite.y = 0;
            const tileBasis = new PIXI.Container(); // stack item 1
            tileBasis.addChild(sprite);
            stack.addChild(tileBasis);
            const topper = new PIXI.Container(); // stack item 2
            if (topperSprite) topper.addChild(topperSprite);
            stack.addChild(topper);
            const watered = new PIXI.Container(); // stack item 3
            stack.addChild(watered);
            const ownerUI = new PIXI.Container(); // stack item 4
            stack.addChild(ownerUI);
            const flower = new PIXI.Container(); // stack item 5
            stack.addChild(flower);
            blockLayer.addChild(stack);
            this.render.setReference('stack', tileX, tileY, stack);
            this.render.setReference('block', tileX, tileY, sprite);
            this.render.setReference('topper', tileX, tileY, topper);
            this.render.setReference('watered', tileX, tileY, watered);
            this.render.setReference('owner', tileX, tileY, ownerUI);
            this.render.setReference('flower', tileX, tileY, flower);
        }
    }
}

Game.propTypes = {
    canvasRef: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onGameError: PropTypes.func,
    onGameLoaded: PropTypes.func,
    startTileX: PropTypes.number,
    startTileY: PropTypes.number,

    account: PropTypes.string,
    web3: PropTypes.object,
}

export default Game;
