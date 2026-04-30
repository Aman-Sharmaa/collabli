"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type CustomScript = { type: "url" | "inline"; value: string };

export function CustomScripts() {
  const [scripts, setScripts] = useState<CustomScript[]>([]);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((res) => res.json())
      .then((data) => {
        const list = data?.settings?.header?.customScripts;
        if (Array.isArray(list) && list.length > 0) {
          setScripts(list.filter((s: CustomScript) => s && (s.type === "url" ? s.value?.trim() : s.value?.trim())));
        }
      })
      .catch(() => {});
  }, []);

  if (!scripts.length) return null;

  return (
    <>
      {scripts.map((s, i) => {
        const key = `custom-script-${i}`;
        if (s.type === "url" && s.value?.trim().startsWith("http")) {
          return (
            <Script
              key={key}
              src={s.value.trim()}
              strategy="afterInteractive"
            />
          );
        }
        if (s.type === "inline" && s.value?.trim()) {
          return (
            <script
              key={key}
              type="text/javascript"
              dangerouslySetInnerHTML={{ __html: s.value.trim() }}
            />
          );
        }
        return null;
      })}
    </>
  );
}
