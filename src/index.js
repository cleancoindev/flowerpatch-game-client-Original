import Splash from './components/GameUI/Splash/index.jsx';

import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';

class App extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            HELLO!
            <Splash screen="tilling" />
        </div>;
    }
}

App.propTypes = {
};

render(<App/>, document.getElementById('app'));
