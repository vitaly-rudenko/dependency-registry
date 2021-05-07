const DependencyRegistry = require('../../lib/DependencyRegistry');

describe('DependencyRegistry', () => {
    /** @type {DependencyRegistry} */
    let dependencyRegistry;

    beforeEach(() => {
        dependencyRegistry = new DependencyRegistry();
    });

    describe('registerValue()', () => {
        it('should register a value', () => {
            const name = 'My App';
            const description = 'This is my app!';
            const keywords = ['my', 'app'];
            const author = 'Me!';

            dependencyRegistry.registerValue('appName', name);
            dependencyRegistry.registerValue('app.description', description);
            dependencyRegistry.registerValue('#keywords', keywords);
            dependencyRegistry.registerValue('_author', author);

            expect(dependencyRegistry.export().appName).toBe(name);
            expect(dependencyRegistry.export()['app.description']).toBe(description);
            expect(dependencyRegistry.export()['#keywords']).toBe(keywords);
            expect(dependencyRegistry.export()['_author']).toBe(author);
        });

        it('should throw an error when the specified name is invalid', () => {
            const value = 'fake value';

            expect(() => dependencyRegistry.registerValue(123, value))
                .toThrowError('Invalid value identifier: "123" (must be a string)');

            expect(() => dependencyRegistry.registerValue({ hello: 'world' }, value))
                .toThrowError('Invalid value identifier: "[object Object]" (must be a string)');

            expect(() => dependencyRegistry.registerValue(null, value))
                .toThrowError('Invalid value identifier: "null" (must be a string)');

            expect(() => dependencyRegistry.registerValue(undefined, value))
                .toThrowError('Invalid value identifier: "undefined" (must be a string)');

            expect(() => dependencyRegistry.registerValue(true, value))
                .toThrowError('Invalid value identifier: "true" (must be a string)');

            expect(() => dependencyRegistry.registerValue('', value))
                .toThrowError('Invalid value identifier: "" (must be a string)');

            expect(() => dependencyRegistry.registerValue(Symbol('hello world'), value))
                .toThrowError('Invalid value identifier: "Symbol(hello world)" (must be a string)');

            expect(() => dependencyRegistry.registerValue([1, 2, 3], value))
                .toThrowError('Invalid value identifier: "1,2,3" (must be a string)');
        });

        it('should throw an error when the specified value is invalid', () => {
            expect(() => dependencyRegistry.registerValue('value', undefined))
                .toThrowError('Invalid value: "undefined"');
        });

        it('should throw an error when value is already registered', () => {
            dependencyRegistry.registerValue('name', 'My App');
            dependencyRegistry.registerValue('description', 'This is my app!');
            dependencyRegistry.registerValue('author', 'Me!');

            expect(() => dependencyRegistry.registerValue('name', null))
                .toThrowError('Dependency is already registered: "name"');
            expect(() => dependencyRegistry.registerValue('name', 'My App'))
                .toThrowError('Dependency is already registered: "name"');
            expect(() => dependencyRegistry.registerValue('name', 'My Other App'))
                .toThrowError('Dependency is already registered: "name"');

            expect(() => dependencyRegistry.registerValue('description', 'This is not my app!'))
                .toThrowError('Dependency is already registered: "description"');
            expect(() => dependencyRegistry.registerValue('author', 'Not me!'))
                .toThrowError('Dependency is already registered: "author"');
        });

        it('should throw an error when arguments count is invalid', () => {
            const errorMessage = 'Invalid value registration arguments';

            expect(() => dependencyRegistry.registerValue())
                .toThrowError(errorMessage);
            expect(() => dependencyRegistry.registerValue('hello', { fake: 'object' }, true))
                .toThrowError(errorMessage);
            expect(() => dependencyRegistry.registerValue('hello', { fake: 'object' }, true, 123))
                .toThrowError(errorMessage);
        });
    });

    describe('registerInstance()', () => {
        it('should register an object by its class name (instance)', () => {
            class MyClass {}
            const instance = new MyClass();

            dependencyRegistry.registerInstance(instance);

            expect(dependencyRegistry.export().myClass).toBe(instance);
        });

        it('should register an object by its name (class)', () => {
            class MyClass {}

            dependencyRegistry.registerInstance(MyClass);

            expect(dependencyRegistry.export().myClass).toBe(MyClass);
        });

        it('should throw an error for invalid instances when name is not specified', () => {
            expect(() => dependencyRegistry.registerInstance(() => {}))
                .toThrowError('Invalid instance: "() => {}" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance(function() {}))
                .toThrowError('Invalid instance: "function() {}" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance(function SomeFunction() {}))
                .toThrowError('Invalid instance: "function SomeFunction() {}" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance({ fake: 'object' }))
                .toThrowError('Invalid instance: "[object Object]" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance(123))
                .toThrowError('Invalid instance: "123" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance('hello world'))
                .toThrowError('Invalid instance: "hello world" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance(undefined))
                .toThrowError('Invalid instance: "undefined" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance(null))
                .toThrowError('Invalid instance: "null" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance([1, 2, 3]))
                .toThrowError('Invalid instance: "1,2,3" (must be a class or a class instance)');

            expect(() => dependencyRegistry.registerInstance(Symbol('something')))
                .toThrowError('Invalid instance: "Symbol(something)" (must be a class or a class instance)');
        });

        it('should register an object using the specified name', () => {
            const instance = { fake: 'instance' };

            dependencyRegistry.registerInstance('someInstance', instance);

            expect(dependencyRegistry.export().someInstance).toBe(instance);
        });

        it('should throw an error when the specified name is invalid', () => {
            const instance = { fake: 'instance' };

            expect(() => dependencyRegistry.registerInstance(123, instance))
                .toThrowError('Invalid instance identifier: "123" (must be a string)');

            expect(() => dependencyRegistry.registerInstance({ hello: 'world' }, instance))
                .toThrowError('Invalid instance identifier: "[object Object]" (must be a string)');

            expect(() => dependencyRegistry.registerInstance(null, instance))
                .toThrowError('Invalid instance identifier: "null" (must be a string)');

            expect(() => dependencyRegistry.registerInstance(undefined, instance))
                .toThrowError('Invalid instance identifier: "undefined" (must be a string)');

            expect(() => dependencyRegistry.registerInstance(true, instance))
                .toThrowError('Invalid instance identifier: "true" (must be a string)');

            expect(() => dependencyRegistry.registerInstance('', instance))
                .toThrowError('Invalid instance identifier: "" (must be a string)');

            expect(() => dependencyRegistry.registerInstance(Symbol('hello world'), instance))
                .toThrowError('Invalid instance identifier: "Symbol(hello world)" (must be a string)');

            expect(() => dependencyRegistry.registerInstance([1, 2, 3], instance))
                .toThrowError('Invalid instance identifier: "1,2,3" (must be a string)');
        });

        it('should throw an error when the specified instance is invalid', () => {
            expect(() => dependencyRegistry.registerInstance('instance', undefined))
                .toThrowError('Invalid instance: "undefined"');
        });

        it('should throw an error when instance is already registered', () => {
            class MyClass1 {}
            class MyClass2 {}

            dependencyRegistry.registerInstance(MyClass1);
            dependencyRegistry.registerInstance(new MyClass2());
            dependencyRegistry.registerInstance('someInstance', { fake: 'someInstance' });

            expect(() => dependencyRegistry.registerInstance(MyClass1))
                .toThrowError('Dependency is already registered: "myClass1"');
            expect(() => dependencyRegistry.registerInstance(new MyClass1()))
                .toThrowError('Dependency is already registered: "myClass1"');

            expect(() => dependencyRegistry.registerInstance(MyClass2))
                .toThrowError('Dependency is already registered: "myClass2"');
            expect(() => dependencyRegistry.registerInstance(new MyClass2()))
                .toThrowError('Dependency is already registered: "myClass2"');

            expect(() => dependencyRegistry.registerInstance('someInstance', { fake: 'someOtherInstance' }))
                .toThrowError('Dependency is already registered: "someInstance"');
        });

        it('should throw an error when arguments count is invalid', () => {
            const errorMessage = 'Invalid instance registration arguments';

            expect(() => dependencyRegistry.registerInstance())
                .toThrowError(errorMessage);
            expect(() => dependencyRegistry.registerInstance('hello', { fake: 'object' }, true))
                .toThrowError(errorMessage);
            expect(() => dependencyRegistry.registerInstance('hello', { fake: 'object' }, true, 123))
                .toThrowError(errorMessage);
        });
    });

    describe('registerFactory()', () => {
        it('should register a factory for the provided class', () => {
            class MyClass {
                constructor(...args) {
                    this.args = args;
                }
            }

            dependencyRegistry.registerFactory(MyClass);

            expect(
                dependencyRegistry.export().myClassFactory.create(1, true, { hello: 'world' })
            ).toEqual(
                new MyClass(1, true, { hello: 'world' })
            );
        });

        it('should throw an error when provided object is not a class', () => {
            class MyClass {}

            expect(() => dependencyRegistry.registerFactory(() => {}))
                .toThrowError('Invalid factory class: "() => {}" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(function() {}))
                .toThrowError('Invalid factory class: "function() {}" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(function SomeFunction() {}))
                .toThrowError('Invalid factory class: "function SomeFunction() {}" (must be a class)');

            expect(() => dependencyRegistry.registerFactory({ fake: 'object' }))
                .toThrowError('Invalid factory class: "[object Object]" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(123))
                .toThrowError('Invalid factory class: "123" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(true))
                .toThrowError('Invalid factory class: "true" (must be a class)');

            expect(() => dependencyRegistry.registerFactory('hello world'))
                .toThrowError('Invalid factory class: "hello world" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(undefined))
                .toThrowError('Invalid factory class: "undefined" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(null))
                .toThrowError('Invalid factory class: "null" (must be a class)');

            expect(() => dependencyRegistry.registerFactory([1, 2, 3]))
                .toThrowError('Invalid factory class: "1,2,3" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(Symbol('something')))
                .toThrowError('Invalid factory class: "Symbol(something)" (must be a class)');

            expect(() => dependencyRegistry.registerFactory(new MyClass()))
                .toThrowError('Invalid factory class: "[object Object]" (must be a class)');
        });

        it('should register a dependent factory for the provided class', () => {
            class MyClass {
                constructor(...args) {
                    this.args = args;
                }
            }

            const someInstance = { fake: 'someInstance' };
            dependencyRegistry.registerInstance('someInstance', someInstance);

            dependencyRegistry.registerFactory(
                MyClass,
                ({ someInstance }, ...args) => new MyClass(someInstance, ...args.reverse())
            );

            expect(
                dependencyRegistry.export().myClassFactory.create(1, true, { hello: 'world' })
            ).toEqual(
                new MyClass(someInstance, { hello: 'world' }, true, 1)
            );
        });

        it('should register a dependent factory with a custom name', () => {
            class MyClass {
                constructor(...args) {
                    this.args = args;
                }
            }

            const someInstance = { fake: 'someInstance' };
            dependencyRegistry.registerInstance('someInstance', someInstance);

            dependencyRegistry.registerFactory(
                'someCustomFactory',
                ({ someInstance }, ...args) => new MyClass(someInstance, ...args.reverse())
            );

            expect(
                dependencyRegistry.export().someCustomFactory.create(1, true, { hello: 'world' })
            ).toEqual(
                new MyClass(someInstance, { hello: 'world' }, true, 1)
            );
        });

        it('should throw an error when factory method is not a function', () => {
            class MyClass {}

            expect(() => dependencyRegistry.registerFactory('someFactory', { fake: 'object' }))
                .toThrowError('Invalid factory method: "[object Object]" (must be a function)');

            expect(() => dependencyRegistry.registerFactory(MyClass, 123))
                .toThrowError('Invalid factory method: "123" (must be a function)');

            expect(() => dependencyRegistry.registerFactory('someFactory', 'hello world'))
                .toThrowError('Invalid factory method: "hello world" (must be a function)');

            expect(() => dependencyRegistry.registerFactory(MyClass, undefined))
                .toThrowError('Invalid factory method: "undefined" (must be a function)');

            expect(() => dependencyRegistry.registerFactory(MyClass, true))
                .toThrowError('Invalid factory method: "true" (must be a function)');

            expect(() => dependencyRegistry.registerFactory('someFactory', null))
                .toThrowError('Invalid factory method: "null" (must be a function)');

            expect(() => dependencyRegistry.registerFactory(MyClass, [1, 2, 3]))
                .toThrowError('Invalid factory method: "1,2,3" (must be a function)');

            expect(() => dependencyRegistry.registerFactory('someFactory', Symbol('something')))
                .toThrowError('Invalid factory method: "Symbol(something)" (must be a function)');

            expect(() => dependencyRegistry.registerFactory(MyClass, new MyClass()))
                .toThrowError('Invalid factory method: "[object Object]" (must be a function)');
        });

        it('should throw an error when provided identifier is not a class or a string', () => {
            expect(() => dependencyRegistry.registerFactory(Symbol('hello world'), () => {}))
                .toThrowError('Invalid factory identifier: "Symbol(hello world)" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory(123, () => {}))
                .toThrowError('Invalid factory identifier: "123" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory(null, () => {}))
                .toThrowError('Invalid factory identifier: "null" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory(undefined, () => {}))
                .toThrowError('Invalid factory identifier: "undefined" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory('', () => {}))
                .toThrowError('Invalid factory identifier: "" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory(true, () => {}))
                .toThrowError('Invalid factory identifier: "true" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory([1, 2, 3], () => {}))
                .toThrowError('Invalid factory identifier: "1,2,3" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory({ fake: 'object' }, () => {}))
                .toThrowError('Invalid factory identifier: "[object Object]" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory(function SomeFunction() {}, () => {}))
                .toThrowError('Invalid factory identifier: "function SomeFunction() {}" (must be a class or a string)');

            expect(() => dependencyRegistry.registerFactory(() => {}, () => {}))
                .toThrowError('Invalid factory identifier: "() => {}" (must be a class or a string)');
        });

        it('should throw an error when factory is already registered', () => {
            class MyClass {}

            dependencyRegistry.registerFactory(MyClass);
            dependencyRegistry.registerFactory('someFactory', () => { fake: 'someFactory' });

            expect(() => dependencyRegistry.registerFactory(MyClass))
                .toThrowError('Dependency is already registered: "myClassFactory"');

            expect(() => dependencyRegistry.registerFactory('someFactory', () => {}))
                .toThrowError('Dependency is already registered: "someFactory"');
        });

        it('should throw an error when arguments count is invalid', () => {
            class MyClass {}

            const errorMessage = 'Invalid factory registration arguments';

            expect(() => dependencyRegistry.registerFactory())
                .toThrowError(errorMessage);
            expect(() => dependencyRegistry.registerFactory('hello', () => {}, true))
                .toThrowError(errorMessage);
            expect(() => dependencyRegistry.registerFactory(MyClass, () => {}, true, 123))
                .toThrowError(errorMessage);
        });
    });

    describe('export()', () => {
        it('should throw an error for invalid dependency names and actions', () => {
            const dependencies = dependencyRegistry.export();

            expect(() => dependencies['']).toThrowError('Unsupported action');
            expect(() => dependencies[Symbol('hello')]).toThrowError('Unsupported action: Symbol(hello)');
        });

        it('should throw an error for non-existing dependencies', () => {
            const dependencies = dependencyRegistry.export();

            expect(() => dependencies['nonExistingDependency']).toThrowError('Unknown dependency: "nonExistingDependency"');
            expect(() => dependencies.nonExistingDependency).toThrowError('Unknown dependency: "nonExistingDependency"');

            expect(() => {
                const { nonExistingFactory } = dependencies;
            }).toThrowError('Unknown dependency: "nonExistingFactory"');
        });
    });

    describe('import()', () => {
        it('should throw an error when provided argument is not an instance of DependencyRegistry', () => {
            class MyClass {}

            const invalidArguments = [
                null,
                undefined,
                { fake: 'something' },
                true,
                undefined,
                new MyClass(),
                MyClass,
            ];

            for (const argument of invalidArguments) {
                expect(() => dependencyRegistry.import(argument))
                    .withContext(argument)
                    .toThrowError('You can only import DependencyRegistry instances');
            }
        });

        it('should import all dependencies from the provided registry', () => {
            class MyClass1 {}
            class MyClass2 {}

            const myClass1Instance = new MyClass1();
            const myClass2Instance = new MyClass2();

            dependencyRegistry.registerInstance(myClass1Instance);
            dependencyRegistry.registerInstance('customInstance1', MyClass1);
            dependencyRegistry.registerFactory(MyClass1);
            dependencyRegistry.registerFactory('customFactory1', ({ myClass2 }) => myClass2);

            const importedDependencyRegistry = new DependencyRegistry();

            importedDependencyRegistry.registerInstance(myClass2Instance);
            importedDependencyRegistry.registerInstance('customInstance2', MyClass2);
            importedDependencyRegistry.registerFactory(MyClass2);
            importedDependencyRegistry.registerFactory('customFactory2', ({ myClass1 }) => myClass1);

            dependencyRegistry.import(importedDependencyRegistry);

            // should be unchanged
            expect(() => importedDependencyRegistry.export().myClass1).toThrow();
            expect(() => importedDependencyRegistry.export().customInstance1).toThrow();
            expect(() => importedDependencyRegistry.export().myClass1Factory).toThrow();
            expect(() => importedDependencyRegistry.export().customFactory1).toThrow();

            expect(dependencyRegistry.export().myClass1).toBe(myClass1Instance);
            expect(dependencyRegistry.export().myClass2).toBe(myClass2Instance);

            expect(dependencyRegistry.export().customInstance1).toBe(MyClass1);
            expect(dependencyRegistry.export().customInstance2).toBe(MyClass2);

            expect(dependencyRegistry.export().myClass1Factory.create()).toBeInstanceOf(MyClass1);
            expect(dependencyRegistry.export().myClass2Factory.create()).toBeInstanceOf(MyClass2);

            expect(dependencyRegistry.export().customFactory1.create()).toBe(myClass2Instance);
            expect(dependencyRegistry.export().customFactory2.create()).toBe(myClass1Instance);
        });

        it('should throw an error for already registered dependencies', () => {
            class MyClass {}

            dependencyRegistry.registerInstance(new MyClass());
            dependencyRegistry.registerInstance('customInstance', MyClass);
            dependencyRegistry.registerFactory(MyClass);
            dependencyRegistry.registerFactory('customFactory', () => {});

            const importedDependencyRegistry1 = new DependencyRegistry();
            importedDependencyRegistry1.registerInstance(new MyClass());

            const importedDependencyRegistry2 = new DependencyRegistry();
            importedDependencyRegistry2.registerInstance('customInstance', MyClass);

            const importedDependencyRegistry3 = new DependencyRegistry();
            importedDependencyRegistry3.registerFactory(MyClass);

            const importedDependencyRegistry4 = new DependencyRegistry();
            importedDependencyRegistry4.registerFactory('customFactory', () => {});

            expect(() => dependencyRegistry.import(importedDependencyRegistry1))
                .toThrowError('Dependency is already registered: "myClass"');

            expect(() => dependencyRegistry.import(importedDependencyRegistry2))
                .toThrowError('Dependency is already registered: "customInstance"');

            expect(() => dependencyRegistry.import(importedDependencyRegistry3))
                .toThrowError('Dependency is already registered: "myClassFactory"');

            expect(() => dependencyRegistry.import(importedDependencyRegistry4))
                .toThrowError('Dependency is already registered: "customFactory"');
        });
    });
});
