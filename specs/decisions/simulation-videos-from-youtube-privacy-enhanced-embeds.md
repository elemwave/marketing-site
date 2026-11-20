# Play simulation videos from YouTube's privacy-enhanced embed

## Context

Three applications in The challenges on the home page — radiated emissions,
radiated immunity and conducted susceptibility — are illustrated by
Elemwave's own simulation videos, published on the OpenSEMBA YouTube channel.
The channel's owner asked for those videos to play in each item's picture
area, from YouTube, muted, looping and without controls, with the video's
thumbnail in the item's round tab.

The site is a static export with an enforcing content policy that admits
scripts only by hash, and it already embeds one third party, the scheduling
service, on the same terms recorded in
[Embed Calendly's own popup modal as the booking dialog](specs/decisions/calendly-popup-modal-booking-dialog.md):
nothing third-party loads up front.

## Decision

- **A plain frame from the privacy-enhanced host.** Each video plays in an
  `<iframe>` from `https://www.youtube-nocookie.com/embed/<id>` with
  `autoplay=1`, `mute=1`, `loop=1` with the video as its own `playlist`,
  `controls=0`, `playsinline=1`, `rel=0` and `iv_load_policy=3`. The page
  loads no YouTube script, style or picture.
- **Heard through the player's message protocol.** The page enables the
  player's protocol (`enablejsapi`, `origin`, `widgetid`), greets the frame
  with the `listening` handshake once it has loaded, and accepts only messages
  from that frame's own window and origin. The frame stays transparent above
  the video's still until the player reports that the video is playing.
- **Mounted only on the visitor's choice.** Nothing loads from YouTube until a
  visitor chooses one of the three items, and the frame is removed when they
  choose another.
- **Never mounted under reduced motion.** A visitor who asks for reduced
  motion is shown the still alone, and nothing is requested from YouTube.
- **Local thumbnails.** Each still is YouTube's own thumbnail, copied byte
  for byte into `public/images/` and pinned by digest, so the picture rule of
  the content policy stays `'self'`.
- **The content policy widens by one host, for frames only.** `frame-src`
  names `https://www.youtube-nocookie.com` beside the scheduling service;
  no other directive changes.
- **No consent step.** As for the scheduling service, nothing third-party
  loads before the visitor's own choice, so no consent step is added.
- **Named in the privacy policy.** The privacy policy names YouTube, says when
  it is contacted and what it receives, links its privacy notice, and lists it
  among the recipients of the visitor's details.

Alternatives rejected:

- **Self-hosted video files.** They would add the videos' weight to the
  published site and duplicate what the channel already publishes; the
  channel's owner chose YouTube.
- **YouTube's IFrame script API.** It would load a third-party script into
  every page that shows a video and widen the script rule of the content
  policy; the same protocol is spoken directly instead.

## Consequences

- The site depends on YouTube for these three videos. Where YouTube is
  unreachable, blocked, declines to play or never answers the handshake, the
  still stays in place with its name and the site shows no error.
- The player's message protocol is YouTube's, not a published contract. A
  change to it degrades to the still, as above, and only a check against the
  real player shows it.
- The browser tests stub YouTube, so automated checks never observe real
  playback; autoplay, looping, pausing and the video's shape are confirmed
  against the real player by a person.
- The content policy's frame rule now admits a second third party; any
  further embed needs its own decision.
