---
title: Reward modularity in Reinforcement Learning
date: 2021-02-17
tags: ["reinforcement learning"]
markup: pandoc
---

Idea post, without implementation (yet). We propose exploiting the modular
structure on RL tasks by learning modular reward functions that guide the
optimization of a (possibly also modular) controller.

## Introduction

Take for example the task of traversing terrains composed of flat segments
connected by gaps. To specify this task as a Markov
Decision Process (MDP) one has to define a reward function that maps every
state-action pair to a scalar number. In this case, an enticing way of defining
the reward function is to reward "going forward" (e.g. assign every
state-action pair to the speed of the robot towards a goal point), as that
encodes the high-level task. However, this simple reward function does not
capture the different behaviours that are needed to actually complete the task.
Moreover, the traditional Deep Reinforcement Learning approach is to optimize
a monolithic Deep Neural Network (ANN) controller that captures all the needed
behaviours. These approaches disregard the structure of the MDP and yield
controllers that are hard to improve and are hard to extended with new
skills.

We focus on tasks that exhibit *sequential modularity* (i.e. that can be
time-wise decomposed into a sequence of distinct behaviours) and argue that we
can exploit their modular structure in what is effectively a divide-and-conquer
approach. We propose exploiting the modular structure by learning modular
reward functions that guide the optimization of a (possibly also modular)
controller.

Our proposed approach aims to find policies that have separate modules with
identifiable responsibilities (e.g. one module for walking, another module for
jumping, etc.) together with their respective optimized modular reward
functions.

## Modular rewards and modular policies

In this work we reason about reward functions (respectively policies)
consisting of an ensemble of modules. There are multiple compositional schemes
that may be employed to combine the outputs of the modules (attention
mechanisms, function-composition trees, etc.), but in this work we focus on
a "hard-attention" mechanism that selects the reward function (respectively
policy) with the highest weight. Under this compositional structure at a given
time-step a single reward function and a single policy are used to compute the
given reward and action. We chose this compositional scheme because it
is the simplest compositional scheme that yields modules with disjoint responsibilities.

While previous work has dealt with optimizing the compositional structure
itself (e.g. Modular Meta Learning, 2018), we make no such attempt and during
training we assume the structure of the MDP is given, i.e. we assume an oracle
that signals which behaviour is needed at any particular time-step during an
agent's life. Thus, in this work we model the agent by augmenting the MDP with
the oracle's output. In the general case the oracle can be replaced with
a function that takes the state and outputs a program to compose the individual
modules.

## Methodology

For a distribution $p(M)$ of MDPs that are decomposed into $m$ different
behaviours, we aim to optimize a modular reward function $R_M(s, \alpha) = \sum \{R_i\}_{i=1}^{i=m}$ so that optimization of a (possibly modular) controller
with the new rewards is more efficient than optimizing the original reward
function (and also maximizes the original reward function). Each function is of
the form $R_i: S \times A \to \mathbb{R}$.

The optimization process is thus,

1. Construct a decomposition over time of the task in to smaller subtasks (this
	 decomposition can potentially be optimized in an outer-loop, or more simply,
	 provided by manual annotation). E.g. decompose the task of *traversing
	 complex terrains* into *running on flat terrain*, *jumping over gaps* and
	 *climbing stairs*.

2. For each segment, optimize a surrogate reward function. That is, for each
	 subtask instantiate a parametric function to act as reward. E.g. instantiate
	 a neural network to act as reward while *running*, another to act as reward
	 while *jumping*, etc.

	 The optimization process for this part is as follows: (1) for each subtask
	 spawn a population of parametric functions, (2) optimize using the
	 parametric functions (thus, running an optimization process for each
	 individual in the population), (3) select the best surrogate rewards (i.e.
	 the ones that better optimize the actual reward function), (4) mutate the
	 surrogate rewards to form a new generation and iterate from 2. The key idea
	 is that these parametric functions are differentiable rewards, presumably
	 making each optimization process faster than optimizing directly with the
	 actual reward.

3. Optimize a policy for each of the subtasks using the elite surrogate rewards.

## Related work

This idea directly builds on works that seek to meta-learn loss functions or
exploit modularity, specifically, we take inspiration from:

- [(2018) Evolved Policy Gradients](https://arxiv.org/pdf/1802.04821.pdf)

- [(2018) Modular Meta Learning](http://proceedings.mlr.press/v87/alet18a.html)

- [(2020) Meta-learning Curiosity Algorithms](https://arxiv.org/pdf/2003.05325.pdf)

- [(2020) Synthesizing Programmatic Policies that Inductively Generalize](https://openreview.net/pdf?id=S1l8oANFDH)

- [(2020) Multi-expert learning of adaptive legged locomotion](https://arxiv.org/pdf/2012.05810.pdf)

- [(2018) Blind Hexapod Locomotion in Complex Terrain with Gait Adaptation Using Deep Reinforcement Learning and Classification](https://link.springer.com/article/10.1007%2Fs10846-020-01162-8)

and also on the extensive literature on reinforcement learning and, more
specifically, reinforcement learning for locomotion and progressive
reinforcement learning such as:

- [(2018) Progressive Reinforcement Learning with Distillation for Multi-Skilled Motion Control]( https://arxiv.org/abs/1802.04765)
