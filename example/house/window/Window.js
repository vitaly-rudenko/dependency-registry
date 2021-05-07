module.exports = class Window {
    constructor({ windowHandleFactory }) {
        this._windowHandle = windowHandleFactory.create();
    }

    measure() {
        return this._windowHandle.measure();
    }

    toggle() {
        if (this._windowHandle.isOpened) {
            this._windowHandle.close();
        } else {
            this._windowHandle.open();
        }
    }

    open() {
        this._windowHandle.open();
    }

    close() {
        this._windowHandle.close();
    }

    get isOpened() {
        return this._windowHandle.isOpened;
    }
}
