---
name: creating-assets
description: Works out which pictures a video needs, writes the prompt for each, and gets them into the project at the right size and shape. Use when scenes need images, when generated images come back inconsistent or wrongly framed, when someone wants to supply their own, or when asked where assets go.
---

# Creating assets

**Use this when** the scenes are known and the pictures are not made yet, or what came back does not
fit.

**You need first** a style decision from `choosing-a-visual-style`, including its style paragraph,
and a list of scenes. Generating before either exists produces pictures that get thrown away.

**This produces** named files under `public/assets/<project>/`, each one recorded next to the prompt
that made it, so any of them can be regenerated without guessing.

**Then go to** `building-scenes`.

---

An asset is any picture the code cannot draw itself — a hand, a logo, a prop, a paper texture.
**Most wasted effort in a video project happens here**, and nearly all of it is preventable by
sorting before generating.

## Ask which of three routes

| Route | What it means |
| --- | --- |
| **Generate them** | Fastest. The person reviews what comes back and asks for another pass on anything that does not fit |
| **They supply them** | For particular photographs, logos or artwork they already hold. Ask early — what exists changes what the film can do |
| **Write the prompts, they generate** | Specify each picture; they run the prompts elsewhere and put the results back. More work, more control |

Mixing is normal — own logo, everything else generated.

## Sort before generating anything

Four groups, and the group decides how much work each one is.

**One-offs.** Appear once and matter. A hero prop, a title element. Made individually and carefully.

**Reusable pieces.** Made once, used many times at different sizes and tints by the code. Paper
scraps, textures, small shapes. A handful can furnish a whole video, so they are worth hunting for.

**Frames of the video itself.** Sometimes a video shows itself — a moment from scene 2 appearing
inside scene 5. These are exported from the film once those scenes exist, never generated.

**Things code draws for nothing.** Solid shapes, lines, circles, rectangles, text. Drawn sharper in
code, and changeable later without regenerating anything.

Sorting cuts the list substantially. On the film in this repository it took 37 assets down to 28
that needed generating.

**And some videos need no generated assets at all.** Where the subject is an idea rather than a
thing, code can draw the whole film. That is a legitimate outcome of this step, not a failure of it.

## Two rules that prevent re-doing everything

**Transparent background, no shadow baked in.** The picture arrives as a cut-out with nothing
behind it. Shadows belong in code, where they move and squash as the object lands. A shadow painted
into the file glues the object flat to the page and cannot be taken out.

**Generate at least twice the size it appears.** A picture filling a third of a 1920-wide frame
arrives at 1280 wide or more. Scaling down looks fine. Scaling up does not.

## Write the prompts, and paste the same paragraph above every one

Once the style rules exist, work out what pictures the video needs and the exact prompt for each.
This is the part to do rather than hand back: the code's requirements are not visible to the person
— that a lever has to be its own file in order to move, that two pictures must match, that
something can be tinted in code rather than generated twice.

**The style paragraph goes at the head of every prompt, the same words every time, never
paraphrased.** It is the single reason separately generated pictures look like one video, and an
inconsistent one is the most likely way a set falls apart.

Show the prompts even when generating them yourself. A wrong prompt read in ten seconds saves a
wrong picture that has to be noticed in a finished scene.

## Ask two questions of every asset

**What has to match?** Things that must look like the same object, the same hand, the same room go
in **one image, generated together, and are cut apart afterwards.** Generated separately they will
not match, and no amount of prompting reliably fixes it.

**What has to move on its own?** A hinge, a lid, an arm, a mouth — each arrives as its own file. A
single picture of a whole object cannot be animated in pieces. This is the constraint discovered
latest and paid for most.

## Four failures to design against

**Do not ask a generator for composition, scale or placement.** Image models follow pictures, not
instructions about layout. Describing a composition more precisely does not help. Build the
starting frame — the subject placed at the size wanted — and hand that over instead.

**Never hand over a photograph or someone else's artwork as a style reference.** These tools copy
what they are shown. A famous cartoon passed as a reference came back reproduced almost exactly; a
paper template contributed its decorative flowers and, separately, its watermark. Describe the
style in words and show only pictures that are yours.

**If the same fix has been asked for twice and come back wrong twice, stop rewording.** The tool
cannot do what is being asked. Change the approach, not the adjectives.

**When something looks wrong in two ways, fix one at a time.** And ask whether the flaw is in the
material or in what was done to it — a clip slowed too far showed a defect that had always been
there and had simply been too fast to see.

## Where files go, and what gets recorded

Files live under `public/assets/<project>/` and are referenced with `staticFile()`. Everything under
`public/` is copied into every render, so anything parked there is paid for whether the film uses it
or not.

**Record the prompt beside the asset.** A picture whose prompt was not kept cannot be regenerated,
only re-invented.

## Reference

- [`reference/assets.md`](reference/assets.md) — the three sourcing routes in full, mixing sources,
  logos, and where files live.
- [`reference/worked-example-live.md`](reference/worked-example-live.md) — 28 pictures, two real
  prompts, and the mistakes they were shaped to avoid.
- [`reference/worked-examples-other.md`](reference/worked-examples-other.md) — two more films: one
  that generated people and paid for it, one that generated nothing at all.
