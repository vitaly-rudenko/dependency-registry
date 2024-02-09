const INVALID_CLASSES: unknown[] = [Object, Array, Number, String, Symbol, Function]

type LazyValue<T> = (dependencies: T) => T[keyof T]

export type Factory<T> = T extends { new (...args: infer C): infer I }
  ? (...args: C) => I
  : never

function isClass(value: unknown): value is ({ new (...args: unknown[]): unknown }) {
  if (!value || INVALID_CLASSES.includes(value)) {
    return false
  }

  const properties = Object.getOwnPropertyNames(value)
  return properties.includes('prototype') && !properties.includes('arguments')
}

function capitalize<T extends string>(input: T): Capitalize<T> {
  return input[0].toUpperCase() + input.slice(1) as Capitalize<T>
}

export class DependencyRegistry<T extends Record<string, unknown>> {
  private readonly dependencies = new Map<keyof T, T[keyof T] | LazyValue<T>>()
  private readonly lazyDependencies = new Set<keyof T>()
  private readonly proxy = new Proxy({}, {
    get: (_, name) => {
      if (!name) {
        throw new Error('Unsupported action')
      }

      if (typeof name !== 'string') {
        throw new Error(`Unsupported action: ${String(name)}`)
      }

      const dependency = this.dependencies.get(name)
      if (dependency === undefined) {
        throw new Error(`Unknown dependency: "${name}"`)
      }

      if (this.isLazy(name, dependency)) {
        const value = dependency(this.export())
        if (value === undefined) {
          throw new Error(`Lazy value is undefined: ${name}`)
        }

        this.lazyDependencies.delete(name)
        this.dependencies.set(name, value)
        return value
      }

      return dependency
    }
  })

  value<Name extends Extract<keyof T, string>>(name: Name, value: T[Name]): void {
    if (!name || typeof name !== 'string') {
      throw new Error(`Invalid name: ${String(name)}`)
    }

    if (value === undefined) {
      throw new Error(`Lazy value cannot be undefined`)
    }

    if (this.dependencies.has(name)) {
      throw new Error(`Value is already registered: ${String(name)}`)
    }

    this.dependencies.set(name, value)
  }

  lazy<Name extends Extract<keyof T, string>>(name: Name, value: (dependencies: T) => T[Name]): void {
    if (!name || typeof name !== 'string') {
      throw new Error(`Invalid name: ${String(name)}`)
    }

    if (this.dependencies.has(name)) {
      throw new Error(`Lazy value is already registered: ${String(name)}`)
    }

    this.dependencies.set(name, value)
    this.lazyDependencies.add(name)
  }

  factory<
    Name extends { [K in keyof T]: K extends `create${infer N}` ? Uncapitalize<N> : never }[keyof T],
    FactoryName extends keyof T = `create${Capitalize<Name>}`
  >(
    name: Name,
    value: T[FactoryName] extends (...args: infer C) => infer I
      ? { new (dependencies: T, ...args: C): I } | ((dependencies: T, ...args: C) => I)
      : never,
  ): void {
    if (!name || typeof name !== 'string') {
      throw new Error(`Invalid factory name: ${String(name)}`)
    }

    if (value === undefined) {
      throw new Error(`Factory value cannot be undefined`)
    }

    const factoryName = `create${capitalize(name)}` as FactoryName
    if (this.dependencies.has(factoryName)) {
      throw new Error(`Factory is already registered: ${String(name)}`)
    }

    if (isClass(value)) {
      // @ts-expect-error Cannot infer type
      this.dependencies.set(factoryName, (...args: C) => new value(this.export(), ...args))
    } else if (typeof value === 'function') {
      // @ts-expect-error Cannot infer type
      this.dependencies.set(factoryName, (...args: C) => value(this.export(), ...args))
    } else {
      throw new Error(`Invalid factory value: ${String(name)}`)
    }
  }

  export(): T {
    return this.proxy as T
  }

  private isLazy<Name extends keyof T>(name: Name, value: unknown): value is LazyValue<T> {
    return this.lazyDependencies.has(name)
  }
}
