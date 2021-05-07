module.exports = class Door {
    constructor() {
        this._isOpened = false;
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
