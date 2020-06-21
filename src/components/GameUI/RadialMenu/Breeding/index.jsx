import React from 'react';
import PropTypes from 'prop-types';

import Util from '../../../Util';
const gameTileProto = require('../../../../protobuf/gametile_pb');
const gameServiceProto = require('../../../../protobuf/gameservice_pb');

import s from './index.less'

const PHASES = {
    DISABLED: 0,
    ENABLED: 1,
    FIRST_PICKED: 2,
    SECOND_PICKED: 3,
};

class Breeding extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            phase: PHASES.DISABLED,
            raisedTiles: null,
            gameTileOne: null,
            gameTileTwo: null,
            interactionReply: null,
        };

        this.lastSelectionInfo = null;

        this.handleBreedButton = this.handleBreedButton.bind(this);
        this.handleHarvestButton = this.handleHarvestButton.bind(this);
    }

    handleTileSelection(selectionInfo) {
        this.lastSelectionInfo = selectionInfo;
        const gameTile = selectionInfo.gameTile;
        const boardEvent = selectionInfo.boardEvent;

        let plantContent = null;
        if (gameTile) {
            const content = Util.Protobuf.GameTile.getFirstContentByType(
                gameTile, gameTileProto.GameTile.Content.Type.PLANTED);
            if (content && content.getGrowthStage() >= 3) {
                plantContent = content;
            }
        }

        let hasBreedingPartners = false;
        if (window.GAME) {
            hasBreedingPartners = (window.GAME.getBreedingPartnersFor(
                boardEvent.tileX, boardEvent.tileY).length > 0);
        }

        if (!hasBreedingPartners) {
            this.cancel();
        } else if (this.state.phase === PHASES.DISABLED && plantContent) {
            this.setState({
                phase: PHASES.ENABLED,
                gameTileOne: gameTile,
            });

            if (window.GAME) {
                window.GAME.raiseTile(boardEvent.tileX, boardEvent.tileY);
            }
        } else if (this.state.phase >= PHASES.FIRST_PICKED && plantContent) {
            const raised = this.state.raisedTiles;
            const isValid = raised.some(position =>
                (position[0] === boardEvent.tileX &&
                    position[1] === boardEvent.tileY))
            const gameTileOne = this.state.gameTileOne;

            if (isValid) {
                this.setState({
                    phase: PHASES.SECOND_PICKED,
                    gameTileTwo: gameTile,
                })
            } else if (gameTileOne.getX() === gameTile.getX() &&
                gameTileOne.getY() === gameTile.getY()) {
                this.props.handleGameError('desc = Cannot breed with itself');
            } else {
                this.cancel(function() {
                    this.handleTileSelection(selectionInfo);
                }.bind(this));
            }
        } else if (plantContent) {
            this.cancel(function() {
                this.handleTileSelection(selectionInfo);
            }.bind(this));
        } else {
            this.cancel();
        }
    }

    cancel(stateCallback) {
        this.setState({
            phase: PHASES.DISABLED,
            raisedTiles: null,
            gameTileOne: null,
            gameTileTwo: null,
        }, stateCallback && function() {
            // TODO small hack: 100ms timeout to make sure we raise
            // after the current set of tiles has started lowering
            setTimeout(() => {
                stateCallback();
            }, 100)
        });

        if (window.GAME) window.GAME.lowerAllManuallyRaised();
    }

    async handleBreedButton() {
        if (window.GAME == null || this.state.phase === PHASES.DISABLED ||
            this.lastSelectionInfo == null) return;

        if (await this.props.ensureLoggedIn() === false) return;

        const boardEvent = this.lastSelectionInfo.boardEvent;
        const tileX = boardEvent.tileX;
        const tileY = boardEvent.tileY;
        let gameTileOne = null;
        if (this.state.gameTileOne) {
            gameTileOne = this.state.gameTileOne;
        }
        let gameTileTwo = null;
        if (this.state.gameTileTwo) {
            gameTileTwo = this.state.gameTileTwo;
        }

        if (this.state.phase === PHASES.ENABLED) {
            try {
                const surrounding =
                    await window.GAME.raiseBreedingPartnersFor(tileX, tileY);

                if (surrounding.length === 0) {
                    this.props.handleGameError('desc = No valid breeding pairs');
                    this.cancel();
                    return;
                }

                this.setState({
                    raisedTiles: surrounding,
                    phase: PHASES.FIRST_PICKED,
                });
            } catch (e) { }
        }
        else if (this.state.phase === PHASES.SECOND_PICKED &&
            gameTileOne != null && gameTileTwo != null) {

            const contentOne = Util.Protobuf.GameTile.getFirstFlowerContent(gameTileOne);
            const contentTwo = Util.Protobuf.GameTile.getFirstFlowerContent(gameTileTwo);
            const adultStage = gameTileProto.GameTile.Content.GrowthStage.ADULT;

            if (contentOne == null || contentOne.getGrowthStage() < adultStage ||
                contentTwo == null || contentTwo.getGrowthStage() < adultStage) {
                this.props.handleGameError('desc = Invalid tile selection');
                return;
            }

            if (gameTileOne.getOwner() !== this.props.account &&
                gameTileTwo.getOwner() !== this.props.account) {
                this.props.handleGameError('desc = You must own one of the FLOWERs');
                return;
            }

            console.log('[Game UI] Starting breeding of',
                contentOne.getEthId(), contentTwo.getEthId());
            this.context.router.history.push('/breed/' +
                contentOne.getEthId() + '+' + contentTwo.getEthId());
        }
    }

    async handleHarvestButton() {
        if (this.lastSelectionInfo == null) {
            console.error('[Breeding] No raised tile active');
            return;
        }
        const gameTile = this.lastSelectionInfo.gameTile;

        if (await this.props.ensureLoggedIn() === false) return;

        if (window.web3 == null || window.web3.utils == null) {
            console.error('[Breeding] no web3 utils available?');
            return;
        }
        const interactionRequest = new gameServiceProto.InteractionRequest();
        interactionRequest.setSourceAccount(this.props.account);
        interactionRequest.setX(gameTile.getX());
        interactionRequest.setY(gameTile.getY());

        let reply = null;
        try {
            reply = await Util.PostAPI.game.tileInteract(
                window.web3, interactionRequest, this.props.account).promise;
        } catch (e) {
            console.error('[Breeding]', e);
            this.props.handleGameError(e);
        }

        console.log('Got interaction reply:', reply);
        this.setState({
            interactionReply: reply
        });

        this.cancel();
    }

    render() {
        const breedInfo = {
            title: 'Breed',
            flowerOne: null,
            flowerTwo: null,
        };

        if (this.state.phase >= PHASES.FIRST_PICKED) {
            const gameTileOne = this.state.gameTileOne;
            const plantedContent = Util.Protobuf.GameTile.getFirstFlowerContent(gameTileOne);
            breedInfo.flowerOne = {
                id: plantedContent.getEthId(),
            }
        }

        if (this.state.phase >= PHASES.SECOND_PICKED) {
            const gameTileTwo = this.state.gameTileTwo;
            const plantedContent = Util.Protobuf.GameTile.getFirstFlowerContent(gameTileTwo);
            breedInfo.flowerTwo = {
                id: plantedContent.getEthId(),
            }
        }

        const emptyClass = (breedInfo.flowerOne == null &&
            breedInfo.flowerTwo == null) ? s.empty : null;

        return this.state.phase !== PHASES.DISABLED && <div class={ s.options }>
            <div class={ [ s.harvest, s.button ].join(' ') }
                onClick={ this.handleHarvestButton }>Harvest</div>

            <div class={ [ s.breed, emptyClass ].join(' ') }>
                <div class={ s.button }
                    onClick={ this.handleBreedButton }>
                    { breedInfo.title }
                </div>

                <div class={ s.container }>
                    { breedInfo.flowerOne && <div class={ s.flower }>
                        <div class={ s.id }>
                            { '#' + breedInfo.flowerOne.id }
                        </div>
                    </div>}

                    { emptyClass == null && <div class={ s.plus }>+</div> }

                    { breedInfo.flowerTwo ? <div class={ s.flower }>
                        <div class={ s.id }>
                            <div>{ '#' + breedInfo.flowerTwo.id }</div>
                        </div>
                    </div> : <div>. . .</div>}
                </div>
            </div>
        </div>;
    }
}

Breeding.contextTypes = {
    router: PropTypes.object
};

Breeding.propTypes = {
    handleGameError: PropTypes.func.isRequired,
    ensureLoggedIn: PropTypes.func.isRequired,
    account: PropTypes.string,
};

export default Breeding;
