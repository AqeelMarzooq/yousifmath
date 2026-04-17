import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;

function createClient() {
  if (url && url.startsWith("postgresql")) {
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
  }
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  return new PrismaClient({ adapter } as any);
}

const prisma = createClient();

async function main() {
  // Users
  const hashedParent = await bcrypt.hash("Parent@123!", 10);
  const hashedYousif = await bcrypt.hash("Yousif@123!", 10);

  await prisma.user.upsert({
    where: { username: "parent" },
    update: {},
    create: { username: "parent", password: hashedParent, role: "PARENT" },
  });

  const student = await prisma.user.upsert({
    where: { username: "yousif" },
    update: {},
    create: { username: "yousif", password: hashedYousif, role: "STUDENT" },
  });

  console.log("Users created ✅");

  // Topics
  const topic1 = await prisma.topic.upsert({
    where: { id: "topic-1" },
    update: {},
    create: {
      id: "topic-1",
      title: "Equivalent Fractions & Decimals (Tenths)",
      lo: "Understand that fractions and decimals are equivalent — tenths",
      order: 1,
    },
  });

  const topic2 = await prisma.topic.upsert({
    where: { id: "topic-2" },
    update: {},
    create: {
      id: "topic-2",
      title: "Equivalent Fractions & Decimals (Hundredths)",
      lo: "Identify equivalent fractions and convert to decimal hundredths",
      order: 2,
    },
  });

  const topic3 = await prisma.topic.upsert({
    where: { id: "topic-3" },
    update: {},
    create: {
      id: "topic-3",
      title: "Convert Thousandths to Fractions",
      lo: "Convert thousandths to fractions and partition them",
      order: 3,
    },
  });

  const topic4 = await prisma.topic.upsert({
    where: { id: "topic-4" },
    update: {},
    create: {
      id: "topic-4",
      title: "Order and Compare Decimals",
      lo: "Compare and order decimals with the same number of decimal places",
      order: 4,
    },
  });

  console.log("Topics created ✅");

  // TOPIC 1 QUESTIONS
  const t1Questions = [
    // FLUENCY (5 Qs)
    {
      id: "t1-f1", topicId: topic1.id, level: "FLUENCY", type: "MCQ",
      questionText: "What is 7/10 as a decimal?",
      options: JSON.stringify(["0.07", "7.0", "0.7", "70"]),
      correctAnswer: "0.7", explanation: "7 tenths = 0.7", xpValue: 10,
    },
    {
      id: "t1-f2", topicId: topic1.id, level: "FLUENCY", type: "FILL_BLANK",
      questionText: "Complete: 3/10 = ___",
      correctAnswer: "0.3", explanation: "3 tenths = 0.3", xpValue: 10,
    },
    {
      id: "t1-f3", topicId: topic1.id, level: "FLUENCY", type: "MCQ",
      questionText: "What fraction is equal to 0.5?",
      options: JSON.stringify(["5/10", "1/2", "5/100", "Both 5/10 and 1/2"]),
      correctAnswer: "Both 5/10 and 1/2", explanation: "0.5 = 5/10 = 1/2", xpValue: 10,
    },
    {
      id: "t1-f4", topicId: topic1.id, level: "FLUENCY", type: "TRUE_FALSE",
      questionText: "True or False: 4/10 = 0.4",
      correctAnswer: "True", explanation: "4 tenths = 0.4 ✓", xpValue: 10,
    },
    {
      id: "t1-f5", topicId: topic1.id, level: "FLUENCY", type: "FILL_BLANK",
      questionText: "Write 9/10 as a decimal: ___",
      correctAnswer: "0.9", explanation: "9 tenths = 0.9", xpValue: 10,
    },
    // SKILL (8 Qs)
    {
      id: "t1-s1", topicId: topic1.id, level: "SKILL", type: "MCQ",
      questionText: "Which decimal is equivalent to 6/10?",
      options: JSON.stringify(["0.06", "0.6", "6.0", "0.006"]),
      correctAnswer: "0.6", explanation: "6 tenths = 0.6", xpValue: 10,
    },
    {
      id: "t1-s2", topicId: topic1.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "A number line goes from 0 to 1. Where would 0.2 be? Write the fraction: ___",
      correctAnswer: "2/10", explanation: "0.2 = 2/10 on the number line", xpValue: 10,
    },
    {
      id: "t1-s3", topicId: topic1.id, level: "SKILL", type: "MCQ",
      questionText: "A shape has 10 equal parts. 3 are shaded. What decimal does this show?",
      options: JSON.stringify(["3.0", "0.03", "0.3", "3/1"]),
      correctAnswer: "0.3", explanation: "3 out of 10 parts = 3/10 = 0.3", xpValue: 10,
    },
    {
      id: "t1-s4", topicId: topic1.id, level: "SKILL", type: "TRUE_FALSE",
      questionText: "True or False: 1/10 = 0.01",
      correctAnswer: "False", explanation: "1/10 = 0.1, not 0.01", xpValue: 10,
    },
    {
      id: "t1-s5", topicId: topic1.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "0.8 = ___/10",
      correctAnswer: "8", explanation: "0.8 = 8/10", xpValue: 10,
    },
    {
      id: "t1-s6", topicId: topic1.id, level: "SKILL", type: "MCQ",
      questionText: "Order these from smallest to largest: 0.7, 0.3, 0.9, 0.1",
      options: JSON.stringify(["0.1, 0.3, 0.7, 0.9", "0.9, 0.7, 0.3, 0.1", "0.3, 0.1, 0.7, 0.9", "0.7, 0.1, 0.3, 0.9"]),
      correctAnswer: "0.1, 0.3, 0.7, 0.9", explanation: "Smallest to largest: 0.1 < 0.3 < 0.7 < 0.9", xpValue: 10,
    },
    {
      id: "t1-s7", topicId: topic1.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "If a ruler shows 10 equal parts and I'm at position 5, what decimal is that? ___",
      correctAnswer: "0.5", explanation: "5 out of 10 = 5/10 = 0.5", xpValue: 10,
    },
    {
      id: "t1-s8", topicId: topic1.id, level: "SKILL", type: "MCQ",
      questionText: "Which fraction equals 0.2?",
      options: JSON.stringify(["2/100", "1/5", "2/10", "Both 2/10 and 1/5"]),
      correctAnswer: "Both 2/10 and 1/5", explanation: "0.2 = 2/10 = 1/5", xpValue: 10,
    },
    // DEPTH (4 Qs)
    {
      id: "t1-d1", topicId: topic1.id, level: "DEPTH", type: "MCQ",
      questionText: "Yousif runs 7/10 km on Monday and 0.5 km on Tuesday. How far in total?",
      options: JSON.stringify(["1.1 km", "1.2 km", "0.12 km", "1.0 km"]),
      correctAnswer: "1.2 km", explanation: "7/10 = 0.7. 0.7 + 0.5 = 1.2 km", xpValue: 10,
    },
    {
      id: "t1-d2", topicId: topic1.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "A goalkeeper saves 0.6 of all shots. What fraction is this? (simplest form) ___/___",
      correctAnswer: "3/5", explanation: "0.6 = 6/10 = 3/5", xpValue: 10,
    },
    {
      id: "t1-d3", topicId: topic1.id, level: "DEPTH", type: "MCQ",
      questionText: "Three friends each eat 3/10 of a pizza. Is there any left?",
      options: JSON.stringify(["Yes, 1/10 left", "No, exactly finished", "Yes, 3/10 left", "Not enough info"]),
      correctAnswer: "Yes, 1/10 left", explanation: "3 × 3/10 = 9/10. 1 - 9/10 = 1/10 left", xpValue: 10,
    },
    {
      id: "t1-d4", topicId: topic1.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "Complete the pattern: 0.1, 0.3, 0.5, ___, 0.9",
      correctAnswer: "0.7", explanation: "Pattern increases by 0.2 each time", xpValue: 10,
    },
  ];

  // TOPIC 2 QUESTIONS
  const t2Questions = [
    // FLUENCY (5 Qs)
    {
      id: "t2-f1", topicId: topic2.id, level: "FLUENCY", type: "MCQ",
      questionText: "What is 1/4 as a decimal?",
      options: JSON.stringify(["0.14", "0.4", "0.25", "0.125"]),
      correctAnswer: "0.25", explanation: "1/4 = 25/100 = 0.25", xpValue: 10,
    },
    {
      id: "t2-f2", topicId: topic2.id, level: "FLUENCY", type: "FILL_BLANK",
      questionText: "1/2 = ___/100",
      correctAnswer: "50", explanation: "1/2 = 50/100", xpValue: 10,
    },
    {
      id: "t2-f3", topicId: topic2.id, level: "FLUENCY", type: "MCQ",
      questionText: "What is 3/4 as a decimal?",
      options: JSON.stringify(["0.34", "0.75", "0.3", "0.7"]),
      correctAnswer: "0.75", explanation: "3/4 = 75/100 = 0.75", xpValue: 10,
    },
    {
      id: "t2-f4", topicId: topic2.id, level: "FLUENCY", type: "TRUE_FALSE",
      questionText: "True or False: 1/5 = 0.20",
      correctAnswer: "True", explanation: "1/5 = 20/100 = 0.20 ✓", xpValue: 10,
    },
    {
      id: "t2-f5", topicId: topic2.id, level: "FLUENCY", type: "FILL_BLANK",
      questionText: "0.75 = 75/___",
      correctAnswer: "100", explanation: "0.75 = 75/100", xpValue: 10,
    },
    // SKILL (8 Qs)
    {
      id: "t2-s1", topicId: topic2.id, level: "SKILL", type: "MCQ",
      questionText: "Using Sam's method: if 1/5 = 0.2, what is 3/5?",
      options: JSON.stringify(["0.35", "0.15", "0.6", "0.3"]),
      correctAnswer: "0.6", explanation: "3/5 = 3 × 0.2 = 0.6", xpValue: 10,
    },
    {
      id: "t2-s2", topicId: topic2.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "Complete: 1/4 = 25/100 = ___",
      correctAnswer: "0.25", explanation: "25/100 = 0.25", xpValue: 10,
    },
    {
      id: "t2-s3", topicId: topic2.id, level: "SKILL", type: "MCQ",
      questionText: "A hundred square has 37 boxes shaded. What decimal is this?",
      options: JSON.stringify(["3.7", "0.037", "0.37", "37.0"]),
      correctAnswer: "0.37", explanation: "37 out of 100 = 37/100 = 0.37", xpValue: 10,
    },
    {
      id: "t2-s4", topicId: topic2.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "Using Sam's method: if 1/5 = 0.2, then 4/5 = ___",
      correctAnswer: "0.8", explanation: "4/5 = 4 × 0.2 = 0.8", xpValue: 10,
    },
    {
      id: "t2-s5", topicId: topic2.id, level: "SKILL", type: "MCQ",
      questionText: "Complete: 1/2 = □/10 = □/100",
      options: JSON.stringify(["5/10 = 50/100", "2/10 = 20/100", "5/10 = 5/100", "4/10 = 40/100"]),
      correctAnswer: "5/10 = 50/100", explanation: "1/2 = 5/10 = 50/100", xpValue: 10,
    },
    {
      id: "t2-s6", topicId: topic2.id, level: "SKILL", type: "TRUE_FALSE",
      questionText: "True or False: 2/5 = 0.4",
      correctAnswer: "True", explanation: "2/5 = 2 × 0.2 = 0.4 ✓", xpValue: 10,
    },
    {
      id: "t2-s7", topicId: topic2.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "0.50 = ___/2 (simplest form)",
      correctAnswer: "1", explanation: "0.50 = 1/2", xpValue: 10,
    },
    {
      id: "t2-s8", topicId: topic2.id, level: "SKILL", type: "MCQ",
      questionText: "Which is largest? 1/4, 1/2, 3/4, 1/5",
      options: JSON.stringify(["1/4", "1/2", "3/4", "1/5"]),
      correctAnswer: "3/4", explanation: "3/4 = 0.75 is the largest", xpValue: 10,
    },
    // DEPTH (4 Qs)
    {
      id: "t2-d1", topicId: topic2.id, level: "DEPTH", type: "MCQ",
      questionText: "CR7 scores 3 out of 4 penalties. What decimal is his conversion rate?",
      options: JSON.stringify(["0.34", "0.75", "0.7", "3.4"]),
      correctAnswer: "0.75", explanation: "3/4 = 0.75", xpValue: 10,
    },
    {
      id: "t2-d2", topicId: topic2.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "Yousif drinks 2/5 of a water bottle. Write this as a decimal: ___",
      correctAnswer: "0.4", explanation: "2/5 = 2 × 0.2 = 0.4", xpValue: 10,
    },
    {
      id: "t2-d3", topicId: topic2.id, level: "DEPTH", type: "MCQ",
      questionText: "Which three fractions are all equal to 0.5?",
      options: JSON.stringify(["1/2, 5/10, 50/100", "1/2, 2/4, 5/10", "5/10, 50/100, 500/1000", "All of the above"]),
      correctAnswer: "All of the above", explanation: "They all equal 0.5!", xpValue: 10,
    },
    {
      id: "t2-d4", topicId: topic2.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "Using Sam's method: if 1/4 = 0.25, then 3/4 = ___",
      correctAnswer: "0.75", explanation: "3/4 = 3 × 0.25 = 0.75", xpValue: 10,
    },
  ];

  // TOPIC 3 QUESTIONS
  const t3Questions = [
    // FLUENCY (5 Qs)
    {
      id: "t3-f1", topicId: topic3.id, level: "FLUENCY", type: "MCQ",
      questionText: "How many thousandths are in 1/100?",
      options: JSON.stringify(["1", "100", "10", "1000"]),
      correctAnswer: "10", explanation: "1/100 = 10/1000", xpValue: 10,
    },
    {
      id: "t3-f2", topicId: topic3.id, level: "FLUENCY", type: "FILL_BLANK",
      questionText: "How many thousandths are in 1/10? ___",
      correctAnswer: "100", explanation: "1/10 = 100/1000", xpValue: 10,
    },
    {
      id: "t3-f3", topicId: topic3.id, level: "FLUENCY", type: "MCQ",
      questionText: "Write 243/1000 as a decimal:",
      options: JSON.stringify(["24.3", "2.43", "0.243", "0.0243"]),
      correctAnswer: "0.243", explanation: "243 thousandths = 0.243", xpValue: 10,
    },
    {
      id: "t3-f4", topicId: topic3.id, level: "FLUENCY", type: "TRUE_FALSE",
      questionText: "True or False: 500/1000 = 1/2",
      correctAnswer: "True", explanation: "500/1000 = 0.5 = 1/2 ✓", xpValue: 10,
    },
    {
      id: "t3-f5", topicId: topic3.id, level: "FLUENCY", type: "FILL_BLANK",
      questionText: "1 = ___/1000",
      correctAnswer: "1000", explanation: "1 = 1000/1000", xpValue: 10,
    },
    // SKILL (8 Qs)
    {
      id: "t3-s1", topicId: topic3.id, level: "SKILL", type: "MCQ",
      questionText: "Partition 243/1000: 2/10 + __/100 + 3/1000",
      options: JSON.stringify(["4", "14", "40", "24"]),
      correctAnswer: "4", explanation: "243/1000 = 2/10 + 4/100 + 3/1000", xpValue: 10,
    },
    {
      id: "t3-s2", topicId: topic3.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "0.007 = ___/1000",
      correctAnswer: "7", explanation: "0.007 = 7/1000", xpValue: 10,
    },
    {
      id: "t3-s3", topicId: topic3.id, level: "SKILL", type: "MCQ",
      questionText: "Which is bigger: 125/1000 or 200/1000?",
      options: JSON.stringify(["125/1000", "200/1000", "They are equal", "Cannot compare"]),
      correctAnswer: "200/1000", explanation: "200 > 125, so 200/1000 > 125/1000", xpValue: 10,
    },
    {
      id: "t3-s4", topicId: topic3.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "685/1000 = 6/10 + __/100 + 5/1000",
      correctAnswer: "8", explanation: "685/1000 = 6/10 + 8/100 + 5/1000", xpValue: 10,
    },
    {
      id: "t3-s5", topicId: topic3.id, level: "SKILL", type: "MCQ",
      questionText: "What is 750/1000 in its simplest fraction?",
      options: JSON.stringify(["3/4", "7/10", "75/100", "1/2"]),
      correctAnswer: "3/4", explanation: "750/1000 = 3/4", xpValue: 10,
    },
    {
      id: "t3-s6", topicId: topic3.id, level: "SKILL", type: "TRUE_FALSE",
      questionText: "True or False: 0.050 = 50/1000",
      correctAnswer: "True", explanation: "0.050 = 50/1000 ✓", xpValue: 10,
    },
    {
      id: "t3-s7", topicId: topic3.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "0.365 = ___/1000",
      correctAnswer: "365", explanation: "0.365 = 365/1000", xpValue: 10,
    },
    {
      id: "t3-s8", topicId: topic3.id, level: "SKILL", type: "MCQ",
      questionText: "How many thousandths are equal to 1 whole?",
      options: JSON.stringify(["10", "100", "1000", "10000"]),
      correctAnswer: "1000", explanation: "1 = 1000/1000", xpValue: 10,
    },
    // DEPTH (4 Qs)
    {
      id: "t3-d1", topicId: topic3.id, level: "DEPTH", type: "MCQ",
      questionText: "CR7's free kick speed is 0.125 km per second. Write this as a fraction:",
      options: JSON.stringify(["1/8", "125/10", "1/125", "12/100"]),
      correctAnswer: "1/8", explanation: "0.125 = 125/1000 = 1/8", xpValue: 10,
    },
    {
      id: "t3-d2", topicId: topic3.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "Partition 685/1000 a second way: 600/1000 + 8/100 + ___/1000",
      correctAnswer: "5", explanation: "600/1000 + 80/1000 + 5/1000 = 685/1000", xpValue: 10,
    },
    {
      id: "t3-d3", topicId: topic3.id, level: "DEPTH", type: "MCQ",
      questionText: "Three thousandths more than 0.997 = ?",
      options: JSON.stringify(["0.910", "1.000", "0.9973", "1.003"]),
      correctAnswer: "1.000", explanation: "0.997 + 0.003 = 1.000", xpValue: 10,
    },
    {
      id: "t3-d4", topicId: topic3.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "250/1000 = 1/___ (simplest fraction)",
      correctAnswer: "4", explanation: "250/1000 = 1/4", xpValue: 10,
    },
  ];

  // TOPIC 4 QUESTIONS
  const t4Questions = [
    // FLUENCY (5 Qs)
    {
      id: "t4-f1", topicId: topic4.id, level: "FLUENCY", type: "MCQ",
      questionText: "Which is greater: 0.932 or 0.798?",
      options: JSON.stringify(["0.932", "0.798", "They are equal"]),
      correctAnswer: "0.932", explanation: "9 tenths > 7 tenths, so 0.932 > 0.798", xpValue: 10,
    },
    {
      id: "t4-f2", topicId: topic4.id, level: "FLUENCY", type: "MCQ",
      questionText: "Which is smaller: 0.45 or 0.54?",
      options: JSON.stringify(["0.45", "0.54", "They are equal"]),
      correctAnswer: "0.45", explanation: "4 tenths < 5 tenths, so 0.45 < 0.54", xpValue: 10,
    },
    {
      id: "t4-f3", topicId: topic4.id, level: "FLUENCY", type: "TRUE_FALSE",
      questionText: "True or False: 0.6 > 0.59",
      correctAnswer: "True", explanation: "0.60 > 0.59 ✓", xpValue: 10,
    },
    {
      id: "t4-f4", topicId: topic4.id, level: "FLUENCY", type: "FILL_BLANK",
      questionText: "Write < or > between: 0.301 ___ 0.310",
      correctAnswer: "<", explanation: "0.301 < 0.310 (3 hundredths < 1 hundredth is wrong — compare: 30 vs 31 hundredths)", xpValue: 10,
    },
    {
      id: "t4-f5", topicId: topic4.id, level: "FLUENCY", type: "MCQ",
      questionText: "Which list is ordered smallest to largest?",
      options: JSON.stringify(["0.9, 0.5, 0.3, 0.1", "0.1, 0.3, 0.5, 0.9", "0.3, 0.1, 0.9, 0.5", "0.5, 0.1, 0.3, 0.9"]),
      correctAnswer: "0.1, 0.3, 0.5, 0.9", explanation: "0.1 < 0.3 < 0.5 < 0.9", xpValue: 10,
    },
    // SKILL (8 Qs)
    {
      id: "t4-s1", topicId: topic4.id, level: "SKILL", type: "MCQ",
      questionText: "Order these from smallest: 3.456, 3.465, 3.546, 3.654",
      options: JSON.stringify(["3.456, 3.465, 3.546, 3.654", "3.654, 3.546, 3.465, 3.456", "3.465, 3.456, 3.546, 3.654", "3.546, 3.654, 3.456, 3.465"]),
      correctAnswer: "3.456, 3.465, 3.546, 3.654", explanation: "Compare digit by digit: tenths first, then hundredths", xpValue: 10,
    },
    {
      id: "t4-s2", topicId: topic4.id, level: "SKILL", type: "MCQ",
      questionText: "Which is greater: 0.932 or 0.798?",
      options: JSON.stringify(["0.932", "0.798", "They are equal"]),
      correctAnswer: "0.932", explanation: "9 tenths > 7 tenths", xpValue: 10,
    },
    {
      id: "t4-s3", topicId: topic4.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "What digit is in the hundredths place in 4.327? ___",
      correctAnswer: "2", explanation: "4.3|2|7 — the 2 is in the hundredths place", xpValue: 10,
    },
    {
      id: "t4-s4", topicId: topic4.id, level: "SKILL", type: "MCQ",
      questionText: "Five runners' times (seconds): 12.45, 12.54, 12.44, 12.55, 12.50. Who was fastest?",
      options: JSON.stringify(["12.45s", "12.44s", "12.55s", "12.50s"]),
      correctAnswer: "12.44s", explanation: "Smallest time = fastest runner", xpValue: 10,
    },
    {
      id: "t4-s5", topicId: topic4.id, level: "SKILL", type: "TRUE_FALSE",
      questionText: "True or False: 0.090 > 0.089",
      correctAnswer: "True", explanation: "0.090 > 0.089 ✓", xpValue: 10,
    },
    {
      id: "t4-s6", topicId: topic4.id, level: "SKILL", type: "FILL_BLANK",
      questionText: "Fill the missing number: 2.3_5 > 2.375. What digit could go in the blank? ___",
      correctAnswer: "8", explanation: "2.385 > 2.375 (8 hundredths > 7 hundredths)", xpValue: 10,
    },
    {
      id: "t4-s7", topicId: topic4.id, level: "SKILL", type: "MCQ",
      questionText: "Distances: 5.123 km, 5.321 km, 5.213 km. Order smallest to largest:",
      options: JSON.stringify(["5.123, 5.213, 5.321", "5.321, 5.213, 5.123", "5.213, 5.123, 5.321", "5.123, 5.321, 5.213"]),
      correctAnswer: "5.123, 5.213, 5.321", explanation: "Compare hundredths: 1 < 2 < 3", xpValue: 10,
    },
    {
      id: "t4-s8", topicId: topic4.id, level: "SKILL", type: "TRUE_FALSE",
      questionText: "True or False: 1.500 = 1.5",
      correctAnswer: "True", explanation: "Trailing zeros don't change the value ✓", xpValue: 10,
    },
    // DEPTH (4 Qs)
    {
      id: "t4-d1", topicId: topic4.id, level: "DEPTH", type: "MCQ",
      questionText: "CR7's sprint speed is 10.926 m/s, Messi's is 10.92 m/s. Who is faster?",
      options: JSON.stringify(["CR7 (10.926)", "Messi (10.92)", "They are the same speed"]),
      correctAnswer: "CR7 (10.926)", explanation: "10.926 > 10.920 — CR7 wins by 6 thousandths!", xpValue: 10,
    },
    {
      id: "t4-d2", topicId: topic4.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "Write a decimal between 0.45 and 0.46: ___",
      correctAnswer: "0.451", explanation: "Any value between 0.450 and 0.460 works, e.g. 0.451", xpValue: 10,
    },
    {
      id: "t4-d3", topicId: topic4.id, level: "DEPTH", type: "MCQ",
      questionText: "Four match distances (km): 8.251, 8.215, 8.512, 8.521. Which is second largest?",
      options: JSON.stringify(["8.512", "8.521", "8.251", "8.215"]),
      correctAnswer: "8.512", explanation: "Ordered: 8.215, 8.251, 8.512, 8.521 — second largest is 8.512", xpValue: 10,
    },
    {
      id: "t4-d4", topicId: topic4.id, level: "DEPTH", type: "FILL_BLANK",
      questionText: "Complete: ___ < 3.455 < 3.46 (give one possible thousandths decimal)",
      correctAnswer: "3.450", explanation: "3.450 < 3.455 < 3.460 ✓", xpValue: 10,
    },
  ];

  // ── TOPIC 1 B-POOL (isActive: false — alternate set) ──────────────────────
  const t1BQuestions = [
    // FLUENCY B (5 Qs)
    { id: "t1-f6", topicId: topic1.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "What is 2/10 as a decimal?",
      options: JSON.stringify(["0.02", "2.0", "0.2", "20"]),
      correctAnswer: "0.2", explanation: "2 tenths = 0.2", xpValue: 10 },
    { id: "t1-f7", topicId: topic1.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "Complete: 8/10 = ___",
      correctAnswer: "0.8", explanation: "8 tenths = 0.8", xpValue: 10 },
    { id: "t1-f8", topicId: topic1.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "What fraction is equal to 0.6?",
      options: JSON.stringify(["60/10", "6/1", "6/10", "6/100"]),
      correctAnswer: "6/10", explanation: "0.6 = 6 tenths = 6/10", xpValue: 10 },
    { id: "t1-f9", topicId: topic1.id, level: "FLUENCY", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 1/10 = 0.1",
      correctAnswer: "True", explanation: "1 tenth = 0.1 ✓", xpValue: 10 },
    { id: "t1-f10", topicId: topic1.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "Write 0.4 as a fraction over 10: ___/10",
      correctAnswer: "4", explanation: "0.4 = 4/10", xpValue: 10 },
    // SKILL B (8 Qs)
    { id: "t1-s9", topicId: topic1.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Which decimal equals 4/10?",
      options: JSON.stringify(["0.04", "0.4", "4.0", "40"]),
      correctAnswer: "0.4", explanation: "4 tenths = 0.4", xpValue: 10 },
    { id: "t1-s10", topicId: topic1.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "0.6 = ___/10",
      correctAnswer: "6", explanation: "0.6 = 6/10", xpValue: 10 },
    { id: "t1-s11", topicId: topic1.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "A pizza has 10 slices. Yousif eats 7. What decimal of the pizza is left?",
      options: JSON.stringify(["0.7", "0.3", "7.0", "0.03"]),
      correctAnswer: "0.3", explanation: "3 slices left out of 10 = 3/10 = 0.3", xpValue: 10 },
    { id: "t1-s12", topicId: topic1.id, level: "SKILL", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 5/10 = 0.50",
      correctAnswer: "True", explanation: "5/10 = 0.5 = 0.50 ✓", xpValue: 10 },
    { id: "t1-s13", topicId: topic1.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Which fraction equals 0.9?",
      options: JSON.stringify(["9/100", "9/10", "9/1", "90/10"]),
      correctAnswer: "9/10", explanation: "0.9 = 9 tenths = 9/10", xpValue: 10 },
    { id: "t1-s14", topicId: topic1.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Order from smallest to largest: 0.4, 0.8, 0.2, 0.6",
      options: JSON.stringify(["0.2, 0.4, 0.6, 0.8", "0.8, 0.6, 0.4, 0.2", "0.4, 0.2, 0.6, 0.8", "0.6, 0.8, 0.2, 0.4"]),
      correctAnswer: "0.2, 0.4, 0.6, 0.8", explanation: "0.2 < 0.4 < 0.6 < 0.8", xpValue: 10 },
    { id: "t1-s15", topicId: topic1.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "A jug holds 10 cups total. 3 cups are poured out. Write the decimal filled: ___",
      correctAnswer: "0.7", explanation: "7 cups remain out of 10 = 7/10 = 0.7", xpValue: 10 },
    { id: "t1-s16", topicId: topic1.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Which of these is NOT equal to 0.5?",
      options: JSON.stringify(["5/10", "1/2", "0.50", "5/100"]),
      correctAnswer: "5/100", explanation: "5/100 = 0.05, not 0.5", xpValue: 10 },
    // DEPTH B (4 Qs)
    { id: "t1-d5", topicId: topic1.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "CR7 scores in 8 out of every 10 matches. Write his scoring rate as a decimal:",
      options: JSON.stringify(["8.0", "0.08", "0.8", "80"]),
      correctAnswer: "0.8", explanation: "8 out of 10 = 8/10 = 0.8", xpValue: 10 },
    { id: "t1-d6", topicId: topic1.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "0.3 + 0.4 = ___ (write as a fraction over 10)",
      correctAnswer: "7/10", explanation: "3/10 + 4/10 = 7/10 = 0.7", xpValue: 10 },
    { id: "t1-d7", topicId: topic1.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "A bag has 10 balls: 4 red, 3 blue, 3 white. What decimal chance is picking blue?",
      options: JSON.stringify(["0.4", "0.3", "0.7", "3.0"]),
      correctAnswer: "0.3", explanation: "3 blue out of 10 = 3/10 = 0.3", xpValue: 10 },
    { id: "t1-d8", topicId: topic1.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "Complete the pattern: 0.9, 0.7, 0.5, ___, 0.1",
      correctAnswer: "0.3", explanation: "Pattern decreases by 0.2 each time", xpValue: 10 },
  ];

  // ── TOPIC 2 B-POOL ─────────────────────────────────────────────────────────
  const t2BQuestions = [
    // FLUENCY B (5 Qs)
    { id: "t2-f6", topicId: topic2.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "What is 1/2 as a decimal?",
      options: JSON.stringify(["0.12", "0.2", "0.5", "0.50"]),
      correctAnswer: "0.5", explanation: "1/2 = 50/100 = 0.5", xpValue: 10 },
    { id: "t2-f7", topicId: topic2.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "1/5 = ___/100",
      correctAnswer: "20", explanation: "1/5 = 20/100", xpValue: 10 },
    { id: "t2-f8", topicId: topic2.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "What is 2/4 as a decimal?",
      options: JSON.stringify(["0.24", "0.2", "0.5", "0.4"]),
      correctAnswer: "0.5", explanation: "2/4 = 1/2 = 0.5", xpValue: 10 },
    { id: "t2-f9", topicId: topic2.id, level: "FLUENCY", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 3/4 = 0.75",
      correctAnswer: "True", explanation: "3/4 = 75/100 = 0.75 ✓", xpValue: 10 },
    { id: "t2-f10", topicId: topic2.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "0.25 = ___/100",
      correctAnswer: "25", explanation: "0.25 = 25/100", xpValue: 10 },
    // SKILL B (8 Qs)
    { id: "t2-s9", topicId: topic2.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Using Sam's method: if 1/5 = 0.2, what is 2/5?",
      options: JSON.stringify(["0.25", "0.4", "0.2", "0.12"]),
      correctAnswer: "0.4", explanation: "2/5 = 2 × 0.2 = 0.4", xpValue: 10 },
    { id: "t2-s10", topicId: topic2.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "A hundred square has 60 boxes shaded. Write the decimal: ___",
      correctAnswer: "0.60", explanation: "60 out of 100 = 60/100 = 0.60", xpValue: 10 },
    { id: "t2-s11", topicId: topic2.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Complete: 3/4 = 75/100 = ___",
      options: JSON.stringify(["0.34", "0.75", "0.7", "7.5"]),
      correctAnswer: "0.75", explanation: "75/100 = 0.75", xpValue: 10 },
    { id: "t2-s12", topicId: topic2.id, level: "SKILL", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 4/5 = 0.80",
      correctAnswer: "True", explanation: "4/5 = 4 × 0.2 = 0.80 ✓", xpValue: 10 },
    { id: "t2-s13", topicId: topic2.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "1/2 = □/4 = □/100",
      options: JSON.stringify(["2/4 = 50/100", "1/4 = 25/100", "3/4 = 50/100", "2/4 = 25/100"]),
      correctAnswer: "2/4 = 50/100", explanation: "1/2 = 2/4 = 50/100", xpValue: 10 },
    { id: "t2-s14", topicId: topic2.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "0.40 = ___/5 (simplest form)",
      correctAnswer: "2", explanation: "0.40 = 2/5", xpValue: 10 },
    { id: "t2-s15", topicId: topic2.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Which fraction is equivalent to 0.2?",
      options: JSON.stringify(["2/4", "1/5", "2/100", "1/2"]),
      correctAnswer: "1/5", explanation: "1/5 = 0.2", xpValue: 10 },
    { id: "t2-s16", topicId: topic2.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Which is the smallest? 1/2, 1/4, 1/5, 3/4",
      options: JSON.stringify(["1/2", "1/4", "1/5", "3/4"]),
      correctAnswer: "1/5", explanation: "1/5 = 0.2 is the smallest", xpValue: 10 },
    // DEPTH B (4 Qs)
    { id: "t2-d5", topicId: topic2.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "A footballer completes 4/5 of his passes. Write this as a decimal: ___",
      correctAnswer: "0.8", explanation: "4/5 = 4 × 0.2 = 0.8", xpValue: 10 },
    { id: "t2-d6", topicId: topic2.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "Using Sam's method: 1/4 = 0.25, so 2/4 = ___",
      options: JSON.stringify(["0.24", "0.5", "0.52", "0.25"]),
      correctAnswer: "0.5", explanation: "2/4 = 2 × 0.25 = 0.50", xpValue: 10 },
    { id: "t2-d7", topicId: topic2.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "Which of these are all equal to 0.75?",
      options: JSON.stringify(["3/4 only", "75/100 only", "3/4 and 75/100", "None"]),
      correctAnswer: "3/4 and 75/100", explanation: "3/4 = 75/100 = 0.75", xpValue: 10 },
    { id: "t2-d8", topicId: topic2.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "Yousif gets 3/4 of his homework correct. As a percentage that is ___% correct.",
      correctAnswer: "75", explanation: "3/4 = 0.75 = 75%", xpValue: 10 },
  ];

  // ── TOPIC 3 B-POOL ─────────────────────────────────────────────────────────
  const t3BQuestions = [
    // FLUENCY B (5 Qs)
    { id: "t3-f6", topicId: topic3.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "How many thousandths are in 1/10?",
      options: JSON.stringify(["1", "10", "100", "1000"]),
      correctAnswer: "100", explanation: "1/10 = 100/1000", xpValue: 10 },
    { id: "t3-f7", topicId: topic3.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "Write 507/1000 as a decimal: ___",
      correctAnswer: "0.507", explanation: "507 thousandths = 0.507", xpValue: 10 },
    { id: "t3-f8", topicId: topic3.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "0.009 = ___/1000",
      correctAnswer: "9", explanation: "0.009 = 9/1000", xpValue: 10 },
    { id: "t3-f9", topicId: topic3.id, level: "FLUENCY", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 250/1000 = 0.25",
      correctAnswer: "True", explanation: "250/1000 = 0.250 = 0.25 ✓", xpValue: 10 },
    { id: "t3-f10", topicId: topic3.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "0.001 = ___/1000",
      correctAnswer: "1", explanation: "0.001 = 1/1000", xpValue: 10 },
    // SKILL B (8 Qs)
    { id: "t3-s9", topicId: topic3.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "Partition 512/1000: 5/10 + 1/100 + ___/1000",
      correctAnswer: "2", explanation: "512/1000 = 5/10 + 1/100 + 2/1000", xpValue: 10 },
    { id: "t3-s10", topicId: topic3.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "0.004 = ___/1000",
      correctAnswer: "4", explanation: "0.004 = 4/1000", xpValue: 10 },
    { id: "t3-s11", topicId: topic3.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Which is bigger: 300/1000 or 30/100?",
      options: JSON.stringify(["300/1000", "30/100", "They are equal", "Cannot compare"]),
      correctAnswer: "They are equal", explanation: "300/1000 = 30/100 = 0.3", xpValue: 10 },
    { id: "t3-s12", topicId: topic3.id, level: "SKILL", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 100/1000 = 1/10",
      correctAnswer: "True", explanation: "100/1000 = 1/10 = 0.1 ✓", xpValue: 10 },
    { id: "t3-s13", topicId: topic3.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "478/1000 = 4/10 + 7/100 + ___/1000",
      correctAnswer: "8", explanation: "478/1000 = 4/10 + 7/100 + 8/1000", xpValue: 10 },
    { id: "t3-s14", topicId: topic3.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "0.125 = ___/1000",
      correctAnswer: "125", explanation: "0.125 = 125/1000", xpValue: 10 },
    { id: "t3-s15", topicId: topic3.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "1000/1000 equals which whole number?",
      options: JSON.stringify(["10", "100", "1", "1000"]),
      correctAnswer: "1", explanation: "1000/1000 = 1", xpValue: 10 },
    { id: "t3-s16", topicId: topic3.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "200/1000 simplified to its simplest fraction is:",
      options: JSON.stringify(["2/10", "1/4", "1/5", "20/100"]),
      correctAnswer: "1/5", explanation: "200/1000 = 2/10 = 1/5", xpValue: 10 },
    // DEPTH B (4 Qs)
    { id: "t3-d5", topicId: topic3.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "3 thousandths less than 0.500 = ?",
      options: JSON.stringify(["0.503", "0.497", "0.470", "0.493"]),
      correctAnswer: "0.497", explanation: "0.500 − 0.003 = 0.497", xpValue: 10 },
    { id: "t3-d6", topicId: topic3.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "750/1000 = ___/___ (simplest fraction)",
      correctAnswer: "3/4", explanation: "750/1000 = 75/100 = 3/4", xpValue: 10 },
    { id: "t3-d7", topicId: topic3.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "Partition 900/1000 two different ways. Which is correct?",
      options: JSON.stringify(["9/10 = 900/1000", "90/100 = 900/1000", "Both are correct", "Neither"]),
      correctAnswer: "Both are correct", explanation: "9/10 = 90/100 = 900/1000 = 0.9", xpValue: 10 },
    { id: "t3-d8", topicId: topic3.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "A raindrop is 8/1000 of a millilitre. Write this as a decimal: ___",
      correctAnswer: "0.008", explanation: "8/1000 = 0.008", xpValue: 10 },
  ];

  // ── TOPIC 4 B-POOL ─────────────────────────────────────────────────────────
  const t4BQuestions = [
    // FLUENCY B (5 Qs)
    { id: "t4-f6", topicId: topic4.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "Which is greater: 0.5 or 0.49?",
      options: JSON.stringify(["0.5", "0.49", "They are equal"]),
      correctAnswer: "0.5", explanation: "0.50 > 0.49 — compare tenths first", xpValue: 10 },
    { id: "t4-f7", topicId: topic4.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "Which is smaller: 1.23 or 1.32?",
      options: JSON.stringify(["1.23", "1.32", "They are equal"]),
      correctAnswer: "1.23", explanation: "2 tenths < 3 tenths so 1.23 < 1.32", xpValue: 10 },
    { id: "t4-f8", topicId: topic4.id, level: "FLUENCY", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 0.700 = 0.7",
      correctAnswer: "True", explanation: "Trailing zeros don't change value ✓", xpValue: 10 },
    { id: "t4-f9", topicId: topic4.id, level: "FLUENCY", type: "FILL_BLANK", isActive: false,
      questionText: "Write < or > between: 0.55 ___ 0.505",
      correctAnswer: ">", explanation: "0.550 > 0.505 — same tenths, but 5 hundredths > 0 hundredths", xpValue: 10 },
    { id: "t4-f10", topicId: topic4.id, level: "FLUENCY", type: "MCQ", isActive: false,
      questionText: "Order from smallest to largest: 0.7, 0.07, 0.77",
      options: JSON.stringify(["0.07, 0.7, 0.77", "0.7, 0.07, 0.77", "0.77, 0.7, 0.07", "0.07, 0.77, 0.7"]),
      correctAnswer: "0.07, 0.7, 0.77", explanation: "0.07 < 0.70 < 0.77", xpValue: 10 },
    // SKILL B (8 Qs)
    { id: "t4-s9", topicId: topic4.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Order from largest to smallest: 4.321, 4.312, 4.231, 4.123",
      options: JSON.stringify(["4.321, 4.312, 4.231, 4.123", "4.123, 4.231, 4.312, 4.321", "4.312, 4.321, 4.231, 4.123", "4.231, 4.321, 4.123, 4.312"]),
      correctAnswer: "4.321, 4.312, 4.231, 4.123", explanation: "Compare tenths then hundredths then thousandths", xpValue: 10 },
    { id: "t4-s10", topicId: topic4.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Which is greater: 0.5 or 0.499?",
      options: JSON.stringify(["0.5", "0.499", "They are equal"]),
      correctAnswer: "0.5", explanation: "0.500 > 0.499 — compare tenths: 5 > 4", xpValue: 10 },
    { id: "t4-s11", topicId: topic4.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "What digit is in the tenths place in 7.435? ___",
      correctAnswer: "4", explanation: "7.|4|35 — the 4 is in the tenths place", xpValue: 10 },
    { id: "t4-s12", topicId: topic4.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Race times (s): 9.85, 9.58, 9.80, 9.75. Who won (fastest)?",
      options: JSON.stringify(["9.85s", "9.75s", "9.80s", "9.58s"]),
      correctAnswer: "9.58s", explanation: "Smallest time = fastest. 9.58 is smallest", xpValue: 10 },
    { id: "t4-s13", topicId: topic4.id, level: "SKILL", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 2.400 > 2.04",
      correctAnswer: "True", explanation: "2.400 > 2.040 — 4 tenths > 0 tenths ✓", xpValue: 10 },
    { id: "t4-s14", topicId: topic4.id, level: "SKILL", type: "FILL_BLANK", isActive: false,
      questionText: "Distances (km): 3.010, 3.001, 3.100. Write them smallest to largest: ___",
      correctAnswer: "3.001, 3.010, 3.100", explanation: "Compare digit by digit: 3.001 < 3.010 < 3.100", xpValue: 10 },
    { id: "t4-s15", topicId: topic4.id, level: "SKILL", type: "TRUE_FALSE", isActive: false,
      questionText: "True or False: 0.1 > 0.099",
      correctAnswer: "True", explanation: "0.100 > 0.099 ✓", xpValue: 10 },
    { id: "t4-s16", topicId: topic4.id, level: "SKILL", type: "MCQ", isActive: false,
      questionText: "Fill: 1.2_3 < 1.243. Which digit could go in the blank?",
      options: JSON.stringify(["4", "5", "3", "6"]),
      correctAnswer: "3", explanation: "1.233 < 1.243 — 3 hundredths < 4 hundredths", xpValue: 10 },
    // DEPTH B (4 Qs)
    { id: "t4-d5", topicId: topic4.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "Yousif runs 2.345 km, Ahmed runs 2.354 km. Who ran further?",
      options: JSON.stringify(["Yousif (2.345)", "Ahmed (2.354)", "They ran the same"]),
      correctAnswer: "Ahmed (2.354)", explanation: "2.354 > 2.345 — compare hundredths: 5 > 4", xpValue: 10 },
    { id: "t4-d6", topicId: topic4.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "Write a decimal that is between 0.23 and 0.24: ___",
      correctAnswer: "0.231", explanation: "Any value 0.231–0.239 works. E.g. 0.231", xpValue: 10 },
    { id: "t4-d7", topicId: topic4.id, level: "DEPTH", type: "MCQ", isActive: false,
      questionText: "Heights: 1.345m, 1.354m, 1.435m, 1.453m. Which is second smallest?",
      options: JSON.stringify(["1.345m", "1.354m", "1.435m", "1.453m"]),
      correctAnswer: "1.354m", explanation: "Ordered: 1.345, 1.354, 1.435, 1.453 — second is 1.354", xpValue: 10 },
    { id: "t4-d8", topicId: topic4.id, level: "DEPTH", type: "FILL_BLANK", isActive: false,
      questionText: "___ > 4.567 > 4.56 — give one possible decimal for the blank",
      correctAnswer: "4.570", explanation: "4.570 > 4.567 > 4.560 ✓", xpValue: 10 },
  ];

  const allQuestions = [
    ...t1Questions, ...t2Questions, ...t3Questions, ...t4Questions,
    ...t1BQuestions, ...t2BQuestions, ...t3BQuestions, ...t4BQuestions,
  ];

  for (const q of allQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: q,
    });
  }

  console.log(`Seeded ${allQuestions.length} questions ✅`);
  console.log("\n🎉 Database ready! Login credentials:");
  console.log("  Student — username: yousif | password: Yousif@123!");
  console.log("  Parent  — username: parent | password: Parent@123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
