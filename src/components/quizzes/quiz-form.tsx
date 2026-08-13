"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { QuizManualBuilder } from "@/components/quizzes/quiz-manual-builder";
import { QuizPasteBuilder } from "@/components/quizzes/quiz-paste-builder";
import {
  createEmptyQuestion,
  draftsToPayload,
  payloadToDrafts,
  quizActionInitialState,
  validateQuestionDrafts,
  type QuizActionState,
  type QuizQuestionPayload,
} from "@/lib/quizzes";
import {
  alertErrorClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
  inputClassName,
  methodCardClassName,
  panelClassName,
} from "@/lib/utils";
import { createQuiz, updateQuiz } from "@/server/actions/quizzes";

type QuizFormInitialData = {
  title: string;
  questions: QuizQuestionPayload[];
};

type QuizFormProps = {
  mode: "create" | "edit";
  quizId?: string;
  initialData?: QuizFormInitialData;
};

type CreationMethod = "manual" | "paste";
type FormStep = "method" | "build" | "title";

export function QuizForm({ mode, quizId, initialData }: QuizFormProps) {
  const action =
    mode === "edit" && quizId ? updateQuiz.bind(null, quizId) : createQuiz;
  const [state, formAction, isPending] = useActionState<
    QuizActionState,
    FormData
  >(action, quizActionInitialState);

  const [step, setStep] = useState<FormStep>(
    mode === "edit" || initialData ? "build" : "method",
  );
  const [method, setMethod] = useState<CreationMethod | null>(
    mode === "edit" || initialData ? "manual" : null,
  );
  const [questionPayload, setQuestionPayload] = useState<
    QuizQuestionPayload[] | null
  >(initialData?.questions ?? null);
  const [manualDrafts, setManualDrafts] = useState(() =>
    initialData?.questions
      ? payloadToDrafts(initialData.questions)
      : [createEmptyQuestion()],
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [stepError, setStepError] = useState<string | null>(null);

  const displayError = state.error ?? stepError;

  const stepLabels =
    mode === "create"
      ? [
          { id: "method" as const, label: "Method" },
          { id: "build" as const, label: "Questions" },
          { id: "title" as const, label: "Save" },
        ]
      : [
          { id: "build" as const, label: "Questions" },
          { id: "title" as const, label: "Save" },
        ];

  function stepIndex(current: FormStep) {
    if (mode === "edit") {
      return current === "build" ? 0 : 1;
    }

    if (current === "method") {
      return 0;
    }

    if (current === "build") {
      return 1;
    }

    return 2;
  }

  function handleManualContinue() {
    const validationError = validateQuestionDrafts(manualDrafts);

    if (validationError) {
      setStepError(validationError);
      return;
    }

    setQuestionPayload(draftsToPayload(manualDrafts));
    setStepError(null);
    setStep("title");
  }

  function handlePasteComplete(payload: QuizQuestionPayload[]) {
    setQuestionPayload(payload);
    setStepError(null);
    setStep("title");
  }

  function selectMethod(nextMethod: CreationMethod) {
    setMethod(nextMethod);
    setStepError(null);
    setStep("build");

    if (nextMethod === "manual" && manualDrafts.length === 0) {
      setManualDrafts([createEmptyQuestion()]);
    }
  }

  const activeStepIndex = stepIndex(step);

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="questions"
        value={JSON.stringify(questionPayload ?? [])}
      />

      <div className={`${panelClassName} space-y-4`}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
          {stepLabels.map((item, index) => (
            <span
              key={item.id}
              className={cn(
                "rounded-full px-3 py-1 font-medium",
                activeStepIndex === index
                  ? "bg-zinc-900 text-white"
                  : activeStepIndex > index
                    ? "bg-zinc-200 text-zinc-700"
                    : "bg-zinc-100 text-zinc-500",
              )}>
              {item.label}
            </span>
          ))}
        </div>

        {step === "method" ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                How do you want to add questions?
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Build question-by-question or paste a block of text.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectMethod("manual")}
                className={methodCardClassName}>
                <p className="font-semibold text-zinc-900">Build manually</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Type each question and answer, like Google Forms.
                </p>
              </button>

              <button
                type="button"
                onClick={() => selectMethod("paste")}
                className={methodCardClassName}>
                <p className="font-semibold text-zinc-900">Paste from text</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Paste many questions at once, then mark correct answers.
                </p>
              </button>
            </div>
          </div>
        ) : null}

        {step === "build" && method === "manual" ? (
          <QuizManualBuilder
            questions={manualDrafts}
            onChange={setManualDrafts}
            onContinue={handleManualContinue}
            onBack={
              mode === "create"
                ? () => {
                    setStepError(null);
                    setStep("method");
                  }
                : undefined
            }
          />
        ) : null}

        {step === "build" && method === "paste" ? (
          <QuizPasteBuilder
            onComplete={handlePasteComplete}
            onBack={() => {
              setStepError(null);
              setStep("method");
            }}
          />
        ) : null}

        {step === "title" ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Name and save
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                {questionPayload?.length ?? 0} MCQ
                {(questionPayload?.length ?? 0) === 1 ? "" : "s"} ready to save.
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-700">
                Quiz title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Chapter 5 review"
                className={inputClassName}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStepError(null);
                  setStep("build");
                }}
                className={buttonSecondaryClassName}>
                Back
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={buttonPrimaryClassName}>
                {isPending
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update quiz"
                    : "Save quiz"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {displayError ? (
        <p role="alert" className={alertErrorClassName}>
          {displayError}
        </p>
      ) : null}

      <Link
        href={
          mode === "edit" && quizId
            ? `/teacher/quizzes/${quizId}`
            : "/teacher/quizzes"
        }
        className={cn(buttonSecondaryClassName, "inline-flex items-center")}>
        Cancel
      </Link>
    </form>
  );
}
