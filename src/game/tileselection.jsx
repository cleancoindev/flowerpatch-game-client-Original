import GameUtil from './gameutil';
import SpriteUtil from './spriteutil';
import GameConstants from '../../config/game.json';

class TileSelectionUI {
    constructor(gameboardContainer, model, render, onClick, onHover) {
        this.alphaHover = 1;
        this.alphaClicked = 0.4;
        this.tileScreenSize = GameConstants.tile.size * GameConstants.tile.scale;
        this.gameboard = gameboardContainer;
        this.model = model;
        this.gameRender = render;
        this.handlers = {
            click: onClick,
            hover: onHover,
        }
        this.alphaOverride = null;
        this.currentBoardEvent = null;
        this.mouseDownEvent = null;

        // Create initial overlay object that will be moved around
        this.tileOverlayUI = SpriteUtil.makeTileBorder(0xA66BD0);
        this.tileOverlayUI.alpha = 0;

        // Binds, since these functions can be used as event handlers
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }

    hide() {
        this.tileOverlayUI.alpha = 0;
    }

    isInsideDiamond(point, diamondMidPoint) {
        const tileScreenSize = this.tileScreenSize;
        const dx = Math.abs(point.x - diamondMidPoint.x);
        const dy = Math.abs(point.y - diamondMidPoint.y);

        if ((dx / (tileScreenSize / 2)) + (dy / (tileScreenSize / 4)) <= 1) {
            return true;
        } else {
            return false;
        }
    }

    // Returns tile info for a given position:
    //  - x, y in pixels for top left corner of tile
    //  - midX, midY in pixels for middle of the tile
    //  - tileX, tileY isometric staggered coords of tile
    getDiamondData(diamondMidPoint) {
        const firstTileInfo = GameUtil.getFirstTileInfo(
            this.gameboard, this.tileScreenSize);
        const x = diamondMidPoint.x -
            (this.tileScreenSize / 2) -
            firstTileInfo.x;
        const y = diamondMidPoint.y - (this.tileScreenSize / 4);

        // Floor will round 0.5s down, since they should be part of the column
        const tileX = Math.floor(x / this.tileScreenSize);
        // Here 0.5s get doubled to whole numbers, and then finally rounded
        const tileY = Math.round((y / (this.tileScreenSize / 2)) * 2);

        return {
            tileX,
            tileY,
            midX: x + (this.tileScreenSize / 2) + firstTileInfo.x,
            midY: y + (this.tileScreenSize / 4),
            x: x + firstTileInfo.x,
            y,
        }
    }

    mouseMove(event) {
        const boardEvent = this.render(event);
        if (boardEvent == null) return;

        let useNew = false;
        if (this.currentBoardEvent == null) useNew = true;
        else if (this.currentBoardEvent.tileX !== boardEvent.tileX ||
            this.currentBoardEvent.tileY !== boardEvent.tileY) {
            useNew = true;
        }

        if (useNew) {
            this.currentBoardEvent = boardEvent;
            // TODO probably want it to be a hover effect, not auto up/down
            this.gameRender.tempRaiseTile(
                boardEvent.tileX, boardEvent.tileY, 8, 0);
            if (this.handlers.hover) this.handlers.hover(boardEvent);
        }
    }

    mouseDown(event) {
        this.alphaOverride = this.alphaClicked;
        this.mouseDownEvent = {
            x: event.data.global.x,
            y: event.data.global.y,
        };
        this.render(event);

        setTimeout(function() {
            // Focus can get lost and we might never get mouseUp
            this.alphaOverride = null;
            this.tileOverlayUI.alpha = this.state().alpha;
            this.mouseDownEvent = null;
        }.bind(this), 10000);
    }

    mouseUp(event) {
        this.alphaOverride = null;
        const boardEvent = this.render(event);

        const upLoc = event.data.global;
        let downLoc = { x: -1000, y: -1000 };
        if (this.mouseDownEvent != null) {
            downLoc = this.mouseDownEvent;
            this.mouseDownEvent = null;
        }

        const mouseMoveDist = Math.sqrt(
            ((upLoc.x - downLoc.x) * (upLoc.x - downLoc.x)) +
            ((upLoc.y - downLoc.y) * (upLoc.y - downLoc.y)));

        // Prevent board click if the game was dragged
        if (boardEvent != null && mouseMoveDist <= 3) {
            this.handlers.click(boardEvent);
        }
    }

    // Returns current cursor status info
    state() {
        const alpha = this.alphaOverride == null ?
            this.alphaHover :
            this.alphaOverride;

        return {
            alpha,
        }
    }

    isRaised(tileX, tileY) {
        const currentRaise = this.gameRender.getCurrentRaiseAmount(
            tileX, tileY);
        return -1 * currentRaise === this.tileScreenSize / 2;
    }

