class EventUrlBuilder {
    constructor({ baseUrl }) {
        this._baseUrl = baseUrl;
    }

    build(eventId) {
        return `${this._baseUrl}/${eventId}`;
    }
}

module.exports = EventUrlBuilder;
