module.exports = class WindowHandle {
    constructor({ windowUtils }) {
        this._windowUtils = windowUtils;
        this._isOpened = false;
    }

    measure() {
        return this._windowUtils.measureDimensions();
    }

    open() {
        this._isOpened = true;
    }

    close() {
        this._isOpened = false;
    }

    get isOpened() {
        return this._isOpened;
    }
}
