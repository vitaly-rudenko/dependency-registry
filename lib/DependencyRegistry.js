class DependencyRegistry {
    constructor() {
        this._dependencies = new Map();

        this._proxy = new Proxy({}, {
            get: (_, dependency) => {
                if (!this._dependencies.has(dependency)) {
                    throw new Error(`Unknown dependency: "${dependency}" (please consider using "dependencyValidator" for checking dependencies)`);
                }

                return this._dependencies.get(dependency);
            }
        });
    }

    registerInstance(instance) {
        const className = instance.constructor.name;
        const dependencyName = className[0].toLowerCase() + className.substring(1);

        this._dependencies.set(dependencyName, instance);
    }

    registerNamedInstance(dependencyName, instance) {
        this._dependencies.set(dependencyName, instance);
    }

    registerFactory(clazz) {
        const className = clazz.name;
        const dependencyName = className[0].toLowerCase() + className.substring(1) + 'Factory';

        this._dependencies.set(
            dependencyName,
            { create: (...args) => new clazz(...args) }
        );
    }

    registerSimpleProvider(name, factoryFunction) {
        const dependencyName = name[0].toLowerCase() + name.substring(1) + 'Provider';

        this._dependencies.set(
            dependencyName,
            { create: (...args) => factoryFunction(...args) }
        );
    }

    registerComplexProvider(clazzOrName, providerFunction) {
        const className = typeof clazzOrName === 'string' ? clazzOrName : clazzOrName.name;
        const dependencyName = className[0].toLowerCase() + className.substring(1) + 'Provider';

        this._dependencies.set(
            dependencyName,
            { create: (...args) => providerFunction(this.export())(...args) }
        );
    }

    export() {
        const dependencies = [...this._dependencies.entries()]
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        return new Proxy(dependencies, {
            get: (_, dependencyName) => {
                const dependency = dependencies[dependencyName];

                if (dependency === undefined) {
                    throw new Error(`Unknown dependency: "${dependencyName}" (please consider using "dependencyValidator" for checking dependencies)`);
                }

                return dependency;
            }
        });
    }
}

module.exports = DependencyRegistry;
