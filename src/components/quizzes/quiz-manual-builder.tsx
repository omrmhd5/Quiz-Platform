"use client";

import { createEmptyQuestion, type QuizQuestionDraft } from "@/lib/quizzes";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/ui/action-control";
import { cn, inputClassName, panelClassName } from "@/lib/utils";

type QuizManualBuilderProps = {
  questions: QuizQuestionDraft[];
  onChange: (questions: QuizQuestionDraft[]) => void;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
};

function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

export function QuizManualBuilder({
  questions,
  onChange,
  onContinue,
  onBack,
  continueLabel,
}: QuizManualBuilderProps) {
  const t = useTranslations("quizzes");
  const tActions = useTranslations("actions");
  function updateQuestion(
    questionId: string,
    updater: (question: QuizQuestionDraft) => QuizQuestionDraft,
  ) {
    onChange(
      questions.map((question) =>
        question.id === questionId ? updater(question) : question,
      ),
    );
  }

  function addQuestion() {
    onChange([...questions, createEmptyQuestion()]);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">
          {t("buildYourQuiz")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {t("buildHint")}
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <article
            key={question.id}
            className={`${panelClassName} space-y-4 border-zinc-200`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">
                {t("questionPrompt")} {questionIndex + 1}
              </h3>
              {questions.length > 1 ? (
                <ActionButton
                  action="delete"
                  label={tActions("remove")}
                  onClick={() =>
                    onChange(questions.filter((item) => item.id !== question.id))
                  }
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`prompt-${question.id}`}
                className="block text-sm font-medium text-zinc-700">
                {t("questionPrompt")}
              </label>
              <input
                id={`prompt-${question.id}`}
                type="text"
                value={question.prompt}
                onChange={(event) =>
                  updateQuestion(question.id, (current) => ({
                    ...current,
                    prompt: event.target.value,
                  }))
                }
                placeholder={t("promptPlaceholder")}
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">
                {t("answerChoices")}
              </p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const inputId = `${question.id}-${option.id}`;
                  const isCorrect = question.correctOptionId === option.id;

                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg border px-3 py-2 transition-colors sm:flex-row sm:items-center sm:gap-3",
                        isCorrect
                          ? "border-green-300 bg-green-50"
                          : "border-zinc-200 bg-white",
                      )}>
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="w-6 shrink-0 font-mono text-sm font-medium text-zinc-500">
                          {optionLetter(optionIndex)})
                        </span>
                        <input
                          id={inputId}
                          type="text"
                          value={option.text}
                          onChange={(event) =>
                            updateQuestion(question.id, (current) => ({
                              ...current,
                              options: current.options.map((item) =>
                                item.id === option.id
                                  ? { ...item, text: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                          placeholder={t("optionPlaceholder", { letter: optionLetter(optionIndex) })}
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none focus:ring-0"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                        <button
                          type="button"
                          aria-pressed={isCorrect}
                          onClick={() =>
                            updateQuestion(question.id, (current) => ({
                              ...current,
                              correctOptionId: option.id,
                            }))
                          }
                          className={cn(
                            "ui-btn ui-btn-correct ui-press w-full sm:w-auto",
                            isCorrect && "is-active",
                          )}>
                          {isCorrect ? t("correct") : t("markCorrect")}
                        </button>
                        {question.options.length > 2 ? (
                          <ActionButton
                            action="delete"
                            label={tActions("remove")}
                            onClick={() =>
                              updateQuestion(question.id, (current) => {
                                const nextOptions = current.options.filter(
                                  (item) => item.id !== option.id,
                                );
                                const nextCorrect =
                                  current.correctOptionId === option.id
                                    ? ""
                                    : current.correctOptionId;

                                return {
                                  ...current,
                                  options: nextOptions,
                                  correctOptionId: nextCorrect,
                                };
                              })
                            }
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {question.options.length < 6 ? (
                <ActionButton
                  action="addOption"
                  onClick={() =>
                    updateQuestion(question.id, (current) => {
                      const nextOption = {
                        id: crypto.randomUUID(),
                        text: "",
                      };

                      return {
                        ...current,
                        options: [...current.options, nextOption],
                      };
                    })
                  }
                />
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <ActionButton
        action="addQuestion"
        onClick={addQuestion}
        className="w-full sm:w-auto"
      />

      <div className="flex flex-wrap gap-2">
        {onBack ? <ActionButton action="back" onClick={onBack} size="md" /> : null}
        <ActionButton
          action="continue"
          onClick={onContinue}
          size="md"
          label={continueLabel ?? tActions("continue")}
        />
      </div>
    </div>
  );
}
