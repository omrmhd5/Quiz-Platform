export type ParsedOption = {
  letter: string;
  text: string;
};

export type ParsedQuestion = {
  orderIndex: number;
  prompt: string;
  options: ParsedOption[];
};

const OPTION_WITH_TEXT = /^([A-Fa-f])\)\s*(.+)$/;
const OPTION_EMPTY = /^([A-Fa-f])\)\s*$/;
const OPTION_MISSING_PAREN = /^([A-Fa-f])\s+(\S.+)$/;

function stripQuestionPrefix(line: string) {
  return line.replace(/^Q\d+[.:\s]+/i, "").trim();
}

function looksLikeOptionStart(line: string) {
  return (
    OPTION_WITH_TEXT.test(line) ||
    OPTION_EMPTY.test(line) ||
    OPTION_MISSING_PAREN.test(line)
  );
}

function parseQuestionBlock(
  block: string,
  questionNumber: number,
): { question?: ParsedQuestion; errors: string[] } {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const errors: string[] = [];

  if (lines.length < 2) {
    return {
      errors: [
        `Question ${questionNumber}: add a question line and at least 2 options (A), B), …).`,
      ],
    };
  }

  if (looksLikeOptionStart(lines[0])) {
    return {
      errors: [
        `Question ${questionNumber}: missing question line. Start with your question (e.g. "Q${questionNumber}. What is 2+2?"), then put each answer on its own line below.`,
      ],
    };
  }

  const prompt = stripQuestionPrefix(lines[0]);

  if (!prompt) {
    return {
      errors: [`Question ${questionNumber}: question text cannot be empty.`],
    };
  }

  const options: ParsedOption[] = [];
  let optionLinesHadErrors = false;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    const lineLabel = `Question ${questionNumber}, line ${index + 1}`;

    if (OPTION_EMPTY.test(line)) {
      const letter = line.match(/^([A-Fa-f])/)?.[1]?.toUpperCase() ?? "?";
      errors.push(
        `${lineLabel}: option ${letter} is empty — type the answer after "${letter})".`,
      );
      optionLinesHadErrors = true;
      continue;
    }

    const withText = line.match(OPTION_WITH_TEXT);

    if (withText) {
      const letter = withText[1].toUpperCase();
      const text = withText[2].trim();

      if (!text) {
        errors.push(
          `${lineLabel}: option ${letter} is empty — type the answer after "${letter})".`,
        );
        optionLinesHadErrors = true;
        continue;
      }

      options.push({ letter, text });
      continue;
    }

    if (OPTION_MISSING_PAREN.test(line)) {
      const letter = line.match(/^([A-Fa-f])/)?.[1]?.toUpperCase() ?? "A";
      errors.push(
        `${lineLabel}: use "${letter}) answer text" — put a closing parenthesis after the letter.`,
      );
      optionLinesHadErrors = true;
      continue;
    }

    errors.push(
      `${lineLabel}: use "A) answer text" format (letter, closing parenthesis, then the answer).`,
    );
    optionLinesHadErrors = true;
  }

  if (optionLinesHadErrors) {
    return { errors };
  }

  if (options.length < 2) {
    return {
      errors: [
        `Question ${questionNumber}: needs at least 2 options. You have ${options.length}.`,
      ],
    };
  }

  if (options.length > 6) {
    return {
      errors: [`Question ${questionNumber}: maximum 6 options (A–F).`],
    };
  }

  const expectedLetters = "ABCDEF".slice(0, options.length).split("");
  const firstWrongIndex = options.findIndex(
    (option, index) => option.letter !== expectedLetters[index],
  );

  if (firstWrongIndex !== -1) {
    const expected = expectedLetters[firstWrongIndex];
    const got = options[firstWrongIndex].letter;

    return {
      errors: [
        `Question ${questionNumber}: options must run A, B, C… without skipping. Expected ${expected}) on option ${firstWrongIndex + 1}, found ${got}).`,
      ],
    };
  }

  return {
    question: {
      orderIndex: questionNumber - 1,
      prompt,
      options,
    },
    errors,
  };
}

export function parseQuizPaste(
  text: string,
  expectedCount?: number,
): { questions: ParsedQuestion[]; errors: string[] } {
  const trimmed = text.trim();

  if (!trimmed) {
    return { questions: [], errors: ["Paste your quiz questions first."] };
  }

  const blocks = trimmed.split(/\r?\n\s*\r?\n/).filter((block) => block.trim());
  const errors: string[] = [];
  const questions: ParsedQuestion[] = [];

  blocks.forEach((block, index) => {
    const result = parseQuestionBlock(block.trim(), index + 1);
    errors.push(...result.errors);

    if (result.question) {
      questions.push(result.question);
    }
  });

  if (expectedCount !== undefined && questions.length !== expectedCount) {
    errors.push(
      `Expected ${expectedCount} question${expectedCount === 1 ? "" : "s"} but found ${questions.length}. Separate each question with a blank line.`,
    );
  }

  return { questions, errors };
}

export function validateCorrectAnswers(
  questions: ParsedQuestion[],
  correctLetters: string[],
): string | null {
  if (correctLetters.length !== questions.length) {
    return "Select the correct answer for every question.";
  }

  for (let index = 0; index < questions.length; index += 1) {
    const letter = correctLetters[index]?.trim().toUpperCase();
    const validLetters = new Set(
      questions[index].options.map((option) => option.letter),
    );

    if (!letter || !validLetters.has(letter)) {
      return `Question ${index + 1}: choose a valid correct answer.`;
    }
  }

  return null;
}
