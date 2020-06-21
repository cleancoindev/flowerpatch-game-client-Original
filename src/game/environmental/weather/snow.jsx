import WeatherInterface from './interface';
import Particles from '../../../components/Particles';

class Snow extends WeatherInterface {
    constructor(game) {
        super('snow', game);
    }

    getConfig() {
        // 2 min + 0-10min
        const cycleTime = 120000 + Math.round(Math.random() * 600000);

        const config = JSON.parse(JSON.stringify(Particles.snow));
        config.spawnRect.x = -400;
        config.spawnRect.y = -4;
        config.spawnRect.w = this.getScreenSize().width + 400;
        config.spawnRect.h = 4;
        config.particleFile = '/gamedata/Particles/snow.png';

        const texture = window.PIXI.Texture.fromImage(
            config.particleFile);

        return {
            config,
            texture,
            cycleTime,
        };
    }
}

export default Snow;
