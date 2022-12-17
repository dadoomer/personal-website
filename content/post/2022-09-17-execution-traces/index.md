---
title: Robotics and execution traces
markup: pandoc
date: 2022-09-17
tags: ["optimization", "robotics"]
---

The goal of this post is to describe the ideas behind
[Pylic](https://gitlab.com/da_doomer/pylic), a work-in-progress Python library
to describe and solve predicates over program execution traces.

*Pylic is a portmanteau of Python and concolic (as in [concolic testing](https://en.wikipedia.org/wiki/Concolic_testing)). The name is definitely temporary.*

![Behaviour found by Pylic when asked to find parameters that induce an execution trace where the button is pressed and the goal is reached.](ant.webm)

## Motivation

Traditionally, control theory and Reinforcement Learning concern themselves
with mathematical models of the environment (differential equations) or
simulations (integrations of said differential equations). For instance, we may
linearize dynamics and apply control algorithms like LQR or assume we have
a step-wise reward function of a simulation and apply Reinforcement Learning.
However, automatically dealing with structure --things like contacts, robot functionality
difficult to capture in a mathematical model, or environment features
like buttons, etc-- is an unsolved problem.

I believe program analysis can allow the development of generic control
algorithms that exploit structure that is otherwise invisible (that is,
invisible if not because of the programmatic representation of the underlying
system). While I do not yet have evidence that program analysis does lead to
achieving this goal, in this document I hope to illustrate what a system that
can exploit simulator source-code may look like.

## Pylic

Pylic is a solution to exposing simulator functionality and structure to
control algorithms. It allows a control algorithm to say things like "find
control parameters that lead to a simulation where property *P* is true", and
it does so in a language that allows *P* to refer to the simulator source-code.

The crucial difference between Pylic and traditional approaches like those
based on temporal logics (and the way in which Pylic relates to the goals
outlined in the motivation), is that **Pylic is designed to interface with the
execution of the simulator itself**, not just the simulated system's state.
This difference is important, as the simulator naturally encodes semantics of
the features in the robot and the environment.

Let us see how Pylic approaches this through an example of using its API.

### Bouncing marble

Assume we have a simulation of a thrusted bouncing marble in a 2D surface with
obstacles. We wish to find a sequence of thrusts such that the marble reaches
a target location while colliding with one of the obstacles (say obstacle 1).

"Colliding with obstacle 1" is a property of the execution of the simulation.
To see this, note that in the simulation code there is a condition that checks
whether the marble is colliding (see code below).

```
def simulation(
        actions: torch.Tensor,
        state: State,
        ) -> State:
    """Run the simulation with the given closed-loop control
    signal and return the final state."""
    for t in range(len(actions)):
        # Compute next state with no collisions
        action = actions[t]
        next_state = normal_dynamics_force(
            state,
            action,
            task.drag_constant,
            task.dt
        )

        # Check for collisions
        for i in range(len(state.obstacles)):
            v = collision_soft_predicate(state, task.dt, i)
            # This condition checks whether the marble
            # is colliding:
            if v <= 0:
                # If collided, adjust next state
                next_state = collision_dynamics(
                    state,
                    i,
                    task.dt,
                    task.coefficient_of_restitution
                )

        # Update state
        state = next_state
    return state
```

We see that
"collide with obstacle 1" can be equivalently described as "make the collision
if-statement true at least once". This can further be formalized in
propositional logic as `collision_1 OR collision_2 OR ... OR collision_T`,
where the index is the simulation time-step. Note that this is a predicate
whose truth value is determined by our control parameters: some thrust sequences
will steer the marble such that the predicate is true, and some others will make
it false. Our goal is therefore to find some parameters that make the predicate
true.

Pylic provides a language built on top of propositional logic to describe
predicates over program traces. For instance, it's API allows us to encode our
desired behaviour as "collide with obstacle 1 within the first half of
simulator AND reach the goal at the end":

```
# This predicate encodes the goal of "colliding
# within the first half of the simulation, then
# reach the goal"
predicate = Conjunction([              # Should be true:
  # (collide(t=0) OR collide(t=1) OR ...)
  Disjunction([IfNodeFilter(           # (1) at least one collision check where
    id=None,
    varspec=VarSpecConjunction([
      VarEqualTo('i', 1),              # obstacle index = 1
      VarLessThan('t', timestep_n//2), # time is < first half of sim
    ]),
  )]),

  # (dist_to_goal[end_of_sim] < 0.1)
  FilterComposition(                   # filter return state and
    filter=NodeFilter(
       type=NodeTypes.RETURN,
       id=None,
       varspec=VarSpecTop()
    ),
    predicate=LessThan(                # (2) make sure that
      "dist_to_goal",                  # dist_to_goal < 0.01
      torch.tensor(0.01),
    ),
  )
])
```

We can then provide Pylic this predicate and instruct it to solve it in the
simulation program. Pylic will then execute the simulation and search for
parameters that make the predicate true.

```
# Solve the predicate with Pylic's gradient descent solver
starting_parameters = torch.zeros((task.max_timesteps, 2))
parameters, _ = solver(
    predicate,
    starting_parameters=starting_parameters,
    f_args=initial_state,
    f=simulation,
    max_value=torch.tensor(10),
    custom_interpreter=interpreter,
    grad_mask=torch.ones_like(starting_parameters),
    iter_n=2000,
    learning_rate=0.01,
    momentum_beta=0.1,
    normalize_gradient=True,
    verbose=True,
)
```

After a few minutes the solver returns some control parameters.

![Behaviour found by Pylic](main.webm)

### What is under the hood?

Two core aspects of the functionality presented in this post are automatic
program tracing and numerical optimization.

Tracing is done with Python's meta-programming capabilities. Specifically,
Pylic reads the source code of the simulation at run-time, parses it into an
AST, and manipulates the AST to introduce tracing code, then the new code is
lowered into a new function definition that is evaluated by the Python interpreter.

In the automatic tracing source-code transformation I took care to "soften"
a subset of Python's control-flow conditions. For instance, consider the
problem of finding some floating point value `x` that makes `if x < c` true. If
done naively (randomly sample `x` values until `x < c` is true) then this is an
extremely challenging problem. However, we can instead transform the problem
into maximizing `f(x) := c-x` until we find a value for which `f(x) > 0`, which
can be done with numerical optimization algorithms. In Signal Temporal Logic
and fuzzy logics this is called "quantitative semantics", and the value of
`f(x)` is called the robustness value of the predicate.

Therefore, where possible, the trace then contains the robustness values of the
control-flow conditions, instead of the boolean values that cannot be used.
Then, we can use Pytorch (an operator-overloading automatic differentiation
library) to compute the gradient with respect to the parameters and perform
gradient-ascent and (hopefully) solve the predicate.

## Concluding remarks

Pylic is in very early stages of development. It aims to use source-code as the
"common language" between control algorithms, domain experts and solvers. In
this post I described predicates over execution traces as one mechanism to
accomplish these goals.

As for the functionality presented in this post, there are a couple of very
obvious limitations in the current implementation:

- Gradient-based optimization is extremely scalable, but it is not effective in
	non-convex problems. This is unfortunate because it is very easy to wish for
	solutions of predicates whose robustness functions are non-convex.

	Providing Pylic with gradient-free optimization algorithms (e.g., CMA-ES,
	CEM, GAs, etc) would allow the solver to find solutions to some of these
	predicates while maintaining scalability. Indeed, the video at the top
	of this post uses CMA-ES to solve trace predicates on a program
	that calls Mujoco.

	Another way to improve this is to use SMT-based solvers (e.g. Z3). However,
	it is not obvious how to encode generic Python programs with control-flow
	into z3. It is thus an open question whether SMT-based solvers integrate
	nicely with tracing-based approaches.

- Currently only top-level functions are traced. There are multiple ways to
	solve this to different degrees (e.g. automatic function in-lining, manual
	decorator-based tracing, automatic transformation of called functions).
	PyTorch has some tracing functionality too, which could be integrated into
	Pylic.

I believe the functionality presented here is a step towards a platform that
allows the design of control algorithms for autonomous systems that
systematically explore their functionality and their environment.
