# Publish the challenge simulations as the site's own videos

## Context

Three applications in The challenges on the home page — radiated emissions,
radiated immunity and conducted susceptibility — are illustrated by
Elemwave's own simulations. They were first played from YouTube's
privacy-enhanced embed. The channel's owner returned that delivery: the site
is not to embed YouTube, the simulations are to be converted to a
web-friendly format that plays by itself, and the Cable panels and Radiated
immunity simulations are to move more fluidly; the Vivaldi horn's frame rate
is right as it is.

The owner supplied the original simulation files rather than YouTube's
re-encodes:

| item | source | where it came from | SHA-256 |
|---|---|---|---|
| Radiated emissions | `antenna_zarzuela_3d.mp4`: H.264, 802 × 620, 244 pictures at 12 per second, no sound | attached to the card EWM-165 | `1f7bd9cc7366e0b55bfebf8272e889e9429bb465db9a235eb70c3a56a2f1d720` |
| Radiated immunity | `ev55_hirf.avi`: Microsoft Video 1, 1412 × 796, 35 pictures at 1 per second | attached to the card EWM-165 | `e9df3a98f2c27cb23a814d8572361b3b8faff071839d72807791b7ab0ed34546` |
| Conducted susceptibility | `panel_wires_1_frame.avi`: Microsoft Video 1, 1556 × 896, 61 pictures at 1 per second | the owner's file share | `115d1c450b80108960c4d0f9c46046cc7de2e3fd1a6e9e1b42c0f31b95986b8f` |

The sources weigh up to 27 MB and are not committed; their digests tie each
published file to the file it was made from.

## Decision

- **H.264 MP4 under `public/images/`, served by the site.** Each item plays
  `problem-<item>.mp4`: H.264 High profile, level 3.1 or lower, `yuv420p`,
  no sound track, `moov` before `mdat` (`+faststart`) so playback starts
  before the file has arrived, at most 720 pixels high and never upscaled.
  H.264 in MP4 is the one format every current desktop and mobile browser
  decodes natively, iOS included. WebM beside it would double the published
  weight for a gain only some browsers take; a GIF or animated WebP is many
  times heavier, cannot be paused through the media API and counts against
  the image budget; a `public/videos/` folder would need its own deploy step,
  cache policy and test, while `/images/` already carries the right policy for
  long-lived media.
- **Fluid motion by motion-compensated interpolation, at the source's pace.**
  Radiated immunity and Conducted susceptibility are interpolated from 1 to
  30 pictures per second with `minterpolate` in its motion-compensated mode,
  keeping each simulation's own length (35 s and 61 s): the owner asked for
  more fluid motion, not faster motion. Scene-change detection is switched off
  (`scd=none`), because consecutive pictures of a 1-per-second simulation always
  look like a scene change to it, and it would then repeat a picture instead
  of generating one. The last picture is held for its own second. Radiated
  emissions keeps its own 12 pictures per second, with nothing generated. The
  owner chose interpolation knowing that about 29 of every 30 pictures are
  generated and that moving field patterns can smear.
- **Converted once, in a pinned image, and recorded.** The approved image
  registry holds no FFmpeg image, and the weights and `minterpolate`'s output
  depend on the FFmpeg and x264 versions, so the conversion ran in a one-off
  image built from `public.ecr.aws/docker/library/debian:trixie-slim` at
  `sha256:a72b4433de1cf7d6bae0c4cee74d0547f58601a643b3375f070c51600d63b6b2`
  with Debian's `ffmpeg` package: FFmpeg 7.1.5 (`7:7.1.5-0+deb13u1`) with
  x264 core 164 r3108 (`libx264-164 2:0.164.3108+git31e19f9-2+b1`). No script
  is committed, because nothing in the site or its checks runs it again. The
  commands, each at `-crf 24`, which kept every file within its 6,000,000-byte
  target:

  ```
  ffmpeg -i antenna_zarzuela_3d.mp4 -an -vf "scale=-2:'min(720,ih)':flags=lanczos" -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 24 -movflags +faststart -g 60 problem-radiated-emissions.mp4
  ffmpeg -r 1 -i ev55_hirf.avi -an -vf "scale=-2:'min(720,ih)':flags=lanczos,tpad=stop_mode=clone:stop_duration=2,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=none" -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 24 -movflags +faststart -g 60 problem-radiated-immunity.mp4
  ffmpeg -r 1 -i panel_wires_1_frame.avi <the same options> problem-conducted-susceptibility.mp4
  ```

  `stop_duration=2` holds the last simulation picture for one second of
  output: `minterpolate` emits nothing for its last input interval, so a
  one-second pad would have left each file a second short.
