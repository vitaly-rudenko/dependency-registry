# @vitalyrudenko/dependency-registry

## Installation

```
npm i @vitalyrudenko/dependency-registry
```

## Initialize the registry

```js
const { DependencyRegistry } = require('@vitalyrudenko/dependency-registry');

const registry = new DependencyRegistry();
```

### Instances

```js
registry.registerInstance(new House());
registry.registerInstance('pgPool', pg.createPool());
registry.registerInstance('databaseDriver', new PostgresDatabaseDriver(registry.export()));

const { house, pgPool, databaseDriver } = registry.export();
```

### Factories

```js
registry.registerFactory(House);
registry.registerFactory(HouseBuilder, (deps) => new HouseBuilder(deps));
registry.registerFactory('databaseDriverFactory', (deps) => new PostgresDatabaseDriver(deps));
registry.registerFactory('pgPoolFactory', () => pg.createPool());

const {
    houseFactory,
    houseBuilderFactory,
    pgPoolFactory,
    databaseDriverFactory
} = registry.export();
```

### Importing registries

```js
registry1.registryInstance('pgPool', pg.createPool());

registry2.registerFactory('databaseDriverFactory', (deps) => new PostgresDatabaseDriver(deps));
registry2.import(registry1);

const { pgPool, databaseDriverFactory } = registry2.export();
```
