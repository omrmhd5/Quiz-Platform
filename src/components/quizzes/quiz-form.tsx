"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppLocale } from "@/components/providers/locale-provider";
import { getMessage } from "@/lib/i18n/messages";
import { QuizManualBuilder } from "@/components/quizzes/quiz-manual-builder";
import { QuizPasteBuilder } from "@/components/quizzes/quiz-paste-builder";
import { ActionButton, ActionLink } from "@/components/ui/action-control";
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
  sessionCount?: number;
  isLive?: boolean;
  initialData?: QuizFormInitialData;
};

function getEditWipeDescription(sessionCount: number, isLive: boolean) {
  const sessionLabel = `${sessionCount} session${sessionCount === 1 ? "" : "s"}`;
  const liveNote = isLive
    ? " This quiz is live right now — students will immediately lose access."
    : "";

  return `Saving will permanently delete ${sessionLabel}, all student attempts, and results.${liveNote} This cannot be undone.`;
}

type CreationMethod = "manual" | "paste";
type FormStep = "method" | "build" | "title";

export function QuizForm({
  mode,
  quizId,
  sessionCount = 0,
  isLive = false,
  initialData,
}: QuizFormProps) {
  const { locale } = useAppLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const action =
    mode === "edit" && quizId ? updateQuiz.bind(null, quizId) : createQuiz;
  const [state, formAction, isPending] = useActionState<
    QuizActionState,
    FormData
  >(action, quizActionInitialState);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wipeConfirmed, setWipeConfirmed] = useState(false);

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
  const requiresHistoryWipe = mode === "edit" && sessionCount > 0;

  useEffect(() => {
    if (!wipeConfirmed) {
      return;
    }

    formRef.current?.requestSubmit();
    setWipeConfirmed(false);
  }, [wipeConfirmed]);

  function handleSaveClick() {
    if (requiresHistoryWipe) {
      setConfirmOpen(true);
      return;
    }

    formRef.current?.requestSubmit();
  }

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
      setStepError(
        getMessage(locale, validationError.key, validationError.values),
      );
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
    <form ref={formRef} action={formAction} className="space-y-6">
      {requiresHistoryWipe ? (
        <input
          type="hidden"
          name="confirmWipeHistory"
          value={wipeConfirmed ? "1" : "0"}
        />
      ) : null}
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
            {requiresHistoryWipe ? (
              <p className="text-sm text-red-700">
                {getEditWipeDescription(sessionCount, isLive)} You will be asked
                to confirm when you click Update quiz.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <ActionButton
                action="back"
                onClick={() => {
                  setStepError(null);
                  setStep("build");
                }}
              />
              <ActionButton
                action="save"
                disabled={isPending}
                onClick={handleSaveClick}
                label={
                  isPending
                    ? "Saving..."
                    : mode === "edit"
                      ? "Update quiz"
                      : "Save quiz"
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Erase session history and save?"
        description={getEditWipeDescription(sessionCount, isLive)}
        confirmLabel={isPending ? "Saving..." : "Save and erase history"}
        cancelLabel="Keep editing"
        variant="danger"
        isPending={isPending}
        onConfirm={() => {
          setConfirmOpen(false);
          setWipeConfirmed(true);
        }}
        onCancel={() => {
          if (!isPending) {
            setConfirmOpen(false);
          }
        }}
      />

      {displayError ? (
        <p role="alert" className={alertErrorClassName}>
          {displayError}
        </p>
      ) : null}

      <ActionLink
        action="cancel"
        href={
          mode === "edit" && quizId
            ? `/teacher/quizzes/${quizId}`
            : "/teacher/quizzes"
        }
        size="md"
      />
    </form>
  );
}
