# @vitalyrudenko/dependency-registry

## Usage

### Installation

```
npm i @vitalyrudenko/dependency-registry
```

### Initialize the registry

```js
const { DependencyRegistry } = require('@vitalyrudenko/dependency-registry');

const registry = new DependencyRegistry();
```

#### Values

```js
registry.registerValue('externalApiKey', config.external.apiKey);

const { externalApiKey } = registry.export();
```

#### Instances

##### Class instances

> The name of the instance is automatically generated from the class name.

```js
registry.registerInstance(new House());

const { house } = registry.export();
```

##### Named instances
```js
registry.registerInstance('myHouse', new House());
registry.registerInstance('pgPool', pg.createPool());

const { myHouse, pgPool } = registry.export();
```

#### Factories

##### Simple class factories

> The name of the factory is automatically generated from the class name.

```js
class MyClass {
    constructor(a, b, c) {
        console.log('test:', a, b, c);
    }
}

registry.registerFactory(MyClass);

const { myClassFactory } = registry.export();

myClassFactory.create(123, 'hello', true); // logs "test: 123 hello true"
```

##### Dependent class factories

> The name of the factory is automatically generated from the class name.

```js
class Transformer {
    transform(value) {
        return '(' + value + ')';
    }
}

class MyClass {
    constructor(a, b, c, { transformer }) {
        console.log(
            'test:',
            transformer.transform(a),
            transformer.transform(b),
            transformer.transform(c)
        );
    }
}

registry.registerInstance(new Transformer());
registry.registerFactory(MyClass, (deps, ...args) => new MyClass(...args, deps));

const { myClassFactory } = registry.export();

myClassFactory.create(123, 'hello', true); // logs "test: (123) (hello) (true)"
```

##### Named factories

```js
registry.registerInstance('translator', {
    translate(key, variables) {
        if (key === 'greeting') {
            return `Hello, ${variables.name}!`;
        }

        throw new Error('Unknown key: ' + key);
    }
})

registry.registerFactory(
    'greetingFactory',
    ({ translator }, name) => translator.translate('greeting', { name })
);

const { greetingFactory } = registry.export();

console.log(greetingFactory.create('John Doe')); // logs "Hello, John Doe!"
```

#### Importing registries

```js
registry1.registerValue('appName', 'My App');

registry2.registerFactory('welcomeFactory', ({ appName }) => `Welcome to ${appName}!`);
registry2.import(registry1);

const { welcomeFactory } = registry2.export();

console.log(welcomeFactory.create()); // logs "Welcome to My App!"
```

> Imported factories can use dependencies of the new registry

## The problem

When using dependency injection or writing unit tests, you might notice that your dependency hierarchy slowly becomes bloated and hard to maintain.

Let's say we have a simple `HouseBuilder` class, which creates `House` instances:
```js
class HouseBuilder {
    constructor({ windowCount, hasDoor }) {
        this._windowCount = windowCount;
        this._hasDoor = hasDoor;
    }

    build(owner) {
        return new House({
            owner,
            windows: Array.from(
                new Array(this._windowCount),
                () => new Window()
            ),
            door: this._hasDoor ? new Door() : null
        });
    }
}
```

Now let's say that `House` requires to have its own security system, and it's gonna be an external security system (which "implements" `Security` interface), which requires an `apiKey`:

```js
const config = require('../config');

class House {
    constructor({ owner, windows, door }) {
        this._security = new ProvidedSecurity({
            windows,
            door
        }, {
            apiKey: config.apiKey,
        });
    }

    toggleLock() {
        if (this._security.isLocked()) {
            this._security.unlock();
        } else {
            this._security.lock();
        }
    }
}
```

And on top of that, let's add new dependency to the `Window`:

```js
class Window {
    constructor() {
        this._windowHandle = new WindowHandle();
    }

    toggle() {
        if (this._windowHandle.isOpened) {
            this._windowHandle.close();
        } else {
            this._windowHandle.open();
        }
    }
}
```

Finally, let's add a `WindowsUtils` dependency to the `WindowHandle`:
```js
class WindowHandle {
    constructor({ windowUtils }) {
        this._windowUtils = windowUtils;
        this._isOpened = false;
    }

    measure() {
        return this._windowUtils.measureDimensions(/* ... */);
    }

    open() {
        this._isOpened = true;
    }

    close() {
        this._isOpened = false;
    }

    get isOpened() {
        return this._isOpened;
    }
}

```

