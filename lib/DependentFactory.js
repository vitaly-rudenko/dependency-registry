class DependentFactory {
    constructor(dependencyRegistry, factoryMethod) {
        this._dependencyRegistry = dependencyRegistry;
        this._factoryMethod = factoryMethod;
    }

    clone(dependencyRegistry) {
        return new DependentFactory(dependencyRegistry, this._factoryMethod);
    }

    create(...args) {
        return this._factoryMethod(this._dependencyRegistry.export(), ...args);
    }
}

module.exports = DependentFactory;
