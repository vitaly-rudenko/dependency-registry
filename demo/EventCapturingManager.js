class EventCapturingManager {
    constructor({ eventCapturerProvider, eventUrlBuilder, dependencyValidator }) {
        dependencyValidator.require({
            eventCapturerProvider,
            eventUrlBuilder,
        });

        this._eventUrlBuilder = eventUrlBuilder;
        this._eventCapturerProvider = eventCapturerProvider;

        this._eventCapturerMap = new Map();
    }

    startCapturing(eventId, { width, height }) {
        const eventCapturer = this._eventCapturerProvider.create({
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
