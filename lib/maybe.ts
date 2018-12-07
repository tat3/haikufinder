class Maybe<T> {
  private constructor (private value: T | null) {}

  static some<T> (value: T) {
    if (!value) {
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
    return value ? this.some(value) : this.none()
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
}

export default Maybe
