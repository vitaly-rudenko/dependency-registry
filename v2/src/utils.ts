export function validateName(name: unknown): asserts name is string {
  if (!name || typeof name !== 'string') {
    throw new Error(`Invalid name: '${String(name)}'`)
  }
}

export type DependencyName<Deps> = Extract<keyof Deps, string>
