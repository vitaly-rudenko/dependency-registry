class EventCapturingManager {
    constructor({ eventUrlBuilder, eventCapturerFactory }) {
        this._eventUrlBuilder = eventUrlBuilder;
        this._eventCapturerFactory = eventCapturerFactory;

        this._eventCapturerMap = new Map();
    }

    startCapturing(eventId, { width, height }) {
        const eventCapturer = this._eventCapturerFactory.create({
            url: this._eventUrlBuilder.build(eventId),
            width,
            height
        });

        this._eventCapturerMap.set(eventId, eventCapturer);
        eventCapturer.start();

        console.log('[EventCapturingManager] Started:', eventId, { width, height });
    }

    stopCapturing(eventId) {
        const eventCapturer = this._eventCapturerMap.get(eventId);
        eventCapturer.stop();

        console.log('[EventCapturingManager] Stopped:', eventId);
    }
}

module.exports = EventCapturingManager;