    // This function corrects which tile is selected when some tiles are
    // raised and may occlude the tile that would normally be there.
    // The normal diamond is correct, UNLESS ONE OF:
    //  - tile directly below is raised and covers whole diamond
    //  - SE tile is raised and covers the right half
    //  - SW tile is raised and covers the left half
    updateTileSelectionByRaise(ddata) {
        const tileX = ddata.tileX;
        const tileY = ddata.tileY;
        const isOdd = (tileY % 2) === 1;
        let toCheck = null;

        if (isOdd) {
            toCheck = {
                S: [ tileX, tileY + 2 ],
                SE: [ tileX + 1, tileY + 1 ],
                SW: [ tileX, tileY + 1 ],
            };
        } else {
            toCheck = {
                S: [ tileX, tileY + 2 ],
                SE: [ tileX, tileY + 1 ],
                SW: [ tileX - 1, tileY + 1 ],
            };
        }

        const fix = function(newPos) {
            const positionInfo = GameUtil.getTilePositionInfo(
                newPos[0], newPos[1], this.gameboard, this.tileScreenSize);
            ddata = Object.assign(ddata, positionInfo);
            ddata.tileX = newPos[0];
            ddata.tileY = newPos[1];
        }.bind(this);

        if (this.isRaised(toCheck.S[0], toCheck.S[1])) {
            fix(toCheck.S);
        }
        else if (ddata.cursorX >= ddata.midX &&
            this.isRaised(toCheck.SE[0], toCheck.SE[1])) {
            fix(toCheck.SE);
        }
        else if (ddata.cursorX < ddata.midX &&
            this.isRaised(toCheck.SW[0], toCheck.SW[1])) {
            fix(toCheck.SW);
        }

        return ddata;
    }

    moveTileOverlayUi(ddata) {
        if (this.tileOverlayUI == null) return;

        const newStack = this.gameRender.getReference(
            'stack', ddata.tileX, ddata.tileY);
        if (newStack == null) {
            console.log('[TileSelection] ERR: cannot move tile ui:', ddata);
            return;
        }

        newStack.addChild(this.tileOverlayUI);
    }

    render(event) {
        const tileScreenSize = this.tileScreenSize;
        const tileSizeX = tileScreenSize;
        const tileSizeY = tileScreenSize / 2;
        const mapSize = this.model.mapSize();

        // event target is the container with all of our blocks
        const firstTileInfo = GameUtil.getFirstTileInfo(
            this.gameboard, this.tileScreenSize);
        const firstTileMid = {
            x: firstTileInfo.midX,
            y: firstTileInfo.midY,
        };

        // cursor position, corrected for map offset
        const cursorPos = event.data.getLocalPosition(event.currentTarget);
        // adjust cursor position in order to align to map's rendering offset
        // don't need to adjust cursorPos.y since it starts at y = 0
        cursorPos.x -= firstTileMid.x - (tileSizeX / 2);
        if (cursorPos.x < tileSizeX / 2 ||
            cursorPos.x > mapSize.width * tileSizeX ||
            cursorPos.y < tileSizeY / 2 ||
            cursorPos.y > mapSize.height * (tileSizeY / 2)) {

            this.tileOverlayUI.alpha = 0;
            return null;
        }

        // 50% chance that the cursor is in this tile
        const possibleTileMainMid = {
            x: (Math.floor(cursorPos.x / tileSizeX) * tileSizeX) +
                firstTileMid.x,
            y: (Math.floor(cursorPos.y / tileSizeY) * tileSizeY) +
                firstTileMid.y - (tileSizeY / 2),
        };

        // Otherwise, 50% chance it's in a neighboring tile
        const cursorInTop = ((cursorPos.y / tileSizeY) -
            Math.floor(cursorPos.y / tileSizeY)) <= 0.5;
        const cursorInLeft = ((cursorPos.x / tileSizeX) -
            Math.floor(cursorPos.x / tileSizeX)) <= 0.5;
        const nextTileDir = {
            x: cursorInLeft ? -1 : 1,
            y: cursorInTop ? -1 : 1,
        };
        const possibleTileSecondaryMid = {
            x: possibleTileMainMid.x + (nextTileDir.x * (tileSizeX / 2)),
            y: possibleTileMainMid.y + (nextTileDir.y * (tileSizeY / 2)),
        };

        // undo our cursor position transform for map offset
        cursorPos.x += firstTileMid.x - (tileSizeX / 2);
        let ddata = null;
        if (this.isInsideDiamond(cursorPos, possibleTileMainMid)) {
            ddata = this.getDiamondData(possibleTileMainMid);
        } else if (this.isInsideDiamond(cursorPos, possibleTileSecondaryMid)) {
            ddata = this.getDiamondData(possibleTileSecondaryMid);
        }

        if (ddata != null) {
            ddata.cursorX = cursorPos.x;
            ddata.cursorY = cursorPos.y;

            ddata = this.updateTileSelectionByRaise(ddata);
            this.tileOverlayUI.alpha = this.state().alpha;
            this.moveTileOverlayUi(ddata);

            return ddata;
        } else {
            this.tileOverlayUI.alpha = 0;
        }

        return null;
    }
}

export default TileSelectionUI;
