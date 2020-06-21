import React from 'react';
import PropTypes from 'prop-types';

import s from './index.less'

class Splash extends React.PureComponent {
    constructor(props) {
        super(props);

        this.handleSplashClick = this.handleSplashClick.bind(this);
    }

    handleSplashClick() {
        if (this.props.onHide) this.props.onHide();
    }

    render() {
        let content = null;
        if (this.props.screen === 'tilling') {
            content = <video autoPlay loop class={ s.video }>
                <source src="/img/Splash/tilling.webm" type="video/webm" />
                <p>Your browser doesn't support HTML5 video. Sigh. </p>
            </video>
        }

        return content && <div class={ s.splash }
            onClick={ this.handleSplashClick }>
            { content }
            <div class={ s.dismissTip }>
                Click Anywhere
            </div>
        </div>;
    }
}

Splash.propTypes = {
    screen: PropTypes.string.isRequired, // which graphic to play, ex. "tilling"
    onHide: PropTypes.func,
}

export default Splash;
