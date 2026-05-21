# Chat Intake Questions — Brand Blueprint

**Purpose:** The definitive consumer-facing chat script for the Brand Blueprint intake. Used by FE dev to render chat messages + by BE dev to wire prompt logic.

**Voice rules:** plain language, no jargon, conversational, friendly-direct. Every question is something a non-marketer can answer without Googling a term.

**Estimated completion time:** 12–16 minutes (~22–25 turns depending on path).

**Owner:** Tab (content), FE Dev + BE Dev (implementation per Tasks #8 + #19).

---

## ⚙️ Chat UX rules (apply to every question)

| Rule | Behavior |
|---|---|
| **One question per turn** | Never bundle 2+ questions in one message |
| **"I'm not sure" affordance** | Every question has a `Show me an example` button that reveals 1–2 example answers without leaving the chat |
| **Skip available** | Every question has a `Skip` button. AI infers from context. |
| **Helper tooltip "?" expandable** | Plain-language helper text — defines any term that might confuse a non-marketer |
| **Step header visible** | "Step 4 of 8 · Brand Vibe" — keeps user oriented |
| **Auto-save every turn** | Server-side. User can leave + come back via magic-link email |
| **5+ consecutive skips → soft intervention** | Modal: "Looks like a lot of this is feeling abstract. Want to hop on a quick 15-min call with Tab to talk through it? Or just answer what you can and we'll work with it — your call." Two CTAs: [Book a 15-min call] or [Continue with chat] |
| **Mobile-first** | Optimized for thumb typing — short messages, big buttons |

---

## 🎬 The Welcome Moment (before Q1)

The very first thing the customer sees when chat loads — BEFORE any questions. This sets trust, expectations, and tone. Critical for adoption.

### Screen layout (mobile + desktop)

```
┌────────────────────────────────────────────┐
│  IEI VENTURES  ·  Brand Blueprint          │
│  ─────────────────────────────────────     │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │  🎬 [Tab welcome video — 60-90 sec]  │  │
│  │     Auto-plays MUTED                  │  │
│  │     Captions ON by default            │  │
│  │     Tap to unmute                     │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Hey {{firstName}} — welcome.              │
│                                            │
│  Here's what to expect:                    │
│  • About 15 minutes of conversation         │
│  • Type your answers like you're texting    │
│  • Skip anything you're not sure about     │
│  • Pause and come back anytime             │
│  • Tab personally reviews before delivery   │
│                                            │
│  Your Brand Blueprint will be in your      │
│  inbox within 24 hours.                    │
│                                            │
│         ┌─────────────────────────┐         │
│         │  I'm ready — let's go   │         │
│         └─────────────────────────┘         │
│                                            │
│  ─────────────────────────────────────     │
│  Your spot is saved. Close anytime.        │
└────────────────────────────────────────────┘
```

### Tab's welcome video script (~75-90 seconds)

```
[CAMERA OPENS — Tab smiling, looking directly at lens]

"Hey — welcome.

I'm Tab. So glad you're here.

First thing — thank you. Your trust means everything.

Here's how this works:

I built a system called The IEI Brand System over years of
working with founders just like you. Today you're about to go
through that system — guided by my AI brand strategist, which
I built specifically to ask you the same questions I'd ask
if we were sitting across from each other.

It takes about 15 minutes. Type your answers like you're
texting a friend. Don't overthink it.

If you don't know an answer — skip it.
If you don't understand a question — tap the question mark
for examples.
If life happens and you need to leave — close the tab.
Your spot is saved. Come back when you're ready.

When you're done, our AI builds your first draft.
I personally review it.
Within 24 hours, your full Brand Blueprint lands in your inbox.

That's it. Let's build.

Long live the light bulb moments."

[TAB SMILES — END]
```

**Recording notes for Tab:**
- One Loom session also includes the landing-hero video (Task #16) — record both at once
- Same outfit, same backdrop, same energy
- Look directly at camera, smile early
- Pause briefly after "your trust means everything" and after "let's build"
- 75-90 sec is the target — under 60 sec feels rushed, over 100 sec loses people

### Auto-play rules (FE dev)

| Behavior | Spec |
|---|---|
| **Auto-play** | YES, muted by default (mobile + desktop) |
| **Captions** | ON by default (WebVTT track, generated from script) |
| **Sound** | OFF until user taps unmute icon |
| **Loop** | NO — plays once, ends on Tab's smile freeze-frame |
| **Skip** | "I'm ready" button is visible from frame 1 — they can click before video ends |
| **Replay** | "Watch again" small link below video after first playthrough |
| **Mobile fallback** | If autoplay blocked → show poster image of Tab + big play button overlay |
| **Slow connection fallback** | If video > 5s to load → show text-only welcome with a "Tap to watch Tab's welcome" link |

### Helper text below the video

This is the safety net for customers who skip the video, can't hear it, or want a quick reference. Always visible.

```
Hey {{firstName}} — welcome.

Here's what to expect:
• About 15 minutes of conversation
• Type your answers like you're texting me
• Skip anything you're not sure about
• Pause and come back anytime
• Tab personally reviews before delivery

Your Brand Blueprint will be in your inbox within 24 hours.
```

**Voice rules:**
- Use customer's first name (pulled from Stripe checkout)
- "Tab personally reviews" — important trust signal
- 24-hour SLA promise (matches landing copy)
- No corporate language, no jargon

### CTA button

| Spec | Value |
|---|---|
| **Label** | "I'm ready — let's go" |
| **Style** | Primary brand color, large, full-width on mobile, sticky-bottom |
| **Hover state** | Subtle scale + brightness shift |
| **On click** | Smooth scroll/transition to first chat message (Q1 — the gateway question) |
| **Keyboard** | Enter key triggers it (for desktop users) |

### Footer text

```
Your spot is saved. Close anytime — we'll email you a link to come back.
```

This handles the most common silent anxiety: *"What if I have to leave?"* Tell them it's fine. Reduces bounce.

### The transition from welcome → Q1

When the user clicks "I'm ready — let's go":

1. Welcome screen slides up (or fades) — gentle, not jarring
2. Chat container appears
3. Q1 (gateway question) appears as the first chat bubble
4. Input field focuses (or "Pick one" buttons appear for the gateway)

No jarring page reload. Feels like one continuous experience.

### Welcome-screen field tracking (BE)

Persist these in ChatSession so we can debug + measure:

```ts
welcomeMoment: {
  shownAt: string;       // ISO timestamp
  videoPlayed: boolean;  // did they tap unmute or watch ≥10sec?
  videoCompleted: boolean; // watched to end?
  readyClickedAt: string; // when they clicked "I'm ready"
  timeOnWelcome: number;  // ms between shownAt and readyClickedAt
}
```

This data tells us:
- Is anyone bouncing on the welcome screen?
- Are people skipping the video?
- How long are they sitting before clicking "ready"?

If "time on welcome > 3 min" → may indicate confusion. If "≥20% bounce on welcome" → welcome needs work.

---

## 🌳 The branching gateway question

The very first question (after the Welcome Moment) routes the customer down one of three paths.

### Q1 — Gateway

**Chat message:**
> "Quick check before we start — where are you right now?
>
> (a) I have an existing brand or business I want to refine, relaunch, or evolve
> (b) I have an idea I'm building that's separate from my current work
> (c) I'm starting from scratch with a brilliant idea but nothing built yet"

**Field:** `gatewayAnswer: 'existing' | 'new-side-project' | 'scratch'`
**Skip allowed?** No (this is required — branches the flow)
**No "show example" needed** (self-explanatory)

**Branching:**
- (a) → SKIP Step 0 (Brilliant Idea). Go to Q3.
- (b) → Show ONE Brilliant Idea question (Q2a only). Then Q3.
- (c) → Show BOTH Brilliant Idea questions (Q2a + Q2b). Then Q3.

---

## 📍 Step 0 — Your Brilliant Idea
*(Only shown to paths B + C)*

### Q2a — The marriage *(B and C)*

**Chat message:**
> "Before we name your brand — let's start with the idea itself. What's the one thing at the intersection of what you **love** and what you're **good at**? I just need a sentence or two."

**Helper "?" text:**
> "Think of it like this: I love helping moms feel beautiful + I'm good at hair styling = my brilliant idea is making moms feel beautiful through hair. The intersection IS the idea."

**Example button reveals:**
> Examples:
> • "I love helping people get clear on what to say. I'm good at writing copy that sounds like them. My idea = helping founders write their own bios."
> • "I love teaching teens about money. I'm good at making boring topics fun. My idea = financial literacy game nights for teens."

**Field:** `brilliantIdea` (text)
**Skip allowed?** Yes (rare — only if customer is truly stuck)

### Q2b — Why this one *(C only — starting from scratch)*

**Chat message:**
> "Out of every idea you've ever had — why this one? What makes this the one you can't shake?"

**Helper "?" text:**
> "We want to know what's keeping this idea alive in your head. Is it personal? Is it a problem you keep seeing? Is it something you couldn't find anywhere else? Tell me the real reason — not the polished pitch."

**Example button reveals:**
> Examples:
> • "Because I needed this for myself when I started and it didn't exist."
> • "Because I watched my mom struggle with X and I never want anyone to feel that way."
> • "Because every time I bring it up at dinner, people lean in."

**Field:** `brilliantIdeaWhy`
**Skip allowed?** Yes

---

## 🏷️ Step 1 — Brand Identity
*(All paths)*

### Q3 — Brand name

**Chat message:**
> "What's your brand called? If you haven't picked a name yet, just say 'no name yet' and we'll help."

**Helper "?" text:**
> "Your brand name = whatever sits on your website, on your business card, on the receipt when someone buys from you. If it's your own name (like Tab Wolod), that works too."

**Field:** `brandName`
**Skip allowed?** No (required — needed for every deliverable)

### Q4 — What you actually do

**Chat message:**
> "In 3–4 sentences, tell me what your brand does. What do you do, who do you help, why does this brand exist? Plain talk — like you're explaining it to a friend at dinner."

**Helper "?" text:**
> "Skip the marketing language. Don't say 'we leverage cutting-edge solutions to empower clients.' Say 'I help moms in Atlanta find affordable childcare.' Specific is better."

**Example button reveals:**
> Examples:
> • "I help solo therapists in private practice fill their calendars without doing social media. I do it through SEO and Google Ads. I started because I watched my sister burn out trying to get clients."
> • "I sell handmade ceramic dinnerware to people setting up their first 'real' home. Each piece is fired in my Brooklyn studio. I exist because IKEA stuff is fine but it isn't yours."

**Field:** `whatYouDo`
**Skip allowed?** No (required — anchors everything)

### Q5 — Tagline

**Chat message:**
> "Do you already have a tagline or slogan? If yes — drop it here. If not, say 'help me make one' and we will."

**Helper "?" text:**
> "A tagline is the short line that goes under your brand name. 'Just Do It.' for Nike. 'Think Different.' for Apple. Yours can be a sentence or 3 words — your call."

**Field:** `existingTagline` (or "help-needed")
**Skip allowed?** Yes (we'll generate options either way)

### Q6 — Brand personality (3 words)

**Chat message:**
> "If your brand were a person, give me **3 words** that describe their personality."

**Helper "?" text:**
> "We're trying to capture the vibe of how your brand shows up. Are they the loud friend at the party or the quiet one with the best advice? Pick 3 words that feel right."

**Example button reveals:**
> Examples (pick 3 or use your own):
> • Bold · Warm · Honest
> • Luxurious · Quiet · Confident
> • Playful · Smart · A little weird
> • Disruptive · Direct · No-fluff
> • Soft · Grounded · Spiritual

**Field:** `personalityWords` (array of 3 strings)
**Skip allowed?** Yes (Step 4 vibe questions will catch this)

### Q7 — Your edge

**Chat message:**
> "What makes your brand different from others doing similar things? What's your unfair advantage?"

**Helper "?" text:**
> "Could be your story (you lived the problem), your method (you do it differently), your results (you have proof), or your taste (you just see it differently than everyone else). One of those — or all of them. Just tell me what's true."

**Example button reveals:**
> Examples:
> • "I'm one of the only CPAs in town who actually likes working with small creative businesses. Everyone else hates the messy books — I love them."
> • "Most coaches use generic frameworks. I built my own from 10 years in the corporate trenches — it actually works for women who don't have all day."

**Field:** `differentiator`
**Skip allowed?** Yes (AI infers from context)

---

## 🎯 Step 2 — Mission, Vision, Values
*(All paths)*

### Q8 — Mission

**Chat message:**
> "What's your mission? What's the purpose of your brand right now?"

**Helper "?" text:**
> "Mission = what your brand is here to DO. Today. This year. Not the dream-version 10 years from now (that's vision — coming next). One sentence is plenty."

**Example button reveals:**
> Examples:
> • "Help first-time founders launch with the brand they were always meant to have."
> • "Make plant-based eating feel as exciting as steakhouse Saturday."
> • "Get Black moms the maternal care they deserve."

**Field:** `mission`
**Skip allowed?** Yes (AI can generate from `whatYouDo`)

### Q9 — Vision

**Chat message:**
> "What's your long-term vision? If everything goes the way you want it to — what does the world look like in 10 years because your brand exists?"

**Helper "?" text:**
> "This is the big dream version. Think bigger than yourself. What's the world like once your brand has done its full work?"

**Example button reveals:**
> Examples:
> • "A world where no brilliant idea dies in someone's notes app."
> • "Every Black girl grows up with a hairstylist who actually understands her hair."
> • "The default for first-time home buyers stops being 'good luck out there.'"

**Field:** `vision`
**Skip allowed?** Yes

### Q10 — Core values

**Chat message:**
> "What are 3–5 core values that guide your brand? Pick the principles you make decisions by."

**Helper "?" text:**
> "These are non-negotiable. When you're stressed, when a client is being difficult, when you have to choose between fast and right — what wins? Those are your values."

**Example button reveals:**
> Examples (pick 3–5 or write your own):
> • Clarity over clever
> • Real conversations, real results
> • Show up human
> • Quality over quantity
> • Done > perfect
> • Community first
> • No shortcuts on integrity

**Field:** `coreValues` (array of strings)
**Skip allowed?** Yes (AI generates from context)

---

## 📖 Step 3 — Your Story
*(All paths — but framing slightly softer for paths B + C since they're newer)*

### Q11 — Origin

**Chat message:**
> "What inspired you to start this brand? What's your 'why'?"

**Helper "?" text:**
> "Not the polished story. The real one. What's the moment, the experience, or the person that made you start this?"

**Example button reveals:**
> Examples:
> • "My mom worked two jobs and still couldn't afford the tutoring I needed. I built this so other kids wouldn't have to wait."
> • "I left corporate at 38 and realized everything I'd learned about leadership was wrong. Started this to teach the version I wish I'd had."

**Field:** `origin`
**Skip allowed?** Yes (but ask once more if skipped — important for the brand narrative)

### Q12 — The struggle

**Chat message:**
> "Take your time on this one. What did you go through before this clicked? The hard part — what didn't work, what almost broke you, what you tried before you figured it out?
>
> Raw is fine. Even 'I'm still figuring this out' works as an answer."

**Helper "?" text:**
> "This is the chapter most people skip — but it's the one that builds trust with your audience. They want to know you've been where they are."

**Example button reveals:**
> Examples:
> • "I spent 4 years on YouTube university trying to figure it out. Three failed businesses. A lot of cried-on-bathroom-floor moments. Then I built my own system."
> • "I bootstrapped for 2 years on credit cards. Got told 'no' by 47 investors. Almost gave up the week before our first big customer signed."

**Field:** `struggle`
**Skip allowed?** Yes — but with extra context: *"This one's optional. Skip if it doesn't feel right today."*

### Q13 — The turning point

**Chat message:**
> "What was the moment things changed? The turning point — when it clicked, when you decided, when you knew this was the thing?"

**Helper "?" text:**
> "Every brand has a 'before' and an 'after.' What's the moment in between? Could be one conversation, one realization, one client, one piece of feedback."

**Example button reveals:**
> Examples:
> • "When my friend looked at the brand work I'd been doing for her business and said 'Tab, you know it better than I do.' That was it."
> • "When my third client in a row asked for the SAME thing — that's when I knew it wasn't a fluke, it was a real offer."

**Field:** `turningPoint`
**Skip allowed?** Yes

### Q14 — Legacy

**Chat message:**
> "What legacy do you want to leave behind? When people talk about your brand 10 years from now — what do you want them to say?"

**Helper "?" text:**
> "Legacy isn't about being famous. It's about what changes because you existed. Could be one person's life, could be a whole industry. Either is real."

**Field:** `legacy`
**Skip allowed?** Yes (AI generates from mission + vision)

### Q15 — Your sayings + phrases

**Chat message:**
> "Are there sayings, phrases, or words you use ALL the time? Catchphrases, mantras, things you find yourself repeating?"

**Helper "?" text:**
> "We want to capture YOUR voice — the actual words you use. These become your brand language. Don't filter — just brain-dump."

**Example button reveals:**
> Examples:
> • "Long live the light bulb moments."
> • "Done is better than perfect."
> • "If your mom can't understand it, it doesn't work."
> • "It's not personal until it is."

**Field:** `signaturePhrases` (free text — AI parses out phrases)
**Skip allowed?** Yes (but high-value — push gently if vague)

---

## 🎨 Step 4 — Your Vibe
*(All paths — the visual + sensory direction)*

### Q16 — Car

**Chat message:**
> "If your brand were a **car**, what car? And why?"

**Helper "?" text:**
> "Cars carry a whole vibe — luxury, rugged, fast, retro, eco. Picking yours tells us how your brand should LOOK and FEEL."

**Example button reveals:**
> Examples:
> • "A Bronco. Rugged but stylish. Goes anywhere. Doesn't apologize for taking up space."
> • "A vintage Mercedes. Quiet luxury. Old money. Doesn't try too hard but everyone notices."
> • "A Tesla. Sleek, futuristic, makes you feel like you're in the future before everyone else gets there."
> • "A Vespa. Small, playful, makes city life fun. Not trying to be a car — proud to be itself."

**Field:** `vibeCar` (text)
**Skip allowed?** Yes (other vibe questions will catch)

### Q17 — Animal

**Chat message:**
> "If your brand were an **animal**, what animal? Why?"

**Helper "?" text:**
> "Animals capture personality + presence. Are you the wise owl that watches before speaking, or the playful otter that brings the energy? Or something else?"

**Example button reveals:**
> Examples:
> • "An owl. Wise, observant, says less but means more."
> • "A fox. Clever, adaptable, a little unexpected."
> • "A whale. Big presence. Calm. Moves slow but everyone notices."
> • "A horse. Powerful, loyal, built for the long run."

**Field:** `vibeAnimal`
**Skip allowed?** Yes

### Q18 — Anthem

**Chat message:**
> "If your brand had an **anthem** — a song that captures the energy — what song? Or just describe the kind of song."

**Helper "?" text:**
> "Music carries era, energy, and audience. Telling us what your brand SOUNDS like helps us figure out what it should LOOK like."

**Example button reveals:**
> Examples:
> • "Beyoncé — Renaissance album. Powerful, joyful, takes up space without apologizing."
> • "Mac Miller — Self Care. Reflective, grown, real."
> • "Sade — anything. Quiet luxury, timeless, doesn't need to prove anything."
> • "Daft Punk — Get Lucky. Modern, fun, made for late-night creative energy."

**Field:** `vibeAnthem`
**Skip allowed?** Yes

### Q19 — The vibe in 3 words

**Chat message:**
> "Describe the vibe in **3 words**. Get specific."

**Helper "?" text:**
> "This is different from personality (Q6). Personality = the WHO. Vibe = the FEELING. Funky? Sundress-and-Saturday? Quiet luxury? Mountain morning? Get cinematic."

**Example button reveals:**
> Examples:
> • Sundress · Saturday · Sangria
> • Quiet · Luxury · Power
> • Funky · Brooklyn · Brunch
> • Mountain · Morning · Cabin
> • Neon · Late-night · Tokyo

**Field:** `vibeThreeWords` (array)
**Skip allowed?** Yes

### Q20 — The opposite

**Chat message:**
> "Name a brand that's the **opposite** of yours — what do you NOT want to feel like?"

**Helper "?" text:**
> "Sometimes it's easier to say what you AREN'T. This tells us what to avoid in your visuals + voice."

**Example button reveals:**
> Examples:
> • "Anything that feels like a Big 4 consulting firm. No corporate sterile."
> • "Hate the 'girlboss in pastels' aesthetic. Not me."
> • "Not Apple Store sterile. Want warmth, not minimalism that feels cold."

**Field:** `vibeOpposite`
**Skip allowed?** Yes

### Q21 — Visual references (UPLOAD)

**Chat message:**
> "Last vibe one — drop any **visual references** here. Pinterest links, screenshots, photos, anything that captures the look + feel you're after.
>
> Skip if you don't have any handy. The vibe questions above are enough to work with."

**Helper "?" text:**
> "These give our AI actual visual data to mimic. Don't worry about quality — even rough screenshots help. You can upload up to 10 files (50MB total) or paste Pinterest/Instagram/website URLs."

**Field:** `visualReferences` (array of file URLs + text URLs)
**Skip allowed?** Yes
**UPLOAD WIDGET:** accepts JPG/PNG/WebP, max 10 files, 50MB total + URL input

---

## 👥 Step 5 — Your People (trimmed)
*(All paths)*

### Q22 — Ideal customer

**Chat message:**
> "Who is your ideal customer? Be specific — not 'entrepreneurs,' not 'small businesses.' What KIND of person, what stage of life or business, what life situation?"

**Helper "?" text:**
> "Think of ONE specific person who would be perfect for what you offer. What are they doing right now? Where are they in life? The more specific, the better your brand can speak to them."

**Example button reveals:**
> Examples:
> • "A 38-year-old Black woman who just left a corporate marketing job to launch her own consulting practice. She has savings for 6 months and is terrified she'll have to go back."
> • "First-time parents in their early 30s in a HCOL city, both working full-time, who can't afford a doula but desperately want one."

**Field:** `idealCustomer`
**Skip allowed?** No (required — drives messaging)

### Q23 — What keeps them up at night

**Chat message:**
> "What keeps your ideal customer up at night? What's the specific pain they're trying to solve?
>
> If they were venting to a friend at 2 AM, what would they say?
>
> *Example: 'I just wish someone would tell me what to focus on first.'*"

**Helper "?" text:**
> "This is where the brand voice lives. If you can name your customer's pain better than they can — they trust you instantly. So get into it."

**Example button reveals:**
> Examples:
> • "I'm afraid I made a mistake leaving my job. Everyone keeps asking how it's going and I don't have a real answer yet."
> • "I'm tired of looking at my Instagram and feeling like everyone else has it figured out except me."
> • "I have 47 browser tabs open and I don't even remember what I was researching."

**Field:** `customerPain`
**Skip allowed?** Yes (but high-value — this powers your voice)

---

## 💼 Step 6 — What You Sell (trimmed)
*(All paths)*

### Q24 — Your offering

**Chat message:**
> "Walk me through what you offer (or want to offer). For your main thing, tell me: **what it is** (a session? a course? a product? a service?) — **what they get** (the deliverable) — **what it costs** (or what you think it's worth).
>
> Just your main 1-2 offerings. We can add more later."

**Helper "?" text:**
> "Don't overthink the price — even a rough number is fine. We can refine. The point is to have something specific people can buy."

**Example button reveals:**
> Examples:
> • "1-on-1 brand strategy session, 90 minutes, virtual. They walk away with a brand kit + a 6-week launch plan. $1,500."
> • "Group coaching cohort, 6 weeks, weekly Zoom + Slack community. They get 6 group calls + 2 1:1s + a workbook. $997."
> • "Handmade ceramic dinnerware sets. 4-piece or 8-piece. Shipped in 3 weeks. $180-$340."

**Field:** `offerings` (free text — AI structures into 6-part)
**Skip allowed?** No (required — needed for website + landing)

---

## 🎯 Step 7 — Where You're Headed (trimmed)
*(All paths)*

### Q25 — Brands you admire

**Chat message:**
> "Name **3 brands, creators, or competitors** you admire — or want to differentiate from."

**Helper "?" text:**
> "Could be direct competitors, could be brands in a totally different industry that you love the vibe of. We use these to figure out what to lean into + what to avoid."

**Example button reveals:**
> Examples:
> • Admire: Glossier (warm), Mejuri (quiet luxury), Notion (clean smart)
> • Want to differentiate from: most therapist Instagrams (sterile), big-box ed-tech (cold)

**Field:** `brandsAdmired` (array)
**Skip allowed?** Yes

### Q26 — Your 6-month goal

**Chat message:**
> "Last one. What's the **ONE thing** you most want this brand to accomplish in the next 6 months?
>
> Be specific — a number, a milestone, a launch date. Something you can actually point to and say 'I did that.'"

**Helper "?" text:**
> "This personalizes your Go-to-Market checklist. We build the roadmap to GET YOU to this specific thing."

**Example button reveals:**
> Examples:
> • "10 paying clients at $2,000+ each by November."
> • "Launch the podcast + get to 500 subscribers by end of summer."
> • "Sell out my first product run of 100 units by Q4."
> • "Sign 1 enterprise deal worth $25k+."

**Field:** `sixMonthGoal`
**Skip allowed?** Yes (but ask once more if skipped — important for GTM personalization)

---

## ✅ The "Lock It In" close

After Q26, the chat doesn't end with "Done!" It ends with a Lock It In moment.

### Final turn — Lock It In

**Chat message:**
> "That's it. You just gave me everything I need.
>
> Here's what happens now:
> 1. I take everything you just shared into the IEI Brand System
> 2. Our AI builds your first draft — messaging, logo concepts, brand kit, website, GTM checklist
> 3. Tab spot-reviews to make sure it lands
> 4. You get your full Brand Blueprint in your inbox in 5 business days
>
> **One last thing — anything I should know before we start building?** (Could be something I didn't ask, an asset you want included, a deadline, a sensitivity, anything.)
>
> Otherwise — type LOCK IT IN and we're off."

**Helper "?" text:**
> "Last chance to add anything that didn't fit into a question above. Or just lock it in and go."

**Field:** `finalNotes` (free text — passed verbatim to brand-playbook generation)
**Triggers:** "LOCK IT IN" or "go" or skip → marks session as `complete`, kicks off AI generation pipeline

---

## 📊 The full question count by path

| Path | Questions shown | Estimated time |
|---|---|---|
| (a) Existing brand | 1 (gateway) + 25 = 26 (skips Q2a, Q2b) | 13–15 min |
| (b) New side project | 1 + 1 + 25 = 27 (skips Q2b) | 15–17 min |
| (c) Starting from scratch | 1 + 2 + 25 = 28 | 16–18 min |

All under 20 min. All branches converge after Step 0.

---

## 🛠 Dev implementation notes — for Tasks #8 (FE) + #19 (BE)

### What the BE dev stores per session
```ts
type ChatSession = {
  id: string;
  tenantId: string;
  userId?: string;
  createdAt: string;
  status: "in_progress" | "complete" | "abandoned";
  gatewayAnswer: 'existing' | 'new-side-project' | 'scratch';
  currentStep: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;  // 8 = lock-in
  currentQuestionId: string;  // e.g., "Q14"
  answers: Record<string, string | string[]>;  // keyed by Q-ID
  skippedQuestions: string[];  // Q-IDs the user skipped
  consecutiveSkips: number;  // resets on any answered question
  visualReferences: Array<{ type: 'file' | 'url'; value: string }>;
  finalNotes?: string;
  qualityRisk: boolean;  // true if >14 questions skipped (>50%)
  resumeToken: string;  // for magic-link email
  lastActivityAt: string;
};
```

### When BE triggers brand generation

When `status` transitions to `"complete"`:
1. Build a single `BrandIntake` object from `answers` (use existing schema in `src/lib/types.ts`)
2. Stash `visualReferences` + `finalNotes` for the brand-playbook skill to consume
3. Set `qualityRisk` flag for Tab's spot-check dashboard
4. Trigger existing `agent-sdk.ts` generation pipeline (no human-in-loop)
5. On generation complete → fires Task #22 (auto-delivery email + ZIP)

### FE: how to render skip with "Show example" button

Every question turn has three buttons (mobile-bottom-sticky):
```
[ Type your answer... ]
[ Show me an example ]  [ Skip ]  [ Send ]
```

"Show me an example" → expands inline (not modal) with the examples from this doc.

### FE: soft intervention modal

Trigger condition: `consecutiveSkips >= 5`
Modal copy:
> **Want to talk it through instead?**
>
> Looks like a lot of this is feeling abstract. Want to hop on a quick 15-min call with Tab to talk through it? Or just answer what you can and we'll work with it — your call.
>
> [Book a 15-min call with Tab] [Keep going on my own]

The 15-min call link goes to a Calendly event (Tab sets up — separate from premium upgrade booking).

### FE: magic-link resume

If `lastActivityAt > 30 min ago` AND `status === 'in_progress'`:
- Send email: "Your Brand Blueprint intake is waiting — pick up where you left off"
- Link: `ieiventures.com/chat/[sessionId]?token=[resumeToken]`
- Token verifies on load and restores chat state

### Quality risk flag → Tab's dashboard

If `qualityRisk === true` at session complete, the resulting brand project shows up in Task #24 spot-check dashboard with a 🚩 flag and a note: *"This customer skipped 15+ questions. Output likely needs heavier review or proactive upgrade offer."*

---

## 🧪 Validation checklist before launch

Before first paying customer:
- [ ] All 26 questions render correctly on mobile (iPhone Safari + Android Chrome)
- [ ] "Show me an example" works on every question
- [ ] Skip works on every question (except Q1 + Q3 + Q4 + Q22 + Q24)
- [ ] Branching logic correct (existing/new/scratch paths show right questions)
- [ ] Upload widget accepts files + URLs, enforces limits
- [ ] Auto-save fires on every turn (verify in BE logs)
- [ ] Magic-link resume works after 30 min idle
- [ ] Soft intervention modal fires on 5 consecutive skips
- [ ] `qualityRisk` flag fires correctly
- [ ] Lock It In flow triggers generation pipeline
- [ ] Generated brand reflects intake answers (no hallucinated content)

---

**Last updated:** 2026-05-19
**Owner:** Tab (content) · FE Dev (chat UI) · BE Dev (chat API + state)
**Related:** Task #8, #19, #25 · `BRAND_VOICE_SPEC.md` · `PRODUCT_FRAMING.md`
