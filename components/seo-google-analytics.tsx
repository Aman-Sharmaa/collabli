"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type SeoSettings = {
  enableGoogleAnalytics?: boolean;
  googleAnalyticsId?: string;
};

export function GoogleAnalytics() {
  const [settings, setSettings] = useState<SeoSettings | null>(null);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.seo) {
          setSettings(data.settings.seo);
        }
      })
      .catch(() => {});
  }, []);

  const enabled = settings?.enableGoogleAnalytics && settings?.googleAnalyticsId?.trim();
  const id = (settings?.googleAnalyticsId || "").trim();

  if (!enabled || !id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
