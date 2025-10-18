/**
 * Result/Either Monad Implementation
 *
 * A lightweight Result type for functional error handling in TypeScript.
 * Adapted from stdLibSchema for game asset pipeline.
 *
 * @module shared/types/result
 * @fileoverview Type-safe error handling without exceptions
 */

/**
 * Result type representing success (Ok) or failure (Err)
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * Success variant of Result
 */
export class Ok<T> {
  readonly _tag = 'Ok' as const;

  constructor(public readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): false {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Ok(fn(this.value));
  }

  mapErr<F>(_fn: (error: never) => F): Result<T, F> {
    return this as Result<T, F>;
  }

  flatMap<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }

  match<U>(patterns: { ok: (value: T) => U; err: (error: never) => U }): U {
    return patterns.ok(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_fn: (error: never) => T): T {
    return this.value;
  }

  andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }

  orElse<F>(_fn: (error: never) => Result<T, F>): Result<T, F> {
    return this as Result<T, F>;
  }

  toPromise(): Promise<T> {
    return Promise.resolve(this.value);
  }
}

/**
 * Failure variant of Result
 */
export class Err<E> {
  readonly _tag = 'Err' as const;

  constructor(public readonly error: E) {}

  isOk(): false {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as Result<U, E>;
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new Err(fn(this.error));
  }

  flatMap<U, F>(_fn: (value: never) => Result<U, F>): Result<U, E | F> {
    return this as Result<U, E | F>;
  }

  match<U>(patterns: { ok: (value: never) => U; err: (error: E) => U }): U {
    return patterns.err(this.error);
  }

  unwrap(): never {
    throw new Error(`Called unwrap on an Err value: ${this.error}`);
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse<T>(fn: (error: E) => T): T {
    return fn(this.error);
  }

  andThen<U, F>(_fn: (value: never) => Result<U, F>): Result<U, E | F> {
    return this as Result<U, E | F>;
  }

  orElse<T, F>(fn: (error: E) => Result<T, F>): Result<T, F> {
    return fn(this.error);
  }

  toPromise(): Promise<never> {
    return Promise.reject(this.error);
  }
}

/**
 * Helper function to create an Ok result
 */
export function ok<T>(value: T): Result<T, never> {
  return new Ok(value);
}

/**
 * Helper function to create an Err result
 */
export function err<E>(error: E): Result<never, E> {
  return new Err(error);
}

/**
 * Convert a throwing function to a Result-returning function
 */
export function tryCatch<T, E = Error>(
  fn: () => T,
  onError?: (error: unknown) => E
): Result<T, E> {
  try {
    return ok(fn());
  } catch (error) {
    const errorValue = onError ? onError(error) : (error as E);
    return err(errorValue);
  }
}

/**
 * Convert an async throwing function to a Result-returning promise
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  onError?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    const errorValue = onError ? onError(error) : (error as E);
    return err(errorValue);
  }
}

/**
 * Combine multiple Results into a single Result
 * Returns Ok with array of values if all are Ok, otherwise first Err
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (result.isErr()) {
      return result as Result<T[], E>;
    }
    values.push(result.value);
  }

  return ok(values);
}

/**
 * Combine Results with different types into tuple
 */
export function combineTyped<T1, T2, E>(
  r1: Result<T1, E>,
  r2: Result<T2, E>
): Result<[T1, T2], E> {
  if (r1.isErr()) return r1 as Result<[T1, T2], E>;
  if (r2.isErr()) return r2 as Result<[T1, T2], E>;
  return ok([r1.value, r2.value]);
}
