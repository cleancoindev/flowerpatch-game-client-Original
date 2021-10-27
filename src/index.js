import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';

import GameUI from './components/GameUI';

class App extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <GameUI location={this.props.location} />
        </div>;
    }
}

App.propTypes = {
};

render(<App/>, document.getElementById('app'));
