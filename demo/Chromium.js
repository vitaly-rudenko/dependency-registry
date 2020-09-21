class Chromium {
    constructor({ width, height }, { chromiumDriverProvider, dependencyValidator }) {
        dependencyValidator.require({ chromiumDriverProvider });

        this._width = width;
        this._height = height;
        this._chromiumDriver = chromiumDriverProvider.create();
    }

    start() {
        this._chromiumDriver.start({
            width: this._width,
            height: this._height,
        });

        console.log('[Chromium] Started');
    }

    openUrl(url) {
        console.log('[Chromium] Opening URL:', url);
        this._chromiumDriver.openUrl(url);
    }

    stop() {
        this._chromiumDriver.stop();

        console.log('[Chromium] Stopped');
    }
}

module.exports = Chromium;
