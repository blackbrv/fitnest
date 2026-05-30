const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

const posts = [
  {
    title: 'Building Stronger Family Bonds Through Fitness',
    slug: 'building-stronger-family-bonds-through-fitness',
    excerpt: 'Discover how exercising together as a family does more than improve physical health — it builds lasting bonds, creates shared memories, and sets lifelong habits for your children.',
    content: `## Why Family Fitness Matters

When most people think about working out, they think of solo runs, gym sessions, or personal trainers. But one of the most powerful things you can do for both your health and your family relationships is to exercise together.

## The Science Behind Shared Physical Activity

Research consistently shows that families who exercise together report higher satisfaction in their relationships. Physical activity releases endorphins, and sharing that experience creates positive associations between family members. When you push through a challenging workout together, you build trust, communication, and a sense of shared accomplishment.

## Starting Small

You don't need to jump straight into intense training. Start with something everyone can enjoy:

- **Evening walks** after dinner, even 20 minutes
- **Weekend bike rides** at a comfortable pace
- **Backyard games** like tag, frisbee, or simple obstacle courses
- **Dance sessions** in the living room

The goal isn't performance — it's participation. Every family member brings their own fitness level, and that's perfectly fine.

## Making It a Habit

Consistency is everything. Schedule your family workout sessions like you would any important appointment. Create a family fitness calendar, rotate who picks the activity each week, and celebrate milestones together — first month of consistency, first 5K, first hike completed.

## FitNest Was Built for This

That's exactly why we built FitNest. We wanted to make it easy for families to plan, track, and celebrate their fitness journey together — not just individuals grinding alone. When everyone can see the family's progress, it creates a natural accountability that keeps everyone motivated.

Start your family's fitness journey today. Your future selves will thank you.`,
    authorName: 'FitNest Team',
    publishedAt: new Date('2026-01-15'),
    status: 'PUBLISHED',
    tags: JSON.stringify(['family', 'fitness', 'wellness', 'motivation']),
  },
  {
    title: '5 Beginner Workout Routines Your Whole Family Will Love',
    slug: '5-beginner-workout-routines-whole-family',
    excerpt: 'Finding workouts that work for every fitness level in your family can be challenging. These five routines are designed to be fun, accessible, and scalable — perfect from kids to grandparents.',
    content: `## One Plan, Every Fitness Level

The biggest challenge with family fitness is finding activities that work for everyone — from a 10-year-old with boundless energy to a grandparent recovering from a knee injury. These five routines are designed to be inclusive, fun, and adaptable.

## Routine 1: The Family Circuit

Set up 5 stations around your home or backyard. Each person works at their own pace for 30 seconds, then rotates.

- Jumping jacks (or step jacks for lower impact)
- Push-ups (knees allowed)
- Marching in place
- Bodyweight squats
- Plank hold (or modified plank on knees)

Rest 1 minute between rounds. Aim for 3 rounds.

## Routine 2: Walk & Talk Challenge

This one is deceivingly simple: go for a 30-minute family walk, but take turns sharing answers to fun questions. "What superpower would you want?" or "What's the best meal you've ever eaten?"

Walking at a brisk pace burns more calories than most people realize — and the conversation makes time fly.

## Routine 3: YouTube Yoga Together

Pick a 20-minute beginner yoga video on YouTube and do it together. Kids find the animal poses hilarious. Adults find genuine relief for tight backs and shoulders. No equipment needed.

## Routine 4: Kitchen Timer Workout

Set a timer for 1 minute. Everyone does the same exercise. Rest 30 seconds. Repeat with a new exercise. Total time: 15 minutes.

Suggested exercises: high knees, lunges, bicycle crunches, arm circles, wall sits.

## Routine 5: Active Scavenger Hunt

Create a list of physical challenges hidden around the house or neighborhood. Complete a set of push-ups at location 1, a 30-second sprint at location 2, 10 jumps at location 3. First to complete all wins bragging rights.

## Track Your Progress

Use FitNest to log which routines your family completes each week. Over time, you'll see patterns — which exercises everyone enjoys, which ones are getting easier, and where to push further.`,
    authorName: 'FitNest Team',
    publishedAt: new Date('2026-02-03'),
    status: 'PUBLISHED',
    tags: JSON.stringify(['beginner', 'workouts', 'family', 'exercise']),
  },
  {
    title: 'The Science of Streaks: Why Consistency Beats Intensity',
    slug: 'science-of-streaks-consistency-beats-intensity',
    excerpt: 'Most people start their fitness journey with high intensity and burn out within weeks. Research shows that consistent, moderate effort over time dramatically outperforms short bursts of extreme effort.',
    content: `## The Intensity Trap

Every January, gym memberships spike. People commit to working out six days a week, running 5 miles a day, cutting all processed food. By February, most have quietly returned to their couch. This pattern — high intensity followed by burnout followed by guilt — is one of the most common fitness mistakes.

The science is clear: consistency almost always beats intensity.

## What the Research Says

A study published in the *Journal of Behavioral Medicine* found that participants who exercised at a moderate, consistent pace for 12 months showed significantly better health outcomes than those who exercised intensely but sporadically. The key variable wasn't effort per session — it was *showing up*.

Behavioral research on habit formation (famously studied by James Clear in *Atomic Habits*) confirms this: small daily actions, compounded over months, produce transformational results.

## Why Streaks Work Psychologically

When you maintain a fitness streak, you're not just building physical fitness — you're building an identity. Each day you show up, you cast a vote for the kind of person you are: "I'm someone who exercises." That identity becomes increasingly resistant to breaking.

Streaks also create what psychologists call "loss aversion" — once you've built a 14-day streak, the thought of losing it is more motivating than any reward could be.

## The 2-Minute Rule

On days you don't feel like working out, commit to just 2 minutes. Put on your shoes, do 2 minutes of activity. Most of the time, you'll keep going. On the rare days you don't — that's fine. Two minutes of movement is infinitely better than zero.

## Building Your Family Streak

In FitNest, every family member's streak is visible to everyone. This isn't about competition — it's about community accountability. When you see your child on a 12-day streak, you don't want to be the parent who breaks theirs.

Start your streak today. It doesn't matter how small the workout is. What matters is that you show up.`,
    authorName: 'FitNest Team',
    publishedAt: new Date('2026-02-20'),
    status: 'PUBLISHED',
    tags: JSON.stringify(['habits', 'streaks', 'consistency', 'psychology']),
  },
  {
    title: 'How to Set Realistic Family Fitness Goals',
    slug: 'how-to-set-realistic-family-fitness-goals',
    excerpt: 'Goal-setting is the foundation of any successful fitness journey — but most goals are set up to fail from the start. Learn how to create goals that motivate every family member and actually stick.',
    content: `## Most Fitness Goals Fail Before February

Research from the University of Scranton shows that only 8% of people achieve their New Year's resolutions. The fitness industry knows this — it's why gym memberships surge in January and revenue stays the same. People set goals, pay for memberships, and stop going.

The problem isn't motivation. It's goal design.

## The SMART Framework for Families

You've probably heard of SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Most people apply these to individual goals. Here's how to apply them for a family:

### Specific
"Get healthier" is not a goal. "Complete three 30-minute family workouts per week" is a goal. The more specific, the more actionable.

### Measurable
FitNest tracks every workout completion, streak, and weekly consistency rate. Make sure your goal can be measured with data, not feelings.

### Achievable
Start with 60-70% of what you think you can do. A family of five achieving 80% of a modest goal is more valuable than 40% of an ambitious one. Build confidence first.

### Relevant
The goal should matter to everyone. If one family member hates running, don't make a 5K the target. Find the intersection of what everyone can commit to.

### Time-bound
"By the end of March, we'll have completed 30 family workouts." Clear deadlines create urgency and allow for celebration.

## Celebrate Milestones

Too many fitness plans skip the celebration phase. When your family hits their first monthly goal, mark it. Dinner at a favorite restaurant. A movie night. Something that ties positive emotion to fitness achievement.

These celebrations are not rewards for effort — they're anchors that connect your family's identity to fitness.

## Starting in FitNest

When you create a family workout plan in FitNest, think about these questions:
- What's one workout we can all commit to this week?
- What does success look like after 30 days?
- How will we celebrate our first milestone?

The best fitness goal isn't the most ambitious one — it's the one you'll actually stick to.`,
    authorName: 'FitNest Team',
    publishedAt: new Date('2026-03-10'),
    status: 'PUBLISHED',
    tags: JSON.stringify(['goals', 'planning', 'family', 'motivation']),
  },
]

async function main() {
  console.log('Seeding blog posts...')
  for (const post of posts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
    console.log('  ✓', post.title)
  }
  console.log('Done!')
  await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