- **The interpolation is checked by PSNR, at every second.** PSNR is taken on
  each file's stored 4:2:0 planes, as FFmpeg's `psnr` filter reads them and as
  a browser's WebCodecs decoder returns them, so no colour conversion adds
  noise of its own. Every own picture, at each whole second `k`, scores at least
  30 dB against source picture `k` (47.7 to 55.8 dB in both files), so the
  simulation's own pictures appear at their seconds and in order. At every
  second where the simulation visibly moves, the picture half a second later
  scores against each neighbour at least 1 dB higher than the neighbours score
  against each other: Radiated immunity from k = 4 to 33, Conducted
  susceptibility from k = 2 to 59, the smallest margins 1.43 dB (Radiated
  immunity, k = 6) and 1.56 dB (Conducted susceptibility, k = 59). A file
  made by repeating pictures fails at every one of those seconds: its middle
  picture scores against the next own picture exactly what the two own
  pictures score against each other (31.80 dB at Radiated immunity's k = 23).
  The seconds before those are still: Radiated immunity's source pictures 0 to
  3 are identical and 3 and 4 differ at 71.9 dB, Conducted susceptibility's 0
  and 1 are identical and 1 and 2 differ at 73.1 dB, a few faint pixels. x264
  holds such a change as one picture and then the other at every CRF tried (16,
  20 and 24), so a generated picture there cannot be told from the encoding's
  own noise, which reaches 53.2 dB between two identical pictures; the
  published pictures of those seconds are more than 50 dB apart, a change
  nobody can see. The browser case "holds generated pictures between the
  simulation's own at every second" in
  `projects/marketing/e2e/challenge-video-pictures.spec.ts` decodes both
  published files and checks the second bound at every second the simulation
  moves, and that the seconds it treats as still stay more than 50 dB apart;
  the first bound needs the sources, which are not committed, so it is
  recorded here. An earlier measurement on RGB pictures
  taken at three seconds per file failed at the still seconds and, by less than
  1 dB, at faint late seconds of Conducted susceptibility: the RGB conversion's
  rounding was larger than the change it was measuring.
- **The site's own button, no player.** The video plays muted and looping with
  no controls in a native `<video>`, transparent over the still until it
  reports `playing`; the picture area is a native button that pauses and
  resumes it, named by what activating it does. It is mounted only once its
  item is chosen, and never when the visitor asks for reduced motion.
- **The weight is the budget's to carry.** The three files weigh 4,496,932
  bytes. Each is downloaded only when its item is chosen, so a first visit is
  unchanged, but the total published weight grows, so `totalExportBytes` in
  `projects/marketing/performance-budget.json` is raised to 12,100,000 bytes
  with the reason "EWM-165 publishes three simulation videos for The
  challenges".

## Consequences

- Nothing third-party is involved: the content policy's `default-src 'self'`
  already admits a same-origin video, and the privacy policy names no video
  service. The booking dialog stays the site's only third-party frame, as
  [Embed Calendly's own popup modal as the booking dialog](specs/decisions/calendly-popup-modal-booking-dialog.md)
  records.
- A new or changed simulation is converted the same way, in an image pinned
  the same way, and its source's digest and the versions used are recorded
  here.
- A faster loop for an interpolated video is one value, the input rate `-r 1`.
- Playwright's browsers are not relied on to decode H.264: the browser cases
  that need playback serve a small VP9 stand-in under the `.mp4` addresses, and
  one case plays the real files where the browser can decode them.
