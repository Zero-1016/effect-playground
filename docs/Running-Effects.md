## runSync

`Effect.runSync()`함수는 Effect를 동기적으로 실행하는 데 사용됩니다. 즉, 즉시 실행되어 결과를 반환합니다.

```typescript
import {Effect} from "effect"

const program = Effect.sync(() => {
    console.log("Hello, World!")
    return 1
})

const result = Effect.runSync(program)
// Output: Hello, World!

console.log(result)
// Output: 1
```

해당 함수는 Effect가 실패하거나 비동기 작업을 수행할 경우 오류가 발생합니다.

```typescript
import {Effect} from "effect"

Effect.runSync(Effect.fail("my error")) // throws

Effect.runSync(Effect.promise(() => Promise.resolve(1))) // throws
```

## runSyncExit

`Effect.runSyncExit()` 함수는 Effect 라이브러리에서 중요한 역할을 합니다. 이 함수는 Effect를 동기적으로 실행할 수 있게 해줍니다. 즉, 이 함수는 Effect를 즉시 실행하고, 실행
결과를 Exit 형태로 반환합니다. Exit 데이터 타입은 Effect의 실행 결과를 캡슐화하며, 성공 여부를 나타냅니다.

```typescript
import {Effect} from "effect"

const result1 = Effect.runSyncExit(Effect.succeed(1))
console.log(result1)
/*
Output:
{
  _id: "Exit",
  _tag: "Success",
  value: 1
}
*/

const result2 = Effect.runSyncExit(Effect.fail("my error"))
console.log(result2)
/*
Output:
{
  _id: "Exit",
  _tag: "Failure",
  cause: {
    _id: "Cause",
    _tag: "Fail",
    failure: "my error"
  }
}
*/
```

## runPromise

`Effect.runPromise()` 함수는 Effect를 실행하고 그 결과를 Promise로 얻는 데 사용됩니다.

```typescript
import {Effect} from "effect"

Effect.runPromise(Effect.succeed(1)).then(console.log) // Output: 1
```

Effect가 실패한다면 `Effect.runPromise`는 오류와 함께 거부됩니다.

```typescript
import {Effect} from "effect"

Effect.runPromise(Effect.fail("my error")) // rejects
```

## runPromiseExit

`Effect.runPromiseExit()` 함수는 Effect를 실행하고 그 결과를 Promise로 얻습니다. 이 Promise는 Exit (Effect 워크플로우의 실행 결과를 설명하는 데이터 타입)으로
해결됩니다.

```typescript
import {Effect} from "effect"

Effect.runPromiseExit(Effect.succeed(1)).then(console.log)
/*
Output:
{
  _id: "Exit",
  _tag: "Success",
  value: 1
}
*/

Effect.runPromiseExit(Effect.fail("my error")).then(console.log)
/*
Output:
{
  _id: "Exit",
  _tag: "Failure",
  cause: {
    _id: "Cause",
    _tag: "Fail",
    failure: "my error"
  }
}
*/
```

## runFork

`Effect.runFork()` 함수는 Effect를 실행하는 데 필요한 기본적인 구성 요소로 사용됩니다. 사실, 다른 모든 실행 함수들은 이 함수에 기반하여 만들어졌습니다. 특별히 Promise나 동기 작업이
필요하지 않는 한, Effect.runFork를 사용하는 것이 좋습니다. 이 함수는 관찰하거나 중단할 수 있는 섬유(fiber)를 반환합니다.

```typescript
import {Effect, Console, Schedule, Fiber} from "effect"

const program = Effect.repeat(
    Console.log("running..."),
    Schedule.spaced("200 millis")
)

const fiber = Effect.runFork(program)

setTimeout(() => {
    Effect.runFork(Fiber.interrupt(fiber))
}, 500)
```

이 예제에서 프로그램은 200밀리초 간격으로 "running..."을 계속 로그합니다. 프로그램의 실행을 중단하기 위해 Effect.runFork가 반환한 섬유(fiber)에 Fiber.interrupt를
사용합니다. 이를 통해 실행 흐름을 제어하고 필요할 때 종료할 수 있습니다.

섬유가 작동하는 방식과 중단을 처리하는 방법에 대한 더 깊은 이해를 원하시면, 우리의 [섬유(Fibers)](https://effect.website/docs/guides/concurrency/fibers)
와 [중단(Interruptions)](https://effect.website/docs/guides/concurrency/interruption-model)에 관한 가이드를 참조하세요.

## Cheat Sheet

프로그램의 대부분의 논리를 Effects로 설계하는 것이 권장됩니다. `run*` 함수들은 프로그램의 "가장자리" 가까이에서 사용하는 것이 좋습니다. 이러한 접근 방식은 프로그램을 실행하고 복잡한 Effects를
구축하는 데 더 큰 유연성을 제공합니다.

다음 표는 사용 가능한 `run*` 함수들과 그 입력 및 출력 타입에 대한 요약을 제공합니다. 이를 통해 필요에 따라 적절한 함수를 선택할 수 있습니다.

| Name	          | Given        | 	To                 |
|----------------|--------------|---------------------|
| runSync        | Effect<A, E> | A                   |
| runSyncExit    | Effect<A, E> | Exit<A, E>          |
| runPromise     | Effect<A, E> | Promise<A>          |
| runPromiseExit | Effect<A, E> | Promise<Exit<A, E>> |
| runFork        | Effect<A, E> | RuntimeFiber<A, E>  |

사용 가능한 `run*` 함수들의 전체 목록은 [여기](https://effect-ts.github.io/effect/effect/Effect.ts.html#execution)에서 확인할 수 있습니다.
