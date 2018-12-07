class Maybe<T> {
  private constructor (private value: T | null) {}

  static some<T> (value: T) {
    if (value === null) {
      throw Error('Provided value must not be empty')
    }
    return new Maybe(value)
  }

  static none<T> (): Maybe<T> {
    // @ts-ignore
    // ignore strictNullChecks
    return new Maybe(null)
  }

  static fromValue<T> (value: T) {
    return value ? Maybe.some(value) : Maybe.none<T>()
  }

  getOrElse<T> (defaultValue: T) {
    return this.value === null ? defaultValue : this.value
  }

  map<R> (f: (wrapped: T) => R): Maybe<R> {
    if (this.value === null) {
      return Maybe.none<R>()
    }
    return Maybe.some(f(this.value))
  }

  flatMap<R> (f: (wrapped: T) => Maybe<R>): Maybe<R> {
    if (this.value === null) {
      return Maybe.none<R>()
    }
    return f(this.value)
  }

  isNone () {
    return this.value === null
  }

  isSome () {
    return !this.isNone()
  }

  dropWhen (f: (wrapped: T) => boolean) {
    if (this.value === null) {
      return Maybe.none<T>()
    }
    return f(this.value) ? Maybe.none<T>() : Maybe.some(this.value)
  }

  product<U> (m: Maybe<U>): Maybe<[T, U]> {
    const mvalue = m.getOrElse({} as U)
    if (this.value === null || m.isNone()) {
      return Maybe.none<[T, U]>()
    }
    return Maybe.some([this.value, mvalue] as [T, U])
  }
}

export default Maybe
