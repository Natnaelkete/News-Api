import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "@prisma/PrismaClient";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const createUsers = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  await prisma.user.createMany({
    data: [
      {
        name: "Alice Author",
        email: "alice.author@example.com",
        passwordHash,
        role: "AUTHOR",
      },
      {
        name: "Bob Author",
        email: "bob.author@example.com",
        passwordHash,
        role: "AUTHOR",
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        name: "Rita Reader",
        email: "rita.reader@example.com",
        passwordHash,
        role: "READER",
      },
      {
        name: "Sam Reader",
        email: "sam.reader@example.com",
        passwordHash,
        role: "READER",
      },
      {
        name: "Uma Reader",
        email: "uma.reader@example.com",
        passwordHash,
        role: "READER",
      },
    ],
  });
};

const createArticles = async (authorIds: string[]): Promise<void> => {
  await prisma.article.createMany({
    data: [
      {
        title: "Tech Trends 2026",
        content:
          "A deep dive into the most important technology trends shaping 2026 and beyond.",
        category: "Tech",
        status: "PUBLISHED",
        authorId: authorIds[0],
      },
      {
        title: "Market Snapshot",
        content:
          "A concise analysis of market movements with key insights for the week ahead.",
        category: "Business",
        status: "DRAFT",
        authorId: authorIds[0],
      },
      {
        title: "Health Innovations",
        content:
          "Exploring breakthrough innovations in healthcare and their impact on patients.",
        category: "Health",
        status: "PUBLISHED",
        authorId: authorIds[1],
      },
      {
        title: "Global Politics Update",
        content:
          "Summary of major geopolitical developments and policy shifts across regions.",
        category: "Politics",
        status: "PUBLISHED",
        authorId: authorIds[1],
      },
      {
        title: "Sports Weekly",
        content:
          "Highlights and analysis from the biggest games and standout performances.",
        category: "Sports",
        status: "ARCHIVED",
        authorId: authorIds[0],
      },
    ],
  });
};

const seed = async (): Promise<void> => {
  await prisma.readLog.deleteMany();
  await prisma.dailyAnalytics.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  await createUsers();

  const authorIds = await prisma.user
    .findMany({ where: { role: "AUTHOR" }, select: { id: true } })
    .then((rows) => rows.map((row) => row.id));

  await createArticles(authorIds);
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
