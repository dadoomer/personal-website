# personal-website

My personal website's files (iamleo.space).

Root repo: [gitlab.com/da_doomer/personal-website](https://gitlab.com/da_doomer/personal-website).

## Installation

1. Install [`hugo`](https://gohugo.io/)

2. Serve the website: `hugo server`.

The port and base URL can be configured, see [Hugo
documentation](https://gohugo.io/commands/hugo_server/): `hugo server --baseUrl URL --port PORT --bind IP`.

## Slides

Content in `/static/` is copied to `/public/static`, so it is served normally.
To create slides

1. `cd static/slides/`.

2. Write your markdown-slides.

3. Compile `hugo` in the root directory.

4. The slides are served in `website-root/slides/your-slides`.
