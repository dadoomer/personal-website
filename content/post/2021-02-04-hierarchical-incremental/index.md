---
title: Weakly-supervised hierarchical incremental neurosymbolic learning
date: 2021-02-04
markup: pandoc
tags: ["reinforcement learning", "state machines" ]
header-includes:
    - \newcommand{\argmin}{\mathop{\mathrm{argmin}}\limits}
---

## Algorithm

**Input**: (1) a policy that lacks a skill (e.g. a policy that can traverse
	a flat terrain but fails to traverse a terrain with holes) and (2) an oracle
	that signals when the new skill should is needed (e.g. that signals when there
	is a hole).

**Output**: (1) a new policy that has the desired new skill and (2) a symbolic
	program that decides when to execute the two.

1. Instantiate a new policy (e.g. a neural network).

2. Optimize the new policy with a Reinforcement Learning algorithm using the
	 oracle (i.e. the oracle decides which of the two policies should be executed
	 at every step).

3. Form a dataset of $(\text{observation}, \text{oracle})$ pairs.

4. Using the dataset synthesize a program  (e.g. a decision tree) to select
	 which of the two policies to execute.

{{< figure src="media/hierarchical1.png" caption="First iteration of the algorithm. The starting policy is extended with a new module that encapsulates a specific skill (e.g. jumping over gaps). A symbolic program (e.g. decision tree) decides which of the two modules to execute." >}}

## Initial results

{{< video src="media/experiment" caption="Summary of the experiment, showing the various steps in the algorithm." >}}

{{< figure src="media/tree.svg" caption="Decision tree from the experiment. Feature index 2 is horizontal velocity, features 14 upward are LIDAR data. You can see the meaning of all features in the [`BipedalWalker` source code](https://github.com/openai/gym/blob/master/gym/envs/box2d/bipedal_walker.py)." >}}

## Observations

- The fitted decision tree is not very effective. Removing the oracle leads to
	the robot failing the task.

	Increasing the maximum depth of the decision tree led to similar results.

{{< figure src="media/tree_large.svg" caption="A deeper tree did not led to better results." >}}

## Possible next steps

1. Improve the synthesis of the "choosing programs". Are we in the right space
	 of symbolic programs to activate primitives in locomotion tasks? Do we need
	 to change the representation or the algorithm? Is the imbalanced data
	 the cause of poor performance?

2. What happens in hierarchies of multiple levels?

{{< figure src="media/hierarchical2.png" caption="Hypothetical structure of a policy that has been extended multiple times." >}}
