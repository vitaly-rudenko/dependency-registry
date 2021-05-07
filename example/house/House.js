module.exports = class House {
    constructor({ owner, windows, door }, { securityFactory }) {
        this._security = securityFactory.create({ windows, door });

        this._owner = owner;
        this._windows = windows;
        this._door = door;
    }

    toggleLock() {
        if (this._security.isLocked()) {
            this._security.unlock();
        } else {
            this._security.lock();
        }
    }

    get owner() {
        return this._owner;
    }

    get windows() {
        return this._windows;
    }

    get door() {
        return this._door;
    }

    get security() {
        return this._security;
    }
}
