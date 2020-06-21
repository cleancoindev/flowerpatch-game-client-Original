import React from 'react';
import PropTypes from 'prop-types';

import Breeding from './Breeding';
import Interacting from './Interacting';

import s from './index.less'

class RadialMenu extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            radialMenuLocation: null,
        };

        this.lastRadialMenuLocation = null;

        this.moduleRefs = {
            'breeding': React.createRef(),
            'interacting': React.createRef(),
        }

        this.cancel = this.cancel.bind(this);
        this.handleTileSelection = this.handleTileSelection.bind(this);

        this.props.game.events.on('viewport-change', this.cancel);
        this.props.game.events.on('board-click', this.handleTileSelection);
    }

    handleTileSelection(boardClickData) {
        const { gameTile, boardEvent, curToolInfo } = { ...boardClickData };
        if (curToolInfo.name !== 'hand') return;

        const viewport = this.props.game.model.getViewport();
        const selectionInfo = {
            x: (boardEvent.midX - (viewport.x / viewport.zoom)) * viewport.zoom,
            y: (boardEvent.midY - (viewport.y / viewport.zoom)) * viewport.zoom,
            boardEvent,
            gameTile,
        };

        this.setState({
            radialMenuLocation: selectionInfo,
        });

        Object.keys(this.moduleRefs).forEach(key => {
            const module = this.moduleRefs[key];
            if (module.current) {
                module.current.handleTileSelection(selectionInfo);
            }
        });
    }

    cancel() {
        this.setState({
            radialMenuLocation: null,
        })

        Object.entries(this.moduleRefs).forEach(module => {
            if (module.current) {
                module.cancel();
            }
        });

        if (window.GAME) window.GAME.lowerAllManuallyRaised();
    }

    render() {
        if ((this.state.radialMenuLocation != null &&
            this.lastRadialMenuLocation == null) ||
            (this.state.radialMenuLocation != null &&
            (this.lastRadialMenuLocation.x !== this.state.radialMenuLocation.x ||
            this.lastRadialMenuLocation.y !== this.state.radialMenuLocation.y))) {
            this.lastRadialMenuLocation = this.state.radialMenuLocation;
        }
        let radialMenuStyle = {
            opacity: 0,
            pointerEvents: 'none',
        };

        if (this.lastRadialMenuLocation) {
            radialMenuStyle = {
                opacity: this.state.radialMenuLocation == null ? 0 : 1,
                pointerEvents: this.state.radialMenuLocation == null ? 'none' : 'all',
                left: this.lastRadialMenuLocation.x,
                top: this.lastRadialMenuLocation.y,
            };
        }

        const radialMenuEnableClass = this.state.radialMenuLocation == null ?
            null : s.enabled;

        return <div class={ [ s.radialMenu, radialMenuEnableClass ].join(' ') }
            style={ radialMenuStyle }>

            <Breeding ref={ this.moduleRefs.breeding }
                account={ this.props.account }
                ensureLoggedIn={ this.props.ensureLoggedIn }
                handleGameError={ this.props.handleGameError }/>

            <Interacting ref={ this.moduleRefs.interacting }
                interactButtonTitle="Open Present"
                account={ this.props.account }
                ensureLoggedIn={ this.props.ensureLoggedIn }
                handleGameError={ this.props.handleGameError }/>
        </div>;
    }
}

RadialMenu.propTypes = {
    game: PropTypes.object.isRequired,
    handleGameError: PropTypes.func.isRequired,
    ensureLoggedIn: PropTypes.func.isRequired,
    account: PropTypes.string,
};

export default RadialMenu;
