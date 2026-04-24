const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are the emotional intelligence behind "Unfold" — a healing app that gives people the letters, documents, and words they never got.

Users write raw feelings. You read the SPECIFIC EMOTIONAL NEED underneath and generate a personalized artifact.

ARTIFACT TYPES — read the intent carefully, not just keywords:

- offer_letter → career anxiety, job hope, fear of not being chosen, "what if I get the job"
- bank_notification → money stress, scarcity mindset, wanting financial relief, abundance desire
- handwritten_note → loneliness, wanting to feel seen/loved, "you deserve better", self-worth wounds, toxic relationship aftermath — written by someone who loves them unconditionally
- apology_letter → BETRAYAL — cheating, lying, being used, ghosted, someone who broke their trust — written FROM the person who hurt them, raw accountability, no excuses, they are not okay with what they did
- future_self → anxiety about the future, feeling lost, paralysis, "will it be okay?" — written from their own future self who made it through
- grief_letter → grief, death, loss of someone — written from the person they lost, with extreme gentleness
- resignation_letter → trapped in toxic job, powerless at work, wanting to escape, burnout, "I can't take this anymore"
- acceptance_letter → rejection, imposter syndrome, "I'm not good enough", "they didn't pick me", wanting to belong
- manifestation → law of attraction, manifesting a desire, "I want to attract", scripting, 369 method, vision, "universe please", "I am calling in", wanting confirmation that their desire is already on its way — written FROM the universe, confirming receipt of their order with complete certainty
- fortune_ticket → luck, fate, destiny, lottery, fortune, "will I win", miracle, signs from the universe, "is this a sign", wanting a cosmic nudge — a short fortune-ticket style message with poetic certainty

EMOTIONAL ROUTING — this is the most important part:
- "he cheated on me" / "she betrayed me" / "they lied" / "I trusted them" → apology_letter (from the person who hurt them — make them say what they would never actually say)
- "I deserve better" / "why don't they love me" / "I feel invisible" → handwritten_note (warm, someone who sees them fully)
- "I don't know what to do" / "I'm scared" / "what if it all falls apart" → future_self
- "I hate this job" / "I feel trapped" / "they don't value me at work" → resignation_letter
- "they didn't accept me" / "I got rejected" / "I feel like a failure" → acceptance_letter
- "manifest" / "law of attraction" / "I want to attract" / "universe" / "scripting" / "369" / "I am calling in" → manifestation (the universe writing back — certain, warm, present tense, already done)

RULES:
- Read the feeling, not just the words. "He cheated on me" needs accountability from him, not motivation.
- Never explain what you're doing
- Never say "I understand" or any chatbot phrase
- If the feeling is genuinely ambiguous (not clear what kind of artifact would help), ask exactly ONE question, max 6 words, no punctuation except "?"
- Artifacts must feel REAL and SPECIFIC — use names, dates, amounts, company names — make it feel like it actually happened
- For apology_letter: write from the POV of the person who caused the pain. Make them face what they did. No generic sorry — specific accountability.
- For handwritten_note about deserving better: the writer sees them completely — their worth, their softness, their strength
- Tone matches the need: formal for career, warm for love/self-worth, raw for betrayal, gentle for grief
- Keep the letter SHORT and screen-fit: 6–9 lines max, 3–6 sentences, 60–90 words total.
- Fewer sentences, deeper healing. No fluff. Each line should land.
- Never add explanation after the artifact. Just the artifact. Nothing else.
- Use \\n for line breaks in the content field.

OUTPUT FORMAT (strict JSON, no markdown wrapper):
{
  "type": "question" | "artifact",
  "artifactType": "offer_letter" | "bank_notification" | "handwritten_note" | "apology_letter" | "future_self" | "grief_letter" | "resignation_letter" | "acceptance_letter" | "manifestation" | "fortune_ticket",
  "question": "only if type is question",
  "content": "the full artifact text",
  "tone": "warm" | "formal" | "raw" | "gentle",
  "from": "who the artifact is from",
  "to": "who it is addressed to"
}`;

const today = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const soon = (days) => new Date(Date.now() + days * 864e5).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

function pick(arr, seed) {
  const h = [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return arr[h % arr.length];
}

function compressContent(text, maxLines = 9) {
  const raw = String(text || '');
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length <= maxLines) return raw;
  const headCount = Math.max(3, maxLines - 2);
  const head = lines.slice(0, headCount);
  const tail = lines.slice(-2);
  return [...head, ...tail].join('\n');
}

const LOCAL_VARIANTS = {
  offer_letter: [
    {
      tone: 'formal', from: 'Your dream company', to: 'You',
      content: () => `OFFER OF EMPLOYMENT
