import { cookies, headers } from "next/headers";
import {
  getMessage,
  LOCALE_COOKIE,
  type AppLocale,
  type TMsg,
} from "./messages";

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookie === "ar" || cookie === "en") {
    return cookie;
  }

  const headerStore = await headers();
  const xLanguage = headerStore.get("x-language")?.trim().toLowerCase();
  if (xLanguage === "ar" || xLanguage === "en") {
    return xLanguage;
  }

  const accept = headerStore.get("accept-language")?.toLowerCase() ?? "";
  if (accept.startsWith("ar")) return "ar";
  return "en";
}

export async function tServer(
  key: string,
  values?: Record<string, string | number>,
) {
  const locale = await getRequestLocale();
  return getMessage(locale, key, values);
}

export async function tMsg(message: TMsg) {
  return tServer(message.key, message.values);
}
