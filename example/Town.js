module.exports = class Town {
    constructor({ houseBuilder }) {
        this._houseBuilder = houseBuilder;
        this._houses = [];
    }

    buildHouse(owner) {
        this._houses.push(this._houseBuilder.build(owner));
    }

    getHouses() {
        return this._houses;
    }
}
