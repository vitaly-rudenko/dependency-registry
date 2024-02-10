const INVALID_CLASSES: unknown[] = [Object, Array, Number, String, Symbol, Function]

type LazyValue<T> = (dependencies: T) => T[keyof T]

function isFactoryClass(value: unknown): value is new (...args: unknown[]) => unknown {
  const properties = Object.getOwnPropertyNames(value)
  return properties.includes('prototype') && !properties.includes('arguments')
}

function isFactoryFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

function capitalize<T extends string>(input: T): Capitalize<T> {
  return input[0].toUpperCase() + input.slice(1) as Capitalize<T>
}

function validateName(name: unknown): asserts name is string {
  if (!name || typeof name !== 'string') {
    throw new Error(`Invalid name: ${String(name)}`)
  }
}

export class DependencyRegistry<T extends object> {
  private readonly dependencies = new Map<string, unknown>()
  private readonly lazyDependencies = new Set<string>()
  private readonly proxy = new Proxy({} as T, {
    ownKeys: () => [...this.dependencies.keys()],
    has: (_, name) => typeof name === 'string' && this.dependencies.has(name),
    getOwnPropertyDescriptor: (_, name) => {
      return typeof name === 'string' && this.dependencies.has(name)
        ? { enumerable: true, configurable: true }
        : undefined
    },
    get: (_, name) => {
      if (!name) {
        throw new Error('Unsupported action')
      }

      if (name === Symbol.iterator) {
        return () => {
          const entries = this.dependencies.entries()
          return { next: () => entries.next() }
        }
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
    validateName(name)

    if (value === undefined) {
      throw new Error(`Lazy value cannot be undefined`)
    }

    if (this.dependencies.has(name)) {
      throw new Error(`Value is already registered: ${String(name)}`)
    }

    this.dependencies.set(name, value)
  }

  lazy<Name extends Extract<keyof T, string>>(name: Name, value: (dependencies: T) => T[Name]): void {
    validateName(name)

    if (this.dependencies.has(name)) {
      throw new Error(`Lazy value is already registered: ${String(name)}`)
    }

    this.dependencies.set(name, value)
    this.lazyDependencies.add(name)
  }

  factory<
    Name extends { [K in keyof T]: K extends `create${infer N}` ? Uncapitalize<N> : never }[Extract<keyof T, string>],
    FactoryName extends `create${Capitalize<Name>}`
  >(
    name: Name,
    value: T extends { [name in FactoryName]: (...args: infer C) => infer I }
      ? (new (dependencies: T, ...args: C) => I) | ((dependencies: T, ...args: C) => I)
      : never,
  ): void {
    validateName(name)

    if (value === undefined) {
      throw new Error(`Factory value cannot be undefined`)
    }

    const factoryName = `create${capitalize(name)}`
    if (this.dependencies.has(factoryName)) {
      throw new Error(`Factory is already registered: ${String(name)}`)
    }

    if (isFactoryClass(value)) {
      if (INVALID_CLASSES.includes(value)) {
        throw new Error(`Invalid factory class: ${String(value.name)}`)
      }

      this.dependencies.set(factoryName, (...args: unknown[]) => new value(this.export(), ...args))
    } else if (isFactoryFunction(value)) {
      this.dependencies.set(factoryName, (...args: unknown[]) => value(this.export(), ...args))
    } else {
      throw new Error(`Invalid factory value: ${String(name)}`)
    }
  }

  export(options?: { plain: boolean }): T {
    return options?.plain ? { ...this.proxy } : this.proxy
  }

  private isLazy(name: string, value: unknown): value is LazyValue<T> {
    return this.lazyDependencies.has(name)
  }
}
