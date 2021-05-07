module.exports = class HouseBuilder {
    constructor({ windowCount, hasDoor }, { houseFactory, windowFactory, doorFactory }) {
        this._windowCount = windowCount;
        this._hasDoor = hasDoor;

        this._houseFactory = houseFactory;
        this._windowFactory = windowFactory;
        this._doorFactory = doorFactory;
    }

    build(owner) {
        return this._houseFactory.create({
            owner,
            windows: Array.from(new Array(this._windowCount), () => this._windowFactory.create()),
            door: this._hasDoor ? this._doorFactory.create() : null
        });
    }
}
