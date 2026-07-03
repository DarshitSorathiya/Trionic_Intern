import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight, CheckCircle2, Globe, Scale } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function Home() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Global Warning Banner */}
      <div className="flex items-center justify-center bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-800 dark:text-amber-400 border-b border-amber-500/20">
        <span className="mr-2">⚠</span>
        {t("common.disclaimer")}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">{t("common.brandName")}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/sign-in">{t("common.signIn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-8">
          {t("landing.feature2")}
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-balance max-w-4xl mx-auto text-foreground">
          {t("landing.headline")}
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          {t("landing.subheadline")}
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto text-base">
            <Link href="/dashboard">
              {t("landing.getStarted")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Feature List */}
        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          <div className="flex flex-col gap-2 p-5 rounded-xl border bg-card/50 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{t("draft.citations")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("landing.feature1")}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-xl border bg-card/50 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{t("navigation.settings")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("landing.feature2")}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-xl border bg-card/50 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 mb-2">
              <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-lg text-amber-800 dark:text-amber-400">{t("common.disclaimer")}</h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
              {t("landing.feature3")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
