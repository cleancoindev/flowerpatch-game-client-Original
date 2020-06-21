import { Emitter } from 'pixi-particles/lib/pixi-particles.js';

import Rain from './weather/rain';
import Snow from './weather/snow';

class Environmental {
    constructor(game) {
        this.game = game;
        this.app = game.app;

        this.emitterContainer = null;
        this.weatherCycleIntervalID = -1;
        this.weathers = {
            rain: new Rain(this.game),
            snow: new Snow(this.game),
        };

        this.componentDidMount();
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        clearInterval(this.weatherCycleIntervalID);
        if (this.emitter) this.emitter.emit = false;
    }

    start(weatherName, immediate) {
        if (this.emitterContainer == null) {
            this.emitterContainer = new window.PIXI.particles.ParticleContainer();
            this.app.stage.addChild(this.emitterContainer);
        }

        const weather = this.weathers[weatherName].getConfig();

        this.emitter = new Emitter(
            this.emitterContainer,
            weather.texture,
            weather.config);
        this.emitter.emit = immediate ? true : Math.random() >= 0.5;
        this.emitter.autoUpdate = true;

        const cycle = () => {
            console.log('[Game] Cycling Weather');
            this.emitter.emit = !this.emitter.emit;
        }

        this.weatherCycleIntervalID = setInterval(cycle.bind(this), weather.cycleTime);

        console.log('[Game] Starting Weather');
    }
}

export default Environmental;
