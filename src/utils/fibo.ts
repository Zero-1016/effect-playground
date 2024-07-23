import {Effect} from "effect";

const fib = (n: number): Effect.Effect<number> =>
    n < 2
        ? Effect.succeed(1)
        : Effect.zipWith(
            Effect.suspend(() => fib(n - 1)),
            Effect.suspend(() => fib(n - 2)),
            (a, b) => a + b
        )

export default fib
