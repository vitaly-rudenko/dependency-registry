import { DependencyRegistry } from '../src/index.js'

class Summarizer {
  sum(a: number, b: number) { return a + b }
}

class User {
  constructor(readonly age: number, readonly friends: string[]) {}
  canDrive() { return this.age >= 16 }
  hasFriends() { return this.friends.length > 0 }
}

class Greeting {
  constructor(readonly input: { firstName: string }) {}
  hi() { console.log(`Hello, ${this.input.firstName}!`) }
}

class Farewell {
  constructor(readonly input: { firstName: string }, readonly lastName: string) {}
  bye() { console.log(`Bye-bye, ${this.input.firstName} ${this.lastName}!`) }
}

interface Dependencies {
  firstName: string
  age: number
  isAgeDisclosed: boolean
  friends: string[]
  photo: Buffer
  metadata: { height: 'short' | 'tall' }
  createSummarizer: () => Summarizer
  createUser: (age: number) => User
  createGreeter: () => Greeting
  createFarewell: (lastName: string) => Farewell
}

const registry = new DependencyRegistry<Dependencies>()

registry.lazy('age', ({ isAgeDisclosed }) => isAgeDisclosed ? 30 : 0)
registry.lazy('friends', () => ['Jane', 'Doe'])

registry.value('firstName', 'John')
registry.value('isAgeDisclosed', true)

registry.value('photo', Buffer.from('photo.jpg'))
registry.value('metadata', { height: 'tall' })

registry.factory('summarizer', Summarizer)
registry.factory('summarizer', () => new Summarizer())

registry.factory('greeter', Greeting)
registry.factory('greeter', (deps) => new Greeting(deps))

registry.factory('farewell', Farewell)
registry.factory('farewell', (_, lastName: string) => new Farewell({ firstName }, lastName))

// @ts-expect-error User doesn't use "dependencies" parameter
registry.factory('user', User)
registry.factory('user', ({ friends }, age) => new User(age, friends))

const {
  firstName,
  age,
  isAgeDisclosed,
  friends,
  photo,
  metadata,
  createUser,
  createGreeter,
  createFarewell,
  createSummarizer,
} = registry.export()

console.log(
  firstName,
  age,
  isAgeDisclosed,
  friends,
  photo,
  metadata,
  createUser(25).canDrive(),
  createGreeter().hi(),
  createFarewell('Doe').bye(),
  createSummarizer().sum(1, 2),
)
