"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("quizzes");
  const tSession = useTranslations("session");
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
          { id: "method" as const, label: t("method") },
          { id: "build" as const, label: t("questionsTab") },
          { id: "title" as const, label: t("saveQuiz") },
        ]
      : [
          { id: "build" as const, label: t("questionsTab") },
          { id: "title" as const, label: t("saveQuiz") },
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
                {t("methodHint")}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                {t("methodDescription")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectMethod("manual")}
                className={methodCardClassName}>
                <p className="font-semibold text-zinc-900">{t("buildManually")}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {t("buildManuallyHint")}
                </p>
              </button>

              <button
                type="button"
                onClick={() => selectMethod("paste")}
                className={methodCardClassName}>
                <p className="font-semibold text-zinc-900">{t("pasteFromText")}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {t("pasteFromTextHint")}
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
                {t("nameAndSave")}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                {t("questionsReady", { count: questionPayload?.length ?? 0 })}
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-700">
                {t("quizTitle")}
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("titlePlaceholder")}
                className={inputClassName}
              />
            </div>
            {requiresHistoryWipe ? (
              <p className="text-sm text-red-700">
                {t("editWillErase", {
                  count: sessionCount,
                  liveNote: isLive ? ` ${tSession("liveNow")}.` : "",
                })}
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
                    ? t("saving")
                    : mode === "edit"
                      ? t("updateQuiz")
                      : t("saveQuiz")
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("wipeTitle")}
        description={t("editWillErase", { count: sessionCount, liveNote: isLive ? ` ${tSession("liveNow")}.` : "" })}
        confirmLabel={isPending ? t("saving") : t("saveAndErase")}
        cancelLabel={t("keepEditing")}
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
