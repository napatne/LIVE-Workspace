# Accessibility

Verified against ASU's published guidance on **2026-09-19**. Sources at the bottom.

**ASU's stated standard is WCAG 2.1 level AA** for all online courses, websites, applications
and other digital content.

**This file applies to every film made here, whichever visual style was chosen.** Nothing in it
is a brand rule.

## Contents

- [Captions are required, not optional](#captions-are-required-not-optional) — what gets captioned, including music and footage
- [Text over footage or photographs](#text-over-footage-or-photographs)
- [Describe what the visuals say](#describe-what-the-visuals-say)
- [Colour is never the only signal](#colour-is-never-the-only-signal)
- [Motion and flashing](#motion-and-flashing) — supplied clips included
- [Check contrast yourself](#check-contrast-yourself)
- [Before calling a video done](#before-calling-a-video-done)

## Captions are required, not optional

This is the part most likely to be treated as a nicety. It is not.

Verbatim from <https://accessibility.asu.edu/articles/video>:

> new recorded video intended to be viewed by students, employees, or the public must have
> edited auto-captions (or manual captions)

**On accuracy, the page says to "aim for 95% accuracy or higher."** That is guidance, not a
threshold you can certify against — do not report a video as "95% accurate" unless someone has
actually measured it. Raw auto-generated captions do not qualify either way: ASU says they
"are often not accurate enough for individuals with disabilities to fully understand the
content." Accessible captions means edited auto-captions or professional human captions.

### What this means for how we build

- **Captions carry what a viewer who cannot hear would miss: the speech, and any sound that
  means something.** That quoted sentence is about recorded video shown to students, employees
  or the public; captioning it means making its sound available as text. It is not a rule that
  every soundtrack needs words on screen.
- **Speech is always captioned, on by default.** Not a preference, not a setting someone has to
  find.
- **A film with music and no voice** has no speech to caption, but the music is still sound. Tell
  a viewer who cannot hear that it is there — a short bracketed description where it starts,
  such as *[gentle piano music]*, and again if it changes in a way that matters. The DCMP
  Captioning Key (below), which ASU points to, covers how to describe music and sound effects;
  check it for the form rather than inventing one. If the words on screen already carry the
  whole film, that one description is all the music needs.
- **A sound effect that tells the viewer something** — a knock, an alarm, a crowd reacting —
  gets a bracketed description where it happens.
- **Background sound that carries no meaning** — room tone, a hum, the general noise of a place —
  needs no caption. Say that you judged it so, in the film's brief, rather than deciding
  silently.
- **A film with no audio track at all** has nothing to caption. Its words on screen are the
  whole message, so they carry every other rule in this file.
- **Generate captions from the script text**, not from transcribing the audio. The script is
  the source of truth, it is already exact, and there is nothing to get to 95% because it was
  never guessed.
- **If narration is generated from the same string**, the caption and the voice cannot drift
  apart. Keep that link.
- **Third-party video** shared with students or employees must be captioned too. If someone
  supplies a clip, ask whether it has speech, and caption what it says. The
  `working-with-footage` skill covers bringing a clip into a film.

### Caption formatting

ASU does not publish its own formatting rules; it points to the **DCMP Captioning Key**
(<https://dcmp.org/learn/captioningkey>) as the recommended guide. The essentials that matter
for short explainers:

- **Keep lines short.** ASU's typography rule caps line length at 80 characters; a caption
  should be well under that — around 8–10 words reads comfortably at 40px.
- **Break at sentence ends** where possible, so a caption rarely splits mid-clause.
- **Weight the timing by length.** An even split gives a three-word caption the same time as a
  fifteen-word one, which reads as a stutter.
- **Put captions on an opaque panel**, not bare on the background. Text alone becomes
  unreadable the moment a diagram passes behind it.
- **Leave room.** When captions are on, the figure area has to stop above them rather than
  running underneath.

## Text over footage or photographs

**Any text that sits over footage or a photograph goes on its own opaque panel** — titles, name
bars, labels and captions alike. Contrast against "what is actually behind it" cannot be
computed when what is behind it is a moving picture or a photograph with light and dark
patches: the ratio changes from frame to frame and from letter to letter. A panel gives the text
one background, and that pair can be computed like any other.

A shadow or outline on bare text is not a substitute. It helps, but it leaves no single pair to
check.

## Describe what the visuals say

ASU's guidance is direct:

> If there are graphs or visuals that include important information, be sure to describe them
> in the video and/or include a clear description as a supplement.

(That sentence is written for *course* content. It is good practice everywhere, but do not cite
it as a blanket ASU rule for all video.)

**A diagram that carries meaning the narration never states is inaccessible.** A bell curve
with no spoken explanation of what it shows fails this, however clear it looks.

**The practical rule:** read the script with the pictures removed. If something is lost, the
script is incomplete — fix the script, not the picture. This is cheap to satisfy in an
explainer, because good narration usually describes the visual anyway. It only fails when a
diagram is doing work the words never mention.

## Colour is never the only signal

Someone who cannot distinguish two hues must still be able to read the chart. Label the
series, or vary the shape, position or pattern as well as the colour. This applies to every
multi-series diagram.

## Motion and flashing

**ASU publishes no rule I could find on this**, so this is WCAG 2.1, not an ASU-specific
standard — do not present it as one:

- **Nothing should flash more than three times per second.** Rapid flashing can trigger
  seizures.
- **That includes footage someone supplies, not only what is animated here.** Watch every clip
  before it goes in, and look for strobing light, camera flashes, rapid cuts between light and
  dark, and busy high-contrast patterns. If a stretch flashes, leave it out or ask the person
  what they want instead. A clip being theirs does not make it safe to show.
- **Avoid large, fast, full-screen motion.** It can cause nausea and vestibular symptoms.
- Prefer a figure that draws itself in over about two seconds and then holds still. That is
  also better for comprehension — narration needs something settled to talk over.

## Check contrast yourself

Compute it. Do not eyeball it, and do not trust a remembered number.

```bash
node -e '
const lum = (h) => { const c = h.replace("#","").match(/../g).map((x) => parseInt(x,16)/255)
  .map((v) => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055) ** 2.4);
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]; };
const ratio = (fg,bg) => { const a=lum(fg), b=lum(bg), hi=Math.max(a,b), lo=Math.min(a,b);
  return ((hi+0.05)/(lo+0.05)).toFixed(2); };
console.log(ratio("#8C1D40","#FBF9F4"));  // 8.44
console.log(ratio("#FFC627","#FFFFFF"));  // 1.57 - fails
'
```

**This one will stop and ask for approval, and that is correct.** `node -e` runs whatever it is
given, so it is not a command worth approving for good — the alternative is allow-listing arbitrary code
execution to save one click. Say yes; it is a calculator.

**It is Node, not Python, on purpose.** Node is already required to build anything here;
Python is not. Do not assume this machine has Python, and do not install it —
`installing-the-toolchain` → `reference/SETUP-CHECK.md` rules that out.

| Target | Ratio |
| --- | --- |
| Body text | **4.5:1** |
| Large text (24px+, or 18.66px+ bold — WCAG's 14pt) | **3:1** |
| Link text against surrounding text | **3:1** |

ASU also names WebAIM's contrast checker as its tool of choice:
<https://webaim.org/resources/contrastchecker/>

## Before calling a video done

- [ ] Speech is captioned, and the caption text came from the script rather than a transcription
- [ ] Music and meaningful sound are described; background sound left uncaptioned is noted in the brief
- [ ] Every text colour clears 4.5:1 against what is actually behind it — computed, not guessed
- [ ] Every word over footage or a photograph sits on an opaque panel
- [ ] No gold text on a light background
- [ ] Nothing meaningful is carried by colour alone
- [ ] Every diagram's point is stated in the narration
- [ ] Nothing flashes more than three times a second — supplied clips included
- [ ] A still shrunk to quarter size is still readable

**Then report what was done, not that it is compliant.** *"Captions are on and the colours
meet AA contrast"* is a fact. *"This is ASU compliant"* is a claim covering far more than we
checked — screen-reader behaviour, audio description, player accessibility — and it is not
ours to make.

## Sources

- ASU video captioning guidelines — <https://accessibility.asu.edu/articles/video>
- ASU video and audio content accessibility — <https://accessibility.asu.edu/video-audio-content-accessibility>
- ASU accessible typography — <https://accessibility.asu.edu/articles/typography>
- ASU colour palette — <https://brandguide.asu.edu/brand-elements/design/color>
- DCMP Captioning Key — <https://dcmp.org/learn/captioningkey>
