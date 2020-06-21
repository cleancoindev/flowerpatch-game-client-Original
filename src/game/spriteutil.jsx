import GameConstants from '../../config/game.json';
import Util from '../components/Util';
import Particles from '../components/Particles';
import FlowerProto from '../protobuf/flower_pb.js';
import { Emitter } from 'pixi-particles/lib/pixi-particles.js';
import chroma from 'chroma-js';

const WIND_ACCELERATION = {
    X: 1.25,
    Y: -0.8,
};

const getParticleConfig = (flowerProto, flowerHeightPx) => {
    const stats = flowerProto.getStats();
    const particleAlgoNum = stats.getParticleAlgorithm();
    const particleAlgo = Object.keys(
        FlowerProto.Flower.Stats.ParticleAlgorithm)[particleAlgoNum];
    const baseNugColor = stats.getBaseNugColor();
    const powderColor = stats.getPowderColor();
    const leafColor = stats.getLeafColor();
    const flowerHeight = stats.getHeight();
    const width = GameConstants.tile.size;
    const height = GameConstants.tile.size;
    let startColor, endColor;
    let particleConfig = null;

    switch (particleAlgo) {
        case 'POWDER_NUG':
            particleConfig = JSON.parse(JSON.stringify(Particles.wormhole));
            particleConfig.frequency = 1;
            particleConfig.maxParticles = 10;
            particleConfig.color.start = baseNugColor;
            particleConfig.color.end = powderColor;
            particleConfig.startRotation.min = -55;
            particleConfig.startRotation.max = -125;
            particleConfig.spawnRect.y = -1 * flowerHeightPx / 2;
            particleConfig.spawnRect.w = 1;
            particleConfig.spawnRect.h = 1;
            particleConfig.particleFile = '/gamedata/Particles/basic.png';
            break;
        case 'HALO':
            particleConfig = JSON.parse(JSON.stringify(Particles.halo));
            startColor = chroma(powderColor).brighten(1.5);
            endColor = chroma(baseNugColor);
            particleConfig.maxParticles = 80;
            particleConfig.color.start = startColor.hex();
            particleConfig.color.end = endColor.hex();
            particleConfig.spawnCircle.x = 0;
            particleConfig.spawnCircle.y = -1 * flowerHeightPx / 2;
            particleConfig.spawnCircle.r = 70;
            particleConfig.spawnCircle.minR = 70;
            particleConfig.particleFile = '/gamedata/Particles/spark.png';
            break;
        case 'HEART_RAIN':
            particleConfig = JSON.parse(JSON.stringify(Particles.gentleRain));
            particleConfig.frequency = 0.75;
            particleConfig.maxParticles = 20;
            particleConfig.lifetime.min = 2.5;
            particleConfig.lifetime.max = 2.5;
            particleConfig.spawnRect.x = -1 * width / 3;
            particleConfig.spawnRect.y = -1 * height / 2;
            particleConfig.spawnRect.w = width / 2;
            particleConfig.spawnRect.h = 4;
            particleConfig.startRotation.min = -20;
            particleConfig.startRotation.max = -160;
            particleConfig.color.start = powderColor;
            particleConfig.color.end = baseNugColor;
            particleConfig.rotationSpeed.min = 6;
            particleConfig.rotationSpeed.max = 6;
            particleConfig.particleFile = '/gamedata/Particles/heart.png';
            break;
        case 'BROKEN_HEART_RAIN':
            particleConfig = JSON.parse(JSON.stringify(Particles.gentleRain));
            startColor = chroma(powderColor).luminance(0.1);
            endColor = chroma(baseNugColor);
            particleConfig.frequency = 0.75;
            particleConfig.maxParticles = 20;
            particleConfig.lifetime.min = 2.5;
            particleConfig.lifetime.max = 2.5;
            particleConfig.spawnRect.x = -1 * width / 3;
            particleConfig.spawnRect.y = -1 * height / 2;
            particleConfig.spawnRect.w = width / 2;
            particleConfig.spawnRect.h = 4;
            particleConfig.startRotation.min = -20;
            particleConfig.startRotation.max = -160;
            particleConfig.rotationSpeed.min = 6;
            particleConfig.rotationSpeed.max = 6;
            particleConfig.color.start = startColor.hex();
            particleConfig.color.end = endColor.hex();
            particleConfig.particleFile = '/gamedata/Particles/broken-heart.png';
            break;
        case 'CANNABIS_RAIN':
            particleConfig = JSON.parse(JSON.stringify(Particles.gentleRain));
            particleConfig.frequency = 0.75;
            particleConfig.maxParticles = 20;
            particleConfig.lifetime.min = 2.5;
            particleConfig.lifetime.max = 2.5;
            particleConfig.spawnRect.x = -1 * width / 3;
            particleConfig.spawnRect.y = -1 * height / 2;
            particleConfig.spawnRect.w = width / 2;
            particleConfig.spawnRect.h = 4;
            particleConfig.startRotation.min = -20;
            particleConfig.startRotation.max = -160;
            particleConfig.rotationSpeed.min = 6;
            particleConfig.rotationSpeed.max = 6;
            particleConfig.color.start = baseNugColor;
            particleConfig.color.end = leafColor;
            particleConfig.particleFile = '/gamedata/Particles/cannabis.png';
            break; // done
        case 'LAZERS':
            particleConfig = JSON.parse(JSON.stringify(Particles.lazers));
            startColor = chroma(baseNugColor).saturate(3);
            endColor = chroma(baseNugColor).saturate(1);
            particleConfig.color.start = startColor.hex();
            particleConfig.color.end = endColor.hex();
            particleConfig.pos.y = -1 * flowerHeightPx / 2;
            particleConfig.lifetime.min = 2;
            particleConfig.lifetime.max = 2;
            particleConfig.alpha.start = 0.8;
            particleConfig.alpha.end = 0;
            particleConfig.speed.start = 80;
            particleConfig.speed.end = 10;
            particleConfig.particlesPerWave = 12;
            particleConfig.particleFile = '/gamedata/Particles/spark.png';
            break; // done
        case 'HAZE':
            particleConfig = JSON.parse(JSON.stringify(Particles.haze));
            startColor = chroma(baseNugColor).desaturate(1);
            endColor = chroma(leafColor).desaturate(1);
            particleConfig.color.start = startColor.hex();
            particleConfig.color.end = endColor.hex();
            particleConfig.scale.start = 0.1;
            particleConfig.scale.end = 1.8;
            particleConfig.lifetime.min = 2;
            particleConfig.lifetime.max = 6;
            particleConfig.startRotation.min = -55;
            particleConfig.startRotation.max = -125;
            particleConfig.pos.y = -1 * flowerHeightPx / 2;
            particleConfig.particleFile = '/gamedata/Particles/smoke.png';
            break;
        case 'FIRE':
            particleConfig = JSON.parse(JSON.stringify(Particles.fire));
            startColor = chroma(baseNugColor).saturate(1);
            endColor = chroma(powderColor).desaturate(1);
            particleConfig.color.start = startColor.hex();
            particleConfig.color.end = endColor.hex();
            particleConfig.pos.x = 0;
            particleConfig.pos.y = -1 * flowerHeightPx / 2;
            particleConfig.scale.start = 0.1;
            particleConfig.scale.end = 0.32;
            particleConfig.spawnCircle.r = 40;
            particleConfig.maxParticles = 30;
            particleConfig.speed.start = 75;
            particleConfig.speed.end = 25;
            particleConfig.particleFile = '/gamedata/Particles/fire.png';
            break;
        case 'BUBBLE':
            particleConfig = JSON.parse(JSON.stringify(Particles.bubble));
            startColor = chroma(baseNugColor).saturate(1);
            endColor = chroma(powderColor).saturate(1);
            particleConfig.color.start = startColor.hex();
            particleConfig.color.end = endColor.hex();
            particleConfig.pos.x = 0;
            particleConfig.pos.y = height / 2;
            particleConfig.speed.start = 50;
            particleConfig.speed.end = 30;
            particleConfig.maxParticles = 20;
            particleConfig.scale.start = 0.1;
            particleConfig.scale.end = 0.32;
            particleConfig.lifetime.min = 0.5;
            particleConfig.lifetime.max = 1.5;
            particleConfig.spawnRect.w = width;
            particleConfig.pos.y = -1 * height / 8;
            particleConfig.pos.x = -1 * width / 2;
            particleConfig.particleFile = '/gamedata/Particles/bubble.png';
            break;
        case 'INCANTATION':
            particleConfig = JSON.parse(JSON.stringify(Particles.wormhole));
            particleConfig.color.start = baseNugColor;
            particleConfig.color.end = powderColor;
            particleConfig.spawnRect.y = -1 * flowerHeightPx / 2;
            particleConfig.spawnRect.w = 1;
            particleConfig.spawnRect.h = 1;
            particleConfig.scale.start = Math.max(0.02, 0.1 * (flowerHeight / 100));
            particleConfig.scale.end = particleConfig.scale.start;
            particleConfig.frequency = 2;
            particleConfig.noRotation = true;
            particleConfig.startRotation.min = -55;
            particleConfig.startRotation.max = -125;
            particleConfig.maxParticles = 20;
            particleConfig.lifetime.min = 5;
            particleConfig.lifetime.max = 10;
            particleConfig.particleFile = '/gamedata/Particles/geometry.png';
            break;
        case 'ALPHA_PARTICLE':
            particleConfig = JSON.parse(JSON.stringify(Particles.gentleRain));
            particleConfig.frequency = 0.5;
            particleConfig.maxParticles = 30;
            particleConfig.lifetime.min = 3;
            particleConfig.lifetime.max = 5;
            particleConfig.spawnRect.x = -1 * width / 2;
            particleConfig.spawnRect.y = -1 * height / 2;
            particleConfig.spawnRect.w = width / 4;
            particleConfig.spawnRect.h = height / 2;
            particleConfig.startRotation.min = 0;
            particleConfig.startRotation.max = 0;
            particleConfig.color.start = powderColor;
            particleConfig.color.end = baseNugColor;
            particleConfig.speed.start = 30;
            particleConfig.speed.end = 25;
            particleConfig.rotationSpeed.min = 0;
            particleConfig.rotationSpeed.max = 0;
            particleConfig.particleFile = '/gamedata/Particles/alpha.png';
            break;
        case 'BETA_PARTICLE':
            particleConfig = JSON.parse(JSON.stringify(Particles.gentleRain));
            particleConfig.frequency = 0.5;
            particleConfig.maxParticles = 30;
            particleConfig.lifetime.min = 3;
            particleConfig.lifetime.max = 5;
            particleConfig.spawnRect.x = width / 3;
            particleConfig.spawnRect.y = -1 * height / 2;
            particleConfig.spawnRect.w = width / 4;
            particleConfig.spawnRect.h = height / 2;
            particleConfig.startRotation.min = 180;
            particleConfig.startRotation.max = 180;
            particleConfig.color.start = powderColor;
            particleConfig.color.end = baseNugColor;
            particleConfig.speed.start = 30;
            particleConfig.speed.end = 25;
            particleConfig.rotationSpeed.min = 0;
            particleConfig.rotationSpeed.max = 0;
            particleConfig.particleFile = '/gamedata/Particles/beta.png';
            break;
        case 'GAMMA_PARTICLE':
            particleConfig = JSON.parse(JSON.stringify(Particles.gentleRain));
            particleConfig.frequency = 0.5;
            particleConfig.maxParticles = 30;
            particleConfig.lifetime.min = 3;
            particleConfig.lifetime.max = 5;
            particleConfig.spawnRect.x = -1 * width / 2;
            particleConfig.spawnRect.y = -1 * height;
            particleConfig.spawnRect.w = width;
            particleConfig.spawnRect.h = height / 2;
            particleConfig.startRotation.min = 90;
            particleConfig.startRotation.max = 90;
            particleConfig.color.start = powderColor;
            particleConfig.color.end = baseNugColor;
            particleConfig.speed.start = 30;
            particleConfig.speed.end = 25;
            particleConfig.rotationSpeed.min = 0;
            particleConfig.rotationSpeed.max = 0;
            particleConfig.particleFile = '/gamedata/Particles/gamma.png';
            break;
        case 'DELTA_PARTICLE':
            particleConfig = JSON.parse(JSON.stringify(Particles.gentleRain));
            particleConfig.frequency = 0.5;
            particleConfig.maxParticles = 30;
            particleConfig.lifetime.min = 3;
            particleConfig.lifetime.max = 5;
            particleConfig.spawnRect.x = -1 * width / 2;
            particleConfig.spawnRect.y = -1 * height / 2;
            particleConfig.spawnRect.w = width;
            particleConfig.spawnRect.h = height / 2;
            particleConfig.startRotation.min = -90;
            particleConfig.startRotation.max = -90;
            particleConfig.color.start = powderColor;
            particleConfig.color.end = baseNugColor;
            particleConfig.speed.start = 30;
            particleConfig.speed.end = 25;
            particleConfig.rotationSpeed.min = 0;
            particleConfig.rotationSpeed.max = 0;
            particleConfig.particleFile = '/gamedata/Particles/delta.png';
            break;
        case 'CANNABIS_INCANTATION':
            particleConfig = JSON.parse(JSON.stringify(Particles.wormhole));
            particleConfig.color.start = baseNugColor;
            particleConfig.color.end = powderColor;
            particleConfig.spawnRect.y = -1 * flowerHeightPx / 2;
            particleConfig.spawnRect.w = 1;
            particleConfig.spawnRect.h = 1;
            particleConfig.scale.start = Math.max(0.02, 0.1 * (flowerHeight / 100));
            particleConfig.scale.end = particleConfig.scale.start;
            particleConfig.scale.start = 0.1;
            particleConfig.scale.end = 0.1;
            particleConfig.frequency = 2;
            particleConfig.noRotation = true;
            particleConfig.startRotation.min = -55;
            particleConfig.startRotation.max = -125;
            particleConfig.maxParticles = 20;
            particleConfig.lifetime.min = 5;
            particleConfig.lifetime.max = 10;
            particleConfig.particleFile = '/gamedata/Particles/cannabis.png';
            break;
        case 'CANNABIS_LAZERS':
            particleConfig = JSON.parse(JSON.stringify(Particles.lazers));
            startColor = chroma(baseNugColor).saturate(3);
            endColor = chroma(baseNugColor).saturate(1);
            particleConfig.color.start = startColor.hex();
            particleConfig.color.end = endColor.hex();
            particleConfig.pos.y = -1 * flowerHeightPx / 2;
            particleConfig.lifetime.min = 2;
            particleConfig.lifetime.max = 2;
            particleConfig.alpha.start = 0.8;
            particleConfig.alpha.end = 0;
            particleConfig.speed.start = 80;
            particleConfig.speed.end = 10;
            particleConfig.scale.start = 0.1;
            particleConfig.scale.end = 0.1;
            particleConfig.particlesPerWave = 12;
            particleConfig.particleFile = '/gamedata/Particles/cannabis.png';
            break;
        case 'PARTICLE_NONE':
            break;
        default:
            console.log('[SpriteUtil] ERR: Unknown Particle Algorithm:',
                particleAlgoNum, particleAlgo);
    }

    if (particleConfig) {
        // Standard / Shared Settings
        particleConfig.acceleration.x = WIND_ACCELERATION.X;
        particleConfig.acceleration.y = WIND_ACCELERATION.Y;
    }

    return particleConfig;
};

