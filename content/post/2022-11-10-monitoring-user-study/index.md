---
title: Recording the screen of participants in a user study
markup: pandoc
date: 2022-11-10
tags: ["data-visualization", "program-by-talking"]
---

In this document I briefly describe how to record the screen of participants in
a user study. The recording will be stored as a sequence of interactions with
the website, it will include mouse pointer position, and can be replayed as a
video. Participants will not know they are being recorded. Only interactions
within the website are recorded (i.e. not even the browser window, only the website itself).

Naturally, this is not limited to user studies. We probably should assume every website
we visit does something similar.

{{< video src="recording" caption="Visualizing a participant screen." >}}

The video above shows a recording of me visualizing a participant's screen.

# TLDR

1. Load library that records changes in the DOM for the purposes of screen recording.

2. Start recording.

3. End recording.

4. Recommended: compress recording.

5. Save to database.

6. Visualize recording by reading from database.

# Assumptions

To keep things we assume the following:

1. The project uses `npm`.

2. We have added two third-party libraries to the project (and assume they are not malicious):

	- [Pako](https://github.com/nodeca/pako) for compression.

	- [rrweb](https://github.com/rrweb-io/rrweb) for recording and replaying interactions.

3. We have a database to store recordings.

Type annotations can be ignored if you are not using Typescript.

# Record screen

Load recording library:

```
import { record } from "rrweb";
```

Create an array to store recording events:

```
// Array to store interaction events
const replay_events = [];
```

To start recording:

```
// Naturally, this line is a potential memory leak. Make sure
// to eventually stop recording.
const stop_recording = record({
	emit(event) {
		replay_events.push(event);
	},
});
```

Then stop recording and save to database:

```
stop_recording();
await write_replay_to_db(replay_id, replay_events);
```

# Write recording to database

```
// Pako implements zlib
import pako from "pako";
import type { eventWithTime } from 'rrweb/typings/types';

async function write_replay_to_db(replay_id: string, replay: unknown) {
	// Serialize into JSON
	const serialized_replay = JSON.stringify(replay);

	// Compress JSON into array of bytes
	const compressed_replay = pako.deflate(serialized_replay);

	// Write to your database of choice
	await write_bytes_to_db(replay_id, compressed_replay);
}
```

# Read from database

In this project, each 10-minute recording is about 500-700 KB compressed.
Compression is optional: you could also store the JSON strings.

```
async function get_replay_from_db(replay_id: string): Promise<eventWithTime[]> {
	// Read from your database
	const compressed_replay = await get_bytes_from_db(replay_id);

	// Uncompress JSON
	const serialized_replay = pako.inflate(compressed_replay, {to: "string"});

	// Parse JSON
	const replay = JSON.parse(serialized_replay);
	return replay;
}
```

# Visualize recording

Import player. The player needs some included CSS to display correctly.

```
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
```

Visualize the replay by creating a player instance on a DOM node:

```
async function display_replay(node: HTMLElement, replay_id: string) {
	const replay_events = await get_replay(replay_id);
	const replayer = new rrwebPlayer({
		target: node,
		props: {
			events: replay_events,
			width: node.offsetWidth,
		},
	});
	// Call replayer.destroy() eventually
}
```

# Notes

- All the code runs on the participant's browser.

- When replaying a sequence of interactions images and videos are displayed,
	but they are probably not stored in the sequence itself, rather, they could
	be downloaded from the same path. This would have several consequences (like the
	stability of the recording). So if you e.g., rely on authentication or want
	to guarantee the stability of the recordings, you probably want to figure out
	exactly what is stored in the trace.
