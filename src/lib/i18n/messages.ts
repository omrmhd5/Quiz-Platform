import enMessages from "../../../messages/en.json";
import arMessages from "../../../messages/ar.json";

export type AppLocale = "en" | "ar";

export const messages: Record<AppLocale, typeof enMessages> = {
  en: enMessages,
  ar: arMessages,
};

export const LOCALE_COOKIE = "language";

/** Fixed TZ so server/client and Vercel/local agree (next-intl ENVIRONMENT_FALLBACK). */
export const APP_TIME_ZONE = "UTC";

function resolveMessage(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);

  return typeof value === "string" ? value : undefined;
}

export function interpolate(
  template: string,
  values?: Record<string, string | number>,
) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    values[name] === undefined ? `{${name}}` : String(values[name]),
  );
}

export function getMessage(
  locale: AppLocale,
  key: string,
  values?: Record<string, string | number>,
) {
  const raw =
    resolveMessage(messages[locale] as Record<string, unknown>, key) ??
    resolveMessage(messages.en as Record<string, unknown>, key) ??
    key;
  return interpolate(raw, values);
}

export type TMsg = {
  key: string;
  values?: Record<string, string | number>;
};

export function msg(
  key: string,
  values?: Record<string, string | number>,
): TMsg {
  return { key, values };
}
