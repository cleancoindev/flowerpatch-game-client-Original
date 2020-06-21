import React from 'react';
import PropTypes from 'prop-types';

import Util from '../../../Util';
const gameServiceProto = require('../../../../protobuf/gameservice_pb');
import DropPopover from '../../../DropPopover';

import s from './index.less'

class Interacting extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            enabled: false,
            interactionReply: null,
        };

        this.raisedTile = null;

        this.handleInteractButton = this.handleInteractButton.bind(this);
    }

    handleTileSelection(selectionInfo) {
        const gameTile = selectionInfo.gameTile;
        if (gameTile == null) {
            this.cancel();
            return;
        }

        const topperContent = Util.Protobuf.GameTile.getFirstTopperContent(gameTile);
        if (topperContent == null) {
            this.cancel();
            return;
        }

        this.setState({
            enabled: true,
        });

        if (window.GAME) {
            const boardEvent = selectionInfo.boardEvent;
            window.GAME.raiseTile(boardEvent.tileX, boardEvent.tileY);
            this.raisedTile = boardEvent;
        }
    }

    cancel() {
        if (this.raisedTile && window.GAME) {
            const boardEvent = this.raisedTile;
            window.GAME.lowerTile(boardEvent.tileX, boardEvent.tileY);
        }

        this.setState({
            enabled: false,
        });
    }

    async handleInteractButton() {
        if (this.raisedTile == null) {
            console.error('[Interacting] No raised tile active');
            return;
        }

        if (await this.props.ensureLoggedIn() === false) return;

        if (window.web3 == null || window.web3.utils == null) {
            console.error('[Interacting] no web3 utils available?');
            return;
        }

        const interactionRequest = new gameServiceProto.InteractionRequest();
        interactionRequest.setSourceAccount(this.props.account);
        interactionRequest.setX(this.raisedTile.tileX);
        interactionRequest.setY(this.raisedTile.tileY);

        let reply = null;
        try {
            reply = await Util.PostAPI.game.tileInteract(
                window.web3, interactionRequest, this.props.account).promise;
        } catch (e) {
            console.error('[Interacting]', e);
            this.props.handleGameError(e);
        }

        this.setState({
            interactionReply: reply
        });

        this.cancel();
    }

    render() {
        let dropPopup = null;
        if (this.state.interactionReply != null) {
            dropPopup = <DropPopover
                onHide={() => {
                    this.setState({
                        interactionReply: null,
                    });
                }}
                interactionReply={ this.state.interactionReply } />;
        }

        const styles = {};
        if (!this.state.enabled) {
            styles.opacity = 0;
            styles.pointerEvents = 'none';
        }

        return (
            <div class={ [ s.interact ].join(' ') } style={ styles }>
                <div class={ s.button }
                    onClick={ this.handleInteractButton }>
                    { this.props.interactButtonTitle }
                </div>

                { dropPopup }
            </div>
        );
    }
}

Interacting.contextTypes = {
    router: PropTypes.object
};

Interacting.propTypes = {
    handleGameError: PropTypes.func.isRequired,
    ensureLoggedIn: PropTypes.func.isRequired,
    interactButtonTitle: PropTypes.string.isRequired,
    account: PropTypes.string,
};

export default Interacting;
