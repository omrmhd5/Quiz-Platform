"use client";

import { createEmptyQuestion, type QuizQuestionDraft } from "@/lib/quizzes";
import {
  buttonDangerClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
  inputClassName,
  panelClassName,
} from "@/lib/utils";

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
  continueLabel = "Continue",
}: QuizManualBuilderProps) {
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
          Build your quiz
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Add each question, type the answer choices, and mark the correct one.
          Students will see options in{" "}
          <strong className="font-medium">random order</strong>— the A/B/C
          labels here are only for you while building.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <article
            key={question.id}
            className={`${panelClassName} space-y-4 border-zinc-200`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-900">
                Question {questionIndex + 1}
              </h3>
              {questions.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      questions.filter((item) => item.id !== question.id),
                    )
                  }
                  className={cn(buttonDangerClassName, "ui-btn-sm")}>
                  Remove
                </button>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`prompt-${question.id}`}
                className="block text-sm font-medium text-zinc-700">
                Question
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
                placeholder="What is the capital of France?"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">
                Answer choices{" "}
                <span className="font-normal text-zinc-500">
                  (click Mark correct on the right answer)
                </span>
              </p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const inputId = `${question.id}-${option.id}`;
                  const isCorrect = question.correctOptionId === option.id;

                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                        isCorrect
                          ? "border-green-300 bg-green-50"
                          : "border-zinc-200 bg-white",
                      )}>
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
                        placeholder={`Option ${optionLetter(optionIndex)}`}
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none focus:ring-0"
                      />
                      <div className="flex shrink-0 items-center gap-1.5">
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
                            "ui-btn ui-btn-correct ui-press",
                            isCorrect && "is-active",
                          )}>
                          {isCorrect ? "Correct ✓" : "Mark correct"}
                        </button>
                        {question.options.length > 2 ? (
                          <button
                            type="button"
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
                            className={cn(buttonDangerClassName, "ui-btn-sm")}>
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {question.options.length < 6 ? (
                <button
                  type="button"
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
                  className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
                  Add option
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className={cn(buttonSecondaryClassName, "w-full sm:w-auto")}>
        + Add question
      </button>

      <div className="flex flex-wrap gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className={buttonSecondaryClassName}>
            Back
          </button>
        ) : null}
        <button
          type="button"
          onClick={onContinue}
          className={buttonPrimaryClassName}>
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
