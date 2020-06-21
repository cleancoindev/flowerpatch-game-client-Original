import {Howl} from 'howler';

import Util from '../components/Util';
import Effects from '../../static/gamedata/Sounds/output/Effects.json';
import Music from '../../static/gamedata/Sounds/output/Music.json';
import Ambience from '../../static/gamedata/Sounds/output/Ambience.json';

const SOUNDS = {
    effects: Effects,
    music: Music,
    ambience: Ambience,
};

class Audio {
    constructor() {
        const soundKeys = Object.keys(SOUNDS);

        // Creates all of our audio tracks based on SOUNDS
        for (var i = 0; i < soundKeys.length; i++) {
            const key = soundKeys[i];
            const level = Util.GameSettings.get('audio', key);
            const urls = SOUNDS[key].urls.map(url =>
                url + "?v=" + window.CONFIG.GAME_VERSION);

            this[key] = new Howl({
                src: urls,
                sprite: SOUNDS[key].sprite,
                volume: level,
            });

            this[key].on('loaderror', (...args) => {
                console.log('[Audio] ERR LOADING SOUNDS', key, args);
            });

            this[key].on('playerror', (...args) => {
                console.log('[Audio] ERR PLAYING SOUND', key, args);
            });
        }

        this.playMusic();
        this.ambienceTimeout = setTimeout(function() {
            this.playAmbience('ForestMorningBirds');
        }.bind(this), Util.Math.randomInt(20000) + 10000);
    }

    componentWillUnmount() {
        const keys = Object.keys(SOUNDS);

        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            this[key].off();
            this[key].fade(this[key].volume(), 0, 2000);
            setTimeout(function(howl) {
                howl.unload();
            }.bind(this, this[key]), 2200);
        }

        clearTimeout(this.ambienceTimeout);
        clearTimeout(this.musicRestartTimeout);

        console.log('[Audio] Faded + stopped audio');
    }

    playMusic() {
        const play = () => {
            console.log('[Audio] Starting music...');
            this.music.play('nuggie-winter');
        };
        play();

        this.music.on('end', () => {
            const randomDelay = this.randomInt(180000, 480000);
            console.log('[Audio] Waiting', randomDelay, 'ms before restarting music');

            clearTimeout(this.musicRestartTimeout);
            this.musicRestartTimeout = setTimeout(function() {
                play();
            }.bind(this), randomDelay);
        });
    }

    playAmbience(name) {
        console.log('[Audio] Starting ambience...');
        this.ambience.volume(0);
        this.ambience.loop(true);
        this.ambience.play(name);
        const level = Util.GameSettings.get('audio', 'ambience');
        this.ambience.fade(0, level, 3000);
    }

    async stopAmbience() {
        this.ambience.fade(this.ambience.volume(), 0, 1000);
        await Util.Promises.sleep(1000)
        this.ambience.stop();
    }

    // Sets audio level by track key name (SOUNDS keys)
    setLevel(key, num) {
        this[key].volume(num);
    }

    getLevel(key) {
        return this[key].volume();
    }

    // random integer in range, inclusive
    randomInt(min, max) {
        return min + Math.floor(Math.random() * Math.floor(max + 1 - min));
    }

    click() {
        this.effects.play('click' + this.randomInt(0, 3));
    }
}

export default Audio;
