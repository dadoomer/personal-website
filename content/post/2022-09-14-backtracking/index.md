---
title: Non-deterministic interpreters and program synthesis
markup: pandoc
date: 2022-09-14
tags: ["natural programming", "program by talking"]
---

The goal of this post is to illustrate a simple enumerative synthesis technique
based on graph traversal. To this end, I describe a very simple
non-deterministic interpreter capable of synthesizing programs at run-time.
Specifically, the interpreter seeks to leverage a corpus which includes
competing implementations of function signatures, each implementation written
under different contexts and assumptions.

All of the ideas presented here have been discussed
elsewhere under different names (e.g. angelic programming).

## Preliminaries

Some notation

- Primitive instructions $p_i$.

	Instructions that cannot be decomposed into steps.

- Signatures $\sigma$.

	Function names typically used to represent sequences of steps.

- Library $L: \sigma \to [\sigma|p]^*$.

	Map from function names to sequences of steps, called implementations.

- Program state: $s$.

	State of the environment in which a program is being executed.

- Primitive interpreter: $P: (p, s) \to s$.

	Map from primitive instructions and program states to program states.

As an example, picture the contents of $L$ to be of the following form, where
lowercase names represent signatures and uppercase names represent primitive
instructions:

```
def craft_stick():
	craft_plank()
	craft_plank()
	PLACE_PLANK()
	PLACE_PLANK()
	CRAFT()
```

## Direct programming

Let us review the mechanics of executing a function call in imperative
programming languages. For simplicity, we will omit control-flow, variables and
assume programs are straight-line sequences of steps.

Assume we have to execute $\sigma()$ under program state $s_0$ using
function library $L$. Our interpreter will probably do something like this:

1. If $\sigma$ is a primitive instruction $p$, return $P(p, s)$. Otherwise,

2. Read implementation of $\sigma$ in $L$: $L(\sigma) = [\sigma_1(); \ldots; \sigma_n();]$.

3. Recursively execute each $\sigma_i()$ under $s_{i-1}$ to get $s_i$.

4. Return $s_n$.

This heavily simplified description of program execution represents "direct
programming" (ad-hoc name in use by collaborators and I): the traditional
programming paradigm where function calls have a one-to-one correspondence with
concrete implementations.

Note that the new program state $s_n$ is fully determined by the sequence of
primitives that were executed.

## Natural programming

Assume library $L$ contains several implementations of $\sigma$, instead of
just one. The value of $L$ for a signature $\sigma$ is thus a collection of step
sequences: $L(\sigma) = \{[\sigma_1^i(); \ldots; \sigma_{n_i}^i();]\}_i$

This is the core of a programming paradigm we have been calling Natural
Programming, the details of which I will not go into in this post. For now let
us only concern ourselves with designing an interpreter that can leverage a
corpus of competing implementations for any function signature.

### Specification

The first thing that becomes apparent is the need for choosing among the
different implementations. Let us delegate this to the user and assume each
signature comes equipped with a specification: a boolean function
$\varphi_\sigma: (s, [p_i]^*) \to \{\top, \bot\}$ which indicates whether
a particular sequence of primitives is a good implementation of $\sigma$ in
state $s$.

For example, for $\sigma = \textit{go to kitchen}$, the corresponding
$\phi_\sigma$ would check if executing the given sequence of primitives takes
the robot to the kitchen. Note that multiple implementations may satisfy
a specification.

## Natural Program interpreter

A key realization is that adding constraints to function signatures allows us
to consider program search as part of the interpreter. In this approach,
function signatures do not have a fixed implementation, rather, they specify
properties that the function execution must satisfy and can leave the specific
low-level details to a solver.

The interpreter can then choose an implementation appropriate for the given
context, thus, transforming into a non-deterministic interpreter. The question
then is: how do we search for implementations in the set of natural programs
given a library of known signature implementations?

It is important to note that every function call is recursively now a synthesis
problem, as for every function call we have access to a corpus of
implementations.

### First attempt

To interpret a signature with a specification $\sigma$, one could be inclined
to simply execute each implementation in $L(\sigma)$ and return the first one
that satisfies $\varphi_\sigma$. Checking if an implementation satisfies the
constraint requires keeping track of which primitives are executed. Thus our
first attempt may look like this:

```
# First attempt.
def interpreter(sigma, L, s0, P) -> tuple[ProgramState, list[Primitive]]:
	if is_primitive(s):
		return P(s, sigma), [sigma]

	for implementation in L(sigma):
		si = s0
		primitives = []
		for sigma_i in implementation:
			si, ps = interpreter(sigma_i, L, si, P)
			primitives.extend(ps)

		if sigma.phi(s, primitives):
			return si, primitives

	raise NoImplementationFoundError(sigma, L, s0, P)
```

This interpreter is incomplete in the sense that it does not maximally use data
in $L$. The problem is that only the first satisfying implementation will be
returned, but that implementation may not lead to a program state where the
next signatures can be interpreted.

### Graph traversal

To understand the problem with our first attempt this we can describe the
synthesis problem as a graph search problem. Programs (including "incomplete"
ones, e.g., signatures) correspond to nodes in the graph. Programs that are
complete (i.e., have no signatures without implementation) or crash will be
leafs. Programs that are incomplete will be connected to all programs that
correspond to a top-level implementation of the left-most non-expanded
signature.

Casting the problem as a graph search problem allows us to devise a solution to
our problem: we can simply traverse the graph (e.g., depth-first) starting from
a given signature until we find a program that satisfies the constraints and
does not crash. If we end up in a leaf that does not satisfy the specification,
we can backtrack one level and continue the search with the other children of
the parent node. Our previous algorithm did not backtrack, and thus it did not
search the entire graph, only a subset of it. This algorithm maximally uses
data in $L$ because it recursively explores every possible way to interpret the
program with the implementations in $L$ before failing.

In fact, this is the approach we took in [our
interpreter](https://gitlab.com/natural-programs/crafting-natural-language/-/blob/main/src/natural_programs/library/fringe_solver.ts).
In our code graph traversal is implemented with a priority queue (also known as
a fringe), because the search space is extremely big and we compute recency
and frequency implementation scores to guide the search.

(*Note: I know this rushed description of the interpreter goes against the goal
of illustrating the algorithm. Please excuse my brevity and do contact me if
you think it is worth to add pictures and a thorough explanation, including
step-by-step examples and how to go from graph-traversal to fringe-search.*)

## Why?

On-line search opens the door to creating agents that can better adapt to novel
scenarios. This has been observed beyond program synthesis, in the context of
model-based reinforcement learning and model-predictive control.

There are caveats to this approach. Performance of interpreters that synthesize
programs at run-time depends on execution state and other factors, which can
easily lead to inherently unstable systems. For instance, a program that
synthesizes in a fast computer may fail to execute in a slow computer. Or
a program that synthesizes in an execution environment may fail in another
environment.

It is my opinion, however, that in some domains non-determinism can be a better
approach to traditional deterministic interpreters, particularly in domains
where these caveats can be engineered to be non-significant to user experience.
