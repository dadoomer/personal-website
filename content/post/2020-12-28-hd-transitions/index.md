---
title: State machine HD transitions
markup: pandoc
date: 2020-12-28
tags: ["hyperdimensional computing", "state machines", "reinforcement learning"]
---

Here I --briefly-- document how random encodings can yield an expressive and
modular set of switching conditions.

## Introduction

It has been shown ([Synthesizing Programmatic Policies That Inductively
Generalize, 2020](https://openreview.net/forum?id=S1l8oANFDH)) that state
machines can be used as robot controllers (known as a "policies"): states get
labeled with functions that map environment states to actions ("modes"), and
edges are labeled with functions that output a scalar value ("switching
conditions"). The action executed by the robot at any moment is the output of
the active mode, and the switching condition with the biggest output determines
the next active mode.

The ability of manipulating state machines to learn and integrate new skills
would be extremely useful. In this document we explore a set of switching
conditions that can be used in state machines that are meant to be manipulated.

## Modular switching conditions

Switching conditions play a fundamental role in extending and composing state
machines. While it is easy to find an expressive set of parametric functions to represent
switching conditions, not all such sets are modular. Consider using [ReLU6
Artificial Neural
Networks](https://pytorch.org/docs/stable/generated/torch.nn.ReLU6.html#torch.nn.ReLU6):
it is likely that a good set of switching conditions will be found, but if any
of them tends to output 6.0 when activated, it is impossible for a new
switching condition to be chosen, and therefore extending or composing the
state machine is impossible. Similar situations where extending or composing
a state machine is impossible or increasingly difficult can be easily crafted.

We require that functions in the set of switching conditions:

1. Can distinguish between similar states (e.g. identify the exact moment we should
	 switch from “moving leg upwards” to “moving leg downwards”).

2. Allow new (unoptimized) switching conditions to “compete” with existing
	switching conditions.

## Hyperdimensional encodings

I propose to implicitly represent the set $S_{i,j}$ of environment states at
which each particular switching condition $G_{m_i}^{m_j}$ should be activated
by labeling each with a vector $v_{i,j}^f$ that is representative of
$f(S_{i,j})$: the action of an encoder $f: S \to V$ on $S_{i,j}$, where $S$
and $V$ are respectively the set of environment states and the encoding space.

A natural course of action would then be to (1) choose a set of parametric
functions to represent and optimize the encoder (e.g. auto-encoder Artificial
Neural Networks) and (2) decide on a scheme to construct the representative
vector. Instead, I propose a simpler scheme that guarantees by design that the
"encoded space" is sparse, and therefore allows new transitions to "compete".
For that I turn to a set of techniques known as Hyperdimensional Computing (HD,
see e.g. [Exploring Hyperdimensional Associative Memory,
2017](https://ieeexplore.ieee.org/document/7920846/)) and propose to use
a random encoder to a very high-dimensional ("hyperdimensional") space.

The core of the idea is to build a random HD encoder, then fix the encoder and
instead optimize the representative vectors. "Activating" the switching
conditions is computing a similarity metric between the encoding of the current
environment state and each switching condition.

So for an observation $o \in S$ the output of each switching condition is
defined as

$$G_{m_i}^{m_j}(o) = \operatorname{sim}(f(o), v_{i,j}^f)$$

where $\operatorname{sim}: S \times S \to R$ is a similarity metric.

By using high-dimensional vectors we guarantee that the space is sparse enough
so that new switching conditions can be labeled with vectors that activate them
in exactly the set of environment states that they should be activated. This
allows (in principle) to extend state machines with new switching conditions,
so that they are modular.

## Results

In the experiments the HD space is composed of floating-point vectors of size
10000 (or any other large number), so that $V = R^{10000}$ and the similarity
metric is cosine similarity. The encoder is represented with a matrix $K: R^m
\to R^{10000}$, so that

$$f(o) = K o$$

Modes are represented with Artificial Neural Networks. Modes and switching
conditions are jointly optimized with a Genetic Algorithm. The encoder is not
optimized. Details can be found in the [git
repository](https://gitlab.com/da_doomer/modular-robot-synthesis-2d/-/tree/incremental_learning_hd).

To test the idea I perform the following experiment:

1. Optimize a state machine on the `BipedalWalker` environment, then

2. Freeze the state machine, add new modes and switching conditions,

3. Optimize the new modes and switching conditions on the
	 `BipedalWalkerHardcore` environment.

The experiment was repeated twice to test if the results were reproducible (I
will test thoroughly later, for now it was just a quick test).

{{< figure src="hd1/BipedalWalker-v3_fitness.svg" caption="Elite fitness in the first test (`BipedalWalker`)." >}}

{{< figure src="hd2/BipedalWalker-v3_fitness.svg" caption="Elite fitness in the second test (`BipedalWalker`)." >}}

{{< video src="hd1" caption="First test output" >}}

{{< video src="hd2" caption="Second test output" >}}

We see that the set of switching conditions works as expected, except in the
"extension" test. There is a good division of labor ("task segmentation") among
the modes in the state machines, but the optimization process got stuck in
a local maxima when trying to extend the state machine to the new environment
(there is a very harsh penalty for falling and sometimes it is easy to
just learn to stay still to avoid it).

## Conclusions

HD switching conditions yield good division of labor and can be optimized.
Further work is needed to avoid local maxima to greater extent.

Future work should investigate if optimizing $v_{i,j}$ instead of $v_{i,j}^f$
yields better performance.
