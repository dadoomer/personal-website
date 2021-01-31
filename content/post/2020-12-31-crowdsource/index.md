---
title: Crowd-sourcing program synthesis
markup: pandoc
date: 2020-12-31
tags: ["program by talking" ]
---

This is an "idea" post (no experiments).

## Introduction

In this document we discuss an open-ended user-driven synthesis
loop. The system gains knowledge by interacting with users.
We propose dividing the interaction loop into two distinct phases: an
exploitation phase in which the system is immediately useful to the users and
an exploration phase that helps the system learn from its users and reduces the
cost of deploying the system to the real world.

## Crowd-sourcing program synthesis

Before the first loop a library of program primitives $L$ is initialized. This
library encodes the knowledge of the synthesizer into a prior over programs
(Ellis et al, 2020). Then two simultaneous phases take place:

- In the *exploitation phase* the system uses its current library $L$ to solve
	synthesis tasks $l_1$ given by the users.

- In the *exploration phase* the system generates new programs from the
	 current library $L$ and asks users to label them, obtaining new program
	 labels $l_2$.

Then a learning phase occurs, where the system integrates the knowledge gained
from the exploitation and exploration phases into the library $L$.

The *exploitation phase* is the usual program synthesis approach, where the
users provide specifications and receive programs that satisfy them: in this
phase the system does the heavy-lifting and learns that "program $\rho$ solves
problem $l_1$". The synthesis process can be carried out with user assistance
if autonomous synthesis is too difficult.

The exploitation phase alone will be insufficient in domains where it is
impossible or extremely difficult for the users to provide specifications that
allow fully autonomous synthesis. In this cases the cost (time) of interacting
with the system is so high that the system will never be used to the extent
required to learn and adapt to the shifting needs of the users. The
*exploration phase* reduces the cost by enabling the synthesizer to **learn
without solving synthesis problems**. Essentially the system shifts the burden
of work to the users by asking them to label solutions with the problems they
solve.

Specifically, the *exploration phase* generates programs and asks users for
their labels, thus learning that "program $\rho$ solves problem $l_2$".

{{< figure src="crowdsource.png" caption="Crowd-sourced program synthesis loop." >}}

Both phases help the system learn a mapping form user commands to programs.

The exploration phase assumes access to a generative model of program inputs,
as program execution on random inputs may yield behaviour that is not easily
describable.

## An instantiation of the system

In this section we discuss a concrete (potential) instantiation of the system
described above.

The task is to synthesize programs that generate plots. In this case
a precise program specification is very hard to communicate, and thus we
apply a divide-and-conquer approach where the user provides incremental
program changes with natural language utterances such as "*make plot green*".

The search space for the synthesizer is *the set programs that receive
a plot-generating program and output programs whose output is a slightly
transformed plot*.

### Exploitation phase

The system receives a natural language utterance (e.g. "*make plot green*"),
computes the most likely program conditioned on the utterance and proposes it
to the user (e.g. `def p(program): return program.color='green'`).

If the most likely program does not satisfy the incremental specification then
a *disambiguation loop* starts, where the synthesizer guides the user to
finding the program that satisfied the incremental specification.

### Exploration phase

In this phase the system generates a random program-transforming routine and
asks users for a label.

Specifically, the user is shown the output of the generated program and
the output of the transformed program on an example input, which is a
set of numbers that are plotted.

### Learning phase

The system learns by mapping each user command to the program that the user
marked as satisfactory.

## Related work

This idea is heavily inspired by and exists thanks to [Yewen Pu's views on
program synthesis with pragmatics](https://www.twitch.tv/videos/787013789) and
recent work on program learning ([Kevin Ellis et al, DreamCoder: Growing generalizable,
interpretable knowledge with wake-sleep Bayesian program
learning](https://arxiv.org/abs/2006.08381), 2020). This idea is part of the research
project with Robert Hawkins and Yewen Pu.
