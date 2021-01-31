---
title: Programatic parametric functions
markup: pandoc
date: 2020-12-29
tags: ["artificial neural networks", "state machines", "reinforcement learning"]
---

Recent years have seen the trend of using big monolithic policies to solve
Reinforcement Learning problems. In this document I show that, by exploiting
the division of labor among modes attainable state machines, parametric
functions that are interpretable by design can be used for locomotion.

## Introduction

It has been shown ([Synthesizing Programmatic Policies That Inductively
Generalize, 2020](https://openreview.net/forum?id=S1l8oANFDH)) that state
machines can be used as robot controllers (known as a "policies"): states get
labeled with functions that map environment states to actions ("modes"), and
edges are labeled with functions that output a scalar value ("switching
conditions"). The action executed by the robot at any moment is the output of
the active mode, and the switching condition with the biggest output determines
the next active mode.

The structure of state machines can bias the optimization process to yield
policies that segments a task into discrete parts, each performed by different
modes. Thus, functions that are simple and interpretable by design can be used
to represent the modes. While constant functions are an enticing option,
here we explore a slightly more expressive set of parametric functions.

## Programmatic parametric functions

Consider a Markov Decision Process with an action space of size $n$ and
observation space of size $m$. Let $W: R^m \to R^k$ and
$g: R^k \to R^n$. Observe this function, which takes an observation $o$ as input:

$$f(o) = \operatorname{tanh}(g(\operatorname{tanh}(W(o))))$$

The equation may be described as follows:

1. Perform a combination of the observation with $W(-)$ to obtain $k$ numbers.

2. Constrain the numbers to the $[-1, 1]$ range. 

3. Run the numbers through the $g(-)$ function.

4. Element-wise constrain the outputs to the $[-1, 1]$ range.

It is easy to see how such a function is interpretable by design: by setting
$k$ to a small value (e.g. one or two) only a few numbers are used to compute
the action and they are constrained to a finite range, so we can inspect the
possible outputs of the function by "moving a slider in the range" and
observing how the output changes.

An interpretation for the resulting set of functions is a set of $k$-inputs
programs. In this interpretation $g(-)$ is a parametric program and $W(-)$ is
a routine for crafting the program inputs given an observation.

Thus, Optimization of state machines with modes from this set of functions can
be interpreted as designing a DSL with parametric primitives from scratch, with
each state machine representing a program that calls the parametric primitives.

The specific choice of representation for programs and parameter-crafting
routines is problem-specific.

## Results

In the experiment the output at the $i-th$ dimension of each program is of the
form

$$g_i(x) = c_i \cdot x$$

and the parameter-crafting routines $W(-)$ are represented as linear
transforms.

{{< video src="video" >}}

The video is part of a curriculum-training run (not shown).

## Conclusion

The set of one-neuron neural network interpretable modes can exploit the
division attainable with labor natural of state machines.
