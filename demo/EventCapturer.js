class EventCapturer {
    constructor({
        url,
        width,
        height,
    }, {
        chromiumFactory,
        ffmpegWrapperFactory,
        videoDeviceFactory,
    }) {
        this._url = url;

        this._chromium = chromiumFactory.create({ width, height });
        this._ffmpegWrapper = ffmpegWrapperFactory.create({ width, height });
        this._videoDevice = videoDeviceFactory.create();
    }

    start() {
        this._chromium.start();
        this._chromium.openUrl(this._url);

        this._ffmpegWrapper.start();
        this._videoDevice.start();

        console.log('[EventCapturer] Started');
    }

    stop() {
        this._chromium.stop();
        this._ffmpegWrapper.stop();
        this._videoDevice.stop();

        console.log('[EventCapturer] Stopped');
    }
}

module.exports = EventCapturer;
