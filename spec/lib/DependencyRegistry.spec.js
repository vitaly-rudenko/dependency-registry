const DependencyRegistry = require('../../lib/DependencyRegistry');

describe('DependencyRegistry', () => {
    /** @type {DependencyRegistry} */
    let dependencyRegistry;

    beforeEach(() => {
        dependencyRegistry = new DependencyRegistry();
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

        it('should register an object using the specified name', () => {
            const instance = { fake: 'instance' };

            dependencyRegistry.registerInstance('someInstance', instance);

            expect(dependencyRegistry.export().someInstance).toBe(instance);
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

        it('should register a dependent factory with the specified name', () => {
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

        it('should throw an error when factory is already registered', () => {
            class MyClass {}

            dependencyRegistry.registerFactory(MyClass);
            dependencyRegistry.registerFactory('someFactory', { fake: 'someFactory' });

            expect(() => dependencyRegistry.registerFactory(MyClass))
                .toThrowError('Dependency is already registered: "myClassFactory"');

            expect(() => dependencyRegistry.registerFactory('someFactory', () => {}))
                .toThrowError('Dependency is already registered: "someFactory"');
        });
    });

    describe('export()', () => {
        it('should throw an error for invalid dependency names and actions', () => {
            const dependencies = dependencyRegistry.export();

            expect(() => dependencies['']).toThrowError('Unsupported action');
            expect(() => dependencies[Symbol('hello')]).toThrowError('Unsupported action: Symbol(hello)');

            const unsupportedActionErrorMessageRegex = /^Unsupported action: .+$/;

            expect(() => console.log(dependencies)).toThrowError(unsupportedActionErrorMessageRegex);
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
