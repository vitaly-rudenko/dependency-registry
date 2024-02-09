/* eslint-disable @typescript-eslint/no-explicit-any */

import { DependencyRegistry } from '../src'

const values = [
  123,
  true,
  'hello world',
  [1, 2, 3],
  { hello: 'world' },
  Symbol('hello world'),
  () => true,
  Buffer.from('hello world'),
]

const invalidNames = [
  undefined,
  null,
  '',
  true,
  Symbol('hello world'),
  123,
  { hello: 'world' },
  [1, 2, 3],
]

describe('DependencyRegistry', () => {
  let registry: DependencyRegistry<any>

  beforeEach(() => {
    registry = new DependencyRegistry()
  })

  it('throws an error for unknown dependencies', () => {
    expect(() => registry.export().name).toThrowErrorMatchingInlineSnapshot(`"Unknown dependency: "name""`)
  })

  it('throws an error for unsupported actions', () => {
    expect(() => registry.export()[Symbol('name')]).toThrowErrorMatchingInlineSnapshot(`"Unsupported action: Symbol(name)"`)
  })

  it('supports spread operator, iterators and "has" operator', () => {
    registry.value('firstName', 'John')
    registry.lazy('lastName', () => 'Doe')
    // @ts-expect-error Cannot infer name
    registry.factory('fullName', () => 'John Doe')

    const { firstName, ...rest } = registry.export()

    expect(firstName).toBe('John')
    expect(rest).toEqual({ lastName: 'Doe', createFullName: expect.any(Function) })

    expect('firstName' in registry.export()).toBe(true)
    expect('lastName' in registry.export()).toBe(true)
    expect('createFullName' in registry.export()).toBe(true)
    expect('middleName' in registry.export()).toBe(false)

    expect(Object.entries(registry.export())).toEqual([
      ['firstName', 'John'],
      ['lastName', 'Doe'],
      ['createFullName', expect.any(Function)],
    ])

    for (const item of registry.export()) {
      expect(item).toEqual([expect.any(String), expect.anything()])
    }

    expect({...registry.export()}).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      createFullName: expect.any(Function),
    })

    expect([...registry.export()]).toEqual([
      ['firstName', 'John'],
      ['lastName', 'Doe'],
      ['createFullName', expect.any(Function)],
    ])
  })

  describe('value()', () => {
    it.each(values)('registers a value', (value) => {
      registry.value('name', value)

      const { name } = registry.export()

      expect(name).toBe(value)
    })

    it('fails when value is already registered', () => {
      registry.value('hello', 'world')

      expect(() => registry.value('hello', 'there')).toThrowErrorMatchingInlineSnapshot(`"Value is already registered: hello"`)

      expect(registry.export().hello).toEqual('world')
    })

    it.each(invalidNames)('fails when name is invalid', (name: any) => {
      expect(() => registry.value(name, 'value')).toThrowErrorMatchingSnapshot()
    })

    it('fails when value is invalid', () => {
      expect(() => registry.value('name', undefined)).toThrowErrorMatchingInlineSnapshot(`"Lazy value cannot be undefined"`)
    })
  })

  describe('lazy()', () => {
    it.each(values)('registers a lazy value', (value) => {
      registry.lazy('name', () => value)

      const { name } = registry.export()

      expect(name).toBe(value)
    })

    it('initializes lazy value once when accessed', () => {
      const spy = jest.fn(() => 'value')

      registry.lazy('name', () => spy())

      const exported = registry.export()

      expect(spy).not.toHaveBeenCalled()

      expect(exported.name).toBe('value')
      expect(exported.name).toBe('value')
      expect(exported.name).toBe('value')

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('initializes lazy value with dependencies', () => {
      registry.value('firstName', 'John')
      registry.lazy('lastName', () => 'Doe')
      registry.lazy('fullName', ({ firstName, lastName }) => `${firstName} ${lastName}`)

      expect(registry.export().fullName).toBe('John Doe')
    })

    it('fails when value is already registered', () => {
      registry.lazy('hello', () => 'world')

      expect(() => registry.lazy('hello', () => 'there')).toThrowErrorMatchingInlineSnapshot(`"Lazy value is already registered: hello"`)

      expect(registry.export().hello).toEqual('world')
    })

    it.each(invalidNames)('fails when name is invalid', (name: any) => {
      expect(() => registry.lazy(name, () => 'value')).toThrowErrorMatchingSnapshot()
    })

    it('fails when value is invalid', () => {
      registry.lazy('name', () => undefined)

      expect(() => registry.export().name).toThrowErrorMatchingInlineSnapshot(`"Lazy value is undefined: name"`)
    })
  })

  describe('factory()', () => {
    it.each(values)('registers a factory', (value) => {
      // @ts-expect-error Cannot infer name
      registry.factory('name', () => value)

      const { createName } = registry.export()

      expect(createName()).toBe(value)
    })

    it('creates a factory from a class', () => {
      class Greeting {
        constructor(readonly deps: any, readonly lastName: string) {}
        generate() { return `Hello, ${this.deps.firstName} ${this.lastName}!` }
      }

      registry.value('firstName', 'John')
      // @ts-expect-error Cannot infer name
      registry.factory('greeting', Greeting)

      const { createGreeting } = registry.export()

      const greeting = createGreeting('Doe')

      expect(greeting).toBeInstanceOf(Greeting)
      expect(greeting.generate()).toBe('Hello, John Doe!')
    })

    it('fails when value is already registered', () => {
      // @ts-expect-error Cannot infer name
      registry.factory('hello', () => 'world')

      // @ts-expect-error Cannot infer name
      expect(() => registry.factory('hello', () => 'there')).toThrowErrorMatchingInlineSnapshot(`"Factory is already registered: hello"`)

      expect(registry.export().createHello()).toEqual('world')
    })

    it.each(invalidNames)('fails when name is invalid', (name: any) => {
      // @ts-expect-error Cannot infer name
      expect(() => registry.factory(name, () => 'value')).toThrowErrorMatchingSnapshot()
    })

    it.each([
      undefined,
      123,
      true,
      [1, 2, 3],
      'hello world',
      { hello: 'world' },
      Buffer.from('hello world'),
    ])('fails when value is invalid', (value) => {
      // @ts-expect-error Cannot infer name
      expect(() => registry.factory('name', value)).toThrowErrorMatchingSnapshot()
    })

    it.each([
      Object, Array, Number, String, Symbol, Function,
    ])('fails when provided class is not valid', (value) => {
      // @ts-expect-error Cannot infer name
      expect(() => registry.factory('name', value)).toThrowErrorMatchingSnapshot()
    })
  })
})

// TODO: test TS types
