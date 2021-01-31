---
title: Improving the Program By Talking app
date: 2020-12-28
tags: ["program by talking"]
---

The Program By Talking app had a couple of problems: it did not
work on the Chrome web browser and it did not scale to different screen sizes.
So, I revisited the CSS files and made sure everything was working correctly.

Fixing the layout on most screens was simple enough.

{{< figure
src="1.png"
caption="First slide. Top: firefox. Bottom: chromium."
>}}

{{< figure
src="2.png"
caption="Second slide. Top: firefox. Bottom: chromium."
>}}

{{< figure
src="3.png"
caption="Third slide. Top: firefox. Bottom: chromium."
>}}

Fixing the screen with the image grid was a little bit more challenging.
Previously I used an HTML `<map>` to segment an image into an element-wise
click-able grid, but that does not work on Chrome the same way it does on
Firefox. Instead, I did the segmentation on the server and sent the images to
the client.

After that, it was only a matter of figuring out the correct CSS so that the
images fall into place correctly in any resolution/screen-size configuration.
This has the advantage of allowing a small border highlighting the area
that the user is hovering the mouse over.

{{< figure
src="4.png"
caption="Fourth slide, with the image grid collage on the right. Top: firefox. Bottom: chromium."
>}}

Below you can see an example execution.

{{< figure
src="chromium.gif"
caption="Example execution on chromium."
>}}

It is even (barely) usable on a smart phone.

{{< figure
src="2-firefox-focus.png"
caption="Second slide in Firefox Focus."
>}}
