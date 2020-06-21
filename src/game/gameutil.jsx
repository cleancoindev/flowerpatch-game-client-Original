
const getFirstTileInfo = function(gameboard, tileScreenSize) {
    // TODO use render.getRenderLayer instead of magic numbers
    const layerOneContainer = gameboard.children[0];
    const firstTile = layerOneContainer.children[0];

    return {
        container: layerOneContainer,
        midX: firstTile.x,
        midY: firstTile.y,
        x: firstTile.x - (tileScreenSize / 2),
        y: firstTile.y - (tileScreenSize / 4),
    };
};

const getTilePositionInfo = function(x, y, gameboard, tileScreenSize) {
    const tileInfo = getFirstTileInfo(gameboard, tileScreenSize);

    let offsetX = x * tileScreenSize;
    if (y % 2 === 1) offsetX += tileScreenSize / 2;
    const offsetY = (y - 1) * (tileScreenSize / 4);

    tileInfo.midX += offsetX;
    tileInfo.midY += offsetY;
    tileInfo.x += offsetX;
    tileInfo.y += offsetY;

    return tileInfo;
};

module.exports = {
    getFirstTileInfo,
    getTilePositionInfo,
}