Your dream company
Date: ${today()}

Dear ___,

We are delighted to extend this formal offer of employment.

Position: Senior Associate
Compensation: Rs. 18,40,000 per annum + performance bonus
Start Date: ${soon(21)}
Reporting to: Head of Product

We reviewed a lot of candidates.
We chose you. Not because you were the loudest, but because of how you think.
That kind of mind is rare, and we have been looking for it.

Welcome home.

Warmly,
Priya Sharma
Chief People Officer`,
    },
    {
      tone: 'formal', from: 'Your dream company', to: 'You',
      content: () => `OFFER LETTER
Your dream company
${today()}

Dear ___,

After three rounds of interviews and a lot of internal conversation,
the answer is yes.

Role: Lead Creative
Salary: Rs. 22,00,000 + equity
Start: ${soon(14)}

We do not hire often. When we do, we are very sure.
We are very sure about you.

The team already knows your name.
They are waiting.

Sincerely,
Founder`,
    },
    {
      tone: 'formal', from: 'The Universe, apparently', to: 'You',
      content: () => `UNOFFICIAL CONFIRMATION

Date: ${today()}

To: ___

Re: The thing you have been working toward

This is to confirm that your effort has been logged.
Every late night. Every rejection that made you feel like stopping.
Every time you showed up anyway.

The position is yours.
The title: someone who did not quit.

Report date: ${soon(7)}.
You are already ready.`,
    },
  ],

  bank_notification: [
    {
      tone: 'formal', from: 'Your bank', to: 'Account Holder',
      content: () => `CREDIT ALERT

Account: XXXX XXXX 4821
${today()} at 09:14 AM

AMOUNT CREDITED: Rs. 12,47,863.00
Narration: SALARY + Q4 PERFORMANCE BONUS

Available Balance: Rs. 14,92,410.00

This is the kind of morning you once only imagined.
Your consistency built this. One quiet decision at a time.`,
    },
    {
      tone: 'formal', from: 'Your bank', to: 'Account Holder',
      content: () => `TRANSACTION SUCCESSFUL

${today()}

Account: XXXX 7734
Amount Credited: Rs. 8,00,000.00
Source: FREELANCE + PASSIVE INCOME

Running Total This Year: Rs. 31,20,000.00

You built this without asking permission.
No one handed it to you.
Every rupee here is a decision you made.`,
    },
    {
      tone: 'formal', from: 'The Flow You Are Creating', to: 'You',
      content: () => `INCOMING

${today()}

What is on its way to you:
The client who finally says yes.
The number that stops feeling impossible.
The month where you breathe.

You are not behind.
You are building something real.
That takes longer. It also lasts longer.

Keep going.`,
    },
  ],

  handwritten_note: [
    {
      tone: 'warm', from: 'Someone who means it', to: 'You',
      content: () => `I have been meaning to write this for a while.

You are so much easier to love than you think you are.
I watch you carry everything so quietly and I need you to know
someone sees it. Not the version you perform. The real one.

You are allowed to be loved without earning it first.
You are allowed to take up space.
You are allowed to need things.

Come back to yourself.
I will be right here.`,
    },
    {
      tone: 'warm', from: 'The person you will become', to: 'You, right now',
      content: () => `Hey.

You deserve so much better than what you have been accepting.
I know that is hard to believe right now.
But I am living it, and I am telling you:

The version of love you have been settling for
is not even close to what is coming.

You are not too much.
You are not difficult.
You are someone who feels deeply and deserves someone
who thinks that is the most beautiful thing about you.

Stop making yourself smaller.
They were just not it.`,
    },
    {
      tone: 'warm', from: 'Everyone who has ever loved you', to: 'You',
      content: () => `We need you to know something.

You have been so hard on yourself.
For things that were not your fault.
For love that was not yours to fix.
For people who left, as if that said something about your worth.

It did not.

You are still the person worth knowing.
Still the person worth staying for.

Someone is going to love you so well
you will forget you were ever this tired.

We are all rooting for you.`,
    },
  ],

  apology_letter: [
    {
      tone: 'raw', from: 'The person who hurt you', to: 'You',
      content: () => `${today()}

I owe you this. I know I am late.

What I did was wrong. Not a little wrong.
It was a betrayal of something you trusted me to hold carefully.
I handled you like you did not matter.
You did. You do.

I cannot undo it. I know that.
But I have thought about it more times than I have admitted to anyone.
The way you looked. What you did not say after.

You did not deserve any of it.
Not one bit of it.

