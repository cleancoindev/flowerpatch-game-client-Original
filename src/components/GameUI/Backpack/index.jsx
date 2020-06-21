import React from 'react';
import PropTypes from 'prop-types';

import GameConstants from '../../../../config/game.json';
import Inventory from './Inventory';

import s from './index.less'

const MAP_WIDTH = 400; // px
const MAP_HEIGHT = 420; // px

class Backpack extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedTab: 'map',
        }

        this.mounted = false;

        this.handleMapClick = this.handleMapClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleViewportChange = this.handleViewportChange.bind(this);
        this.handleSwitchTab = this.handleSwitchTab.bind(this);

        this.props.game.events.on('viewport-change', this.handleViewportChange);
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleViewportChange() {
        if (this.mounted) this.forceUpdate();
    }

    handleClose() {
        if (this.props.onClose) this.props.onClose();
    }

    handleSwitchTab(tabName) {
        this.setState({
            selectedTab: tabName,
        });
    }

    handleMapClick(event) {
        let mapRect = event.currentTarget.getClientRects();
        if (mapRect.length <= 0) return;
        mapRect = mapRect[0];

        const click = {
            percentX: (event.clientX - mapRect.left) / MAP_WIDTH,
            percentY: (event.clientY - mapRect.top) / MAP_HEIGHT,
        };

        const mapSize = this.props.game.model.mapSize();
        const tileX = Math.round(mapSize.width * click.percentX);
        const tileY = Math.round(mapSize.height * click.percentY);

        this.props.game.handlePanToCenter(tileX, tileY);
    }

    render() {
        const regions = GameConstants.regions.map((region) => {
            const regionName = Object.keys(region)[0];
            return (
                <div key={regionName} class={s.region}
                    style={region[regionName]}>
                    { regionName.toUpperCase() }
                </div>
            );
        });

        const minimapStyles = {
            width: MAP_WIDTH + 'px',
            height: MAP_HEIGHT + 'px',
        }

        let hereDotStyles = {
            display: 'none',
        };

        if (this.props.game.model) {
            const viewport = this.props.game.model.getViewport();
            const mapSize = this.props.game.model.mapSize();
            const mapWidth = mapSize.width * mapSize.tileScreenWidth;
            const mapHeight = mapSize.height * (mapSize.tileScreenWidth / 4);
            const zoom = viewport.zoom;
            const left = ((viewport.x / mapWidth) * MAP_WIDTH) / zoom;
            const top = ((viewport.y / mapHeight) * MAP_HEIGHT) / zoom;
            const width = ((viewport.width / mapWidth) * MAP_WIDTH) / zoom;
            const height = ((viewport.height / mapHeight) * MAP_HEIGHT) / zoom;

            hereDotStyles = {
                left: left + 'px',
                top: top + 'px',
                width: width + 'px',
                height: height + 'px',
            };
        }

        let pageContent = (
            <div class={ s.map } style={ minimapStyles }
                onClick={ this.handleMapClick }>
                <div class = { s.regions }>
                    { regions }
                </div>
                <div class={ s.hereDot } style={ hereDotStyles } />
            </div>);

        if (this.state.selectedTab === 'inventory') {
            pageContent = <Inventory />;
        } else if (this.state.selectedTab === 'flowers') {
            pageContent = <div>FLOWERs!</div>;
        }

        return (
            <div class={ s.backpack }>
                <div class={ s.header }>
                    <div class={ s.tabs }>
                        <div class={ s.mapTab }
                            onClick={ this.handleSwitchTab.bind(this, 'map') }>
                            Map
                        </div>

                        <div class={ s.inventoryTab }
                            onClick={ this.handleSwitchTab.bind(this, 'inventory') }>
                            Inventory
                        </div>

                        <div class={ s.flowerTab }
                            onClick={ this.handleSwitchTab.bind(this, 'flowers') }>
                            FLOWERs
                        </div>
                    </div>
                </div>
                <div class={ s.close } onClick={ this.handleClose }>✕</div>

                <div class={ s.content }>
                    { pageContent }
                </div>
            </div>
        );
    }
}

Backpack.propTypes = {
    game: PropTypes.object.isRequired,
    onClose: PropTypes.func,
}

export default Backpack;
