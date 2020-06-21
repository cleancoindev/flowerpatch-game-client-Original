import React from 'react';
import PropTypes from 'prop-types';
import { DrizzleContext } from 'drizzle-react';
import URL from 'url-parse';
import fscreen from "fscreen";

import Game from '../../game';
import AccountNav from '../Header/AccountNav';
import Go from '../Go';
import Util from '../Util';
import AccountCardPickerPopover from '../AccountCardPickerPopover';
import UnlockPopover from '../UnlockPopover';
import WelcomePopover from '../WelcomePopover';
import Hotbar from './Hotbar';
import Chat from './Chat';
import Splash from './Splash';
import RadialMenu from './RadialMenu';
import InfoSidebar from './InfoSidebar';
import Backpack from './Backpack';
import flowerdbProto from '../../protobuf/flowerdbservice_pb.js';

const gameTileProto = require('../../protobuf/gametile_pb');

import s from './index.less'

class GameUI extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            gameInstance: null,
            plantingCard: null, // null or boardEvent
            gameErrors: [],
            showSplash: null, // null or splash name like "tilling"
            showUnlockPopover: false,
            showWelcomePopover: false,
            showBackpack: false,
            showInfoSidebar: false,
            selectionInfo: null, // complex object of selection data
            isFullscreen: false,
            chatEnabled: false,
        };

        this.windowResizeTimeoutID = 0;
        this.errorExpiryIntervalID = 0;
        this.canvasRef = React.createRef();
        this.containerRef = React.createRef();
        this.lastAccount = '';
        this.lastWeb3 = null;
        window.GAME = null;
        this.radialMenuRef = React.createRef();

        this.ensureLoggedIn = this.ensureLoggedIn.bind(this);
        this.getURLOptions = this.getURLOptions.bind(this);
        this.updateGAMEProps = this.updateGAMEProps.bind(this);
        this.handleBoardClick = this.handleBoardClick.bind(this);
        this.handleCardPicked = this.handleCardPicked.bind(this);
        this.handleCardPickerClosed = this.handleCardPickerClosed.bind(this);
        this.handleToolSelected = this.handleToolSelected.bind(this);
        this.handleBackpackToggle = this.handleBackpackToggle.bind(this);
        this.handleGameError = this.handleGameError.bind(this);
        this.handleGameLoaded = this.handleGameLoaded.bind(this);
        this.handleHideSplash = this.handleHideSplash.bind(this);
        this.handleUnlockHide = this.handleUnlockHide.bind(this);
        this.handleWelcomeHide = this.handleWelcomeHide.bind(this);
        this.handleInfoSidebarHide = this.handleInfoSidebarHide.bind(this)
        this.handleRequestFullscreen = this.handleRequestFullscreen.bind(this);
        this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    componentDidMount() {
        // Create game instance
        // Note: window size may be unreliable at first load
        if (window.GAME == null) {
            window.GAME = new Game(); // props will be passed later
            this.updateGAMEProps();
        }

        // On next render tick, double check window size
        this.windowResizeTimeoutID = setTimeout(function() {
            this.updateGAMEProps();
            window.GAME.componentDidMount();
        }.bind(this), 0);

        // And just check window size again because ugh
        this.windowResizeTimeoutID = setTimeout(function() {
            this.updateGAMEProps();
        }.bind(this), 1000);

        // System for expiring old error messages
        this.errorExpiryIntervalID = setInterval(function() {
            const newErrors = this.state.gameErrors.filter(errInfo =>
                errInfo.timestamp >= Date.now() - 8000);
            if (newErrors.length !== this.state.gameErrors.length) {
                this.setState({
                    gameErrors: newErrors,
                });
            }
        }.bind(this), 2000);

        // Game Listeners
        window.GAME.events.on('board-click', this.handleBoardClick);

        // Global Listeners
        window.addEventListener('resize', this.updateGAMEProps);
        fscreen.addEventListener('fullscreenchange', this.handleFullscreenChange);

        // Game is created, can pass it to sub-modules
        this.setState({ gameInstance: window.GAME });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateGAMEProps);
        fscreen.removeEventListener('fullscreenchange', this.handleFullscreenChange);

        clearTimeout(this.windowResizeTimeoutID);
        clearInterval(this.errorExpiryIntervalID);

        if (window.GAME != null) {
            window.GAME.componentWillUnmount();
            window.GAME = null;
        }
    }

    handleFocus() {
        if (window.GAME) window.GAME.handleFocus();
    }

    handleBlur() {
        if (window.GAME) window.GAME.handleBlur();
    }

    getURLOptions() {
        const urlParse = new URL(this.props.location.search, null, true);
        return urlParse.query;
    }

    handleBackpackToggle() {
        this.setState({
            showBackpack: !this.state.showBackpack
        });
    }

    handleBoardClick(data) {
        const { boardEvent, groundInfo, groundTexture, curToolInfo, gameTile,
            topperInfo, topperTexture, wateredTexture } = { ...data };

        switch (curToolInfo.name) {
            case 'hand':
                this.setState({ selectionInfo: {
                    groundInfo, groundTexture, gameTile,
                    topperInfo, topperTexture, wateredTexture },
                    showInfoSidebar: true
                });
                break;
            case 'trowel':
                this.cancelTileSelection()
                this.handleTilling(boardEvent);
                break;
            case 'plant':
                this.cancelTileSelection()
                this.handlePlanting(boardEvent);
                break;
            case 'watering-can':
                this.cancelTileSelection()
                this.handleWatering(boardEvent);
                break;
            case 'shears':
                this.cancelTileSelection()
                this.handleClear(boardEvent);
                break;
            default:
        }
    }

    cancelTileSelection() {
        if (this.radialMenuRef.current) {
            this.radialMenuRef.current.cancel();
        }
    }

    handleHideSplash() {
        this.setState({
            showSplash: null,
        });
    }

    handleUnlockHide() {
        this.setState({ showUnlockPopover: false });
    }

    handleWelcomeHide() {
        this.setState({ showWelcomePopover: false });
    }

    handleInfoSidebarHide() {
        this.setState({ showInfoSidebar: false });
    }

    handleRequestFullscreen() {
        if (fscreen.fullscreenEnabled) {
            fscreen.requestFullscreen(document.body);
        }
    }

    handleFullscreenChange() {
        this.setState({
            isFullscreen: document.body === fscreen.fullscreenElement,
        });
    }

    handleToolSelected(toolInfo) {
        if (window.GAME == null) return;

        window.GAME.handleToolSelected(toolInfo);
    }

    async ensureLoggedIn() {
        if (!Util.Cookies.isLoggedIn(this.props.account)) {
            console.log('User is not logged in');
            this.handleGameError('desc = Please unlock account to play');

            this.setState({
                showUnlockPopover: true,
            });

            return false;
        }

        return true;
    }

    async handlePlanting(boardEvent) {
        if (await this.ensureLoggedIn() === false) return;

        let gametile = window.GAME.model.getGameTile(
            boardEvent.tileX, boardEvent.tileY);
        if (gametile == null || gametile.gametile == null) {
            this.handleGameError('desc = Tile must be tilled before planting');
            return;
        }
        gametile = gametile.gametile;

        const owner = gametile.getOwner();
        if (owner === "" || owner == null) {
            // all good, probably an empty tile
        } else if (owner.toLowerCase() !== this.props.account.toLowerCase()) {
            this.handleGameError('desc = Cannot plant on tile owned by someone else');
            return;
        }

        const tilledContent = Util.Protobuf.GameTile.getFirstTilledContent(gametile);
        if (tilledContent == null) {
            this.handleGameError('desc = Tile must be tilled before planting');
            return;
        }

        const flowerContent = Util.Protobuf.GameTile.getFirstFlowerContent(gametile);
        if (flowerContent != null) {
            this.handleGameError('desc = Tile already has a FLOWER on it');
            return;
        }

        this.setState({
            plantingCard: boardEvent
        });
    }

    async handleClear(boardEvent) {
        if (await this.ensureLoggedIn() === false) return;

        const gametile = new gameTileProto.GameTile();
        gametile.setX(boardEvent.tileX);
        gametile.setY(boardEvent.tileY);
        gametile.setOwner(this.props.account);

        try {
            const newGameTile = await Util.PostAPI.game.tileWrite(
                this.props.web3, gametile, this.props.account).promise;
            if (window.GAME) window.GAME.model.updateGameTile(newGameTile);
        } catch (e) {
            this.handleGameError(e)
        }
    }

    async handleTilling(boardEvent) {
        if (await this.ensureLoggedIn() === false) return;

        const gametile = new gameTileProto.GameTile();
        gametile.setX(boardEvent.tileX);
        gametile.setY(boardEvent.tileY);
        gametile.setOwner(this.props.account);

        const contentTilled = new gameTileProto.GameTile.Content();
        contentTilled.setType(gameTileProto.GameTile.Content.Type.TILLED);
        gametile.addContent(contentTilled);

        try {
            const newGameTile = await Util.PostAPI.game.tileWrite(
                this.props.web3, gametile, this.props.account).promise;
            if (window.GAME) window.GAME.model.updateGameTile(newGameTile);
        } catch (e) {
            this.handleGameError(e)
        }
    }

    async handleWatering(boardEvent) {
        if (await this.ensureLoggedIn() === false) return;

        const gametile = new gameTileProto.GameTile();
        gametile.setX(boardEvent.tileX);
        gametile.setY(boardEvent.tileY);

        const contentTilled = new gameTileProto.GameTile.Content();
        contentTilled.setType(gameTileProto.GameTile.Content.Type.WATERED);
        gametile.addContent(contentTilled);

        try {
            const newGameTile = await Util.PostAPI.game.tileWrite(
                this.props.web3, gametile, this.props.account).promise;
            if (window.GAME) window.GAME.model.updateGameTile(newGameTile);
        } catch (e) {
            this.handleGameError(e)
        }
    }

    makeFlowerQuery() {
        const boardEvent = this.state.plantingCard;
        if (boardEvent == null) {
            console.error("No board event for AccountCardPickerPopover");
            return null;
        }
        if (window.GAME == null) {
            console.error("No GAME found for AccountCardPickerPopover");
            return null;
        }

        const type = window.GAME.model.getWorldTileInfo(
            boardEvent.tileX, boardEvent.tileY).type.toUpperCase();

        const flowerQuery = new flowerdbProto.FlowerQuery();
        flowerQuery.setAccount(this.props.account);
        const filters = new flowerdbProto.FlowerQuery.Filters();
        filters.setLandAffinity(flowerdbProto.FlowerQuery.LandAffinity[type]);
        filters.setPlanted(flowerdbProto.FlowerQuery.Planted.NOT_PLANTED);
        flowerQuery.setFilters(filters);
        const sorting = new flowerdbProto.FlowerQuery.Sorting();
        flowerQuery.setSorting(sorting);

        return flowerQuery
    }

    async handleCardPicked(cardID) {
        const boardEvent = this.state.plantingCard;
        if (boardEvent == null) return;

        const gametile = new gameTileProto.GameTile();
        gametile.setX(boardEvent.tileX);
        gametile.setY(boardEvent.tileY);
        gametile.setOwner(this.props.account);

        const contentTilled = new gameTileProto.GameTile.Content();
        contentTilled.setType(gameTileProto.GameTile.Content.Type.TILLED);
        gametile.addContent(contentTilled);

        const contentFlower = new gameTileProto.GameTile.Content();
        contentFlower.setType(gameTileProto.GameTile.Content.Type.PLANTED);
        contentFlower.setEthId(cardID);
        gametile.addContent(contentFlower);

        this.setState({
            plantingCard: null,
        });

        try {
            const newGameTile = await Util.PostAPI.game.tileWrite(
                this.props.web3, gametile, this.props.account).promise;
            if (window.GAME) window.GAME.model.updateGameTile(newGameTile);
            this.setState({
                showSplash: 'tilling',
            });
        } catch (e) {
            this.handleGameError(e)
        }
    }

    handleCardPickerClosed() {
        this.setState({
            plantingCard: null
        });
    }

    handleGameLoaded() {
        setTimeout(function() {
            this.setState({
                showWelcomePopover: true,
            });
        }.bind(this), 1500);

        setTimeout(function() {
            this.setState({
                chatEnabled: true,
            });
        }.bind(this), 2500);
    }

    handleGameError(err) {
        console.log('[GAME ERR]', err);
        const message = err.match(/desc = (.*)/);
        if (message.length === 2) {
            const newErrors = [ ...this.state.gameErrors ];
            const timestamp = Date.now();
            newErrors.push({ error: message[1], timestamp });

            this.setState({
                gameErrors: newErrors,
            })
        } else {
            console.log(' - Weird error format (not gRPC)!');
        }
    }

    updateGAMEProps() {
        if (this.canvasRef.current != null && window.GAME != null) {
            this.forceUpdate(); // to force canvas element resize
            const newWidth = document.documentElement.clientWidth;
            const newHeight = document.documentElement.clientHeight;
            const urlOptions = this.getURLOptions();
            let startTileX = parseInt(urlOptions.x, 10);
            if (isNaN(startTileX)) startTileX = null;
            let startTileY = parseInt(urlOptions.y, 10);
            if (isNaN(startTileY)) startTileY = null;

            window.GAME.componentWillReceiveProps(Object.assign({
                account: this.props.account,
                web3: this.props.web3,
                canvasRef: this.canvasRef,
                width: newWidth,
                height: newHeight,
                onGameError: this.handleGameError,
                onGameLoaded: this.handleGameLoaded,
                startTileX,
                startTileY,
            }, this.props));
        }
    }

    render() {
        if (this.lastAccount !== this.props.account) {
            this.lastAccount = this.props.account;
            console.log('[Game UI] ETH Account changed to:', this.lastAccount);
            this.updateGAMEProps();
        }

        if (this.lastWeb3 == null && this.props.web3 != null) {
            this.lastWeb3 = this.props.web3;
            console.log('[Game UI] ETH web3 changed to:', this.lastWeb3);
            this.updateGAMEProps();
        }

        const newWidth = document.documentElement.clientWidth;
        const newHeight = document.documentElement.clientHeight;
        const canvasStyle = {
            width: newWidth + 'px',
            height: newHeight + 'px',
        };

        const fullscreenButtonClasses = [ s.fullscreenButton ];
        if (this.state.isFullscreen) {
            fullscreenButtonClasses.push(s.enabled);
        }

        return (
            <div class={ s.gamecontainer } ref={ this.containerRef }>
                <div id={ s.overlay }>
                    <div class={ fullscreenButtonClasses.join(' ') }
                        onClick={ this.handleRequestFullscreen } />

                    <div class={ s.accountNav }>
                        <AccountNav />
                    </div>

                    { this.state.gameInstance &&
                        <RadialMenu ref={ this.radialMenuRef }
                            game={ this.state.gameInstance }
                            account={ this.props.account }
                            ensureLoggedIn={ this.ensureLoggedIn }
                            handleGameError={ this.handleGameError } /> }

                    <Chat account={ this.props.account }
                        chatEnabled={ this.state.chatEnabled } />

                    <div class={ s.bottomPanel }>
                        <div class={ s.backpackIcon }
                            onClick={ this.handleBackpackToggle }/>

                        <div class={ s.centeredVertical }>
                            <div class={ s.errorStack }>
                                { this.state.gameErrors.slice(-3).map((errInfo, i) =>
                                    <div key={ i } class={ s.error }>
                                        { errInfo.error }
                                    </div>
                                ) }
                            </div>

                            <Hotbar onToolSelected={ this.handleToolSelected }/>
                        </div>

                        <Go to="https://flowerpatch.app/market"
                            data-category={ 'Game' }
                            data-action={ 'Market' }
                            class={ s.shopIcon } />
                    </div>

                    { this.state.gameInstance && this.state.showBackpack &&
                        <Backpack game={ this.state.gameInstance }
                            onClose={ this.handleBackpackToggle } /> }
                </div>

                <canvas id={ s.game }
                    ref={ this.canvasRef }
                    style={ canvasStyle }
                    onMouseOver={ this.handleFocus }
                    onMouseOut={ this.handleBlur } />

                <InfoSidebar show={ this.state.showInfoSidebar }
                    onClose={ this.handleInfoSidebarHide }
                    { ...this.state.selectionInfo } />

                { this.state.plantingCard != null &&
                    <AccountCardPickerPopover
                        flowerQuery={ this.makeFlowerQuery() }
                        onHide={ this.handleCardPickerClosed }
                        onCardPicked={ this.handleCardPicked } /> }

                { this.state.showUnlockPopover &&
                    <UnlockPopover startVisible={ true }
                        onHide={ this.handleUnlockHide } /> }

                { this.state.showSplash != null &&
                    <Splash screen="tilling" onHide={ this.handleHideSplash }/> }

                { this.state.showWelcomePopover &&
                    <WelcomePopover startVisible={ true }
                        onHide={ this.handleWelcomeHide } /> }
            </div>
        );
    }
}

GameUI.propTypes = {
    location: PropTypes.object.isRequired,

    web3: PropTypes.object,
    account: PropTypes.string,
}

export default (params) => (
    <DrizzleContext.Consumer>
        { drizzleContext => {
            // TODO: handle "no ethereum data" in UI

            let account = null;
            try {
                account = drizzleContext.drizzleState.accounts[0];
            } catch (e) {}

            return <GameUI { ...params }
                web3={ drizzleContext.drizzle.web3 }
                account={ account } />
        }}
    </DrizzleContext.Consumer>
);
