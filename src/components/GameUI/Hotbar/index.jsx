import React from 'react';
import PropTypes from 'prop-types';

import GameConstants from '../../../../config/game.json';

import s from './index.less'

const TOOL_ICON_PATH = '/img/Game/icons/';

class Hotbar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedTool: 'hand',
        }
    }

    handleToolSelected(toolInfo) {
        this.setState({
            selectedTool: toolInfo.name,
        });

        this.props.onToolSelected(toolInfo);
    }

    render() {
        const selected = this.state.selectedTool;

        const sizeOverrides = {
            'watering-can': '52px'
        };

        const disabled = [ 'watering-can' ];

        const actions = GameConstants.tools.map(tool => {
            const classes = [ s.tool, s.border ];
            if (tool.name === selected) classes.push(s.selected);
            if (disabled.indexOf(tool.name) >= 0) classes.push(s.disabled);

            return <div key={ tool.name }
                class={ classes.join(' ') }
                style={{
                    backgroundImage: 'url(' + TOOL_ICON_PATH + tool.graphic + ')',
                    backgroundSize: sizeOverrides[tool.name]
                }}
                data-tooltip={ tool.tip }
                onClick={ this.handleToolSelected.bind(this, tool) }
            />
        });

        return <div class={ s.hotbar }>
            { actions }
        </div>;
    }
}

Hotbar.propTypes = {
    onToolSelected: PropTypes.func.isRequired,
}

export default Hotbar;
