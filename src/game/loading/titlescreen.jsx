import Constants from '../../../config/constants.json';
import RenderUtil from '../renderutil.jsx';

class LoadingTitleScreen {
    constructor(app) {
        this.app = app;

        this.richText = null;
    }

    async run() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: [
                Constants.brandColors['light-grey'],
                Constants.brandColors['green'],
            ], // gradient
            stroke: Constants.brandColors['purple'],
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: Constants.brandColors['blue'],
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
        });

        this.richText = new PIXI.Text('Flowerpatch', style);
        this.richText.anchor.set(0.5);
        this.richText.x = this.app.screen.width / 2;
        this.richText.y = this.app.screen.height / 2;
        this.richText.alpha = 0;
        this.app.stage.addChild(this.richText);

        return RenderUtil.fadeIn(this.app, this.richText, 0.06);
    }

    destroy() {
        if (this.richText != null) {
            this.richText.destroy();
            console.log('[LoadingTitleScreen] Destroyed');
        }
    }
}

export default LoadingTitleScreen;
