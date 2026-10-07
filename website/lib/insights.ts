export type InsightSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type InsightArticle = {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords: string[];
  sections: InsightSection[];
};

export const INSIGHTS: InsightArticle[] = [
  {
    slug: "how-long-to-form-a-habit",
    title: "How Long Does It Take to Form a Habit?",
    description:
      "It takes about 66 days on average to form a habit, not 21. Here is what the research says — and how to use Alavo while the habit is still forming.",
    date: "2026-08-19",
    keywords: [
      "how long to form a habit",
      "66 days habit",
      "Phillippa Lally",
      "habit formation",
      "daily habit tracker",
    ],
    sections: [
      {
        heading: "The short answer",
        paragraphs: [
          "Sixty-six days. That is the average from Phillippa Lally’s 2009 study at University College London. Participants chose a simple daily behaviour — drinking water with lunch, running, or a short stretch — and reported how automatic it felt over time. The average was 66 days. The range was 18 to 254 days.",
          "Simple habits (a glass of water with a meal) formed faster. Complex ones (daily exercise) took longer. Most people landed somewhere in the middle. If you have been told that 21 days is the magic number, that claim is older folklore, not this study.",
        ],
      },
      {
        heading: "Missing a day is not the end",
        paragraphs: [
          "The important part of Lally’s work is often skipped in social posts: missing one day did not significantly slow habit formation. Missing two days in a row did. Consistency matters more than perfection. That finding has been replicated enough times that it is safe to treat it as settled.",
          "This is why a good habit tracker should show more than a streak. A streak goes to zero after one miss. Your actual habit does not. Alavo keeps a Today checklist, week rings, and longer charts so one grey day does not look like a collapsed identity.",
        ],
      },
      {
        heading: "What to do in the first 66 days",
        paragraphs: [
          "Pick a time and keep it. Morning water, a 10-minute walk after lunch, or a journal entry before bed. Attach the new behaviour to something you already do. Open Alavo at that same time so the check-in itself becomes a cue.",
          "Track two habits, not seven. Every extra habit dilutes attention. Use the heatmap and 30-day completion view once you have Pro, or the free 30-day history while you are starting. Aim for showing up, not for a cinematic 66-day flame.",
        ],
        bullets: [
          "Same time every day beats a perfect plan you rewrite weekly",
          "One miss is data. Two misses in a row is the real risk",
          "Celebrate 7, 21, and 66 days as checkpoints, not finish lines",
        ],
      },
      {
        heading: "How Alavo helps while the habit is forming",
        paragraphs: [
          "Alavo is a habit tracker with a Today home screen, streak tracking, and a journal. During the messy middle — weeks three to eight — people quit because the behaviour still takes effort. Seeing a week of purple rings is often enough proof that you are still in the game.",
          "If you want the research in one line: give a new habit two months of honest tracking before you decide it “doesn’t work.” Open Alavo, tap the habit, write one sentence in the journal. Repeat tomorrow.",
        ],
      },
    ],
  },
  {
    slug: "21-90-rule",
    title: "The 21/90 Rule Explained",
    description:
      "The 21/90 rule says 21 days to build a habit and 90 days to make it a lifestyle. Here is what is useful about it — and what the research actually shows.",
    date: "2026-08-19",
    keywords: [
      "21/90 rule",
      "21 day habit myth",
      "90 day lifestyle",
      "habit formation",
    ],
    sections: [
      {
        heading: "What people mean by 21/90",
        paragraphs: [
          "The 21/90 rule is a popular coaching frame: spend 21 days practising a behaviour, then 90 days living it until it feels like identity. It is memorable. It is also only half true.",
          "The 21-day idea is usually traced to plastic surgeon Maxwell Maltz, who noticed patients took about three weeks to adjust to a new face or a missing limb. That was an observation about self-image, not a trial of daily habits. It leaked into self-help and never left.",
        ],
      },
      {
        heading: "What to keep, what to drop",
        paragraphs: [
          "Keep the idea of checkpoints. Twenty-one days is a fair first review: is the cue still working, is the habit too big, are you tracking it? Ninety days is a fair lifestyle review: would you miss this if it disappeared?",
          "Drop the promise that 21 days rewires you. Phillippa Lally’s research puts the average closer to 66 days, with a wide range. If you quit on day 22 because you “should already be automatic,” you quit in the middle of the real curve.",
        ],
      },
      {
        heading: "A practical 21/90 plan in Alavo",
        paragraphs: [
          "Days 1–21: two habits only. Same time daily. Check them off on Today. Journal three nights a week. If a habit feels like a fight, shrink it (ten pushups, not a full workout).",
          "Days 22–66: protect the streak without worshipping it. Use never-miss-twice. Watch week rings more than the big number. This is when most people get bored. Boredom is not failure; it is the work.",
          "Days 67–90: decide if this is lifestyle. Keep it, replace it, or add one new habit — not five. A short list is enough. It does not need to become a dashboard.",
        ],
      },
    ],
  },
  {
    slug: "habits-that-stick",
    title: "How to Build Habits That Stick",
    description:
      "Start small, stack habits, track daily, and never miss twice. A practical guide to building a daily habit tracking routine with Alavo.",
    date: "2026-08-19",
    keywords: [
      "how to build habits that stick",
      "habit stacking",
      "never miss twice",
      "daily habit tracking routine",
    ],
    sections: [
      {
        heading: "Start small",
        paragraphs: [
          "Two habits. Not five. Not ten. Two. Add more when those feel automatic. Every habit you add makes all of them weaker because willpower is not a stack of independent batteries — it is one morning.",
          "A short habit list is deliberate. Unlimited lists look ambitious. They also become a museum of guilt. Track what you will actually do this week.",
        ],
      },
      {
        heading: "Stack habits onto a life you already have",
        paragraphs: [
          "“After I pour my morning coffee, I do 10 pushups.” Attaching a new habit to something you already do removes the question of when. The coffee is the cue. The pushups are the behaviour. Checking Alavo is the close of the loop.",
          "Write the stack in the habit name if you need to: “Coffee → stretch.” Your future self at 7:14 a.m. should not have to invent a plan.",
        ],
      },
      {
        heading: "Track daily — the check-in is a reward",
        paragraphs: [
          "Checking off a habit is itself a tiny reward. Open Alavo at the same time every day and the check-in becomes its own habit. If the tracker takes more than a couple of seconds, you will stop using it. Alavo is built around a Today screen for that reason: tap, done, see the ring fill.",
        ],
      },
      {
        heading: "Never miss twice",
        paragraphs: [
          "Miss a day, fine. Do it the next day. This one rule matters more than motivation, discipline, or any app feature. A broken streak hurts. A broken identity hurts more. Never miss twice keeps the identity.",
        ],
      },
      {
        heading: "Celebrate milestones",
        paragraphs: [
          "Seven days. Twenty-one days. Sixty-six days. Each one is real progress. Acknowledging them builds the momentum that keeps you going. Alavo’s rewards and journal are there so the milestone is not only a number in your head.",
        ],
        bullets: [
          "Same time every day is the whole strategy",
          "Morning (move, water, meditate) or night (review the day) — pick one",
          "If opening the tracker at that time feels “off” when you skip it, the routine is taking hold",
        ],
      },
    ],
  },
  {
    slug: "streak-tracking",
    title: "Streak Tracking: Why Consistency Beats Perfection",
    description:
      "Streaks work because of loss aversion — and they fail for the same reason. How to use a streak habit tracker without quitting after one miss.",
    date: "2026-08-19",
    keywords: [
      "streak tracking",
      "streak habit tracker",
      "consistency vs perfection",
      "never miss twice",
    ],
    sections: [
      {
        heading: "A streak is consecutive days. That is all.",
        paragraphs: [
          "But it works because of a quirk in how we think: losing a 14-day streak feels worse than gaining a 14-day streak felt good. Loss aversion. Psychologists have measured this. The pain of losing is roughly twice the pleasure of gaining.",
          "That is useful on day 12, when you would rather stay on the couch. The number on the screen pulls you through. Alavo shows a streak pill on Today for that exact moment.",
        ],
      },
      {
        heading: "The same force can make you quit",
        paragraphs: [
          "The problem with streaks is the same thing that makes them powerful. One missed day and the number goes to zero. That feels catastrophic, and catastrophic feelings make people quit — not just the streak, the entire habit.",
          "If your tracker only celebrates perfection, it trains fragility. A grown-up streak habit tracker also shows the week, the month, and the completion rate.",
        ],
      },
      {
        heading: "Never miss twice, then look at the percentage",
        paragraphs: [
          "Miss Monday, show up Tuesday. The streak resets. The habit does not. In Alavo, the 30-day picture (and longer Pro charts) measures this better than a flame icon. Ninety percent with a broken streak beats sixty percent with a streak intact.",
          "Use streaks as a daily nudge. Use heatmaps and charts as the truth. Wednesdays might be your weak day. You might never miss when you check in before breakfast. Those are the patterns a tracker reveals that memory never will.",
        ],
      },
    ],
  },
  {
    slug: "best-free-habit-tracker",
    title: "What to look for in a habit tracker",
    description:
      "The best habit tracker is the one you open every day. Alavo is open source and free to self-host. Alavo Cloud is paid managed hosting.",
    date: "2026-08-19",
    keywords: [
      "best free habit tracker",
      "free habit tracker online",
      "free daily habit tracker",
      "habit tracker app",
    ],
    sections: [
      {
        heading: "Fast beats fancy",
        paragraphs: [
          "A good habit tracker app needs to be fast. If checking off a habit takes more than two seconds, you will stop doing it. Alavo loads a Today home screen with week rings, a streak pill, and one-tap complete. That is the job.",
          "Many trackers bury the check-in behind social feeds or coins. Alavo keeps the Today screen simple. Self-host the open-source app, or use paid Alavo Cloud if you want it hosted. Existing Cloud accounts keep the access they already have.",
        ],
      },
      {
        heading: "What to look for in a free daily habit tracker",
        paragraphs: [
          "You want a Today view, not a blank spreadsheet. You want streaks without shame. You want a way to see the year (calendar or heatmap) and a few honest numbers (current streak, longest streak, completion rate). You want your data to be exportable.",
          "Alavo includes those pieces. Habits can be daily, specific weekdays, or times-per-week. You can install it as a PWA on your phone. Reminders and a journal are part of the app. Self-hosting does not require a subscription.",
        ],
        bullets: [
          "Open source and free to self-host",
          "Works in the browser and on your home screen",
          "Export JSON anytime; privacy policy is public",
          "Built as a calm purple UI, not a noisy game",
        ],
      },
      {
        heading: "Online, on your phone, without another store account",
        paragraphs: [
          "Search “habit tracker app for my phone” and you will find dozens of store listings. Alavo is the web app at alavo.cc and app.alavo.cc. Add it to your home screen and you have the same Today view you use on desktop.",
          "Self-host if you want the full tracker on your own server. Use Alavo Cloud if you want it hosted. The point of a tracker is a daily routine that runs on autopilot.",
        ],
      },
    ],
  },
];

export function getInsight(slug: string) {
  return INSIGHTS.find((article) => article.slug === slug);
}

export function relatedInsights(slug: string, limit = 3) {
  return INSIGHTS.filter((article) => article.slug !== slug).slice(0, limit);
}
