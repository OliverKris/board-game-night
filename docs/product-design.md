# Product Design

This document is about the *idea* of the product — what it should feel like to use, and what makes it worth building — not what's currently implemented. For implementation status and schema, see the codebase and `schema.dbml` directly.

## The core idea

Most people's board game hobby is capped by their existing friend group. This app exists to break that cap: help people find others nearby — new friends, casual acquaintances, or just fellow hobbyists — to actually play with, at whatever scale feels right, from a single one-off game night to a standing weekly group to a full community event.

## Onboarding

When a user first joins:

The first few minutes with the app should leave it genuinely useful, not just set up. Onboarding walks a new user through:

- **Creating an account** — the basics.
- **Sharing their location** — so everything downstream (matches, groups, events) can be grounded in "near me," not a global list.
- **Telling the app about their games** — both what they *own* (so they can host) and what they *want to play* (so they can be matched even without owning it themselves). These are meaningfully different signals and the app should treat them that way, not conflate them.
- **Describing their taste** — the kinds of games they gravitate toward (strategy, party, co-op, etc.), so recommendations and matches feel personal rather than generic.
- **Saying what kind of gathering they're looking for** — a couple of close friends around a table, a local game store's open night, or a bigger organized event. Someone looking for a quiet two-hour strategy session with three people has a different goal than someone looking to show up to a bustling store event, and the app should let them say so up front.
- **Sharing their availability** — so the app can actually suggest things that fit someone's real schedule, not just their interests.
- **Making the profile their own** — a bio, a photo, a sense of personality, since this is a social app first and a scheduling tool second.

## The feed

Beyond utility, the app should feel alive. A feed of posts, photos from game nights, and ratings/reviews of games people have played gives the platform a social heartbeat - a reason to open the app even on a week with no event planned. It's where "I just discovered this amazing game" or "our group had a great time last night" lives, and it's what makes the platform feel like a community rather than a scheduling utility.

## Finding groups

This is arguably the single most important feature area. 

### Groups of every size

Users should be able to search and filter for groups by size - a cozy 2-4 person weekly game night is completely different experince than a 20+ person open club night, and the discovery experince should make that distinction obvious and filterable, not bury it.

### Not all gatherings are the same shape

The app should recognize (and let users filter by) at least three distinct kinds of gatherings, because they carry different expectations:

1. **One-time, spontaneous meetups** - a small group of people, often strangers or new acquaintances, come together for a single game night with no expectations of it repeating. Low commitment, easy to say yes to.
2. **Recurring groups** - a standing weekly (or otherwise regular) game night, usually organized by an individual user who wants the same core group to keep coming back. This is about building an ongoing habit and community.
3. **Largger, organized events** - hosted by clubs or local businesses (game stores, cafes), open to the wider community, often bigger and more public than a perosnal group. These carry a different tone - less "hanging out with friends," more "showing up to a community event."

## Two ways to find people

The app should support two different paths to finding a group, because they suit different moods and different users:

- **Browsing premade group listings** - someone (or some business) has already posted "we're looking for two more for our Tuesday Catan night," and users browse and request to join something thats already has shape.
- **Direct discovery of people nearby** - rather than joining something premade, a user can be matched directly with individuals in their community based on overlapping game collections, preferences, and availability. This is for someone who doesn't want to join an existing group so much as meet specific new people and see where it goes.

## Matching philosohpy

Whether it's a one-time meetup or a recommendation of who to invite to a recurring group, matching should feel like it actually knows the user - not just "anyone who owns the game," but someone whose taste, schedule, and proximity line up.

## Ideas for later

- **Recommendation nudges** - surfacing things like "three of your friends loved this game" to make discovery feel social rather than algorithmic.
- **Event check-ins / history** - a lightweightt record of games played and people met, so the app becomes a kind of personal log of the user's board gaming life over time.
- **Notifications** - timely nudges when a match is found, a group has an opening, or an event is coming up, so the app is useful without needing to be checked constantly.
- **Browsing games themselves** - letting users explore and filter the game catalog (by category, complexity, player count) as its own discovery surface, independent of finding people - useful for someone deciding what to buy or bring to a night, not just who to play with.
- **Trust and familiarity signals** - letting users prefer matching with friends-of-friends or people who share a group in common, so meeting strangers still feels a little less like meeting strangers.
