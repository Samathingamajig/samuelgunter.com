---
author: Samuel Gunter
pubDatetime: 2023-04-28T08:16:00Z
title: "&& and || aren't just for booleans"
postSlug: and-and-or-arent-just-for-booleans
featured: false
draft: false
tags:
  - operators
  - code
ogImage: ""
description: >-
  A lot of people think that && (and) and || (or) are just logical operators on booleans, but they're more than that in some languages.
---

A lot of people think that && (and) and || (or) are just logical operators on booleans, but they're more than that in some languages.

# Table of Contents

# Truth Tables

The simplest definition of "and" and "or" is logical operators, which means they operate on boolean values (true or false).

|   A   |   B   | A && B | A \|\| B |
| :---: | :---: | :----: | :------: |
| false | false | false  |  false   |
| false | true  | false  |   true   |
| true  | false | false  |   true   |
| true  | true  |  true  |   true   |

As with all things simplified, this doesn't tell teh whole story.

In [boolean algebra][boolean-algebra], the "and" operator happens before the "or" operator, much like multiplication happens before addition in regular algebra. Operators of the same type happen left-to-right. I looked at the operation precedence for C, C++, Java, JavaScript, Python, and Rust, and they all follow this order.

With math, you simplifying the expressions make them easier to solve. We can apply some of those tricks when evaluating expressions with "&&" and "||". We also need to consider what happens when the values aren't booleans themselves.

# Short-Circuiting

`true || ambiguous value` will always equal `true`, and `false && ambiguous value` will always equal `false`.

Most programming languages exploit this fact to reduce computation time by not evaluating anything once it's in a guaranteed state. This is known as [short-circuit evaluation][short-circuit-evaluation], (probably) based on [short circuits][short-circuits-electronics] in electronics where current likes to flow where there is the least resistance.

If `A` and `B` are functions that return a boolean,

|  A()  |  B()  |  A() && B()   | A() \|\| B()  |
| :---: | :---: | :-----------: | :-----------: |
| false | false |   only A()    | evaluate both |
| false | true  |   only A()    | evaluate both |
| true  | false | evaluate both |   only A()    |
| true  | true  | evaluate both |   only A()    |

If you had code like

```js
const A = () => {
  console.log("A() called");
  return true;
  // return false;
};
const B = () => {
  console.log("B() called");
  return true;
  // return false;
};
```

then "A() called" will always be printed to the console, but depending on the value it returns "B() called" may or may not be printed.

This is valuable if you want to avoid nested if's or ternaries.

Let's say that you're checking if a string is lowercase. One possible implementation of that is

```js
const isLowercase = (str) => str.toLowerCase() === str;
```

When you try to use it in your code,

```js
if (isLowercase(myString)) {
  console.log("Yay! It's lowercase!");
}
```

you run into an annoying bug: `myString` is `null` or `undefined`, so when `isLowercase` calls `toLowerCase` you get a `TypeError`.

You _could_ change this to

```js
if (myString != undefined) {
  if (isLowercase(myString)) {
    console.log("Yay! It's lowercase!");
  }
}
```

but that's ugly.

Instead, harness the power of short-circuiting

```js
if (myString != undefined && isLowercase(myString)) {
  console.log("Yay! It's lowercase!");
}
```

If you had control over `isLowercase`, you could change it to return `false`/`undefined`/`null` when there's a non-string input, which would allow you to take advantage of newer features such as [optional chaining][optional-chaining], which will only continue the property access if `str` (in this case) is _not_ `null` or `undefined`. (`==` is needed, since optional chaining evaluates to undefined when the object is null or undefined, and `undefined === null` is false while `undefined == null` is true)

```js
const isLowercase = (str) => str?.toLowerCase() == str;
```

It's also useful when you have a deeply nested object that might have null/undefined values. If `obj.a.b.c.d` might fail, you can do `obj && obj.a && obj.a.b.c && obj.a.b.c.d` to avoid any runtime errors. It's essentially equivalent to `obj?.a?.b?.c?.d`.

# Non-boolean Inputs

This is pretty boring when just working with booleans, so what happens if you don't? My initial thought would be that it just casts it to a boolean, so `5 && 6` would be `true` and `0 || 0` would be false.

In Java, Go, and Rust, it's just not possible. You can only use `&&` and `||` on booleans.

In C/C++, the operands are automatically converted to either `0` or `1` (in C++, the `bool` type). If the operand is the number 0 (of any simple number type) or a null pointer, it becomes the number 0, otherwise it becomes the number 1. The operation returns 0 or 1 based on the rules above, so it's probably what you expected.

Enter JavaScript and Python. If a value is [truthy][truthy] it's treated as `true`/`True`, if it's [falsy][falsy] it's treated as `false`/`False`.

In JavaScript, falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. In Python, falsy values are `None`, `False`, numbers equal to `0`, empty sequences & collections (such as `""`, `[]`, and `{}`), objects where `obj.__bool__()` returns `False`, and objects where `obj.__len__()` returns `0` when `obj.__bool__()` is not defined. Everything else is truthy.

`&&`/`and` returns the first non-truthy value, or the last operand if both are truthy. `||`/`or` returns the first truthy value, or the last operand if both are falsy.

|  A  |  B  | A && B | A \|\| B |
| :-: | :-: | :----: | :------: |
| ""  | ""  |   ""   |    ""    |
| ""  | []  |   ""   |    []    |
|  5  | ""  |   ""   |    5     |
|  5  | []  |   []   |    5     |

# Nullish Coalescing

There's [an operator][nullish-coalescing] similar to `||` in some languages that returns the right value if and only if the left side is null/undefined. Like `&&` and `||`, it short-circuits.

|  A   |     B     |  A ?? B   |
| :--: | :-------: | :-------: |
| null |     9     |     9     |
|  5   |     6     |     5     |
| null | undefined | undefined |
|  7   | undefined |     7     |

# Uses

This gives you some special powers, such as if you want to have a default value when something is falsy.

```js
const printGreeting = (name) => console.log(`Hello ${name || "reader"}!`);
```

(this will have a default value when `name` is an empty string, since that's a falsy value. In JavaScript, if you want to only have a default value for null/undefined, use [ullish coalescing `name ?? "reader"`)

Using a short-circuited `&&` with non-boolean values is a common pattern in React. Here's a simple component that toggles displaying a paragraph when a button is clicked:

```jsx
const MyComponent = () => {
  const [shouldShowParagraph, setShouldShowParagraph] = useState(false);

  return (
    <>
      <button onClick={() => setShouldShowParagraph((curr) => !curr)}></button>
      {shouldShowParagraph && (
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      )}
    </>
  );
};
```

When `shouldShowParagraph` is falsy, the && expression short circuits, returning `shouldShowParagraph`, otherwise it returns what's after the &&. In React, whenever you return true/false/null/undefined it renders nothing.

If you wanted to display something different depending on the value of `shouldShowParagraph`, you'd use a ternary.

```jsx
<>
  {shouldShowParagraph ? (
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
    </p>
  ) : (
    <h1>Something else</h1>
  )}
</>
```

[boolean-algebra]: https://en.wikipedia.org/wiki/Boolean_algebra
[falsy]: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
[nullish-coalescing]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
[optional-chaining]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
[short-circuits-electronics]: https://en.wikipedia.org/wiki/Short_circuit
[short-circuit-evaluation]: https://en.wikipedia.org/wiki/Short-circuit_evaluation
[truthy]: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
