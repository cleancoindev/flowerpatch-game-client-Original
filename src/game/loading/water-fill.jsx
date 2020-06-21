class LoadingWaterFill {
    constructor(app, spritesheet, tileSize, tileScale) {
        this.app = app;
        this.spritesheet = spritesheet;
        this.tileScale = tileScale;
        this.tileSize = tileSize;

        this.container = null;
    }

    // Runs animation, returns promise for completion
    async run(autoDestroy) {
        const prom = this.fillOcean();
        console.log('[LoadingWaterFill] Started');

        if (autoDestroy) {
            prom.then(function() {
                this.destroy();
            }.bind(this));
        }

        return prom;
    }

    // Remove animation from the scene
    destroy() {
        if (this.container != null) {
            this.container.parent.removeChild(this.container);
            console.log('[LoadingWaterFill] Destroyed');
        }
    }

    makeTileSpriteFromCenter(posX, posY, texture) {
        const startX = Math.round(this.app.screen.width / 2);
        const startY = 0;

        const water = new PIXI.Sprite(texture);
        water.anchor.set(0.5);
        water.scale.x = this.tileScale;
        water.scale.y = this.tileScale;
        water.zIndex = (posY + 1000) * 4;
        water.x = startX + (this.tileSize * this.tileScale * posX);
        water.y = startY + ((this.tileSize / 2) * this.tileScale * posY);

        return water
    }

    // Initialization animation that loads ocean tiles
    async fillOcean() {
        let resolve;
        const prom = new Promise((res) => {
            resolve = res;
        });
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        const texture = this.spritesheet.getTextureByID(5);
        const maxY = (this.app.screen.height / this.tileSize) * 8;

        let i = 0;
        let anim = null;
        anim = (function() {
            if (i === 0) {
                // Draw starting tile
                this.container.addChild(
                    this.makeTileSpriteFromCenter(0, 0, texture));
            } else {
                // Draw v shape
                for (let x = 0; x < ((i + 1) * 2) - 2; x += 1) {
                    this.container.addChild(this.makeTileSpriteFromCenter(
                        -i + (x / 2), 0 + (x / 2), texture));
                    this.container.addChild(this.makeTileSpriteFromCenter(
                        i - (x / 2), 0 + (x / 2), texture));
                }
                this.container.addChild(this.makeTileSpriteFromCenter(0, i, texture));
            }

            if (i >= maxY) {
                this.app.ticker.remove(anim);
                console.log('[LoadingWaterFill] Complete');
                resolve();
            } else {
                i += 1;
            }
        }).bind(this);
        this.app.ticker.add(anim);

        return prom;
    }
}

export default LoadingWaterFill;
