"use client";

import { useState } from "react";
import { parseQuizPaste, type ParsedQuestion } from "@/lib/quiz-parser";
import { type QuizQuestionPayload } from "@/lib/quizzes";
import {
  alertErrorClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
  inputClassName,
  panelClassName,
} from "@/lib/utils";

const PLACEHOLDER = `Q1. What is 2+2?
A) 3
B) 4
C) 5
D) 6

Q2. Capital of France?
A) London
B) Berlin
C) Paris
D) Madrid`;

type QuizPasteBuilderProps = {
  onComplete: (questions: QuizQuestionPayload[]) => void;
  onBack: () => void;
};

function buildCorrectAnswers(
  nextQuestions: ParsedQuestion[],
  previous: string[],
) {
  return nextQuestions.map((question, index) => {
    const existing = previous[index];
    const validLetters = new Set(
      question.options.map((option) => option.letter),
    );

    if (existing && validLetters.has(existing)) {
      return existing;
    }

    return "";
  });
}

function toPayload(
  parsedQuestions: ParsedQuestion[],
  correctAnswers: string[],
): QuizQuestionPayload[] {
  return parsedQuestions.map((question, index) => ({
    prompt: question.prompt,
    options: question.options.map((option) => ({
      text: option.text,
      isCorrect: option.letter === correctAnswers[index]?.toUpperCase(),
    })),
  }));
}

export function QuizPasteBuilder({
  onComplete,
  onBack,
}: QuizPasteBuilderProps) {
  const [subStep, setSubStep] = useState<"paste" | "answers">("paste");
  const [paste, setPaste] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function handleParse() {
    const { questions: nextQuestions, errors: parseErrors } =
      parseQuizPaste(paste);

    if (parseErrors.length > 0) {
      setErrors(parseErrors.slice(0, 4));
      setError(null);
      return;
    }

    setErrors([]);
    setParsedQuestions(nextQuestions);
    setCorrectAnswers((current) => buildCorrectAnswers(nextQuestions, current));
    setError(null);
    setSubStep("answers");
  }

  function handleComplete() {
    const missing = parsedQuestions.some((question, index) => {
      const letter = correctAnswers[index];
      return (
        !letter || !question.options.some((option) => option.letter === letter)
      );
    });

    if (missing) {
      setError("Select the correct answer for every question.");
      return;
    }

    onComplete(toPayload(parsedQuestions, correctAnswers));
  }

  if (subStep === "paste") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Paste your questions
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Separate each question with a blank line. Use{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800">
              A)
            </code>{" "}
            style options (2–6 per question). Question count is detected
            automatically.
          </p>
        </div>

        <textarea
          rows={14}
          value={paste}
          onChange={(event) => {
            setPaste(event.target.value);
            if (errors.length > 0) {
              setErrors([]);
            }
          }}
          placeholder={PLACEHOLDER}
          className={`${inputClassName} font-mono text-xs leading-relaxed`}
        />

        {errors.length > 0 ? (
          <div role="alert" className={alertErrorClassName}>
            <p className="font-medium">Fix these issues:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className={alertErrorClassName}>
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className={buttonSecondaryClassName}>
            Back
          </button>
          <button
            type="button"
            onClick={handleParse}
            className={buttonPrimaryClassName}>
            Parse &amp; continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">
          Mark correct answers
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {parsedQuestions.length} question
          {parsedQuestions.length === 1 ? "" : "s"} found — select the correct
          option for each.
        </p>
      </div>

      <div className="space-y-4">
        {parsedQuestions.map((question, questionIndex) => (
          <div
            key={question.orderIndex}
            className={`${panelClassName} space-y-3 border-zinc-200 bg-zinc-50/80`}>
            <p className="font-medium text-zinc-900">
              {questionIndex + 1}. {question.prompt}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => {
                const inputId = `paste-q${questionIndex}-${option.letter}`;
                const checked = correctAnswers[questionIndex] === option.letter;

                return (
                  <label
                    key={option.letter}
                    htmlFor={inputId}
                    className={cn(
                      "ui-press flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      checked
                        ? "border-zinc-900 bg-white shadow-sm"
                        : "border-zinc-200 bg-white hover:border-zinc-300",
                    )}>
                    <input
                      id={inputId}
                      type="radio"
                      name={`paste-correct-${questionIndex}`}
                      value={option.letter}
                      checked={checked}
                      onChange={() =>
                        setCorrectAnswers((current) => {
                          const next = [...current];
                          next[questionIndex] = option.letter;
                          return next;
                        })
                      }
                      className="mt-0.5"
                    />
                    <span className="text-zinc-900">
                      <span className="font-mono font-medium text-zinc-600">
                        {option.letter})
                      </span>{" "}
                      {option.text}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setSubStep("paste");
          }}
          className={buttonSecondaryClassName}>
          Back
        </button>
        <button
          type="button"
          onClick={handleComplete}
          className={buttonPrimaryClassName}>
          Continue
        </button>
      </div>
    </div>
  );
}
