import { redirect } from "@/i18n/routing";

export default async function SecuritySettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/settings#security", locale });
}
