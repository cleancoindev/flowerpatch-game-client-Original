import React from 'react';
import PropTypes from 'prop-types';
import { DrizzleContext } from 'drizzle-react';

import Go from '../../Go';
import Util from '../../Util';
import PrettyAccount from '../../PrettyAccount';
import EthCard from '../../Card/EthCard';
import PresentDropDistribution from './PresentDropDistribution';
import EntityConfig from '../../../../config/entities.json';

const gameTileProto = require('../../../protobuf/gametile_pb');

import s from './index.less'

const DISAPPEAR_TIME = 12000; // ms

class InfoSidebar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            cardID: null,
            cardData: null,
        };

        this.disappearTimerID = -1;
        this.lastGameTile = null;

        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.setAttribute('width', '64px');
        this.previewCanvas.setAttribute('height', '96px');

        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleCardDataLoad = this.handleCardDataLoad.bind(this);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        clearTimeout(this.disappearTimerID);
        this.disappearTimerID = -1;
        this.lastGameTile = null;
    }

    handleMouseEnter() {
        clearTimeout(this.disappearTimerID);
        this.disappearTimerID = -1;
    }

    handleMouseLeave() {
        clearTimeout(this.disappearTimerID);
        this.disappearTimerID = setTimeout(function() {
            this.disappearTimerID = -1;
            this.props.onClose();
        }.bind(this), DISAPPEAR_TIME / 4);
    }

    handleCardDataLoad(cardData, cardID) {
        this.setState({ cardData, cardID });
    }

    render() {
        const { show, groundInfo, groundTexture, gameTile,
            topperInfo, topperTexture, wateredTexture } = { ...this.props };

        if (show && (this.lastGameTile == null || gameTile == null ||
            gameTile.getX() !== this.lastGameTile.getX() ||
            gameTile.getY() !== this.lastGameTile.getY())) {

            this.lastGameTile = gameTile;
            clearTimeout(this.disappearTimerID);
            this.disappearTimerID = setTimeout(function() {
                this.disappearTimerID = -1;
                this.props.onClose();
            }.bind(this), DISAPPEAR_TIME);
        } else if (!show) {
            this.componentWillUnmount();
        }

        const canvas = this.previewCanvas;
        const context = canvas.getContext('2d');
        if (groundTexture != null) {
            const frame = groundTexture.frame;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(groundTexture.baseTexture.source,
                frame.x, frame.y,
                frame.width, frame.height,
                0, 32, 64, 64);
        }

        if (wateredTexture != null) {
            const frame = wateredTexture.frame;
            context.drawImage(wateredTexture.baseTexture.source,
                frame.x, frame.y,
                frame.width, frame.height,
                0, 0, 64, 64);
        }

        if (topperTexture != null) {
            const frame = topperTexture.frame;
            context.drawImage(topperTexture.baseTexture.source,
                frame.x, frame.y,
                frame.width, frame.height,
                0, 0, 64, 64);
        }

        let topperDescription = '';
        if (topperInfo) topperDescription = topperInfo.properties[0].value || '';

        let selectedGameTileInfo = null;
        let flowerID = null;
        if (gameTile != null) {
            const content = gameTile.getContentList();
            const owner = gameTile.getOwner() || null;
            // let tilled = false;
            let growthStage = null;
            content.forEach(cur => {
                switch (cur.getType()) {
                    case gameTileProto.GameTile.Content.Type.TILLED:
                        // tilled = true;
                        break;
                    case gameTileProto.GameTile.Content.Type.PLANTED:
                        flowerID = cur.getEthId();
                        growthStage = cur.getGrowthStage();
                        break;
                    default:
                }
            });

            selectedGameTileInfo = [
                owner != null && <div key="owner" class={ s.sideBySide }>
                    <div class={ s.title }>Owner:</div>
                    <Go class={ s.value }
                        data-category="Game"
                        data-action={ "Account " + owner }
                        to={ "https://flowerpatch.app/account/" + owner }>
                        <PrettyAccount account={ owner } />
                    </Go>
                </div>,
                flowerID != null && <div key="flowerID" class={ s.sideBySide }>
                    <div class={ s.title }>Flower:</div>
                    <Go class={ s.value }
                        data-category="Game"
                        data-action={ "https://flowerpatch.app/card/" + flowerID }
                        to={ "https://flowerpatch.app/card/" + flowerID }>
                        #{ flowerID }
                    </Go>
                </div>,
            ];

            if (this.state.cardID === flowerID && this.state.cardData != null &&
                growthStage < gameTileProto.GameTile.Content.GrowthStage.ADULT) {
                let growthTime = '. . .';

                growthTime = Util.Card.getGrowthTimeMinutes(
                    this.state.cardData.stats.growthSpeed);
                growthTime -= Util.Card.getTimeSincePlantingMinutes(
                    gameTile, this.state.cardData.stats.growthSpeed);
                if (growthTime < 0) growthTime = 0;
                growthTime = Util.Card.prettyTime(growthTime);

                selectedGameTileInfo.push(
                    <div key="growthTime" class={ s.sideBySide }>
                        <div class={ s.title }>Growth Time Left:</div>
                        <div class={ s.value }>~{ growthTime }</div>
                    </div>);
            }

            if (flowerID != null) {
                selectedGameTileInfo.push(
                    <div key={ flowerID } class={ s.card }>
                        <EthCard key={ flowerID }
                            cardID={ flowerID }
                            onDataLoad={ this.handleCardDataLoad }/>
                    </div>);
            }

            if (topperInfo && topperInfo.type === "present") {
                let timeRemaining = Util.Card.getTimeSinceModifiedMinutes(gameTile);
                timeRemaining = EntityConfig.present.decay - timeRemaining;
                timeRemaining = Util.Card.prettyTime(timeRemaining);

                selectedGameTileInfo.push(
                    <div key="growthTime" class={ s.sideBySide }>
                        <div class={ s.title }>Time Remaining:</div>
                        <div class={ s.value }>~{ timeRemaining }</div>
                    </div>);

                selectedGameTileInfo.push(
                    <PresentDropDistribution key="dropDistribution" />);
            }
        }

        let tileType = null;
        if (topperInfo) tileType = topperInfo.type;
        else if (groundInfo) tileType = groundInfo.type;
        if (tileType) tileType = Util.Text.toTitleCase(tileType) + ' Tile';

        const selectionUIStyle = {
            opacity: show ? 1 : 0,
            pointerEvents: show ? 'all' : 'none',
            minWidth: flowerID ? '288px' : '240px',
        };

        return (
            <div class={ s.selectionUI }
                style={ selectionUIStyle }
                onMouseEnter={ this.handleMouseEnter }
                onMouseLeave={ this.handleMouseLeave }>

                <div class={ s.close } onClick={ this.props.onClose } />

                <div class={ s.sideBySide }>
                    <div ref={ ref => ref && ref.appendChild(canvas) } />

                    <div class={ s.groundInfo }>
                        <div class={ s.tileName } >
                            { tileType }
                        </div>
                        <div class={ s.topperDescription }>
                            { topperDescription }
                        </div>
                    </div>

                </div>

                { selectedGameTileInfo }
            </div>
        );
    }
}

InfoSidebar.propTypes = {
    web3: PropTypes.object,

    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,

    gameTile: PropTypes.object,
    groundInfo: PropTypes.object,
    groundTexture: PropTypes.object,
    topperInfo: PropTypes.object,
    topperTexture: PropTypes.object,
    wateredTexture: PropTypes.object
};

export default (params) => (
    <DrizzleContext.Consumer>
        { drizzleContext => <InfoSidebar { ...params }
            web3={ drizzleContext.drizzle.web3 } /> }
    </DrizzleContext.Consumer>
);
