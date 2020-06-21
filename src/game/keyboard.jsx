class Keyboard {
    constructor() {
        this.observe = {};

        this.downHandler = this.downHandler.bind(this);
        this.upHandler = this.upHandler.bind(this);

        this.componentDidMount();
    }

    downHandler(event) {
        if (Object.keys(this.observe).indexOf(event.key) >= 0) {
            this.observe[event.key](event);
            event.preventDefault();
        }
    }

    // not in use
    upHandler(event) {
        event.preventDefault();
    }

    componentDidMount() {
        window.addEventListener("keydown", this.downHandler, false);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.downHandler);
        this.observe = {};
    }

    // keyNames: either single key name like 'ArrowUp' or an array
    // handler: function that receives keyboard event
    on(keyNames, handler) {
        if (Array.isArray(keyNames)) {
            for (var i = 0; i < keyNames.length; i++) {
                this.observe[keyNames[i]] = handler;
            }
        } else {
            this.observe[keyNames] = handler;
        }
    }
}

export default Keyboard;
