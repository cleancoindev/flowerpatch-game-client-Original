import React from 'react';


import s from './index.less'

class Chat extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            chatMinimized: true,
        }

        this.toggleChat = this.toggleChat.bind(this);
    }


    toggleChat() {
        this.setState({
            chatMinimized : !this.state.chatMinimized
        })
    }

    render() {
        const username = this.props.account ? this.props.account.substring(0, 4) : 'Anonymous';
        const chatWindow = <div class = {s.chatWindow}>
            <div class = {[ s.chatContainer, this.state.chatMinimized ? s.minimized : '' ].join(' ')}>
                <div class = {s.chatControls}>
                    <div class = {s.closeButton} onClick = {this.toggleChat}>
                        <span class={ s.text }>
                            { this.state.chatMinimized ?
                                'Open Chat' : 'Close Chat' }
                        </span>
                        <span class={ s.arrow }>
                            {this.state.chatMinimized ? ' ↑' : ' ↓'}
                        </span>
                    </div>
                </div>
                <div class = {[ s.chatWrapper ].join(' ')}>
                    <iframe
                        src={"https://titanembeds.com/embed/420697341146693632?defaultchannel=643908970020339738&css=36&username="
                        + username }
                        height="100%" width="100%" frameBorder="0">
                    </iframe>
                </div>
            </div>
        </div>

        return this.props.chatEnabled && chatWindow;
    }
}

export default Chat;