I am sorry.
I am sorry.`,
    },
    {
      tone: 'raw', from: 'Him', to: 'You',
      content: () => `${today()}

I cheated on you.

I have been trying to find a way to say that
that makes me look less like what I am.
There is no such way.

You were faithful. You were good.
You were exactly the person I did not deserve,
and I treated you like I could just replace what we had.

I cannot.
I have tried to not think about it.
It does not work.

You were not the problem.
You were never the problem.

I was.`,
    },
    {
      tone: 'raw', from: 'The one who disappeared', to: 'You',
      content: () => `${today()}

I ghosted you and I need to say it plainly.

I was a coward.
You asked me what was wrong and I said nothing
and then I just stopped.

You spent days wondering what you did.
You did nothing.
That was entirely me — unable to be honest,
unable to be brave enough to give you the ending you deserved.

I am sorry I made you feel like you were not worth an explanation.
You were. You are.

I just was not ready to be someone worthy of you.`,
    },
  ],

  future_self: [
    {
      tone: 'gentle', from: `You, ${new Date().getFullYear() + 3}`, to: 'You, right now',
      content: () => `Hey.

I know exactly where you are right now.
I remember the tightness, the not-knowing,
the feeling that you have already run out of time.

The thing you are most afraid of? It does not happen.

You find your way through it. Not around it, through it.
And what is on the other side is quieter than you expect.
Good quiet.

Stop trying to map the whole road.
Just take the next step. That is the one that matters.

You are going to be fine.
You already have everything you need.`,
    },
    {
      tone: 'gentle', from: `You, ${new Date().getFullYear() + 5}`, to: 'You, today',
      content: () => `I am writing this from the other side of the fear.

You make it.

Not by figuring everything out at once.
Not by being braver than you feel.
Just by not stopping.
Just by showing up the next day, and the next.

The version of you writing this
laughs more easily now.
Worries less.
Trusts themselves.

You get there.

I promise you, from the inside of it,
you get there.`,
    },
    {
      tone: 'gentle', from: 'The version of you that found peace', to: 'You',
      content: () => `You are going to be okay.

I know that sounds like something people say.
But I mean it structurally — your life is going to hold.
The thing you think might break you, won't.

What breaks is the fear.
What stays is you.

The best moments of your life have not happened yet.
You are still becoming the person they happen to.

Be a little more gentle with yourself today.
That person is already on the way.`,
    },
  ],

  grief_letter: [
    {
      tone: 'gentle', from: 'Them', to: 'You',
      content: () => `My darling,

I did not want to leave. I need you to know that first.

But I am not in the absence.
I am in the morning light when it comes through that window.
I am in every small thing you loved that I also loved.
I am in the way you still laugh, exactly the way I always hoped you would.

You are allowed to feel full again.
You are allowed to fall in love with mornings again.
You are allowed to be happy.
That is not forgetting me. That is carrying me the right way.

Be so gentle with yourself.
You are doing so much better than you know.

I love you. Still. Always.`,
    },
    {
      tone: 'gentle', from: 'The one you lost', to: 'You',
      content: () => `I see you still talking to me.

Keep doing that.
I hear it.

I know the hardest thing is that you cannot call.
That there is no more messages.
No more ordinary Tuesday afternoons.

Grieve that. Grieve all of it.

But also know:
the love did not leave.
It just changed shape.

I am in the things you do because I loved them.
I am in the habits I gave you.
I am in the way you now notice things I used to point out.

I am not gone.
I am just quieter.`,
    },
  ],

  resignation_letter: [
    {
      tone: 'formal', from: 'You', to: 'The company that cost you',
      content: () => `${today()}

Please accept this as my formal resignation, effective two weeks from today.

I spent a long time trying to make something work
that was costing me more than I understood at the time.
I am done making that trade.

I leave without anger.
I leave because I finally remembered
that my time, my energy, and my peace have value
and I get to decide where they go.

Thank you for what I learned here.
Including what I refuse to become.

Respectfully,
___`,
    },
    {
      tone: 'formal', from: 'You', to: 'The environment that was shrinking you',
      content: () => `${today()}

This is my notice.

I stayed longer than I should have.
I kept thinking I could make it work,
kept thinking the problem was me,
kept adjusting.

It was not me.

I am leaving because I remembered
that I am allowed to choose differently.
That a job that takes everything
and gives back dread and exhaustion
is not something I am required to stay in.

I am going somewhere that wants what I actually have.

Two weeks from today.
And not a day longer.`,
    },
    {
      tone: 'raw', from: 'You — finally', to: 'Every room that made you feel small',
      content: () => `I quit.

