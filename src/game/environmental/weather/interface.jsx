class WeatherInterface {
    constructor(name, game) {
        this.name = name;
        this.game = game;
    }

    getConfig() {
        console.log('[Weather] ERR must implement WeatherInterface');

        return {
            config: null,
            texture: null,
            cycleTime: null,
        }
    }

    getName() {
        return this.name;
    }

    getScreenSize() {
        return {
            width: this.game.props.width,
            height: this.game.props.height,
        };
    }
}

export default WeatherInterface;
