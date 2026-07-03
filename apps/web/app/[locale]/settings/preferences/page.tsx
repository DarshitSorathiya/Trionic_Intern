import { redirect } from "@/i18n/routing";

export default async function PreferencesSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/settings#preferences", locale });
}
