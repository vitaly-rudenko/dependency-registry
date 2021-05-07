module.exports = class Unit {
    constructor(value, unit) {
        this._value = value;
        this._unit = unit;
    }

    get value() {
        return this._value;
    }

    get unit() {
        return this._unit;
    }
}
