import { msg, type TMsg } from "@/lib/i18n/messages";

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
): { question?: ParsedQuestion; errors: TMsg[] } {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const errors: TMsg[] = [];

  if (lines.length < 2) {
    return {
      errors: [msg("errors.parserNeedLines", { n: questionNumber })],
    };
  }

  if (looksLikeOptionStart(lines[0])) {
    return {
      errors: [msg("errors.parserMissingPrompt", { n: questionNumber })],
    };
  }

  const prompt = stripQuestionPrefix(lines[0]);

  if (!prompt) {
    return {
      errors: [msg("errors.parserEmptyPrompt", { n: questionNumber })],
    };
  }

  const options: ParsedOption[] = [];
  let optionLinesHadErrors = false;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (OPTION_EMPTY.test(line)) {
      const letter = line.match(/^([A-Fa-f])/)?.[1]?.toUpperCase() ?? "?";
      errors.push(msg("errors.parserEmptyOption", { n: questionNumber, line: index + 1, letter }));
      optionLinesHadErrors = true;
      continue;
    }

    const withText = line.match(OPTION_WITH_TEXT);

    if (withText) {
      const letter = withText[1].toUpperCase();
      const text = withText[2].trim();

      if (!text) {
        errors.push(msg("errors.parserEmptyOption", { n: questionNumber, line: index + 1, letter }));
        optionLinesHadErrors = true;
        continue;
      }

      options.push({ letter, text });
      continue;
    }

    if (OPTION_MISSING_PAREN.test(line)) {
      const letter = line.match(/^([A-Fa-f])/)?.[1]?.toUpperCase() ?? "A";
      errors.push(msg("errors.parserNeedParen", { n: questionNumber, line: index + 1, letter }));
      optionLinesHadErrors = true;
      continue;
    }

    errors.push(msg("errors.parserFormat", { n: questionNumber, line: index + 1 }));
    optionLinesHadErrors = true;
  }

  if (optionLinesHadErrors) {
    return { errors };
  }

  if (options.length < 2) {
    return {
      errors: [msg("errors.parserMinOptions", { n: questionNumber, count: options.length })],
    };
  }

  if (options.length > 6) {
    return {
      errors: [msg("errors.parserMaxOptions", { n: questionNumber })],
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
      errors: [msg("errors.parserLetterOrder", { n: questionNumber, expected, index: firstWrongIndex + 1, got })],
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
): { questions: ParsedQuestion[]; errors: TMsg[] } {
  const trimmed = text.trim();

  if (!trimmed) {
    return { questions: [], errors: [msg("errors.pasteQuestionsFirst")] };
  }

  const blocks = trimmed.split(/\r?\n\s*\r?\n/).filter((block) => block.trim());
  const errors: TMsg[] = [];
  const questions: ParsedQuestion[] = [];

  blocks.forEach((block, index) => {
    const result = parseQuestionBlock(block.trim(), index + 1);
    errors.push(...result.errors);

    if (result.question) {
      questions.push(result.question);
    }
  });

  if (expectedCount !== undefined && questions.length !== expectedCount) {
    errors.push(msg("errors.parserExpectedCount", { expected: expectedCount, found: questions.length }));
  }

  return { questions, errors };
}

export function validateCorrectAnswers(
  questions: ParsedQuestion[],
  correctLetters: string[],
): TMsg | null {
  if (correctLetters.length !== questions.length) {
    return msg("errors.selectCorrectAll");
  }

  for (let index = 0; index < questions.length; index += 1) {
    const letter = correctLetters[index]?.trim().toUpperCase();
    const validLetters = new Set(
      questions[index].options.map((option) => option.letter),
    );

    if (!letter || !validLetters.has(letter)) {
      return msg("errors.parserValidCorrect", { n: index + 1 });
    }
  }

  return null;
}
