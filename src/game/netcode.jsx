import PropTypes from 'prop-types';

import Util from '../components/Util';

const UPDATE_INTERVAL = 2000; // ms

class Netcode {
    constructor(game) {
        this.props = null;
        this.componentWillReceiveProps(game.props);

        this.model = game.model;

        this.gameLoopIntervalID = 0;
        this.stateReadProm = null;
        this.latestTimestamp = 0;
    }

    componentWillReceiveProps(props) {
        PropTypes.checkPropTypes(Netcode.propTypes, props, 'prop', 'Netcode');
        this.props = props;
    }

    componentWillUnmount() {
        if (this.stateReadProm != null) this.stateReadProm.cancel();

        clearInterval(this.gameLoopIntervalID);
    }

    gameUpdateLoop() {
        console.log('[Net] Starting game update loop!');

        const updateState = function() {
            if (this.stateReadProm != null) this.stateReadProm.cancel();

            this.stateReadProm = Util.PostAPI.game.stateRead(
                this.props.account, this.latestTimestamp);

            this.stateReadProm.promise.then(function(gamestate) {
                const gameTiles = gamestate.getGameTilesMap()

                gameTiles.forEach(function(gametile) {
                    const timestamp = gametile.getLastChangedTimestamp();

                    if (timestamp > this.latestTimestamp) {
                        this.latestTimestamp = timestamp;
                    }

                    this.model.updateGameTile(gametile);
                }.bind(this));
            }.bind(this)).catch(function(err) {
                console.log('Error getting gamestate', err);
            });
        }.bind(this);

        this.gameLoopIntervalID = setInterval(function() {
            updateState();
        }.bind(this), UPDATE_INTERVAL);

        updateState();
    }
}

Netcode.propTypes = {
    account: PropTypes.string,
}

export default Netcode;
