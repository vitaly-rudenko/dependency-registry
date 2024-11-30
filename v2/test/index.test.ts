/* eslint-disable @typescript-eslint/no-explicit-any */

import { DependencyRegistry } from '../src/index.js'

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

  describe('export()', () => {
    it('throws an error for unknown dependencies', () => {
      expect(() => registry.export().name).toThrowErrorMatchingInlineSnapshot(`"Unknown dependency: 'name'"`)
    })

    it('throws an error for unsupported actions', () => {
      expect(() => registry.export()['']).toThrowErrorMatchingInlineSnapshot(`"Unsupported action"`)
      expect(() => registry.export()[Symbol('name')]).toThrowErrorMatchingInlineSnapshot(`"Unsupported action: 'Symbol(name)'"`)
      expect(() => registry.export()[Symbol.asyncIterator]).toThrowErrorMatchingInlineSnapshot(`"Unsupported action: 'Symbol(Symbol.asyncIterator)'"`)
    })

    it('supports spread operator, iterators and "in" operator', () => {
      registry.value('firstName', 'John')
      registry.values({ lastName: 'Doe', fullName: 'John Doe' })

      const { firstName, ...rest } = registry.export()

      expect(firstName).toBe('John')
      expect(rest).toStrictEqual({ lastName: 'Doe', fullName: 'John Doe' })

      const deps = registry.export()
      expect('firstName' in deps).toBe(true)
      expect('lastName' in deps).toBe(true)
      expect('fullName' in deps).toBe(true)
      expect('middleName' in deps).toBe(false)

      expect(Object.entries(registry.export())).toStrictEqual([
        ['firstName', 'John'],
        ['lastName', 'Doe'],
        ['fullName', 'John Doe'],
      ])

      for (const item of registry.export()) {
        expect(item).toStrictEqual([expect.any(String), expect.anything()])
      }

      expect({...registry.export()}).toStrictEqual({
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      })

      expect([...registry.export()]).toStrictEqual([
        ['firstName', 'John'],
        ['lastName', 'Doe'],
        ['fullName', 'John Doe'],
      ])
    })
  })

  describe('create()', () => {
    it.each(values)('registers a value', (value) => {
      registry.create('name', () => value)

      const { name } = registry.export()

      expect(name).toBe(value)
    })

    it('allows using dependencies for value creation', () => {
      registry.values({ firstName: 'John', lastName: 'Doe' })
      registry.create('fullName', ({ firstName, lastName }) => `${firstName} ${lastName}`)

      expect(registry.export().fullName).toBe('John Doe')
    })

    it('fails when value is already registered', () => {
      registry.create('hello', () => 'world')

      expect(() => registry.create('hello', () => 'there')).toThrowErrorMatchingInlineSnapshot(`"Value is already registered: 'hello'"`)

      expect(registry.export().hello).toBe('world')
    })

    it.each(invalidNames)('fails when name is invalid', (name) => {
      // @ts-expect-error Invalid name values are used
      expect(() => registry.create(name, () => 'value')).toThrowErrorMatchingSnapshot()
    })

    it('fails when value is invalid', () => {
      expect(() => registry.create('name', () => undefined)).toThrowErrorMatchingInlineSnapshot(`"Value cannot be undefined"`)
    })
  })

  describe('value()', () => {
    it.each(values)('registers a value', (value) => {
      registry.value('name', value)

      const { name } = registry.export()

      expect(name).toBe(value)
    })

    it('fails when value is already registered', () => {
      registry.value('hello', 'world')

      expect(() => registry.value('hello', 'there')).toThrowErrorMatchingInlineSnapshot(`"Value is already registered: 'hello'"`)

      expect(registry.export().hello).toBe('world')
    })

    it.each(invalidNames)('fails when name is invalid', (name) => {
      // @ts-expect-error Invalid name values are used
      expect(() => registry.value(name, 'value')).toThrowErrorMatchingSnapshot()
    })

    it('fails when value is invalid', () => {
      expect(() => registry.value('name', undefined)).toThrowErrorMatchingInlineSnapshot(`"Value cannot be undefined"`)
    })
  })

  describe('values()', () => {
    it.each(values)('registers values', (value) => {
      registry.values({ name: value })

      const { name } = registry.export()

      expect(name).toBe(value)
    })

    it('registers multiple values', () => {
      registry.values({ firstName: 'John', lastName: 'Doe' })

      const { firstName, lastName } = registry.export()

      expect({ firstName, lastName }).toStrictEqual({ firstName: 'John', lastName: 'Doe' })
    })

    it('fails when value is already registered', () => {
      registry.values({ hello: 'world' })

      expect(() => registry.values({ hello: 'world' })).toThrowErrorMatchingInlineSnapshot(`"Value is already registered: 'hello'"`)

      expect(registry.export().hello).toBe('world')
    })

    it('fails when name is invalid', () => {
      expect(() => registry.values({ '': 'value' })).toThrowErrorMatchingSnapshot()
    })

    it('fails when value is invalid', () => {
      expect(() => registry.values({ name: undefined })).toThrowErrorMatchingInlineSnapshot(`"Value cannot be undefined"`)
    })
  })
})
