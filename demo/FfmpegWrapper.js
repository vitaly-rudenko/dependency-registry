class FfmpegWrapper {
    constructor({ ffmpegFactory }) {
        this._ffmpegFactory = ffmpegFactory;
    }

    start() {
        this._ffmpeg = this._ffmpegFactory.create();
        this._ffmpeg.start();

        console.log('[FfmpegWrapper] Started!');
    }

    stop() {
        this._ffmpeg.stop();
        this._ffmpeg = null;

        console.log('[FfmpegWrapper] Started!');
    }
}

module.exports = FfmpegWrapper;
