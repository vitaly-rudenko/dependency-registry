const assert = require('assert').strict;

const { DependencyRegistry } = require('@vitalyrudenko/dependency-registry');

const Unit = require('./utils/Unit');

const House = require('./house/House');
const HouseBuilder = require('./house/HouseBuilder');
const Door = require('./house/Door');
const ProvidedSecurity = require('./house/ProvidedSecurity');

const Window = require('./house/window/Window');
const WindowHandle = require('./house/window/WindowHandle');
const WindowUtils = require('./house/window/WindowUtils');

const Town = require('./Town');
const Person = require('./Person');

// initialize the registry 

const PROVIDED_SECURITY_API_KEY = 'provided-security-api-key-12345';

const registry = new DependencyRegistry();

registry.registerFactory(Town, (deps) => new Town(deps));
registry.registerFactory(House, (deps, attributes) => new House(attributes, deps));
registry.registerFactory(Window, (deps) => new Window(deps));
registry.registerFactory(WindowHandle, (deps) => new WindowHandle(deps)); 

registry.registerFactory('securityFactory', (_, attributes) => new ProvidedSecurity(attributes, { apiKey: PROVIDED_SECURITY_API_KEY }))

registry.registerFactory(Person);
registry.registerFactory(Door);
registry.registerFactory(Unit);

registry.registerInstance(
    new WindowUtils({
        defaultScale: 2
    }, registry.export())
);

registry.registerInstance(
    new HouseBuilder({
        windowCount: 4,
        hasDoor: true
    }, registry.export())
);

// usage

const { townFactory, personFactory } = registry.export();

const town = townFactory.create();

const owner = personFactory.create('Jon Doe');
town.buildHouse(owner);

const [house] = town.getHouses();

assert.equal(house.owner, owner);
assert.equal(house.security instanceof ProvidedSecurity, true);
assert.equal(house.security.apiKey, PROVIDED_SECURITY_API_KEY);

assert.equal(house.door.isOpened, false);
assert.equal(house.windows[0].isOpened, false);
assert.equal(house.windows[1].isOpened, false);
assert.equal(house.security.isLocked(), true);

house.toggleLock();

assert.equal(house.door.isOpened, true);
assert.equal(house.windows[0].isOpened, true);
assert.equal(house.windows[1].isOpened, true);
assert.equal(house.security.isLocked(), false);

const { width, height } = house.windows[0].measure();

assert.equal(width.value, 400);
assert.equal(width.unit, 'cm');
assert.equal(height.value, 800);
assert.equal(height.unit, 'cm');
