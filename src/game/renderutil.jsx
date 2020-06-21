const fadeIn = async function(app, fadeable, increaseRate) {
    let resolve;
    const prom = new Promise((res) => {
        resolve = res;
    })

    let anim = null;
    anim = (function(delta) {
        fadeable.alpha += increaseRate * delta;
        if (fadeable.alpha >= 1) {
            fadeable.alpha = 1;
            app.ticker.remove(anim);
            resolve(fadeable);
        }
    }).bind(this);

    // In case we got shutdown during this delay
    if (app) {
        app.ticker.add(anim);
    } else {
        resolve(fadeable);
    }

    return prom
}

const fadeOut = async function(app, fadeable, decreaseRate) {
    let resolve;
    const prom = new Promise((res) => {
        resolve = res;
    })

    let anim = null;
    anim = (function(delta) {
        fadeable.alpha -= decreaseRate * delta;
        if (fadeable.alpha <= 0) {
            fadeable.alpha = 0;
            app.ticker.remove(anim);
            resolve(fadeable);
        }
    }).bind(this);

    // In case we got shutdown during this delay
    if (app) {
        app.ticker.add(anim);
    } else {
        resolve(fadeable);
    }

    return prom
}

module.exports = {
    fadeIn,
    fadeOut,
}
