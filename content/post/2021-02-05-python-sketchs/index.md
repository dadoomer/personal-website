---
title: Program synthesis for the 21st century
date: 2021-02-05
tags: ["program by talking",]
---

## Introduction

The program synthesis task is to find computer programs that satisfy a given
specification. These specifications can take the form of input-output examples,
constraints on program structure or semantics, or even natural language.

In the last few decades there have been impressive developments in the
techniques to perform program synthesis (e.g. CEGIS, program synthesis from
refinement types, Dreamcoder). However, even though there have been some
real-world applications of program synthesis (e.g.
FlashFill), the power of the majority of these techniques remains caged behind
purpose-specific languages (e.g. Sketch), non-programming applications such as
Microsoft Excel or proof-of-concept code-bases. We observe that state-of-the-art
program synthesis techniques are robust enough for them to be widely applied,
specially if guided by high-level user insights.

Specifically, we note that modern general programming languages --specifically
Python-- can provide seamless integration of program synthesis techniques into
real-world code with little overhead to the user, which has the potential of
igniting mass adoption of program synthesis, and, therefore, of transforming
software development, and, therefore, of changing scientific and industrial
activities in general. We argue that development of program synthesis software
libraries meant for mass-consumption is possible.

## Example

We now show the implications of a general program synthesis library, both for
the designers of the library as well as for its users.

In particular we note that Python's capabilities and extensive ecosystem (e.g.
deep-learning libraries) offer the possibility of *one line install and
seamless use of complex program synthesis libraries*.

To show this, a proof-of-concept implementation was written in Python 3.9. The
implementation does not perform actual program synthesis, rather, it
manipulates Abstract Syntax Tress in a predefined way. While not showcasing
program synthesis techniques, it does show that usage and implementation of the
library's front-end components is not overly complex.

### Designing the library

Python's ability for [reflective
programming](https://en.wikipedia.org/wiki/Reflective_programming) allow for
succinct integration and use of programming synthesis techniques. Specifically,
some of Python's capabilities include:

- Discovery and modification of source code instructions at runtime: it is
	possible to read and modify ASTs during runtime.

- Conversion of strings matching methods and classes to references or
	invocations of them.

- Evaluation of strings as source code.

We will hard-code a dummy synthesizer into the system, as our goal is to
explore the use of Python and its capabilities and not the program synthesis
techniques themselves. Specifically, the dummy synthesizer takes an Abstract
Syntax Tree and manipulates it in a pre-defined way to find the output code.

### Seamless integration

Assume for the sake of example that we want a function that receives a list and
desired length and outputs a list of the desired length. Further assume we have
some high-level insights about the structure and the semantics of such
a function. Thus, our code may look like this:

```
from sketch import synthesizer
from sketch import Code
from sketch import Bool
from typing import List


@synthesizer
def f(A: List[int], k: int) -> List[int]:
    if len(A) > k:
        Code()

    while Bool("the length of A is less than k"):
        A.append(0)

    assert len(A) == k

    return A


print(synthesizer.sourcecode(f))
print(f([1, 2, 3], 10))
```

The actual output of that code is as follows:

```
def f(A: List[int], k: int) -> List[int]:
    if len(A) > k:
        A = A[:k]
    while len(A) < k:
        A.append(0)
    assert len(A) == k
    return A
[1, 2, 3, 0, 0, 0, 0, 0, 0, 0]
```

In conclusion, the user can seamlessly integrate program synthesis into
existing Python code-bases.

### Front-end

The front-end pre-empts the wrapped function call and synthesizes a replacement
function. The replacement function is obtained by manipulating the AST of the
original function in a predefined way, which is then "un-parsed" into Python
source code and compiled under the same `globals()` context as the original
function. The result is stored for subsequent re-use of the synthesized
function.

```
import inspect
from .synthesizers import fake_synthesizer


class Synthesizer:
    def __init__(self, synthesizer):
        self.synthesized_fs = dict()
        self.sourcecodes = dict()
        self.synthesizer = synthesizer

    def _synthesized(self, f):
        # See if we already computed the input
        if f.__qualname__ in self.synthesized_fs:
            return self.synthesized_fs[f.__qualname__], self.sourcecodes[f.__qualname__]

        synthesized_f, sourcecode = self.synthesizer(f)

        # Store the output for future use
        self.synthesized_fs[f.__qualname__] = synthesized_f
        self.sourcecodes[f.__qualname__] = sourcecode
        return synthesized_f, sourcecode

    def sourcecode(self, f) -> str:
        _, sourcecode = self._synthesized(f)
        return sourcecode

    def __call__(self, f):
        sf, _ = self._synthesized(f)
        return sf


synthesizer = Synthesizer(fake_synthesizer)
```

## Backend

In this case we use a dummy back-end which manipulates AST's in a predefined
way. While limited in its usability, it shows that actual program synthesis
techniques can be easily incorporated.

```
...

def fake_synthesizer(f):
    tree = ast.parse(inspect.getsource(f))

    # Replace sections of the syntax tree
    fakeCode = ast.parse("A = A[:k]").body[0]
    fakeBool = ast.parse("len(A) < k").body[0].value
    tree = recursive_replace_codes(tree, "Code", fakeCode)
    tree = recursive_replace_while_conditions(tree, fakeBool)

    # Ensure the syntax tree is clean
    if not is_tree_clean(tree):
        raise Exception("Invalid use of sketch primitives in ast {}".format(ast.dump(tree, indent=4)))

    # Remove decorators
    tree.body[0].decorator_list = list()

    # Build the new function
    _locals = dict()
    exec(ast.unparse(tree), f.__globals__, _locals)
    synthesized_f = _locals[f.__name__]
    return synthesized_f, ast.unparse(tree)
```

## Conclusion

Python's reflective capabilities allow (1) clean implementation of a
program synthesis library front-end and (2) seamless integration of
the library into modern code-bases.

The source-code for this experiment is located in [https://gitlab.com/da_doomer/python-sketch/-/tree/idea0/sketch](https://gitlab.com/da_doomer/python-sketch/-/tree/idea0/sketch).
