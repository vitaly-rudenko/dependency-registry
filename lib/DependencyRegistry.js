const DependentFactory = require('./DependentFactory');

class DependencyRegistry {
    constructor() {
        this._dependencies = new Map();

        this._dependenciesProxy = new Proxy({}, {
            get: (_, dependencyName) => {
                if (!dependencyName) {
                    throw new Error(`Unsupported action`);
                }

                if (typeof dependencyName !== 'string') {
                    throw new Error(`Unsupported action: ${String(dependencyName)}`);
                }

                if (!this._dependencies.has(dependencyName)) {
                    throw new Error(`Unknown dependency: "${dependencyName}"`);
                }

                return this._dependencies.get(dependencyName);
            }
        });
    }

    registerInstance(...args) {
        if (args.length === 1) {
            const [object] = args;
            let dependencyName;

            if (this._isNativeClass(object)) {
                dependencyName = this._generateInstanceName(object.name);
            } else {
                dependencyName = this._generateInstanceName(object.constructor.name);
            }

            this._register(dependencyName, object);
        }

        if (args.length === 2) {
            const [name, instance] = args;
            this._register(name, instance);
        }
    }

    _isNativeClass(object) {
        const properties = Object.getOwnPropertyNames(object);
        return properties.includes('prototype') && !properties.includes('arguments');
    }

    _generateInstanceName(className) {
        return className[0].toLowerCase() + className.substring(1);
    }

    registerFactory(...args) {
        if (args.length === 1) {
            const [clazz] = args;

            this._register(
                this._generateFactoryName(clazz.name),
                { create: (...args) => new clazz(...args) }
            );
        }

        if (args.length === 2) {
            const [identifier, factoryMethod] = args;
            let dependencyName;

            if (this._isNativeClass(identifier)) {
                dependencyName = this._generateFactoryName(identifier.name);
            } else {
                dependencyName = identifier;
            }

            this._register(
                dependencyName,
                new DependentFactory(this, factoryMethod),
            );
        }
    }

    _generateFactoryName(className) {
        return className[0].toLowerCase() + className.substring(1) + 'Factory';
    }

    import(registry) {
        if (!(registry instanceof DependencyRegistry)) {
            throw new Error('You can only import DependencyRegistry instances');
        }

        for (const [dependencyName, dependency] of registry._dependencies.entries()) {
            if (dependency instanceof DependentFactory) {
                this._register(dependencyName, dependency.clone(this));
            } else {
                this._register(dependencyName, dependency);
            }
        }
    }

    _register(dependencyName, dependency) {
        if (this._dependencies.has(dependencyName)) {
            throw new Error(`Dependency is already registered: "${dependencyName}"`);
        }

        this._dependencies.set(dependencyName, dependency);
    }

    export() {
        return this._dependenciesProxy;
    }
}

module.exports = DependencyRegistry;
