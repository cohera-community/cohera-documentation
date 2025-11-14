# cohera documentation

This is the documentation for a community platform framework.
We're using the [Diátaxis model](https://diataxis.fr/) for documentation structure.

IMPORTANT: Cohera does not exist yet. We're writing the documentation as if it exists though.

## Cohera

Cohera is a collection of modules for quickly building custom community platforms.
Read src/content/docs/reference/architecture.mdx for an overview.

### CLI

src/content/docs/reference/cli.mdx provides an overview of all `cohera` subcommands.
STOP if you need to use one that does not exist there!

## Diátaxis

- four kinds are: tutorials, how-to guides, reference and explanation
- our focus: tutorials and how-to guides

| If the content…   | …and serves the user's… | …then it must belong to… |
| ----------------- | ----------------------- | ------------------------ |
| informs action    | acquisition of skill    | a tutorial               |
| informs action    | application of skill    | a how-to guide           |
| informs cognition | application of skill    | reference                |
| informs cognition | acquisition of skill    | explanation              |

### Tutorials

> A tutorial is a lesson, that takes a student by the hand through a learning experience. A tutorial is always practical: the user does something, under the guidance of an instructor. A tutorial is designed around an encounter that the learner can make sense of, in which the instructor is responsible for the learner’s safety and success.
>
> A driving lesson is a good example of a tutorial. The purpose of the lesson is to develop skills and confidence in the student, not to get from A to B. A software example could be: Let’s create a simple game in Python.
>
> The user will learn through what they do - not because someone has tried to teach them.

### How-to guides

> A how-to guide addresses a real-world goal or problem, by providing practical directions to help the user who is in that situation.
>
> A how-to guide always addresses an already-competent user, who is expected to be able to use the guide to help them get their work done. In contrast to a tutorial, a how-to guide is concerned with work rather than study.
>
> A how-to guide might be: How to store cellulose nitrate film (in motion picture photography) or How to configure frame profiling (in software). Or even: Troubleshooting deployment problems.

## Tools

use `bun` for commands:

- `bun run build`

The site is built with `astro` and its starlight template.

To check if the dev server is running:
`curl localhost:4321`.
If not, start it in the background with `bun dev`

## Inspiration

- [astro docs](https://github.com/withastro/docs)
- [sveltekit docs](https://svelte.dev/docs)
- [starlight docs](https://github.com/withastro/starlight)
