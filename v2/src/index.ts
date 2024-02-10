import { validateName, type DependencyName } from './utils.js'

export class DependencyRegistry<Deps extends object> {
  private readonly deps = new Map<string, unknown>()
  private readonly proxy = new Proxy({} as Deps, {
    ownKeys: () => [...this.deps.keys()],
    has: (_, name) => typeof name === 'string' && this.deps.has(name),
    getOwnPropertyDescriptor: (_, name) => {
      return typeof name === 'string' && this.deps.has(name)
        ? { enumerable: true, configurable: true }
        : undefined
    },
    get: (_, name) => {
      if (!name) {
        throw new Error('Unsupported action')
      }

      if (name === Symbol.iterator) {
        return () => {
          const entries = this.deps.entries()
          return { next: () => entries.next() }
        }
      }

      if (typeof name !== 'string') {
        throw new Error(`Unsupported action: '${String(name)}'`)
      }

      const dependency = this.deps.get(name)
      if (dependency === undefined) {
        throw new Error(`Unknown dependency: '${name}'`)
      }

      return dependency
    }
  })

  value<DepName extends DependencyName<Deps>>(name: DepName, value: Deps[DepName]): void {
    validateName(name)

    if (value === undefined) {
      throw new Error('Value cannot be undefined')
    }

    if (this.deps.has(name)) {
      throw new Error(`Value is already registered: '${String(name)}'`)
    }

    this.deps.set(name, value)
  }

  values(values: Partial<Deps>): void {
    for (const [name, value] of Object.entries(values)) {
      // @ts-expect-error Object.entries() make
      this.value(name, value)
    }
  }

  create<DepName extends DependencyName<Deps>>(name: DepName, createFn: (deps: Deps) => Deps[DepName]): void {
    this.value(name, createFn(this.export()))
  }

  export(): Deps {
    return this.proxy
  }
}
