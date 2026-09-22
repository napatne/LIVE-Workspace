# Accessibility

Verified against ASU's published guidance on **2026-09-19**. Sources at the bottom.

**ASU's stated standard is WCAG 2.1 level AA** for all online courses, websites, applications
and other digital content.

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

- **Captions go on by default, always.** Not a preference, not a setting someone has to find.
- **Generate captions from the script text**, not from transcribing the audio. The script is
  the source of truth, it is already exact, and there is nothing to get to 95% because it was
  never guessed.
- **If narration is generated from the same string**, the caption and the voice cannot drift
  apart. Keep that link.
- **Third-party video** shared with students or employees must be captioned too. If someone
  supplies a clip, ask.

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
given, so it is deliberately not pre-approved — the alternative is allow-listing arbitrary code
execution to save one click. Say yes; it is a calculator.

**It is Node, not Python, on purpose.** Node is already required to build anything here. Python
is not installed and `SETUP-CHECK.md` promises never to install it.

| Target | Ratio |
| --- | --- |
| Body text | **4.5:1** |
| Large text (24px+, or 18.66px+ bold — WCAG's 14pt) | **3:1** |
| Link text against surrounding text | **3:1** |

ASU also names WebAIM's contrast checker as its tool of choice:
<https://webaim.org/resources/contrastchecker/>

## Before calling a video done

- [ ] Captions are on, and their text came from the script rather than a transcription
- [ ] Every text colour clears 4.5:1 against what is actually behind it — computed, not guessed
- [ ] No gold text on a light background
- [ ] Nothing meaningful is carried by colour alone
- [ ] Every diagram's point is stated in the narration
- [ ] Nothing flashes more than three times a second
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