const makeTileBorder = function(color) {
    const tileScreenSize = GameConstants.tile.size * GameConstants.tile.scale;
    const tileOverlayUI = new PIXI.Graphics();
    tileOverlayUI.lineStyle(2, color, 1);
    tileOverlayUI.moveTo(tileScreenSize / 2, 0);
    tileOverlayUI.lineTo(tileScreenSize, tileScreenSize / 4);
    tileOverlayUI.lineTo(tileScreenSize / 2, tileScreenSize / 2);
    tileOverlayUI.lineTo(0, tileScreenSize / 4);
    tileOverlayUI.lineTo(tileScreenSize / 2, 0);
    tileOverlayUI.x -= tileScreenSize / 2;
    tileOverlayUI.y -= (tileScreenSize / 2) + 1;
    return tileOverlayUI;
};

// Creates a PIXI.Container rendering a flower
//
// REQUIRED:
// - spritesheets: loaded Spritesheet objects
// - tileInfo: protobuf.GameTile_Content for this object
// - tileContent: protobuf.GameTile_Content for this object
//
// OPTIONAL:
// - existing: previous PIXI.Container to use
// - flowerProto: protobuf.Flower for rendering statistics
const makeFlower = function(
    app, spritesheets, tileInfo, tileContent, existing, flowerProto) {

    const growthStage = tileContent.getGrowthStage();
    const container = existing != null ? existing : new PIXI.Container();
    container.removeChildren();

    const renderYouth = () => {
        const texture = spritesheets.Entities.getFirstTextureByTypeTag(
            "growth stage " + (parseInt(growthStage, 10) + 1));
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.75);

        if (flowerProto != null) {
            const stats = flowerProto.getStats();
            sprite.tint = Util.Math.hexStringToDecimal(stats.getStemColor());
            sprite.alpha = 1;
        } else {
            sprite.tint = 0;
            sprite.alpha = 0.5;
        }

        container.addChild(sprite);
    }

    const renderAdult = () => {
        const body = new PIXI.Sprite(
            spritesheets.Entities.getFirstTextureByTypeTag('sativa'));
        const stem = new PIXI.Sprite(
            spritesheets.Entities.getFirstTextureByTypeTag('sativa stem'));
        const shadow = new PIXI.Sprite(
            spritesheets.Entities.getFirstTextureByTypeTag('sativa shadow'));
        const nugs = new PIXI.Sprite(
            spritesheets.Entities.getFirstTextureByTypeTag('sativa nugs'));
        let particles = null;

        [ shadow, stem, body, nugs ].forEach(sprite => {
            sprite.anchor.set(0.5, 0.75);
            sprite.tint = 0;
            sprite.alpha = 0.5;
        });

        if (flowerProto != null) {
            const stats = flowerProto.getStats();
            const bodyTypeNum = stats.getBodyType();
            const bodyTypeString = Object.keys(
                FlowerProto.Flower.Stats.BodyType)[bodyTypeNum]
                .toLowerCase();
            const bodyHeightPx = stats.getHeight() * 0.75;
            const scale = (bodyHeightPx / 100) + 0.25;

            body.texture = spritesheets.Entities.getFirstTextureByTypeTag(
                bodyTypeString);
            body.tint = Util.Math.hexStringToDecimal(stats.getLeafColor());
            body.alpha = 1;
            body.scale.x = scale;
            body.scale.y = scale;

            stem.texture = spritesheets.Entities.getFirstTextureByTypeTag(
                bodyTypeString + ' stem');
            stem.tint = Util.Math.hexStringToDecimal(stats.getStemColor());
            stem.alpha = 1;
            stem.scale.x = scale;
            stem.scale.y = scale;

            shadow.texture = spritesheets.Entities.getFirstTextureByTypeTag(
                bodyTypeString + ' shadow');
            shadow.alpha = 1;
            shadow.scale.x = scale;
            shadow.scale.y = scale;

            nugs.texture = spritesheets.Entities.getFirstTextureByTypeTag(
                bodyTypeString + ' nugs');
            nugs.tint = Util.Math.hexStringToDecimal(stats.getBaseNugColor());
            nugs.alpha = 1;
            nugs.scale.x = scale;
            nugs.scale.y = scale;

            const particleConfig = getParticleConfig(flowerProto, bodyHeightPx);
            if (particleConfig) {
                particles = new PIXI.particles.ParticleContainer();
                const particleTexture = window.PIXI.Texture.fromImage(
                    particleConfig.particleFile);
                const emitter = new Emitter(
                    particles,
                    particleTexture,
                    particleConfig);

                app.ticker.add(() => {
                    const deltaS = app.ticker.elapsedMS / 1000;
                    emitter.update(deltaS);
                });

                // TODO what a pile of shit this toggling is
                // const toggler = () => {
                //     emitter.emit = !emitter.emit;
                // }
                // setTimeout(function() {
                //     setTimeout(function() {
                //         toggler();
                //     }.bind(this), 4000);

                //     setInterval(function() {
                //         toggler();
                //         setTimeout(function() {
                //             toggler();
                //         }.bind(this), 4000);
                //     }.bind(this), 10000);
                // }.bind(this), Util.Math.randomInt(5000));
            }
        }

        container.addChild(shadow);
        particles && container.addChild(particles);
        container.addChild(stem);
        container.addChild(body);
        container.addChild(nugs);
    }

    if (growthStage < 3) {
        renderYouth()
    } else if (growthStage === 3) {
        renderAdult();
    } else {
        console.log('Err unknown growth stage');
        return null;
    }

    container.scale.x = GameConstants.tile.scale;
    container.scale.y = GameConstants.tile.scale;
    container.x = 0;
    container.y = -1 * GameConstants.tile.scale * GameConstants.tile.size * 0.25;

    return container;
};

const makeTopper = function(spritesheets, tileContent) {
    const info = spritesheets.Toppers.getTextureInfoByID(
        tileContent.getTopperId());
    const isInteractable = GameConstants.interactableToppers.indexOf(
        info.type) >= 0;

    const topper = new PIXI.Sprite(
        spritesheets.Toppers.getTextureByID(tileContent.getTopperId()));
    topper.anchor.set(0.5, 1);
    topper.scale.x = GameConstants.tile.scale;
    topper.scale.y = GameConstants.tile.scale;

    if (isInteractable) {
        const container = new PIXI.Container();
        const tileborder = makeTileBorder(0xFF72D0);
        container.addChild(tileborder);
        container.addChild(topper);
        return container;
    }

    return topper;
};

module.exports = {
    makeFlower,
    makeTopper,
    makeTileBorder,
}
