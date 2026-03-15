import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { mergeFeatureMessages } from "@mohasinac/cli/i18n";
import features from "@/features.config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const projectMessages = (await import(`../messages/${locale}.json`)).default;
  const featureMessages = await mergeFeatureMessages(locale, features);

  return {
    locale,
    messages: { ...featureMessages, ...projectMessages },
  };
});
