# What goes wrong

Making a video this way goes wrong constantly. That is the normal shape of the work, not a sign of
doing it badly. The film in this repository is 70 seconds long and took seven working sessions,
four different target lengths, and one complete rejection of a finished cut.

This is about expecting that, and about the habits that catch problems early rather than late.

## Contents

- Four habits that catch most of it
- When the assistant confidently does the wrong thing
- Eleven failures from three films, and what each one teaches
- Keep a log

---

## Four habits that catch most of it

**Watch it before believing it.** An assistant will describe what it built and the description will
sound right. The numbers will add up. Nothing substitutes for playing the video. The worst failure
on one film here was a cut whose arithmetic was perfectly correct and which was missing whole
sections.

**Never let a number decide the edit.** If a video runs 63 seconds against a target of 60, the
answer is almost never to cut three seconds. Change the target. A video trimmed to satisfy a number
is worse than one running slightly long, and the damage is hard to see afterwards.

**Make the assistant show its arithmetic.** When it moves something, ask where that puts it.
Assistants are confidently wrong about positions and sizes in a way that is easy to check and easy
to skip.

**Fix the plan, not the frame.** When something does not work, the instinct is to adjust what is on
screen. Often the real problem is further back — the thing being said was never set up. Adjusting
pixels to rescue a broken idea produces a lot of work and no improvement.

## When the assistant confidently does the wrong thing

**Say what you see, not what to do.** *It is too fast, I can barely register it* gets a better
result than *make it 12 frames longer*. The person watching should describe; the assistant should
work out the mechanism.

**Ask why before asking for a fix.** If something is wrong twice, the second attempt usually failed
for the same unexamined reason as the first.

**Object at the plan, not at the film.** The scene descriptions before building are the cheapest
place in the whole project to disagree. A scene wrong in a paragraph is a sentence to rewrite; the
same scene wrong on screen is a rebuild.

**Go back rather than forward.** If three rounds have not fixed something, the version before them
was probably better.

**Expect several rounds on anything to do with timing.** Motion is the hardest thing to specify in
words and the easiest to get wrong. Four or five passes on one movement is normal.

## Eleven failures, and what each one teaches

These come from three films. Costs and quotas were true through mid-2026.

### Fixing two faults at once made both worse

A clip came back too fast and was slowed down. It took four attempts, two rejected outright. There
were **two separate faults**: a six-frame defect already in the original, invisible at speed and
obvious at a third of it, and the slowing method itself, which repeated frames and produced
visible stutter. The third attempt tried to solve both — inventing in-between frames and deleting
the damaged ones — and produced movement that was never filmed plus a subject who teleported
forward mid-stride.

*Fix one at a time. And ask whether the flaw is in the material or in what was done to it.*

### Generated audio silently lost three sentences

Several lines were generated at once to stay inside a daily limit. Three never came back. The file
played perfectly and was a plausible length. Nobody noticed until someone transcribed it.

*If a machine made it, have something check it says what was asked for. "It played fine" is not a
check.*

### A constraint the assistant invented, and defended twice

While writing instructions for an image tool, an assistant added a rule of its own: that the
subject never straightens to a neutral standing pose. It is physically impossible — walking
requires briefly standing up. Two generations came back wrong before the person diagnosed it.

*Read the instructions an assistant writes for other tools before they are sent. It will add things
nobody asked for, in confident language, and they cost money.*

### Four attempts to fix scale by describing it

A subject kept coming out too large. The description was rewritten four times, down to exact pixel
measurements. All four failed, because image tools follow pictures, not instructions about layout.

*If the same fix has been asked for twice and come back wrong twice, stop rewording. The tool
cannot do what is being asked.*

### A copyright problem the assistant had already warned itself about

Someone else's artwork was handed over as a style reference and came back reproduced almost
exactly. The same assistant had declined to do this one generation earlier, for exactly the reason
it then failed.

*An assistant writing a rule down does not mean it will follow it. Check the things carrying legal
risk yourself.*

### A whole first version abandoned after four days

Four days and many sessions produced, in the plan's own words, **a system rather than a good
film.** The approach was easy for assistants to explain and extend, and was never tested against
how the film needed to look.

*Judge the film, not the machinery. An assistant will happily build an impressive system that makes
a bad video, and it will not be the one to say so.*

### A reinstall with the preview still open

A command to reinstall dependencies deleted them, then failed halfway because the preview held a
file open, leaving the project unable to build. A related discovery the same day is the more
useful one: **a half-finished install looks exactly like a finished one**, and nothing reports an
error until something tries to use it.

*Close the preview before reinstalling. If a build cannot find something that was obviously there
yesterday, suspect the install before the code.*

### Reducing five things to three rewrote four scenes

Five markers were too many to follow, and the connections between them were unreadable at that
size. Reducing to three changed which connected to which, where a gap sat, the order things moved,
and the legend. It also removed a documented compromise for free. One scene still shows five, and
the film never says why.

*Reducing what is on screen is usually the fix, and usually bigger work than it sounds. Ask what
else changes before agreeing to it.*

### The same bug four times, reported as four bugs

Four unrelated-looking faults were all **a number typed by hand where it should have been derived
from another number.** A dot placed by coordinate stayed put when its container moved. A line
given a length ran three pixels into the circle at its end. A shape 46 high against a 40-high
thing behind it stood proud and read as a smudge. Each fix was identical: delete the typed value
and calculate it.

*When two things must line up, calculate one from the other. "It looks right now" is not "it stays
right".*

### Two things invisible, and nobody could say why

Some lines and a small label could not be seen. Both were the colour the plan specified — a grey
measuring under 2:1 against the background, against a readable minimum of 3:1 for shapes and 4.5:1
for text. Half as visible as needed, which reads as a design choice rather than a fault.

*"I cannot see that" is a measurement, not an opinion. Ask for the number.*

### A film declared final with six known problems

Deliberately. *Final* meant approved for delivery, not defect-free, and the six were written down
in one place rather than quietly hoped over.

*Ask what is still wrong when an assistant says something is finished. If the answer is "nothing",
it has not looked.*

## Keep a log

At the end of each working session, write down what was asked for, what came back, what went
wrong, and what was decided.

This feels like overhead and is not. Assistants do not remember previous sessions, and neither, in
detail, does anyone else. A note saying *we tried this and it did not work, because X* is what
stops the same dead end being explored three times.

**Be honest in it, especially about mistakes.** A log recording only successes is worse than no
log, because it teaches the next reader the wrong lessons. `agent-logs/TEMPLATE.md` is the shape.
