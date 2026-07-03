import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load target locale messages
  const localMessages = (await import(`../messages/${locale}.json`)).default;
  
  // Load default locale (en) messages for fallback
  const defaultMessages = locale === "en" 
    ? {} 
    : (await import(`../messages/en.json`)).default;

  // Deep merge helper so that missing keys fallback to English value
  const mergeMessages = (target: any, source: any): any => {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === "object") {
        if (!target[key]) target[key] = {};
        mergeMessages(target[key], source[key]);
      } else if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
    return target;
  };

  const messages = mergeMessages({ ...localMessages }, defaultMessages);

  return {
    locale,
    messages,
  };
});