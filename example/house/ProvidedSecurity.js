module.exports = class ProvidedSecurity {
    constructor({ windows, door }, { apiKey }) {
        this._windows = windows;
        this._door = door;
        this._apiKey = apiKey;
    }

    lock() {
        for (const window of this._windows) {
            window.close();
        }

        this._door?.close();
    }

    unlock() {
        for (const window of this._windows) {
            window.open();
        }

        this._door?.open();
    }

    isLocked() {
        return this._windows.every(window => !window.isOpened)
            && (this._door && !this._door.isOpened);
    }

    get apiKey() {
        return this._apiKey;
    }
}