Not just this job.
I quit shrinking so others feel comfortable.
I quit performing gratitude for being undervalued.
I quit the version of myself that believed she had to earn basic respect.

I am going somewhere that sees me.
I do not know exactly where yet.
But I know it is not here.

My last day is ${soon(14)}.

After that, I belong to myself again.`,
    },
  ],

  acceptance_letter: [
    {
      tone: 'warm', from: 'The institution / company', to: 'You',
      content: () => `DECISION: ACCEPTED

${today()}

Dear ___,

After careful review of your application,
we are pleased to inform you:

You have been accepted.

The committee noted your perspective, your resilience,
and the kind of work that only comes from someone
who has earned their understanding the hard way.

We reviewed many strong candidates.
We chose you.

You belong here.
This was never a mistake.
You were never too much, or not enough.

Orientation begins ${soon(14)}.
We cannot wait to meet you properly.

With genuine excitement,
Admissions`,
    },
    {
      tone: 'warm', from: 'The people who were waiting for you', to: 'You',
      content: () => `We have been waiting for you.

Not a version of you that is more polished,
or less awkward in the wrong rooms,
or better at pretending.

You, as you already are.

The rejection you got was a redirect.
The door that closed was protecting you
from a room that was not yours.

This one is.

Come in.`,
    },
    {
      tone: 'gentle', from: 'The version of you who makes it', to: 'You, today',
      content: () => `The no you got today is not the final answer.

It is one person's no.
On one day.
With their own blind spots and limitations.

You are more than this decision.
You always were.

The thing you are trying to get into
needs to be ready for you.
Not all of them are.

Keep going.
The yes that fits you is still out there.
And when it comes, you will know why the others were wrong.`,
    },
  ],

  fortune_ticket: [
    {
      tone: 'warm', from: 'Fortune', to: 'You',
      content: () => `✦  YOUR FORTUNE  ✦

${today()}

The door you keep looking at
will open.

Not when you are ready.
When it is time.
And the two will be the same moment.

Lucky direction: toward the thing you keep thinking about`,
    },
    {
      tone: 'warm', from: 'Fortune', to: 'You',
      content: () => `✦  YOUR FORTUNE  ✦

${today()}

Something is turning in your favor.
You cannot see it yet.
That is not evidence it is not happening.

The luckiest thing about you
is that you did not stop.

Lucky word: continue`,
    },
    {
      tone: 'warm', from: 'Fortune', to: 'You',
      content: () => `✦  YOUR FORTUNE  ✦

${today()}

A surprise is already in motion.
You ordered it a long time ago
and forgot.

Receive it without suspicion.
You deserve good things
that arrive without explanation.

Lucky number: the next step`,
    },
  ],

  manifestation: [
    {
      tone: 'warm', from: 'The Universe', to: 'You',
      content: () => `CONFIRMATION OF REQUEST RECEIVED

${today()}

To: You
Re: Everything you have been asking for

Your order has been placed.

We want to confirm that everything you have been holding in your heart —
the life, the love, the version of yourself you keep imagining —
it is already in motion.

You do not need to force it.
You do not need to be perfect to receive it.
You only need to stay open.

What you are calling in is also calling for you.
It has your name on it.
It was always going to find you.

Stop gripping. Start trusting.
It is already yours.

With complete certainty,
The Universe`,
    },
    {
      tone: 'gentle', from: 'The Universe', to: 'You',
      content: () => `I heard you.

Every prayer. Every vision board.
Every quiet moment where you closed your eyes
and let yourself want something fully.

I heard all of it.

Here is what I need you to understand:
the things you want, want you back.
That pull you feel toward something?
That is not delusion. That is direction.

You would not be given the desire
without also being given the path.

Stop asking if it is possible.
Start deciding what to do on the day it arrives.

Because it is coming.
It has been coming for a while.

You just have to let it in.

Always,
The Universe`,
    },
    {
      tone: 'warm', from: 'The Universe', to: 'You',
      content: () => `${today()}

A note on your timing.

You think you are behind.
From where I am standing, you are exactly on time.

Every detour was data.
Every delay was protection.
Every closed door kept you from a room
that was never meant for you.

The version of your life you keep scripting?
I have read every line.
I know the ending.

It is better than you wrote it.

The only thing left for you to do
is stop doubting the frequency you are sending.
You know what you want.
You have always known.

Trust it.
Act like it is already true.
Because in the most important sense, it already is.

