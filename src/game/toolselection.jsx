import GameConstants from '../../config/game.json';

class ToolSelection {
    constructor(game) {
        this.game = game;

        this.currentTool = GameConstants.tools[0];
        this.setTool(this.currentTool);
    }

    setTool(toolInfo) {
        this.currentTool = toolInfo;

        this.game.app.renderer.plugins.interaction.cursorStyles.pointer =
            "url('/img/Game/cursors/" + toolInfo.graphic + "') 4 4, pointer";
    }

    getCurrent() {
        return this.currentTool;
    }
}

export default ToolSelection;

