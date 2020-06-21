import WeatherInterface from './interface';
import Particles from '../../../components/Particles';

class Rain extends WeatherInterface {
    constructor(game) {
        super('rain', game);
    }

    getConfig() {
        // 2 min + 0-10min
        const cycleTime = 120000 + Math.round(Math.random() * 600000);

        const config = JSON.parse(JSON.stringify(Particles.actualRain));
        config.frequency = 0.04;
        config.startRotation.min = 65;
        config.startRotation.max = 65;
        config.rotationSpeed.min = 0;
        config.rotationSpeed.max = 0;
        config.alpha.start = 0.3;
        config.alpha.end = 0.3;
        config.color.end = '#0000FF';
        config.spawnRect.x = -400;
        config.spawnRect.y = -4;
        config.spawnRect.w = this.getScreenSize().width + 400;
        config.spawnRect.h = 4;
        config.acceleration.x = 1;
        config.acceleration.y = 1.5;
        config.lifetime.min = 0.81;
        config.lifetime.max = 0.81;
        config.particleFile = '/gamedata/Particles/hard-rain.png';

        const texture = window.PIXI.Texture.fromImage(
            config.particleFile);

        return {
            config,
            texture,
            cycleTime,
        };
    }
}

export default Rain;