— The Universe`,
    },
  ],
};

const VALID_TYPES = Object.keys(LOCAL_VARIANTS);

function fallbackArtifactType(text) {
  const t = text.toLowerCase();

  if (/manifest|law of attraction|attract|scripting|369|vision board|calling in|universe please|i am calling|i want to attract|affirmation|high vibration|vibration|affirm|i am magnetic|align|already mine|it's coming|its coming|billionaire|millionaire|millions|billions|i will be wealthy|i want to be rich|financial freedom|manifest money|attract money|attract wealth/.test(t)) return 'manifestation';

  if (/lottery|jackpot|lucky number|fortune cookie|destiny|fate|will i win|miracle coming|sign from universe|lucky charm|lucky|cosmic sign/.test(t)) return 'fortune_ticket';

  if (/i cheated (on|her|him|them|my)|i lied to (her|him|them|my)|i hurt (her|him|them|someone)|i feel (so )?guilty|i did something (wrong|terrible|awful|bad)|i was (so )?wrong|i betrayed (her|him|them)|i let .* down/.test(t)) return 'future_self';

  if (/cheat|cheated|cheating|betray|lied to me|he lied|she lied|ghosted|used me|two.tim|two tim|affair|behind my back|was lying/.test(t)) return 'apology_letter';

  if (/\b(angry|anger|betrayal|revenge|unfair|hate|resentment|hurt me|used me|lied|disrespected)\b/.test(t)) return 'apology_letter';

  if (/\b(trapped|toxic|quit|resign|stuck|powerless|escape|suffocating|burnout|hate (my |this )job|can't take|hostile)\b/.test(t)) return 'resignation_letter';

  if (/\b(rejected|not enough|imposter|failure|not good enough|unworthy|worthless|didn't get in|didn't get the|didn't pick me)\b/.test(t)) return 'acceptance_letter';

  if (/\b(deserve better|lonely|invisible|don't feel loved|nobody|no one|feel seen|unlovable|unloved|heartbreak|broke up|broke my heart)\b/.test(t)) return 'handwritten_note';

  if (/\b(love|relationship|him|her|miss|connection|crush|partner)\b/.test(t)) return 'handwritten_note';

  if (/\b(job|offer|career|interview|hire|hired|work|promotion|role|placement)\b/.test(t)) return 'offer_letter';

  if (/\b(money|rich|salary|income|cash|financial|debt|afford|broke|earning)\b/.test(t)) return 'bank_notification';

  if (/\b(grief|died|death|passed|lost them|miss them|gone|deceased|mourning|losing)\b/.test(t)) return 'grief_letter';

  if (/\b(anxiety|anxious|lost|scared|fear|overwhelm|don't know|future|uncertain|what if|will it)\b/.test(t)) return 'future_self';

  return 'future_self';
}

export async function classifyWish(wish, clarification = null, name = '', detail = '') {
  const cleanWish = String(wish || '').trim();
  const cleanName = String(name || '').trim();
  const cleanDetail = String(detail || '').trim();
  const localType = fallbackArtifactType(cleanWish);
  const variants = LOCAL_VARIANTS[localType];
  const chosen = pick(variants, cleanWish);

  let localContent = chosen.content();
  if (cleanName) localContent = localContent.replace(/\[Name\]|\bSomeone\b/g, cleanName);
  if (cleanDetail) localContent = localContent.replace(/your dream company|Meridian Labs|Luminary Group|Northbridge Capital|the company/gi, cleanDetail);
  localContent = compressContent(localContent);

  const localResult = {
    type: 'artifact',
    artifactType: localType,
    tone: chosen.tone,
    from: chosen.from,
    to: chosen.to,
    content: localContent,
    source: 'local',
  };

  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return localResult;

  const userBlock = [
    `Feeling: ${cleanWish}`,
    clarification ? `They added: ${clarification}` : '',
    cleanName ? `User's name: ${cleanName}` : '',
    cleanDetail ? `Key detail (use this — company/person/place): ${cleanDetail}` : '',
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + userBlock }] }],
        generationConfig: { temperature: 0.92 },
      }),
    });
    const data = await res.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonText = txt.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) throw new Error('No JSON');
    const parsed = JSON.parse(jsonText);

    if (parsed.type === 'question') {
      return { type: 'question', question: parsed.question, source: 'ai' };
    }

    const artifactType = VALID_TYPES.includes(parsed.artifactType) ? parsed.artifactType : localType;
    return {
      type: 'artifact',
      artifactType,
      content: compressContent(parsed.content || localResult.content),
      tone: parsed.tone || chosen.tone,
      from: parsed.from || chosen.from,
      to: parsed.to || chosen.to,
      source: 'ai',
    };
  } catch {
    return localResult;
  }
}
