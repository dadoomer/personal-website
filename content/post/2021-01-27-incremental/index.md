---
title: (Efficient) incremental state machine manipulation
markup: pandoc
date: 2021-01-27
tags: ["reinforcement learning", "state machines" ]
header-includes:
    - \newcommand{\argmin}{\mathop{\mathrm{argmin}}\limits}
---

Previously I wrote about [optimizing and extending state machines with genetic
algorithms](../2021-01-02-incremental). Given enough computational resources
the approach is sound, as demonstrated by successful trainings on the
`BipedalWalker-v3` environment. This model-free approach only assumes access to
a generic reward function, and so it is conceptually clean and appealing.

However, the amount of computational resources needed to perform extensions
appears to be needlessly large. In this document I explore the same problem
under slightly more constrained assumptions.

## Introduction

We focus on the problem of extending the skill set of a policy so that it can
complete novel tasks. We restrict our analysis to scenarios where at every
time-step a single skill is needed. Our approach takes an existing policy, and
optimizes a new separate component that replaces the original policy in the
environment states in which the original policy fails to perform, together with
the predicates that signal when to transition from and to the original and the
new component. The output of the process is a state machine with a new mode (a
new skill), that can be further extended.

The proposed algorithm assumes that the extension process is desired because
performance is deemed unsatisfactory in some novel task. Specifically, it
assumes that the (approximate) time-step in a rollout in which performance was
deemed unsatisfactory can be identified. The observation is that in these
scenarios there is a very clear signal --failure itself-- that indicates in
which environment states is the new skill needed, which can guide
the optimization of new components.

## Concrete example

Suppose we have a policy that can control a bipedal robot to traverse
"mostly-flat terrains".

{{< video src="media/original.mp4" caption="Example policy for the flat terrain (on `BipedalWalker-v3`). Optimized with neuroevolution." >}}

When the policy tries to traverse a terrain with holes
it will probably fall at some point.

{{< video src="media/originalfails" caption="Example policy trying to traverse a terrain with holes." >}}

We want to optimize a new mode and corresponding switching conditions so that
the new mode activates exactly in the observations immediately before failure
was identified.

{{< figure src="media/failuresignal.png" caption="Failure as a time-dependent specification of the environment states at which new skills are needed." >}}

The optimization process of the new mode and the corresponding switching
conditions can exploit the fact that failure can be identified. Specifically,
we can sample failed rollouts and optimize the switching conditions *to the new
mode* to activate when failure is detected, then optimize the new mode (which
will be activated in the environment states in which the current policy
underperforms) and the switching conditions *to the original modes* to activate
at the appropriate times (as returning to the original policy at the
environment states that it can handle will quickly increase performance).

{{< figure src="media/algorithm.svg" caption="Addition of a mode and corresponding switching conditions." >}}

## Algorithm

The input is a state machine $\pi_\text{orig}$ (that will be extended to
$\pi_\text{new}$ with a new skill) and a distribution of environments for which
the new skill is needed. We extend $\pi_\text{orig}$  with a new mode
$m_\text{new}$ and new switching conditions $G_\text{new}^{m_i}$ and
$G_{m_i}^\text{new}$ for every original mode $m_i$.

1. Gather failed rollouts $r_i = (o_i[t], m_i[t])_{t=1}^{t=n_i}$ with the
	 original state machine, where $o_i[t]$, and $m_i[t]$ are
	 respectively the observations and active modes of the state
	 machine.

2. Trim the rollouts so that the last experience corresponds to the point in
	 which unsatisfactory performance was identified (not needed if execution
	 stops on unsatisfactory performance).

3. Let $l_i$ be the number of time-steps before the last observation in which
	 the new skill was needed to avoid failure.

	 Then $D_1 = \cup_i\{(o_i[n_i-j], m_i[n_i-j])\}_{j=l_i}^{j=0}$ is the set of
	 observations and active modes in which the new mode should be active (i.e.
	 in which switching conditions $G_{m_i[n_i-j]}^\text{new}$ and
	 $G_\text{new}^\text{new}$ should have been active) and $D_2 = \cup_i\{(o_i[j], m_i[j])\}_{j=0}^{j=n_i-l_i}$
	 is the set of observations and active modes in which the new mode should
	 not be active.

4. (**TODO: try to find a simpler loss function.**) For every original mode $m_i$ update $G_{m_i}^\text{new}$ according to

	 $$G_{m_i}^\text{new} = \argmin_{G} \text{err}_\text{active} + \text{err}_\text{inactive}$$

	 where

	 $$\text{err}_\text{active} =\frac{1}{|D_1|}  \sum_{(o, m) \in D_1} \min(0, G(o) - G_{m}^{m^*}(o) + \epsilon)^2$$

	 and

	 $$\text{err}_\text{inactive} =\frac{1}{|D_2|}  \sum_{(o, m) \in D_2}  \min(0, G_{m}^{m^*}(o) - G(o) + \epsilon)^2$$

	 where $m^* = \argmax_{m' \neq m_\text{new}} G_{m}^{m'}$ and $\epsilon > 0$ is a small margin
	 by which the new switching conditions have to beat old switching conditions.

	 At this point the new mode should be active at the times where performance
	 of the original policy was deemed unsatisfactory.

5. Now optimize the new mode and the switching conditions from the new mode to
	 the original modes by executing the policy. That is, update $\pi_\text{new}$ according to

	$$\pi_\text{new} = \argmax_{\pi \in <\pi_\text{orig}[\{G_\text{new}^{m_1},\ldots , G_\text{new}^{m_n}, m_\text{new}\}]>} \mathbb{E}\left[\sum_{k=0} \gamma^kr_{t+k} | s_t \sim S_0\right]$$

	Where $<\pi_\text{orig}[\{c_i\}]>$ is the set of
	state machines with that only differ from $\pi_\text{orig}$ in components
	$\{c_i\}$.

6. Repeat from step 1 (but sampling rollouts from the extended state machine)
	until needed.
