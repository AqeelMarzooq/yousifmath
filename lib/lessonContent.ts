export interface LessonStep {
  title: string;
  body: string;
  visual?: LessonVisual;
  highlight?: string; // key fact to emphasise
}

export type LessonVisual =
  | { type: "fraction_bar"; numerator: number; denominator: number; label?: string }
  | { type: "number_line"; value: number; label?: string }
  | { type: "hundred_square"; shaded: number; label?: string }
  | { type: "place_value"; digits: { ones?: string; tenths?: string; hundredths?: string; thousandths?: string }; highlight?: string }
  | { type: "equation_chain"; steps: string[] }
  | { type: "comparison"; left: string; right: string; operator: string; explanation: string };

export interface LessonContent {
  heading: string;
  steps: LessonStep[];
}

// Extract a simple fraction like "7/10" from text → {num, den}
function parseFraction(text: string): { num: number; den: number } | null {
  const m = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return null;
  return { num: parseInt(m[1]), den: parseInt(m[2]) };
}

// Extract decimal like "0.7" from text
function parseDecimal(text: string): number | null {
  const m = text.match(/\b(0\.\d+|\d+\.\d+)\b/);
  if (!m) return null;
  return parseFloat(m[1]);
}

export function generateLessonContent(question: {
  questionText: string;
  type: string;
  correctAnswer: string;
  explanation: string | null;
  topicId: string;
  level: string;
}): LessonContent {
  const { questionText, correctAnswer, explanation, topicId } = question;
  const qLower = questionText.toLowerCase();

  // ─── TOPIC 1: Tenths ────────────────────────────────────────────────────────
  if (topicId === "topic-1") {
    const frac = parseFraction(questionText);
    const dec = parseDecimal(questionText) ?? parseDecimal(correctAnswer);

    if (frac && frac.den === 10) {
      return {
        heading: "Fractions & Decimals — Tenths",
        steps: [
          {
            title: "Think of a chocolate bar 🍫",
            body: `Imagine breaking a chocolate bar into 10 equal pieces. If you take ${frac.num} pieces, that's ${frac.num}/10 of the bar.`,
            visual: { type: "fraction_bar", numerator: frac.num, denominator: 10, label: `${frac.num}/10` },
          },
          {
            title: "Tenths live after the decimal point",
            body: "The first number after the decimal point is how many tenths you have. It's that simple!",
            visual: { type: "place_value", digits: { ones: "0", tenths: String(frac.num) }, highlight: "tenths" },
          },
          {
            title: `So ${frac.num}/10 = 0.${frac.num}`,
            body: `Count the pieces: ${frac.num} out of 10. Write a 0, then a dot, then ${frac.num}. Done!`,
            visual: { type: "equation_chain", steps: [`${frac.num}/10`, `= ${frac.num} tenths`, `= 0.${frac.num}`] },
            highlight: `${frac.num}/10 = 0.${frac.num}`,
          },
        ],
      };
    }

    if (dec !== null) {
      const tenths = Math.round(dec * 10);
      return {
        heading: "Decimals as Fractions — Tenths",
        steps: [
          {
            title: "Read the decimal",
            body: `The number ${dec} is read as "${tenths} tenths." The digit after the dot tells you how many tenths!`,
            visual: { type: "place_value", digits: { ones: "0", tenths: String(tenths) }, highlight: "tenths" },
          },
          {
            title: "Place it on a number line",
            body: `${dec} sits exactly at the ${tenths}/10 mark between 0 and 1.`,
            visual: { type: "number_line", value: dec, label: `${dec}` },
          },
          {
            title: `${dec} = ${tenths}/10`,
            body: `So the fraction is ${tenths}/10. You can also simplify: ${tenths}/10 = ${correctAnswer} ✓`,
            visual: { type: "equation_chain", steps: [`${dec}`, `= ${tenths} tenths`, `= ${tenths}/10`] },
            highlight: `${dec} = ${tenths}/10`,
          },
        ],
      };
    }
  }

  // ─── TOPIC 2: Hundredths ────────────────────────────────────────────────────
  if (topicId === "topic-2") {
    // Sam's method questions
    if (qLower.includes("sam") || qLower.includes("method")) {
      const match = questionText.match(/(\d+)\/(\d+)\s*=\s*([\d.]+)/);
      const baseNum = match ? parseInt(match[1]) : 1;
      const baseDen = match ? parseInt(match[2]) : 5;
      const baseVal = match ? parseFloat(match[3]) : 0.2;
      const targetMatch = questionText.match(/(\d+)\s*\/\s*(\d+)\s*=/);
      const multNum = targetMatch ? parseInt(targetMatch[1]) : 3;

      return {
        heading: "Sam's Method — Scale Up!",
        steps: [
          {
            title: "Sam's brilliant shortcut 🧠",
            body: `We know that ${baseNum}/${baseDen} = ${baseVal}. Sam says: just multiply both sides by the same number!`,
            visual: { type: "equation_chain", steps: [`${baseNum}/${baseDen} = ${baseVal}`, `× ${multNum}`, `${multNum}/${baseDen} = ${multNum} × ${baseVal}`] },
          },
          {
            title: "Scale it up",
            body: `${multNum}/${baseDen} means ${multNum} lots of ${baseNum}/${baseDen}. So multiply ${baseVal} by ${multNum}.`,
            visual: { type: "fraction_bar", numerator: multNum, denominator: baseDen, label: `${multNum}/${baseDen}` },
          },
          {
            title: `Answer: ${correctAnswer}`,
            body: `${multNum} × ${baseVal} = ${correctAnswer}. That's Sam's method — find one value, then multiply!`,
            visual: { type: "equation_chain", steps: [`${multNum} × ${baseVal}`, `= ${correctAnswer}`] },
            highlight: `${multNum}/${baseDen} = ${correctAnswer}`,
          },
        ],
      };
    }

    // 1/4, 3/4 etc. to hundredths
    const frac = parseFraction(questionText);
    if (frac) {
      const hundredths = Math.round((frac.num / frac.den) * 100);
      const decimal = (frac.num / frac.den).toFixed(2);
      return {
        heading: "Fractions to Hundredths",
        steps: [
          {
            title: `Picture a 100-square grid`,
            body: `A hundred square has 100 small boxes. Shade ${hundredths} boxes to show ${frac.num}/${frac.den}.`,
            visual: { type: "hundred_square", shaded: hundredths, label: `${hundredths}/100` },
          },
          {
            title: "Build the equivalence chain",
            body: `${frac.num}/${frac.den} is the same as ${hundredths}/100. Both describe the same amount!`,
            visual: { type: "equation_chain", steps: [`${frac.num}/${frac.den}`, `= ${hundredths}/100`, `= ${decimal}`] },
          },
          {
            title: `Answer: ${correctAnswer}`,
            body: `The two digits after the decimal point (${decimal}) show how many hundredths — ${hundredths} hundredths!`,
            visual: { type: "place_value", digits: { ones: "0", tenths: String(Math.floor(hundredths / 10)), hundredths: String(hundredths % 10) }, highlight: "hundredths" },
            highlight: `${frac.num}/${frac.den} = ${hundredths}/100 = ${decimal}`,
          },
        ],
      };
    }

    // Decimal → fraction (0.37 style)
    const dec = parseDecimal(questionText);
    if (dec !== null) {
      const hundredths = Math.round(dec * 100);
      return {
        heading: "Reading Hundredths",
        steps: [
          {
            title: "Two digits after the dot = hundredths",
            body: `In ${dec}, the digits after the dot are "${String(dec).split(".")[1]}". That means ${hundredths} hundredths.`,
            visual: { type: "place_value", digits: { ones: "0", tenths: String(Math.floor(hundredths / 10)), hundredths: String(hundredths % 10) }, highlight: "hundredths" },
          },
          {
            title: "Shade the hundred square",
            body: `Colour ${hundredths} boxes out of 100. That picture IS the decimal ${dec}.`,
            visual: { type: "hundred_square", shaded: hundredths, label: `${hundredths}/100` },
          },
          {
            title: `${dec} = ${hundredths}/100`,
            body: explanation ?? `Every hundredth decimal has 100 as its denominator.`,
            visual: { type: "equation_chain", steps: [`${dec}`, `= ${hundredths} hundredths`, `= ${hundredths}/100`] },
            highlight: `${dec} = ${hundredths}/100`,
          },
        ],
      };
    }
  }

  // ─── TOPIC 3: Thousandths ───────────────────────────────────────────────────
  if (topicId === "topic-3") {
    const frac = parseFraction(questionText);
    const dec = parseDecimal(questionText) ?? parseDecimal(correctAnswer);

    if (qLower.includes("partition") || qLower.includes("different way")) {
      return {
        heading: "Partitioning Thousandths",
        steps: [
          {
            title: "Break it into columns",
            body: "A thousandths number can be split by its digit columns: tenths + hundredths + thousandths.",
            visual: { type: "place_value", digits: { ones: "0", tenths: "6", hundredths: "8", thousandths: "5" }, highlight: "thousandths" },
          },
          {
            title: "Each digit is its own fraction",
            body: "The tenths digit × 1/10, the hundredths digit × 1/100, the thousandths digit × 1/1000.",
            visual: { type: "equation_chain", steps: ["6/10", "+ 8/100", "+ 5/1000", "= 685/1000"] },
          },
          {
            title: "Multiple ways work!",
            body: `You can also write: 600/1000 + 85/1000 = 685/1000. Any split that adds up is correct!`,
            visual: { type: "equation_chain", steps: ["600/1000 + 85/1000", "= 685/1000", "✓ Both are correct!"] },
            highlight: "Partition means split into any valid parts",
          },
        ],
      };
    }

    if (frac && frac.den === 1000) {
      const d = (frac.num / 1000).toFixed(3);
      const ones = "0";
      const tenths = String(Math.floor(frac.num / 100));
      const hundredths = String(Math.floor((frac.num % 100) / 10));
      const thousandths = String(frac.num % 10);
      return {
        heading: "Thousandths as Decimals",
        steps: [
          {
            title: "Three decimal places = thousandths",
            body: `${frac.num}/1000 has 3 digits, so it needs 3 decimal places. Write 0.___`,
            visual: { type: "place_value", digits: { ones, tenths, hundredths, thousandths }, highlight: "thousandths" },
          },
          {
            title: "Fill in each column",
            body: `${frac.num} = ${tenths} hundreds + ${hundredths} tens + ${thousandths} ones → place each in the right column.`,
            visual: { type: "equation_chain", steps: [`${frac.num}/1000`, `= 0.${String(frac.num).padStart(3, "0")}`] },
          },
          {
            title: `Answer: ${d}`,
            body: explanation ?? `${frac.num} thousandths = ${d}`,
            visual: { type: "equation_chain", steps: [`${frac.num}/1000`, `= ${d}`] },
            highlight: `${frac.num}/1000 = ${d}`,
          },
        ],
      };
    }

    // How many thousandths = 1/10 etc.
    if (qLower.includes("how many thousandths")) {
      return {
        heading: "Converting to Thousandths",
        steps: [
          {
            title: "1 whole = 1000 thousandths",
            body: "Think of 1 metre = 1000 millimetres. 1/10 of a metre = 100 mm = 100 thousandths!",
            visual: { type: "equation_chain", steps: ["1 = 1000/1000", "1/10 = 100/1000", "1/100 = 10/1000"] },
          },
          {
            title: "Multiply to find the answer",
            body: `To go from ${qLower.includes("1/10") ? "1/10" : "1/100"} to thousandths, multiply top and bottom by ${qLower.includes("1/10") ? 100 : 10}.`,
            visual: { type: "equation_chain", steps: [qLower.includes("1/10") ? "1/10 × 100/100" : "1/100 × 10/10", `= ${correctAnswer}/1000`] },
          },
          {
            title: `Answer: ${correctAnswer}`,
            body: explanation ?? `The correct number of thousandths is ${correctAnswer}.`,
            highlight: `Answer = ${correctAnswer}`,
          },
        ],
      };
    }
  }

  // ─── TOPIC 4: Ordering & Comparing ─────────────────────────────────────────
  if (topicId === "topic-4") {
    // Comparison questions
    const decimals = questionText.match(/\b\d+\.\d+\b/g) ?? [];

    if (qLower.includes("greater") || qLower.includes("bigger") || qLower.includes(">") || qLower.includes("<")) {
      const [left, right] = decimals.length >= 2 ? [decimals[0], decimals[1]] : ["0.932", "0.798"];
      const leftParts = left.split(".");
      const rightParts = right.split(".");
      const winner = parseFloat(left) > parseFloat(right) ? left : right;
      const op = parseFloat(left) > parseFloat(right) ? ">" : "<";
      return {
        heading: "Comparing Decimals",
        steps: [
          {
            title: "Always compare from LEFT to RIGHT",
            body: "Start with the ones digit. If they're the same, move to tenths. Then hundredths. Then thousandths.",
            visual: { type: "comparison", left, right, operator: op, explanation: `Compare digit by digit, left to right` },
          },
          {
            title: "Line them up in a place value chart",
            body: `Put ${left} and ${right} in the chart. Find the first column where the digits differ — that decides the winner!`,
            visual: {
              type: "place_value",
              digits: {
                ones: leftParts[0],
                tenths: (leftParts[1] ?? "0")[0] ?? "0",
                hundredths: (leftParts[1] ?? "00")[1] ?? "0",
                thousandths: (leftParts[1] ?? "000")[2] ?? "0",
              },
              highlight: "tenths",
            },
          },
          {
            title: `${left} ${op} ${right}`,
            body: `The tenths digits are ${(leftParts[1] ?? "0")[0]} vs ${(rightParts[1] ?? "0")[0]}. ${parseInt((leftParts[1] ?? "0")[0]) > parseInt((rightParts[1] ?? "0")[0]) ? left : right} wins!`,
            visual: { type: "equation_chain", steps: [`${left} vs ${right}`, `Tenths: ${(leftParts[1]??'0')[0]} vs ${(rightParts[1]??'0')[0]}`, `${left} ${op} ${right} ✓`] },
            highlight: `${left} ${op} ${right}`,
          },
        ],
      };
    }

    if (qLower.includes("order") || qLower.includes("smallest") || qLower.includes("largest")) {
      return {
        heading: "Ordering Decimals",
        steps: [
          {
            title: "The golden rule: line up the decimal points",
            body: "Write all the decimals in a column with dots lined up. Then compare column by column, left to right.",
            visual: { type: "equation_chain", steps: decimals.slice(0, 4).sort((a, b) => parseFloat(a) - parseFloat(b)).map((d, i) => `${i + 1}. ${d}`) },
          },
          {
            title: "Compare tenths first",
            body: "The tenths digit is the most important (it's the biggest column). Find the smallest tenths digit first.",
            visual: {
              type: "place_value",
              digits: { ones: "?", tenths: "→ check here first", hundredths: "then here", thousandths: "then here" },
              highlight: "tenths",
            },
          },
          {
            title: `Correct order: ${correctAnswer}`,
            body: explanation ?? "Always work left to right, one digit at a time.",
            highlight: `Ordered: ${correctAnswer}`,
          },
        ],
      };
    }

    // Place value question
    if (qLower.includes("place") || qLower.includes("digit")) {
      return {
        heading: "Reading Place Value",
        steps: [
          {
            title: "Every digit has a home",
            body: "In a decimal number, each position has a name: ones . tenths hundredths thousandths",
            visual: { type: "place_value", digits: { ones: "4", tenths: "3", hundredths: "2", thousandths: "7" }, highlight: "hundredths" },
          },
          {
            title: "Count the columns",
            body: "Start at the decimal point and count right: 1st column = tenths, 2nd = hundredths, 3rd = thousandths.",
            visual: { type: "equation_chain", steps: ["4 . 3 2 7", "↑   ↑ ↑ ↑", "ones . t h th"] },
          },
          {
            title: `Answer: ${correctAnswer}`,
            body: explanation ?? `The correct digit in that position is ${correctAnswer}.`,
            highlight: `Answer = ${correctAnswer}`,
          },
        ],
      };
    }
  }

  // ─── Generic fallback ───────────────────────────────────────────────────────
  return {
    heading: "Let me explain! 🎓",
    steps: [
      {
        title: "Here's how to solve it",
        body: explanation ?? "Read the question carefully and think about what you know.",
      },
      {
        title: `The correct answer is: ${correctAnswer}`,
        body: "Now let's see if you can apply this!",
        highlight: `Correct: ${correctAnswer}`,
      },
    ],
  };
}
