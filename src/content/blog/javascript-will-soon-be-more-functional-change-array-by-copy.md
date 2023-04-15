---
author: Samuel Gunter
pubDatetime: 2023-04-15T06:36:12.000Z
title: JavaScript will soon be more functional (change-array-by-copy)
postSlug: javascript-will-soon-be-more-functional-change-array-by-copy
featured: false
draft: false
tags:
  - JavaScript
  - Functional Programming
  - Array
  - ECMAScript Proposal
  - code
ogImage: ""
description: >-
  An explanation of a proposal that adds new methods to the Array prototype that return a mutated copy of the array instead of mutating the array in place.
---

Sometimes you want to `.sort`, `.splice`, or `.reverse` an array, but unlike `.map`, `.filter`, `.reduce`, and others, those methods mutate (change) the original array. Also, `.splice` returns the removed elements, so it's not nice to use them in a chain of methods. In [Functional Programming][functional-programming], functions are supposed to be [pure][pure-functions], meaning that they don't have side-effects such as mutating the inputs/outer state. Making functions pure when possible can make your code easier to reason about, test, and debug, but when it's inconvenient I like to mix programming styles. In this post, I'll explain a proposal that adds new methods to the Array prototype that return a mutated copy of the array instead of mutating the array in place.

# Table of Contents

# The Problem

As mentioned above, JavaScript's array methods are inconsistent with mutations. Some methods mutate the array, others return a mutated copy of the array. `.splice` returns the removed elements instead of the mutated array, which prevents the chaining of array methods.

```js
/* Independent calls example */
const arr = [3, 5, 4, 1, 2];
const arr2 = arr.sort((a, b) => a - b);
const arr3 = arr.filter(x => x > 2);
const arr4 = arr.reverse();

console.log(arr); // [5, 4, 3, 2, 1]
console.log(arr2); // [5, 4, 3, 2, 1]
console.log(arr3); // [3, 4, 5]
console.log(arr4); // [5, 4, 3, 2, 1]
```

