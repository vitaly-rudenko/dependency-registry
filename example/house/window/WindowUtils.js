module.exports = class WindowUtils {
    constructor({ defaultScale }, { unitFactory }) {
        this._defaultScale = defaultScale;
        this._unitFactory = unitFactory;
    }

    measureDimensions() {
        return {
            width: this._unitFactory.create(200 * this._defaultScale, 'cm'),
            height: this._unitFactory.create(400 * this._defaultScale, 'cm'),
        };
    }
}
