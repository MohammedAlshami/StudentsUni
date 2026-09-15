import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const services = t.raw("items") as Array<{ title: string; description: string; steps: string[] }>;
  const processSteps = t.raw("process.steps") as Array<{ title: string; desc: string }>;

  return (
    <div>
      {/* Header */}
      <div className="border-b border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-2xl font-bold">{t("header.title")}</h1>
          <p className="mt-2 text-sm text-black/60">{t("header.subtitle")}</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="border border-black/10 p-5">
              <h2 className="text-base font-bold">{service.title}</h2>
              <p className="mt-2 text-xs text-black/60 leading-relaxed">
                {service.description}
              </p>
              <ol className="mt-4 space-y-1">
                {service.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-black/50">
                    <span className="font-bold text-black/30">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-bold text-center">{t("process.title")}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {processSteps.map((item, i) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center border-2 border-black text-lg font-bold">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-black/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <p className="text-sm text-black/60">{t("cta.text")}</p>
          <Link href="/contact" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
