import { panelClassName } from "@/lib/utils";

type PageLoadingProps = {
  variant?: "teacher" | "auth";
};

export function PageLoading({ variant = "teacher" }: PageLoadingProps) {
  if (variant === "auth") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md animate-pulse space-y-4">
          <div className={`${panelClassName} h-64 rounded-xl bg-zinc-200/80`} />
          <div className={`${panelClassName} h-32 rounded-xl bg-zinc-200/60`} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-zinc-200" />
        <div className="h-4 w-72 max-w-full rounded bg-zinc-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={`${panelClassName} h-24 rounded-xl bg-zinc-200/80`}
          />
        ))}
      </div>
      <div className={`${panelClassName} h-72 rounded-xl bg-zinc-200/60`} />
    </div>
  );
}