But wait, how are we going to pass `windowUtils` to the `WindowHandle`?

We'll need to pass it to `HouseBuilder`, then to `Window`:

```js
class HouseBuilder {
    constructor({ windowCount, hasDoor }, { windowUtils }) {
        this._windowCount = windowCount;
        this._hasDoor = hasDoor;
        this._windowUtils = windowUtils;
    }

    build(owner) {
        return new House({
            owner,
            windows: Array.from(
                new Array(this._windowCount),
                () => new Window({ windowUtils })
            ),
            door: this._hasDoor ? new Door() : null
        });
    }
}
```

```js
class Window {
    constructor({ windowUtils }) {
        this._windowHandle = new WindowHandle({ windowUtils });
    }

    // ...
}
```

There are three main problems with the code above:
- This code is almost impossible to unit test, because it's very hard to mock creation of external dependencies (like `new ProvidedSecurity()` or `new WindowHandle()`)
- The code knows about stuff it shouldn't know about (like `ProvidedSecurity` implementation and `config`)
- We need to pass all necessary dependencies from top to bottom of the dependency hierarchy (like with `WindowsUtils`: `HouseBuilder -> Window -> WindowHandle`), which means top-level code should know how are low-level instances are created and which dependencies they use. It's also hard to add new dependencies in low-level code, because we now need to pass it to every single "parent".

This tiny dependency registry tries to solve these issues by flattening the dependency tree and creating factories for classes.

In order to do that, we need to specify how to instantiate every class:
```js
// app.js
const registry = new DependencyRegistry();

registry.registerFactory(House, (deps, attributes) => new House(attributes, deps));
registry.registerFactory(
    'securityFactory',
    (deps, attributes) => new ProvidedSecurity(attributes, { apiKey: config.apiKey })
);

registry.registerFactory(Window, (deps, attributes) => new Window(deps));
registry.registerFactory(WindowHandle, (deps, attributes) => new WindowHandle(deps));
registry.registerInstance(new WindowUtils());

registry.registerFactory(Door);

const houseBuilder = new HouseBuilder(
    { windowCount: 2, hasDoor: true },
    registry.export()
);

const house = houseBuilder.build(new Person('John Doe'));
```

Now we need to update our classes to use the factories to create instances:
```js
class HouseBuilder {
    constructor(
        { windowCount, hasDoor },
        { houseFactory, windowFactory, doorFactory }
    ) {
        this._windowCount = windowCount;
        this._hasDoor = hasDoor;

        this._houseFactory = houseFactory;
        this._windowFactory = windowFactory;
        this._doorFactory = doorFactory;
    }

    build(owner) {
        return this._houseFactory.create({
            owner,
            windows: Array.from(
                new Array(this._windowCount),
                () => this._windowFactory.create()
            ),
            door: this._hasDoor ? this._doorFactory.create() : null
        });
    }
}
```
```js
class House {
    constructor({ owner, windows, door }, { securityFactory }) {
        this._security = securityFactory.create({
            windows,
            door
        });
    }

    toggleLock() {
        if (this._security.isLocked()) {
            this._security.unlock();
        } else {
            this._security.lock();
        }
    }
}
```
```js
class Window {
    constructor({ windowHandleFactory }) {
        this._windowHandle = windowHandleFactory.create();
    }

    toggle() {
        if (this._windowHandle.isOpened) {
            this._windowHandle.close();
        } else {
            this._windowHandle.open();
        }
    }
}
```

As you can see:
- Code is now perfectly unit testable, because we can create mock factories and completely isolate the module when testing it
- All classes only know about dependencies they actually use, they don't know about dependencies of the "children" classes (for example, `House` doesn't know about `WindowHandle` and `Window` doesn't know about `WindowUtils`). Now it's much easier to change dependencies of low-level classes, because we don't need to change anything it in "parent" classes
- Code doesn't know about stuff it shouldn't know about (for example, `House` doesn't know about `ProvidedSecurity` class and `config`, it's only concerned about `Security` interface and not the details)

> It's important that your application code (like business logic) doesn't know about `DependencyRegistry`'s existence.
> 
> You only really need it in `main` part of your application, which initializes the application, configures routes, creates connections to databases, etc. (like `app.js`, routers and controllers).
>
> In terms of your business logic, it should behave as if those factories do actually exist in your code.
