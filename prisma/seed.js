const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (process.env.NODE_ENV === 'production') {
  console.error('[seed] Refusing to run seed script in production environment.');
  process.exit(1);
}

const prisma = new PrismaClient();

const FAMILY_ID = 'cmpr7qm2f00021k1zcxuge2gl';
const ALEX_ID = 'cmpr7othv00001k1zqn57wmft';
const EXISTING_PLAN_ID = 'cmpr7vao300071k1z8lowj2rr';
const PASSWORD = 'fitnest2025';
const SALT_ROUNDS = 12;

// Day-of-week mapping
const DAY_MAP = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

async function main() {
  console.log('=== FitNest Seed Script Starting ===\n');

  // ─────────────────────────────────────────────────────────────────
  // 1. Hash password once
  // ─────────────────────────────────────────────────────────────────
  console.log('Hashing password...');
  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
  console.log('Password hashed.\n');

  // ─────────────────────────────────────────────────────────────────
  // 2. Create 4 new users (idempotent: upsert by email)
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating users...');

  const usersToCreate = [
    { name: 'Sarah Johnson', email: 'sarah@johnson.com' },
    { name: 'Marcus Johnson', email: 'marcus@johnson.com' },
    { name: 'Emma Johnson', email: 'emma@johnson.com' },
    { name: 'Liam Johnson', email: 'liam@johnson.com' },
  ];

  const createdUsers = {};
  let usersCreatedCount = 0;

  for (const u of usersToCreate) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (existing) {
        console.log(`  User ${u.name} already exists (${existing.id}), skipping.`);
        createdUsers[u.name] = existing;
      } else {
        const user = await prisma.user.create({
          data: {
            name: u.name,
            email: u.email,
            password: hashedPassword,
            emailVerified: true,
          },
        });
        console.log(`  Created user: ${user.name} (${user.id})`);
        createdUsers[u.name] = user;
        usersCreatedCount++;
      }
    } catch (err) {
      console.error(`  Error creating user ${u.name}:`, err.message);
    }
  }

  const sarahId = createdUsers['Sarah Johnson'].id;
  const marcusId = createdUsers['Marcus Johnson'].id;
  const emmaId = createdUsers['Emma Johnson'].id;
  const liamId = createdUsers['Liam Johnson'].id;

  console.log(`Users done. Created: ${usersCreatedCount}\n`);

  // ─────────────────────────────────────────────────────────────────
  // 3. Add users as MEMBER to family (idempotent)
  // ─────────────────────────────────────────────────────────────────
  console.log('Adding family members...');
  let membersCreatedCount = 0;

  for (const userId of [sarahId, marcusId, emmaId, liamId]) {
    try {
      const existing = await prisma.familyMember.findUnique({
        where: { familyId_userId: { familyId: FAMILY_ID, userId } },
      });
      if (existing) {
        console.log(`  FamilyMember for userId=${userId} already exists, skipping.`);
      } else {
        const fm = await prisma.familyMember.create({
          data: { familyId: FAMILY_ID, userId, role: 'MEMBER' },
        });
        console.log(`  Added family member: ${userId} (fm id: ${fm.id})`);
        membersCreatedCount++;
      }
    } catch (err) {
      console.error(`  Error adding family member ${userId}:`, err.message);
    }
  }

  console.log(`Family members done. Created: ${membersCreatedCount}\n`);

  // ─────────────────────────────────────────────────────────────────
  // 4. Delete existing plan (cascades to exercises & logs)
  // ─────────────────────────────────────────────────────────────────
  console.log('Deleting existing workout plan...');
  try {
    await prisma.workoutPlan.delete({ where: { id: EXISTING_PLAN_ID } });
    console.log(`  Deleted plan ${EXISTING_PLAN_ID}\n`);
  } catch (err) {
    if (err.code === 'P2025') {
      console.log('  Existing plan not found (already deleted), continuing.\n');
    } else {
      console.error('  Error deleting plan:', err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. Create 6 workout plans with exercises
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating workout plans...');

  const plansData = [
    {
      title: 'Morning Strength Routine',
      assignedTo: ALEX_ID,
      category: 'STRENGTH',
      difficulty: 'INTERMEDIATE',
      scheduledDays: ['monday', 'wednesday', 'friday'],
      exercises: [
        { exerciseName: 'Barbell Squat', sets: 4, reps: 8, duration: null, restSeconds: 90, order: 1 },
        { exerciseName: 'Bench Press', sets: 4, reps: 8, duration: null, restSeconds: 90, order: 2 },
        { exerciseName: 'Deadlift', sets: 3, reps: 5, duration: null, restSeconds: 120, order: 3 },
        { exerciseName: 'Pull-ups', sets: 3, reps: 10, duration: null, restSeconds: 60, order: 4 },
        { exerciseName: 'Plank Hold', sets: 3, reps: null, duration: 60, restSeconds: 45, order: 5 },
      ],
    },
    {
      title: 'HIIT Cardio Blast',
      assignedTo: marcusId,
      category: 'CARDIO',
      difficulty: 'ADVANCED',
      scheduledDays: ['tuesday', 'thursday', 'saturday'],
      exercises: [
        { exerciseName: 'Burpees', sets: 4, reps: 15, duration: null, restSeconds: 30, order: 1 },
        { exerciseName: 'Mountain Climbers', sets: 4, reps: 30, duration: null, restSeconds: 20, order: 2 },
        { exerciseName: 'Jump Squats', sets: 3, reps: 20, duration: null, restSeconds: 45, order: 3 },
        { exerciseName: 'Box Jumps', sets: 3, reps: 12, duration: null, restSeconds: 60, order: 4 },
        { exerciseName: 'Sprint Intervals', sets: 4, reps: null, duration: 30, restSeconds: 60, order: 5 },
      ],
    },
    {
      title: 'Yoga & Mindfulness',
      assignedTo: sarahId,
      category: 'MOBILITY',
      difficulty: 'INTERMEDIATE',
      scheduledDays: ['tuesday', 'thursday', 'saturday'],
      exercises: [
        { exerciseName: 'Sun Salutation', sets: 3, reps: 5, duration: null, restSeconds: 30, order: 1 },
        { exerciseName: 'Warrior Sequence', sets: 3, reps: null, duration: 60, restSeconds: 20, order: 2 },
        { exerciseName: 'Downward Dog', sets: 3, reps: null, duration: 45, restSeconds: 15, order: 3 },
        { exerciseName: "Child's Pose", sets: 2, reps: null, duration: 90, restSeconds: 0, order: 4 },
        { exerciseName: 'Savasana', sets: 1, reps: null, duration: 300, restSeconds: 0, order: 5 },
      ],
    },
    {
      title: 'Evening Flexibility',
      assignedTo: emmaId,
      category: 'STRETCHING',
      difficulty: 'BEGINNER',
      scheduledDays: ['monday', 'wednesday', 'friday'],
      exercises: [
        { exerciseName: 'Hamstring Stretch', sets: 3, reps: null, duration: 30, restSeconds: 10, order: 1 },
        { exerciseName: 'Hip Flexor Stretch', sets: 3, reps: null, duration: 30, restSeconds: 10, order: 2 },
        { exerciseName: 'Shoulder Roll', sets: 3, reps: 15, duration: null, restSeconds: 10, order: 3 },
        { exerciseName: 'Spinal Twist', sets: 3, reps: null, duration: 30, restSeconds: 10, order: 4 },
        { exerciseName: 'Cat-Cow Stretch', sets: 3, reps: 10, duration: null, restSeconds: 15, order: 5 },
      ],
    },
    {
      title: 'Kids Fun Workout',
      assignedTo: liamId,
      category: 'KIDS_EXERCISE',
      difficulty: 'BEGINNER',
      scheduledDays: ['monday', 'wednesday', 'friday'],
      exercises: [
        { exerciseName: 'Jumping Jacks', sets: 3, reps: 20, duration: null, restSeconds: 15, order: 1 },
        { exerciseName: 'Bear Crawls', sets: 3, reps: null, duration: 30, restSeconds: 20, order: 2 },
        { exerciseName: 'Frog Jumps', sets: 3, reps: 10, duration: null, restSeconds: 20, order: 3 },
        { exerciseName: 'Hula Hoop', sets: 2, reps: null, duration: 60, restSeconds: 30, order: 4 },
        { exerciseName: 'Dance Freeze', sets: 2, reps: null, duration: 90, restSeconds: 0, order: 5 },
      ],
    },
    {
      title: 'Family Sunday Stretch',
      assignedTo: null,
      category: 'STRETCHING',
      difficulty: 'BEGINNER',
      scheduledDays: ['sunday'],
      exercises: [
        { exerciseName: 'Group Warm-Up', sets: 1, reps: null, duration: 300, restSeconds: 0, order: 1 },
        { exerciseName: 'Partner Stretches', sets: 3, reps: null, duration: 60, restSeconds: 30, order: 2 },
        { exerciseName: 'Breathing Exercises', sets: 3, reps: 5, duration: null, restSeconds: 15, order: 3 },
        { exerciseName: 'Cool Down Walk', sets: 1, reps: null, duration: 600, restSeconds: 0, order: 4 },
      ],
    },
  ];

  const createdPlans = [];
  for (const planData of plansData) {
    try {
      const plan = await prisma.workoutPlan.create({
        data: {
          familyId: FAMILY_ID,
          assignedTo: planData.assignedTo,
          title: planData.title,
          category: planData.category,
          difficulty: planData.difficulty,
          scheduledDays: JSON.stringify(planData.scheduledDays),
          isActive: true,
          exercises: {
            create: planData.exercises,
          },
        },
      });
      console.log(`  Created plan: "${plan.title}" (${plan.id})`);
      createdPlans.push({ ...plan, scheduledDaysArr: planData.scheduledDays, assignedTo: planData.assignedTo });
    } catch (err) {
      console.error(`  Error creating plan "${planData.title}":`, err.message);
    }
  }

  console.log(`Workout plans done. Created: ${createdPlans.length}\n`);

  // ─────────────────────────────────────────────────────────────────
  // 6. Generate 30 days of workout logs
  // ─────────────────────────────────────────────────────────────────
  console.log('Generating workout logs...');

  // Members and their plans/schedules/probabilities
  const members = [
    {
      id: ALEX_ID,
      planIndex: 0, // Morning Strength Routine
      scheduledDays: ['monday', 'wednesday', 'friday'],
      probability: 85,
      guaranteedStreak: true, // last 10 days if scheduled
    },
    {
      id: marcusId,
      planIndex: 1, // HIIT Cardio Blast
      scheduledDays: ['tuesday', 'thursday', 'saturday'],
      probability: 75,
      guaranteedStreak: false,
    },
    {
      id: sarahId,
      planIndex: 2, // Yoga & Mindfulness
      scheduledDays: ['tuesday', 'thursday', 'saturday'],
      probability: 78,
      guaranteedStreak: false,
    },
    {
      id: emmaId,
      planIndex: 3, // Evening Flexibility
      scheduledDays: ['monday', 'wednesday', 'friday'],
      probability: 70,
      guaranteedStreak: false,
    },
    {
      id: liamId,
      planIndex: 4, // Kids Fun Workout
      scheduledDays: ['monday', 'wednesday', 'friday'],
      probability: 65,
      guaranteedStreak: false,
    },
  ];

  const today = new Date();
  // Normalize to midnight local
  today.setHours(0, 0, 0, 0);

  let logsCreatedCount = 0;

  for (const member of members) {
    const plan = createdPlans[member.planIndex];
    if (!plan) {
      console.log(`  No plan found at index ${member.planIndex}, skipping member ${member.id}`);
      continue;
    }

    const scheduledDayNums = member.scheduledDays.map((d) => DAY_MAP[d]);

    for (let dayIndex = 0; dayIndex < 30; dayIndex++) {
      // dayIndex 0 = today, dayIndex 29 = 29 days ago
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex);

      const dayOfWeek = date.getDay(); // 0=Sun .. 6=Sat

      // Only log on scheduled days
      if (!scheduledDayNums.includes(dayOfWeek)) continue;

      // Determine completion
      let completed = false;

      if (member.guaranteedStreak && dayIndex <= 9) {
        // Alex: guarantee last 10 days
        completed = true;
      } else {
        // Deterministic: use charCode of first char of memberId + dayIndex
        const seed = (dayIndex + member.id.charCodeAt(0)) % 100;
        completed = seed < member.probability;
      }

      const status = completed ? 'COMPLETED' : 'SKIPPED';

      // Random hour between 07:00 and 20:00
      const randomHour = 7 + Math.floor(((dayIndex * 13 + member.id.charCodeAt(2)) % 13));
      const randomMin = (dayIndex * 7 + member.id.charCodeAt(1)) % 60;

      let completedAt = null;
      let logTime = new Date(date);
      logTime.setHours(12, 0, 0, 0); // noon default for skipped

      if (completed) {
        logTime = new Date(date);
        logTime.setHours(randomHour, randomMin, 0, 0);
        completedAt = logTime;
      }

      try {
        await prisma.workoutLog.create({
          data: {
            userId: member.id,
            workoutPlanId: plan.id,
            status,
            completedAt,
            createdAt: logTime,
          },
        });
        logsCreatedCount++;
      } catch (err) {
        console.error(
          `  Error creating log for member=${member.id} day=${dayIndex}: ${err.message}`
        );
      }
    }

    console.log(`  Logs generated for member: ${member.id}`);
  }

  console.log(`Workout logs done. Created: ${logsCreatedCount}\n`);

  // ─────────────────────────────────────────────────────────────────
  // 7. Create notifications for Alex
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating notifications for Alex...');

  const now = new Date();

  const notifications = [
    {
      userId: ALEX_ID,
      type: 'FAMILY_ACTIVITY',
      title: 'Marcus Completed a Workout',
      message: 'Marcus completed HIIT Cardio Blast',
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: ALEX_ID,
      type: 'STREAK_REMINDER',
      title: "Sarah's Streak Milestone",
      message: 'Sarah hit a 7-day streak!',
      isRead: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: ALEX_ID,
      type: 'FAMILY_ACTIVITY',
      title: 'Emma Completed a Workout',
      message: 'Emma completed Evening Flexibility',
      isRead: false,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      userId: ALEX_ID,
      type: 'FAMILY_ACTIVITY',
      title: 'New Family Member',
      message: 'Liam joined the family plan',
      isRead: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  let notificationsCreatedCount = 0;
  for (const notif of notifications) {
    try {
      await prisma.notification.create({ data: notif });
      notificationsCreatedCount++;
    } catch (err) {
      console.error(`  Error creating notification "${notif.message}":`, err.message);
    }
  }

  console.log(`Notifications done. Created: ${notificationsCreatedCount}\n`);

  // ─────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────
  console.log('=== Seed Complete ===');
  console.log(`  Users created:          ${usersCreatedCount}`);
  console.log(`  Family members added:   ${membersCreatedCount}`);
  console.log(`  Workout plans created:  ${createdPlans.length}`);
  console.log(`  Workout logs created:   ${logsCreatedCount}`);
  console.log(`  Notifications created:  ${notificationsCreatedCount}`);
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
