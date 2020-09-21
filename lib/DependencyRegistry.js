const DependentFactory = require('./DependentFactory');

// at MyClass.myMethod (/path/MyClass.js)
const CLASS_METHOD_STACK_REGEX = /^\s+at\s(.+?)\.(.+?) \(.+?\)$/;

class DependencyRegistry {
    constructor() {
        this._dependencies = new Map();

        this._dependenciesProxy = new Proxy({}, {
            get: (_, dependencyName) => {
                if (typeof dependencyName !== 'string') {
                    throw new Error(`Unsupported action: ${String(dependencyName)}`);
                }

                if (!this._dependencies.has(dependencyName)) {
                    throw new Error(`Unknown dependency: "${dependencyName}"`);
                }

                const stack = new Error().stack;
                const executor = stack.split('\n')[2];

                if (CLASS_METHOD_STACK_REGEX.test(executor)) {
                    const [_, className] = executor.match(CLASS_METHOD_STACK_REGEX);

                    if (className !== 'Object') {
                        throw new Error('Dependencies object can only be used in the constructor');
                    }
                }

                return this._dependencies.get(dependencyName);
            }
        });
    }

    /**
     * @example
     * registry.registerInstance(new FileManager()); // registers "fileManager"
     * registry.registerInstance(DateUtils); // registers "dateUtils"
     * registry.registerInstance('amqplib', require('amqplib')); // registers "amqplib"
     */
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

    /**
     * @example
     * registry.registerFactory(FileManager); // registers "fileManagerFactory"
     *
     * // registers "billingPeriodFactory"
     * registry.registerFactory(
     *     BillingPeriod,
     *     (dependencies, amount, unit) => new BillingPeriod(amount, unit, dependencies)
     * );
     *
     * // registers "expressRouterFactory"
     * registry.registerFactory(
     *     'expressRouterFactory',
     *     (_, ...args) => express.Router(...args)
     * );
     */
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

    /**
     * @example
     * registry.import(someOtherRegistry);
     */
    import(registry) {
        if (!(registry instanceof DependencyRegistry)) {
            throw new Error('You can only import a DependencyRegistry instance');
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
