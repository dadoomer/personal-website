---
title: "Insects are really cool"
date: 2021-05-11
tags: ["reinforcement learning", "robotics", "evolution"]
markup: pandoc
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/Lw2dfjYENNE?start=50" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

It is easy to find amazing examples of insect behaviour. The [process by which
ants build nests](https://youtu.be/ZglirAfRvWg) is beautiful. Everything from
[hatching eggs](https://youtu.be/V400oXh_YTQ) to the incredible [food
gathering dynamics](https://youtu.be/OnooyOZRzkM) is awe inspiring. What drives
these very complex behaviours in such energetically efficient systems?

## Control mechanisms in insects

Control mechanisms behind insect behaviour are surprisingly complex. For
instance, insects can exhibit Pavlovian traits, altering their behaviour
depending on previous stimulus. Even more surprisingly, insects can track some
environmental variables (for example, bees and crabs seem to posses "home
vectors" to track the location of their nests). There is no single
cognitive process behind these behaviours, instead, it appears cognition in
insects is very complex ([Cognition in insects,
2012](http://www.originlife.ru/wp-content/uploads/2018/07/Anucleate-Neurons.pdf)).
Furthermore, research has shown that insects can disambiguate the effect of
their own movement with respect to the environment, and represent visual space
for orientation and navigation ([What insects can tell us about the origins of
consciousness, 2015](https://www.pnas.org/content/pnas/113/18/4900.full.pdf)).

Despite the complexity of their control mechanisms, it appears to me that
insect behaviour is not built on a (primarily) learning-based platform. Perhaps
much of the control mechanisms are instead "hardcoded" into the hardware
platform. Moreover, it appears that raw "computational power" is not what
enables complex behaviour: flight and host search are possible from the
thousands of neurons ([The smallest insects evolve anucleate neurons,
2011](http://www.originlife.ru/wp-content/uploads/2018/07/Anucleate-Neurons.pdf)).

## Thoughts

There is a lot of evidence that the heavy-lifting in insect behaviour
optimization is done through evolution of hardware platforms, which introduce
biases so that "learning" (if any) is efficient. Intuitively this makes sense:
learning is extremely expensive relative to the lifespan of insects.

Some questions for which I would love to find the answer:

- Is the hardware platform (i.e. body) what enables such (relatively) simple
	control structure? How is it possible that a system with so many sensors can
	be controlled with relatively few computation units? Assume we have 100 units
	of energy for compute. **How much energy should we spend on designing a good
	hardware platform and how much on designing its control law?**

- Can such a process (insect evolution) be replicated by humanity at a lower
	energetic cost? Can we steer this process into something that is useful for
	humanity (e.g. highway-making ants)?

- Co-evolution of body and mind has been historically explored ([Karl Sims'
	1994 work](https://youtu.be/RZtZia4ZkX8) remains a personal favorite). This
	continues to be explored, resulting in impressive works (e.g. [Embodied
	Intelligence via Learning and Evolution,
	2021](https://arxiv.org/abs/2102.02202), [Regenerating Soft Robots through
	Neural Cellular Automata, 2021](https://arxiv.org/abs/2102.02579)). Yet, this
	area seems to be under-explored when compared to the amount of work on
	algorithms for optimization of Artificial Neural Networks (in Reinforcement
	Learning-like settings). **What is the best way to co-optimize robot control
	and robot design?**
