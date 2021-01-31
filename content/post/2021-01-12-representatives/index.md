---
title: Representative programs
date: 2021-01-12
tags: ["program by talking", "manifold learning" ]
---

Here I document a very simple way to use manifold-learning techniques to form
"diverse" sets of vectors. The proposed algorithm exploits the structure of the
set of vectors to form a subset that "covers" the set.

In this case, each vector represents input-output manipulations performed by a
black-box program (each vector represents a different program).

## Introduction

We are working on a system that interacts with users to incrementally solve
program synthesis problems in domains where precise specifications are very
hard or otherwise impossible to give. Our proposed approach follows a
divide-and-conquer strategy, where users gradually modify programs until
a viable candidate is found. The system learns from past interactions.

{{< figure src="disambiguation-loop.svg" caption="Synthesis loop in the current project iteration (it may change)." >}}

Sets of programs can be infinite and may be described by both continuous and
discrete parameters. Given the user's finite lifespan, we must restrict the
search space to a finite number of programs that "cover" the set of possible
solutions. The question that concerns us in this document is: how do we form
these finite representative sets?

We will be exploring this in a relatively simple domain where the search space
is constant at every step of the synthesis: programs that manipulate one-line
matplotlib programs. Each manipulation changes one of the arguments to
matplotlib's plot function. Thus, to avoid confusion we distinguish between
plot-generating *programs* and *transformations* that take programs and output
programs whose output is slightly different. The following code exemplifies
such relationship:

```jl
program = PlotProgram()
program() # Generates a blue plot

function transform_color_to_green(program)
	program.color = "green"
	program
end

program = transform_color_to_green(program)
program() # Generates a green plot
```

This domain is simple enough that a question arises: "could you not design by
hand a good-enough sampling scheme?". The answer is yes, we could write a good
enough heuristic. But it is far more powerful in the long term to think about
how computers can discover these heuristics for us.

## Structure-preserving representative subsets

Plotting with t-SNE shows there is a lot of structure ready to be exploited
(see [attached document](TSNEreport.pdf)). However, in the case of transform
representatives, this structure seems difficult to be recovered by an
off-the-shelf clustering algorithm.

To improve the chances at forming good clusters we can instead project data
with an algorithm that exploits structure. The plan is to use the geodesic
distances computed by the Isomap algorithm and then apply a clustering algorithm. Then, sample
one from each cluster in a way that we do not choose "close" transforms. So the
proposed algorithm for choosing a set of diverse vectors is:

1. Apply Isomap to an initial set of vectors.

2. Perform clustering with the geodesic distances to find as many
clusters as desired diverse vectors.

3. Choose a vector from each cluster to find the set of diverse vectors.

We should note that the k-neighbors graph computed by Isomap invites us to
frame our goal as the classic vertex cover problem. Doing so would result
in loosing  a lot of distance-related information, which is why clustering with
the geodesic distances is a better solution.

We first execute the algorithm on a small set of transforms with the goal of
verifying the Isomap algorithm does preserve structure in this domain, and then
execute on a large set of transforms to form the final representative subset.

### Small execution

We begin by executing the Isomap algorithm on a small set of two hundred
transforms with the goal of verifying it does preserve structure in this
domain.

By plotting the graph induced by the nearest k-neighbors, as formed by Isomap,
we see that the structure of the transform space is recovered. In the
illustration below, each circle is the representative vector of a transform
(hover the mouse over the circle to see the transforms labels); the color of
each circle represents which attribute the transformation is changing; note
that transforms of the same attribute tend to be close and transforms which ;
these two properties of the resulting graph show that nearest k-neighbors
geodesic distances will reflect the structure of the transform space.

<div class="visualization1"> </div>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script src = "/2021-01-12-representatives/d3-graph.js"></script>
<script>
let color_scheme = d3.interpolateRainbow;
let color_function = d => {return color_scheme(d.color);};
d3.json("/2021-01-12-representatives/graph.json").then(data=>graph(data, color_function, ".visualization1"));
</script>

Thus, we can run the clustering algorithm using the geodesic distance matrix and
expect the resulting clusters to reflect the structure found by the Isomap
algorithm.

<div class="visualization2"> </div>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script src = "/2021-01-12-representatives/d3-graph.js"></script>
<script>
color_scheme2 = d3.interpolateRainbow;
color_function2 = d => {return color_scheme2(d.color);};
d3.json("/2021-01-12-representatives/cluster_graph.json").then(data=>graph(data, color_function2, ".visualization2"));
</script>

The only question that remains is how should we choose from each cluster so
that we do not choose "close" points which lie "near the boundary" of the
clusters, as having too many close points would be redundant. We solve this
with a very simple heuristic: we pick the cluster centers as representatives.

{{< figure src="sampling.png" caption="Motivation of the sampling strategy. Top: we must choose a node in the outlined cluster to maximize diversity, given that we have chosen the nodes with the solid outlines. Center: possible choices. Bottom: the best choice is the 'center' point." >}}

The chosen representative vectors can be seen in the graph below. We see that
the representatives are scattered in the graph, so it confirms we are getting a
diverse set.

<div class="visualization3"> </div>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script src = "/2021-01-12-representatives/d3-graph.js"></script>
<script>
color_scheme3 = d3.interpolateOranges;
color_function3 = d => {if (d.color == 0) return color_scheme3(0.4); return color_scheme3(d.color);};
d3.json("/2021-01-12-representatives/representatives_graph_json.json").then(data=>graph(data, color_function3, ".visualization3"));
</script>

## Concluding remarks

To get an arbitrary number of representative vectors (instead of the number of
clusters found by the algorithm) an idea is below:

- Sample subsets and choose the one whose all-pairs distance list has the
	minimum standard deviation, so that points are not too close nor too far from
	each other.

## Appendix.

We used the Affinity Propagation algorithm from Scikit Learn. The
representatives were computed summing a lot of "output-diffs" caused by the
corresponding transform. In this case, summing the diffs instead of
concatenating them resulted in a better structure-preserving graph.

The code is available at [https://gitlab.com/da_doomer/program-by-talking/-/tree/representative-transforms](https://gitlab.com/da_doomer/program-by-talking/-/tree/representative-transforms).
