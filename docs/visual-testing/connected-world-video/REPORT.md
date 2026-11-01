# Connected-world animation recording

1 November 2026. Records the standalone connected-world prototype, not the production research viewer. Source: working tree based on `2471a922b4e1988afe5ef907b4bdb629693af296`, with connected-world prototype files documented in [the prototype report](../connected-world/REPORT.md). No application source changed for this recording.

## Reproduce

```powershell
node docs/prototypes/unreliable-world/record-video.cjs --discover
node docs/prototypes/unreliable-world/record-video.cjs --rehearse
node docs/prototypes/unreliable-world/record-video.cjs
```

Uses locally installed Playwright/Chromium and the offline HTML artifact. Discovery saved actual button/input/select types and option values in [field-map.json](field-map.json). Rehearsal uses the same interactions without recording. Recording uses 1280×720, visible cursor, short captions, smooth scrolling, and UI interactions for normal playback, slow 0.25×, fast 3×, pause, aircraft altitude adjustment and a new seeded layout.

## Framing regression

Visual inspection of the first rehearsal found that captions obscured playback controls. Original framing placed the controls' bottom at717.39 px, below the caption's672 px top boundary. An independent browser reproduction confirmed the overlap predicate failed the original framing. Corrected scroll framing puts the controls above the caption, and the script now asserts this after every scene-framing action. Rehearsal passed with that assertion. Inspected the corrected [rehearsal frame](rehearse-final.png). The first recording attempt was stopped and replaced; raw intermediate files are not the deliverable.

The video depicts synthetic instantaneous link availability, not transmitted or delivered packets. No voiceover is included. This recording does not close broader research-engine or accessibility acceptance.

## Final verification

Discovery, rehearsal and recording all passed. [Recording result](record-result.json) reports no page errors. Final deliverables: [MP4](swarmsync-connected-world.mp4) and [WebM](swarmsync-connected-world.webm). FFprobe verified MP4 H.264,1280×720,71.84 seconds,2,233,094 bytes. Full MP4 decode with FFmpeg passed. Inspected an extracted [24-second frame](video-24s.png) and the final/rehearsal captures; sampled inspection is not a frame-by-frame review.
