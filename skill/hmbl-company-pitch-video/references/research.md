# Research: facts and vibe

Goal: know the company well enough to make a video that could only be about them. Facts make it accurate; vibe
makes it different. Spend real time on the vibe; it is the input every creative choice depends on.

Tools: Scrapling first (`scrapling extract get URL out.md`, plain Fetcher). LinkedIn: public
pages only, logged out, one page at a time (company page, founder profiles, their PUBLIC posts and articles); stop on
HTTP 999 or a login wall. `npx designlang <url> --full -o research/design` for brand tokens when the site is
JS-heavy. Never log in anywhere. Never invent a fact, a quote or a person.

## A. Facts -> `research/facts.md`

One line per fact, with its source URL or doc, grouped by the five takeaways:

| Takeaway | Look for | Where |
|---|---|---|
| What it does | One-sentence product, the job it replaces, the steps a user takes | Homepage, product page, YC page, launch post |
| Founders | Names, roles, schools (graduated or not), prior companies, exits, notable employers | YC founder bios, LinkedIn public profiles, team page, press |
| Difference | Who they're compared to, the moat in the founders' own words | Phone script, kickoff notes, launch post, interviews |
| Traction | Named customers (logos on their site), revenue speed, funding + investors, team size, growth | Site "trusted by", YC, job posts, press, brief |
| Where / how | City, in office or remote, stage | Job posts, brief |

Then a **Do not use** list: everything marked "to confirm", projections, anything from a single unsourced claim,
private customer data.

## B. Vibe -> `research/vibe.md`

Answer each with evidence (a quote, a hex, a URL), not adjectives alone.

1. **Their words.** Their tagline and the 5-10 phrases they repeat on the site and in posts. Plain or playful?
   Technical or business? Do they joke? (e.g. a sales-tools startup whose site keeps saying "precision" and mocks
   "spray and pray" sounds sharp and a little irreverent.)
2. **Founder voice.** Read the founders' recent public LinkedIn posts and any interviews or launch videos. Pull
   1-3 true, human details that show who they are (e.g. a founder post saying they went through YC twice and were
   20 the first time).
   These can become a beat in the video; quote them exactly or not at all.
3. **Brand look.** Palette as hexes (from CSS or designlang), display and body fonts, logo shape, image style
   (photo, 3D, flat illustration, screenshots, hand-drawn), light or dark site, density, motion on their site.
4. **The name and its world.** What the name or logo evokes, and visual metaphors that come from it
   (e.g. a company named after a bird suggests flight and its colour). Also metaphors from the product's job
   (e.g. "ten tools become one").
5. **Who they sell to and how it feels to be their customer.** Developers? Hospitals? Law firms? The video's
   energy should feel right to an engineer considering that world.
6. **Real visual material.** Product screenshots or demo videos on their site, founder photos (profile, stage,
   team, office), event photos, customer logos. Download what's usable to `assets/`.
7. **Energy in one line.** E.g. "scrappy repeat founders, fast and a little irreverent", or "careful clinical
   precision for regulated buyers". This sentence steers the concept, music and pacing.

## C. Gaps
List what you couldn't find. If a takeaway has no sourced fact (no revenue, no customer logos), the concept must
fill that beat with something true instead (team pedigree, investors, a launch milestone), never a guess.
