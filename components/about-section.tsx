"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TeamCard } from "@/components/team-card";
import { DEFAULT_HOME_PAGE_SETTINGS, type HomeAboutSettings } from "@/lib/home-page-defaults";

type Founder = {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  email?: string;
  calendly?: string;
};

const defaultFounders: Founder[] = [
  {
    name: "Aman Sharma",
    role: "Founder & CEO",
    image: "/team/aman.png",
    linkedin: "https://www.linkedin.com/in/amnshrma/",
    email: "mailto:aman@rapydlaunch.com",
    calendly: "https://cal.com/amansharma",
  },
  {
    name: "Muskan Sharma",
    role: "Co-Founder & CFO",
    image: "/team/muskan.png",
    linkedin: "https://www.linkedin.com/in/muskan07/",
  },
];

type AboutSectionProps = {
  settings?: HomeAboutSettings;
};

export function AboutSection({ settings = DEFAULT_HOME_PAGE_SETTINGS.about }: AboutSectionProps) {
  const [founders, setFounders] = useState<Founder[]>(defaultFounders);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((res) => res.json())
      .then((data) => {
        const cms = data.settings?.aboutUs?.founders;
        if (Array.isArray(cms) && cms.length > 0) {
          setFounders(cms);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-medium mb-6">{settings.title}</h2>
            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              {settings.description}
            </p>
            <a
              href={settings.linkHref || "/about-us"}
              className="inline-flex items-center gap-2 mt-6 text-base font-medium text-black hover:gap-3 transition-all"
            >
              {settings.linkLabel}
              <span aria-hidden>→</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8"
          >
            {founders.map((founder) => (
              <TeamCard
                key={founder.name}
                name={founder.name}
                role={founder.role}
                image={founder.image}
                linkedin={founder.linkedin}
                email={founder.email}
                calendly={founder.calendly}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
