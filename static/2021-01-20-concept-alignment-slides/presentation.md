[comment]: # (compile this presentation with markdown-slides)

[comment]: # (!!! data-background-image="media/cover.png" data-background-size="contain")

(*texture/shader synthesis*)

![picture of spaghetti](media/metallic.jpg) <!-- .element: style="height:100%; width: auto; max-height: 50vh; max-width:50vw;" -->

"Make it metallic."

[comment]: # (!!!)

(*parametric vehicle design*)

![picture of spaghetti](media/buggy.png) <!-- .element: style="height:100%; width: auto; max-height: 80vh; max-width:80vw;" -->

(adapted from [source](http://getdrawings.com/volkswagen-beetle-silhouette#volkswagen-beetle-silhouette-4.png))

"Lift suspension; make it convertible; add all-terrain wheels"

[comment]: # (!!!)

![picture of spaghetti](media/problem1.png) <!-- .element: style="height:100%; width: auto; max-height: 90vh; max-width:80vw;" -->

[comment]: # (!!!)

(*hay de tres sopas*)

No matter how much I shake my computer, it will not help me. I need to:

- Invest precious time reading Matplotlib's documentation; or

- Talk to an expert, e.g. ask on StackOverflow; or

- Try random program modifications.

until I learn how to apply my intent to the program.

[comment]: # (!!!)

![picture of spaghetti](media/problem2.png) <!-- .element: style="height:100%; width: auto; max-height: 90vh; max-width:80vw;" -->

[comment]: # (!!!)

If only the computer knew that

"*make it orange*"

maps to

`color='#f37359ff'`

[comment]: # (!!!)

## Concept alignment of people and programs in creative domains

[comment]: # (!!! data-background-color="aquamarine")

(*the challenge*)

In creative domains it is very difficult for users to express their intent to
a computer.

This difficulty arises because of the gap between user- and program- concepts.

Our goal is to align human concepts, expressed as natural language phrases,
with underlying programmatic constructs.

[comment]: # (!!!)

(*examples*)

| User concept  | Programatic concept |
|---------------|---------------------|
|"make orange"  | `color='#f37359ff'` |
|"line dashed"  | `linestyle='--'`    |
|"shorter axis" | `plt.ylim(1, 10)`   |

[comment]: # (!!!)

# What do we need?

![picture of spaghetti](media/cauldron.jpg) <!-- .element: style="height:40vh; max-height:70vh; max-width:80vw;" -->

(image: [Stephan Burlot, wikimedia](https://upload.wikimedia.org/wikipedia/commons/9/91/Chaudron_de_raisin%C3%A9e.JPG))

[comment]: # (!!!)

(*the need for communication*)

There is asymmetry of information:

- User does not speak "computer": If the user knows the API, they can just
	program in it.

- (Initially) Computer does not speak "human": Otherwise it can understand intent and
	perform traditional synthesis.

We need communication because the user does not know the API and the computer
does not know the intent.

[comment]: # (!!!)

(*the need for incremental modifications*)

In creative domains the specification is often hard to state upfront or
even impossible to verbalise precisely.

Because of this, we propose a **divide-and-conquer** strategy, where the user
incrementally communicates modifications to a working version of the program
that bring it closer to the goal.

[comment]: # (!!!)

Working materials:

![picture of spaghetti](media/variables.png) <!-- .element: style="height:100%; width: auto; max-height: 80vh; max-width:80vw;" -->

[comment]: # (!!!)

Thus, the main loop is something like:

![picture of spaghetti](media/loop.png) <!-- .element: style="height:100%; width: auto; max-height: 80vh; max-width:80vw;" -->

[comment]: # (!!!)

In general each step is a search among programs
("transformations") that operate over objects/programs.

![picture of spaghetti](media/plot-graph.png) <!-- .element: style="height:100%; width: auto; max-height: 60vh; max-width:80vw;" -->

[comment]: # (!!!)

As the system interacts with users, it builds a dataset of past interactions
$B$ that binds user- and program- concepts.

These bindings help the system make better proposals and faster negotiations.

[comment]: # (!!!)

<iframe width="1000" height="500" src="media/demo.mp4" frameborder="0"allowfullscreen></iframe>

[comment]: # (!!!)

## TO-DO

[comment]: # (!!!)

`linewidth = 1.011`

`linewidth = 1.012`

...

`linewidth = 1.02`

**Negotiation phase**: There is an infinite number of transforms. How can we
reduce the search space?

Candidate solution: offer a "diverse" set of possibilities and then refine it
with local search?

[comment]: # (!!!)

![picture of spaghetti](media/dataset.png) <!-- .element: style="height:100%; width: auto; max-height: 40vh; max-width:80vw;" -->

**Proposal phase**: How to quickly compute the most likely transform given an
	utterance and past interactions?

Candidate solution: word-2-vec embeddings to look for similar utterances?

[comment]: # (!!!)

## Additional remarks

[comment]: # (!!!)

![picture of spaghetti](media/diff.png) <!-- .element: style="height:100%;" -->

We can exploit the programmatic nature of transformations by reasoning over
the output-space changes they induce.

[comment]: # (!!!)

![picture of spaghetti](media/tsnediffs.png) <!-- .element: style="height:100%;" -->

For example, for automatically finding good comparison metrics for
transformations...

[comment]: # (!!!)

![picture of spaghetti](media/isomapcover.png) <!-- .element: style="height:100%; width: auto; max-height: 70vh; max-width:80vw;" -->

...that allows us to (e.g) find [sets that "cover" the space of transformations](/2021-01-12-representatives/).

[comment]: # (!!!)

## In summary

[comment]: # (!!!)

1. We want to align human- and program- concepts.

	E.g. "*make orange*" with `color='#f37359ff'`.

2. We propose a communication scheme where the user and the synthesizer
	 incrementally modify a working program/object until the user is satisfied.

[comment]: # (!!!)

The end, thank you :D

[comment]: # (!!!)
