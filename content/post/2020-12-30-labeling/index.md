---
title: Transformation representative vectors
markup: pandoc
date: 2020-12-30
tags: ["program by talking", "similarity"]
---

## Introduction

We are tackling a class of program synthesis problems where it is impossible or
extremely difficult for the user to provide the synthesizer with
a specification for the synthesis process. Our main assumption is that it is
instead easier for the user to provide incremental specifications that
transform a candidate program to one that is closer to fulfilling the implicit
user specification. This is a form of divide-and-conquer, where we segment the
synthesis problem (finding a program) into smaller and easier problems (finding
a program transformation). Thus, programmatically finding relationships between
user commands and program transformations will be an important part of the
solution.

As part of this research project we are building a tool that lets you (yes,
you) customize your Matplotlib (a very popular plotting Python library) plots
using natural language.

The core of the tool is a program-synthesis loop based on incremental
natural language specifications that transform the programs. The idea can be
summarized as follows:

1. The user asks for a transformation (e.g. "make the plot green")

2. The synthesizer computes the most likely transformation.

3. If the transformation was not the one intended by the user, the user
helps the synthesizer to disambiguate the transformation command.

{{< figure src="disambiguation-loop.svg" caption="Synthesis loop in the current project iteration (it may change)." >}}

As more users interact with the tool, the program-synthesis search will become
more efficient; but starting the system without any user data (a "cold start")
poses a challenge that has to be solved: the very large number of possible
transformations makes searching a very tedious process for the user, which may
be avoidable. In this document we explore a simple data augmentation scheme to
help with cold starts.

## Diff-space representative transformation vectors

One aspect of the problem we are neglecting is the fact that transformations
can be detached from the context in which they were given. That is,
transformations are themselves programs that can be executed for any input
program. For example, the user may have labeled a transformation with "*make
the plot green*" by comparing the outputs of two particular programs (say,
`plot(x, y)` and its transformation `plot(x, y, color="green")`), but the
transformation can be applied to any plot-generating program.

Given that sampling plot-generating programs and applying transformations has
negligible computational cost, this opens the opportunity of using data
augmentation to optimize a model to identify when should a label be used.

Our observation is that the programmatic nature of our synthesis problems can
be exploited through the execution of the programs in the search space. We test
this idea in two experiments, (1) clustering transforms using their
output-space transformation (diff-space) representatives and (2) learning to
label transforms based only on how they transform the output of the programs
and a very small dataset of labels:

### Clustering representative vectors

As a proof-of-concept we test the idea with a very simple representative-vector
forming scheme. The experiment is to cluster the representative vectors to
see if semantically-meaningful clusters arise.

Specifically, we form the representative vector of transform $t$ as follows:

$$v[t] \leftarrow \sum_{p \sim P} \operatorname{diff}(\operatorname{exec}(p), \operatorname{exec}(t(p)))$$

where $P$ is the set of plot-generating programs, and then we cluster them
using a clustering algorithm. Note that we can easily compute $v[t]$ on-demand.

#### Results

In the experiment we clustered 100 transforms using their representative
vectors with the Affinity Propagation algorithm implemented in the [Scikit Learn python library](https://scikit-learn.org/stable/index.html) with the cosine
metric. Each representative vector was formed by sampling 200 programs.


The algorithm formed 13 clusters, most of which are semantically meaningful.
For example, transformations which change the markers of the plot in different
ways were clustered together.

You can see a summary of the results in the [report.pdf](report.pdf) file of
this experiment and the implemetentation in the [git
repository](https://gitlab.com/da_doomer/program-by-talking/-/tree/diff-clustering).

### Learning to label using representative vectors

1. Assign to each transformation $t$ a vector representative of the
	 output-space changes it causes, as in the clustering experiment:

	$$v[t] \leftarrow \sum_{p \sim P} \operatorname{diff}(\operatorname{exec}(p), \operatorname{exec}(t(p)))$$

	where $P$ is the set of plot-generating programs.

2. Map each word (not each utterance) in our dataset $w \in D$ to a
	representative of the list of representative vectors of the transformations in
	which the word appears in our current dataset,

	$$v[w] \leftarrow \sum_{t \in \{t' \in  D[w] | w \in t'\}} v[t]$$

3. Label new transformations by comparing its representative vector to the list
	 of representative vectors of each word, and labeling with the words whose
	 vectors are "most-similar" to the current vector.

	 $$\operatorname{label}(t) = \underset{w}{\operatorname{argmax}} \operatorname{sim}(v[t], v[w]) $$

	 Choosing the top-$k$ words instead of the single most similar word is also
	 possible.

#### Results

In the experiment we performed the above procedure for transforms both in the
dataset and randomly generated. We used random plot-generating programs to
compute the diffs. There were only 12 bindings in the dataset, and 10 random
programs were used to compute the representative vectors.

The images below are the output of the first experiment, but you can run the
application on your computer with more programs-per-transform by following the
instructions in the [git
repo](https://gitlab.com/da_doomer/program-by-talking/-/tree/labeling-transformations).

{{< figure src="example1.png" caption="Example output 1." >}}

{{< figure src="example2.png" caption="Example output 2." >}}

{{< figure src="example3.png" caption="Example output 3." >}}

{{< figure src="example4.png" caption="Example output 4." >}}

{{< figure src="example5.png" caption="Example output 5." >}}

{{< figure src="example6.png" caption="Example output 6." >}}

{{< figure src="example7.png" caption="Example output 7." >}}

{{< figure src="example8.png" caption="Example output 8." >}}

{{< figure src="example9.png" caption="Example output 9." >}}

{{< figure src="example10.png" caption="Example output 10." >}}

Results show that even with the extremely limited budget "mostly good enough"
top-1 labels were generated for transforms that are similar to transforms in
the dataset (i.e. we can guess the label for a transform that is in the
dataset).

Generation of labels for transforms very different to things in the dataset
was not effective, which is not surprising given the simplicity of the
setup.

Increasing the budget boosts performance for transformations "similar" to
transformations in the dataset (confirmed by
setting the number of sampled programs to 50).

## Conclusion

Data augmentation techniques can exploit the programmatic nature of programmatic search spaces.

The clustering experiment proved that it was easy to get (mostly) semantically
meaningful clusters of transforms.

In the labeling experiment results showed that we can label transforms
(programs) that are similar to transforms (programs) in the dataset using only
simple vector operations. Further work should incorporate problem-specific
solutions to improve the generalization capabilities (e.g. to produce labels
that are not in the initial dataset).
