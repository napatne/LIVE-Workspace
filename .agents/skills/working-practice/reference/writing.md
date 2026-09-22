# Writing that the next reader can use

Notes in code, and documents like a storyboard or a plan, get read by people who were not in the
conversation that produced them — and by agents with no memory of it. Three habits make that
reading work.

## State the rule, not the correction

At the end of a working session, the freshest thing in mind is usually a decision that was just
made, often after something was tried and dropped. The natural note to write is the correction:
*do not do the thing we stopped doing.*

The next reader does not have the thing. They have a sentence telling them not to want something,
which gives them nothing to act on and hints at a trap they cannot see.

Write the rule and the reason together:

> Torn edges read as handmade; cut edges read as machine-made. Keep hands and paper torn, keep
> interface elements cut. It does the work narration would otherwise do.

That can be used immediately by someone who has just arrived.

Where a warning is genuinely load-bearing — a value that looks wrong and is correct, a change that
breaks something non-obvious — keep it, and explain the mechanism rather than the history:

> This value is the length of the on-screen progress bar, not the length of the scene. They differ
> because the video pauses partway through, and a bar that matched the scene would sit at the end
> at the moment the video stops.

That is still a warning, and it teaches how the thing works instead of referring to an argument
the reader was not part of.

**Check —** read the note as someone who arrived today. If it only makes sense as a reply, rewrite
it as the rule.

## Use the vocabulary that exists, and define it once

A word invented while working spreads into everything written after it. The next reader meets it
with no definition, infers one, and is sometimes right.

Three things before a new term enters a filename, a heading or a value:

1. **Search for it.** If it is already used here, use it the way it is already used.
2. **Check it is not taken for something else.** A word meaning two things in one project reads as
   understood and is not.
3. **If it is new and needed, define it in one sentence where it first appears** — including when
   it looks obvious.

Terms borrowed from a craft are worth using, because they are shared outside the project, and
worth defining anyway, because the reader may not have that craft.

A memorable phrase is the worst case: it compresses a real lesson into something that sounds like a
principle, travels faster than the lesson, and turns out to be false when read literally. Say the
thing plainly instead.

## Intent at the head, measurements at the foot

A document about work in progress holds two kinds of content, and they belong in different places.

**At the head:** what was settled before the work started — resolution, frame rate, whether there
is sound, the safe area, the scenes, the beats, the intent — plus the tentative scope, marked
tentative.

**At the foot, appended and dated:** what has since been measured, decided, rejected or changed.

Editing a measured figure up into a heading causes two problems. The document begins to read as
though the measurement came first and the work was made to fit it, which is not how it happened,
and which misleads anyone using the document as a model for their own project. And the figure goes
stale quietly, because a number in a heading is a number nobody re-checks.

Appended notes avoid both. They carry their own date, they sit under the text they replace, and
the replaced text stays readable as the record of what was thought before.

**Check —** before editing a figure into the head of a document, ask whether it belongs at the
foot with a date instead.

## Keep the text you replace

Where a description is superseded, keep the old one underneath the new one and say what replaced
it and when.

It costs a few lines and answers the question the next reader is about to ask, which is whether a
direction was considered and dropped or simply never thought of. Ideas get re-proposed as new ones
otherwise, and the second attempt costs as much as the first.

## Correct documents in the open

Where a document disagrees with the thing it describes, the thing that exists is what is true. Which
one gets corrected — the document or the work — is the person's decision. Report the contradiction.

Where a document is corrected, say so, in the report and in the document. A document quietly
brought into line with reality destroys the evidence that it was ever wrong, and that it was wrong
is usually the more useful fact.
