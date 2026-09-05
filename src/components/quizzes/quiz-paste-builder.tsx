"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/ui/action-control";
import { useAppLocale } from "@/components/providers/locale-provider";
import { getMessage, type TMsg } from "@/lib/i18n/messages";
import { parseQuizPaste, type ParsedQuestion } from "@/lib/quiz-parser";
import { type QuizQuestionPayload } from "@/lib/quizzes";
import {
  alertErrorClassName,
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
  const { locale } = useAppLocale();
  const t = useTranslations("quizzes");
  const [subStep, setSubStep] = useState<"paste" | "answers">("paste");
  const [paste, setPaste] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<TMsg[]>([]);

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
      setError(t("selectCorrect"));
      return;
    }

    onComplete(toPayload(parsedQuestions, correctAnswers));
  }

  if (subStep === "paste") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            {t("pasteQuestions")}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {t("pasteQuestionsHint")}
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
            <p className="font-medium">{t("fixIssues")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((message, index) => (
                <li key={`${message.key}-${index}`}>{getMessage(locale, message.key, message.values)}</li>
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
          <ActionButton action="back" onClick={onBack} size="md" />
          <ActionButton action="parse" onClick={handleParse} size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">
          {t("markCorrectAnswers")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {t("questionsFound", { count: parsedQuestions.length })}
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
        <ActionButton
          action="back"
          onClick={() => {
            setError(null);
            setSubStep("paste");
          }}
          size="md"
        />
        <ActionButton action="continue" onClick={handleComplete} size="md" />
      </div>
    </div>
  );
}
