const DependentFactory = require('./DependentFactory');

const INVALID_CLASSES = [Object, Array, Number, String, Symbol, Function];

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

    registerValue(...args) {
        if (args.length === 2) {
            const [identifier, value] = args;

            if (typeof identifier !== 'string' || identifier.length === 0) {
                throw new Error(`Invalid value identifier: "${String(identifier)}" (must be a string)`);
            }
    
            if (value === undefined) {
                throw new Error('Invalid value: "undefined"');
            }
    
            this._register(identifier, value);
        } else {
            throw new Error('Invalid value registration arguments');
        }
    }

    registerInstance(...args) {
        if (args.length === 1) {
            const [object] = args;
            let dependencyName;

            if (this._isClass(object)) {
                dependencyName = this._generateInstanceName(object.name);
            } else if (this._isClass(object && object.constructor)) {
                dependencyName = this._generateInstanceName(object.constructor.name);
            } else {
                throw new Error(`Invalid instance: "${String(object)}" (must be a class or a class instance)`);
            }

            this._register(dependencyName, object);
        } else if (args.length === 2) {
            const [identifier, instance] = args;

            if (typeof identifier !== 'string' || identifier.length === 0) {
                throw new Error(`Invalid instance identifier: "${String(identifier)}" (must be a string)`);
            }

            if (instance === undefined) {
                throw new Error('Invalid instance: "undefined"');
            }

            this._register(identifier, instance);
        } else {
            throw new Error('Invalid instance registration arguments');
        }
    }

    _generateInstanceName(className) {
        return className[0].toLowerCase() + className.substring(1);
    }

    registerFactory(...args) {
        if (args.length === 1) {
            const [clazz] = args;

            if (!this._isClass(clazz)) {
                throw new Error(`Invalid factory class: "${String(clazz)}" (must be a class)`);
            }

            this._register(
                this._generateFactoryName(clazz.name),
                { create: (...args) => new clazz(...args) }
            );
        } else if (args.length === 2) {
            const [identifier, factoryMethod] = args;
            let dependencyName;

            if (typeof factoryMethod !== 'function') {
                throw new Error(`Invalid factory method: "${String(factoryMethod)}" (must be a function)`);
            }

            if (this._isClass(identifier)) {
                dependencyName = this._generateFactoryName(identifier.name);
            } else if (typeof identifier === 'string' && identifier.length > 0) {
                dependencyName = identifier;
            } else {
                throw new Error(`Invalid factory identifier: "${String(identifier)}" (must be a class or a string)`);
            }

            this._register(
                dependencyName,
                new DependentFactory(this, factoryMethod),
            );
        } else {
            throw new Error('Invalid factory registration arguments');
        }
    }

    _isClass(object) {
        if (!object || INVALID_CLASSES.includes(object)) {
            return false;
        }

        const properties = Object.getOwnPropertyNames(object);
        return properties.includes('prototype') && !properties.includes('arguments');
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