[Not even GitHub Copilot understands which methods mutate the array and which don't][copilot-tweet].

This wacky behavior happens because `arr`, `arr2`, and `arr4` are all referencing the same array. `.sort` mutates in-place, `.filter` is a new array based on `arr` (which was mutated by the `.sort`), and `.reverse` mutates in-place. This example is pretty simple, but imagine having a bug due to arrays being mutated when you expected them to be copied.

If I do the same operations but chained (separated into variables to be able to log), a different result is produced:

```js
/* Chained calls example */
const arr = [3, 5, 4, 1, 2];
const arr2 = arr.sort((a, b) => a - b); // [1, 2, 3, 4, 5]
const arr3 = arr2.filter(x => x > 2); // [3, 4, 5]
const arr4 = arr3.reverse(); // [5, 4, 3]

console.log(arr); // [1, 2, 3, 4, 5]
console.log(arr2); // [1, 2, 3, 4, 5]
console.log(arr3); // [5, 4, 3]
console.log(arr4); // [5, 4, 3]
```

Since we're chaining, it doesn't really matter that `arr3` is mutably reversed, however we still have the side-effect of `arr` being mutated by `.sort`.

# The New Solution

There's a [Stage 4][stage-4] proposal to the ECMAScript Standard (ECMAScript is the generic name of JavaScript) that adds new methods to the Array prototype and [Typed Array][typed-array] prototype that return a mutated copy of the array for the methods described above, as well as a new method `.with(index, value)` that acts like `arr[index] = value`. The [proposal][proposal] will be implemented in the 2023 edition of ECMAScript, [which has come out in June for the past several years][june-release].

Here are the ([proposed<sup>\*</sup>][proposed-ts]) TypeScript definitions for the new methods:

```ts
interface Array<T> {
  toSorted(compareFn?: (a: T, b: T) => number): T[];
  toSpliced(start: number, deleteCount?: number): T[];
  // Overload, with extra info in TSDoc format
  toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
  toReversed(): T[];
  with(index: number, value: T): T[];
}
```

There was some debate over whether `.toSpliced` should be allowed to introduce something of a different type into the array:

```ts
interface Array<T> {
  toSpliced<F>(start: number, deleteCount: number, ...items: F[]): (T | F)[];
}
```

Since `.splice` doesn't allow that, as well as every other method in the Array prototype and modification via bracket notation (`arr[index] = value`), it was decided that `.toSpliced` should not allow it either.

When we use these methods in the same examples as above, we get the following results:

```js
/* Independent calls example */
const arr = [3, 5, 4, 1, 2];
const arr2 = arr.toSorted((a, b) => a - b); // [1, 2, 3, 4, 5]
const arr3 = arr.filter(x => x > 2); // [3, 5, 4]
const arr4 = arr.toReversed(); // [2, 1, 4, 5, 3]

console.log(arr); // [3, 5, 4, 1, 2]
console.log(arr2); // [1, 2, 3, 4, 5]
console.log(arr3); // [3, 5, 4]
console.log(arr4); // [2, 1, 4, 5, 3]
```

```js
/* Chained calls example */
const arr = [3, 5, 4, 1, 2];
const arr2 = arr.toSorted((a, b) => a - b); // [1, 2, 3, 4, 5]
const arr3 = arr2.filter(x => x > 2); // [3, 4, 5]
const arr4 = arr3.toReversed(); // [5, 4, 3]

console.log(arr); // [3, 5, 4, 1, 2]
console.log(arr2); // [1, 2, 3, 4, 5]
console.log(arr3); // [3, 4, 5]
console.log(arr4); // [5, 4, 3]
```

As you can see, every array is now independent of the others, and the original array is not mutated.

# Drawbacks

The downside of this proposal is that each time we chain a method, a whole new array is created. This can be a performance issue if you're doing a lot of chaining, but it's not a big deal if you're only chaining a few methods and the array is small. I'm sure that engines _could_ optimize for chained immutable calls, but I don't know the precedent.

If performance becomes an issue, you can always perform a single copy beforehand and use mutable methods, and for methods that don't have a mutable equivalent, you can implement them with a `for` loop.

As with the other `Array` methods, the new arrays are created immediately. If you're interested in lazy evaluation, look out for the Stage 3 proposal [Iterator Helpers][iterator-helpers] or use a library such as [itertools][itertools] or [iter-tools][iter-tools].

# Alternatives

These new methods don't _need_ to exist, but they can make code more readable and less error-prone. It's worth noting some alternatives that you can use:

- Use the [spread operator][spread-operator], [`Array.from`][array-from], or `.slice` to copy the array before mutating it:

  ```js
  /* Independent calls example */
  const arr = [3, 5, 4, 1, 2];
  const arr2 = [...arr].sort((a, b) => a - b);
  const arr3 = [...arr].filter(x => x > 2); // not actually needed here
  const arr4 = [...arr].reverse();

  console.log(arr); // [3, 5, 4, 1, 2]
  console.log(arr2); // [1, 2, 3, 4, 5]
  console.log(arr3); // [3, 5, 4]
  console.log(arr4); // [2, 1, 4, 5, 3]
  ```

- Rearrange the methods so that the array is copied before mutating it:

  ```js
  /* Chained calls example */
  const arr = [3, 5, 4, 1, 2];
  const arr2 = arr.filter(x => x > 2); // [3, 5, 4]
  const arr3 = arr2.sort((a, b) => a - b); // [3, 4, 5]
  const arr4 = arr3.reverse(); // [5, 4, 3]

  console.log(arr); // [3, 5, 4, 1, 2]
  console.log(arr2); // [5, 4, 3]
  console.log(arr3); // [5, 4, 3]
  console.log(arr4); // [5, 4, 3]
  ```

  Like before, it doesn't matter that `arr2` is mutated since when you actually chain methods, the `arr2` variable doesn't exist.

- Use a library like [Immutable](immutable) or [Immer](immer) to make your arrays immutable. I don't know much about these libraries, but they get 13.6 million and 9.2 million weekly downloads on npm, respectively, so they're probably good. I know that for objects, they store the changes instead of full copies, but I don't know what exactly happens with arrays.

- Technically, all of these methods can be implemented with a `.reduce` function, but that would just lead to ugly code.

# Browser/Engine support

(copied from the [proposal][proposal], with a small change)

- [Firefox/SpiderMonkey](https://bugzilla.mozilla.org/show_bug.cgi?id=1729563), currently flagged
- [Safari/JavaScriptCore](https://bugs.webkit.org/show_bug.cgi?id=234604), shipping unflagged since [Safari Tech Preview 146](https://developer.apple.com/safari/technology-preview/release-notes/#:~:text=bug%20tracker.-,Release%20146,-Note%3A%20Tab)
- [Chrome/V8](https://bugs.chromium.org/p/v8/issues/detail?id=12764), shipping unflagged since Chrome 110

- [Ladybird/LibJS](https://github.com/SerenityOS/serenity/issues/16353), shipping unflagged

- [core-js](https://github.com/zloirock/core-js)

  - [change-array-by-copy](https://github.com/zloirock/core-js#change-array-by-copy)

- [es-shims](https://github.com/es-shims):

  - [`array.prototype.tosorted`](https://www.npmjs.com/package/array.prototype.tosorted)
  - [`array.prototype.toreversed`](https://www.npmjs.com/package/array.prototype.toreversed)
  - [`array.prototype.tospliced`](https://www.npmjs.com/package/array.prototype.tospliced)
  - [`array.prototype.with`](https://www.npmjs.com/package/array.prototype.with)

- [@tc39/proposal-change-array-by-copy/polyfill.js](https://github.com/tc39/proposal-change-array-by-copy/blob/main/polyfill.js) (minimalist reference implementation)

These methods are ready to be used today, and polyfills exist for older browsers. You probably already have a system for transpiling your code into older versions of JavaScript, and that system will probably work with these methods.

# Conclusion

This proposal is pretty cool, bringing `.sort`, `.splice`, and `.reverse` to the same level as the other methods on `Array`s, without breaking backwards compatibility. It's also a great way to make your code more readable and less error-prone.

If you don't want to use them, don't. If you _need_ to write more performant code, do so.

They're ready for use today, so don't be afraid of them because they're new.

If you have any questions or see a typo, feel free to open an issue or pull request, or contact me on [Twitter][@samathingamajig].

[Primeagen][@ThePrimeagen], if you're reading this, you should be afraid because of <span class="whitespace-nowrap">closures 😱</span> and <span class="whitespace-nowrap">copies 🤯</span>.

[@ThePrimeagen]: https://twitter.com/ThePrimeagen
[@samathingamajig]: https://twitter.com/samathingamajig
[array-from]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
[copilot-tweet]: https://twitter.com/samathingamajig/status/1647089280634744832?s=20
[functional-programming]: https://en.wikipedia.org/wiki/Functional_programming
[june-release]: https://en.wikipedia.org/wiki/ECMAScript_version_history
[immutable-js]: https://immutable-js.github.io/immutable-js/
[immer]: https://immerjs.github.io/immer/
[iterator-helpers]: https://github.com/tc39/proposal-iterator-helpers
[itertools]: https://www.npmjs.com/package/itertools
[iter-tools]: https://www.npmjs.com/package/iter-tools
[proposal]: https://github.com/tc39/proposal-change-array-by-copy
[proposed-ts]: https://github.com/microsoft/TypeScript/pull/51367
[pure-functions]: https://en.wikipedia.org/wiki/Pure_function
[spread-operator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
[stage-4]: https://tc39.es/process-document/
[typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
