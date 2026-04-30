"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ClientMarquee } from "@/components/client-marquee";
import { TeamCard } from "@/components/team-card";
import { Star, Loader2 } from "lucide-react";

type TeamMember = {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  email?: string;
  calendly?: string;
};

type Stat = {
  value: string;
  label: string;
};

type AboutUsData = {
  hero: {
    title: string;
    subtitle: string;
    ratingText: string;
  };
  mission: {
    title: string;
    description: string;
  };
  stats: Stat[];
  teamSectionTitle: string;
  teamSectionSubtitle: string;
  founders: TeamMember[];
  teamMembers: TeamMember[];
};

// Defaults matching the previous hardcoded values
const defaultAboutUs: AboutUsData = {
  hero: {
    title: "We empower startups to scale smarter and faster",
    subtitle:
      "We are a team of designers and engineers driven by one goal — helping ambitious startups build products that grow.",
    ratingText: "Rated 5.0 by founders worldwide",
  },
  mission: {
    title: "Our Mission",
    description:
      "Empower teams and founders with tools that reduce friction, simplify workflows, and enable sustainable growth.",
  },
  stats: [
    { value: "250+", label: "Projects Supported" },
    { value: "85%", label: "Client Retention Rate" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "30+", label: "Integrations Supported" },
  ],
  teamSectionTitle: "Our Founders & Team",
  teamSectionSubtitle:
    "Our team combines deep industry knowledge with hands-on experience to help startups grow smarter and faster.",
  founders: [
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
  ],
  teamMembers: [
    {
      name: "Honey Pathkar",
      role: "Full Stack Developer",
      image: "/team/honey.png",
      linkedin: "https://www.linkedin.com/in/honey-pathkar/",
    },
    {
      name: "Archana Kumari",
      role: "Full Stack Developer",
      image: "/team/archana.png",
      linkedin: "https://www.linkedin.com/in/archana-kumari-dev/",
    },
    {
      name: "Sandeep Shakya",
      role: "Area Manager (Gram)",
      image: "/team/sandeep.png",
      linkedin: "https://www.linkedin.com/in/sandeep-shakya-857014249/",
    },
    {
      name: "Krishna Mohan",
      role: "Area Manager (Gram)",
      image: "/team/krishna.png",
      linkedin: "https://www.linkedin.com/in/krishna-mohan-836529187/",
    },
    {
      name: "Anshul Jha",
      role: "Inventory Manager (Gram)",
      image: "/team/anshul.png",
    },
    {
      name: "Amit Kumar Nayak",
      role: "Inventory & Scripting (Gram)",
      image: "/team/amit.jpg",
    },
    {
      name: "Gopal Bajpai",
      role: "Video Editor (Gram)",
      image: "/team/gopal.png",
    },
  ],
};

export function AboutUsClient() {
  const [aboutUs, setAboutUs] = useState<AboutUsData>(defaultAboutUs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.aboutUs) {
          setAboutUs(data.settings.aboutUs);
        }
      })
      .catch((err) => console.error("Failed to load about us settings", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-gray-900">
      <Header />

      {/* HERO */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
            {aboutUs.hero.title.includes("\n")
              ? aboutUs.hero.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < aboutUs.hero.title.split("\n").length - 1 && <br />}
                  </span>
                ))
              : aboutUs.hero.title}
          </h1>

          <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            {aboutUs.hero.subtitle}
          </p>

          {aboutUs.hero.ratingText && (
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span>{aboutUs.hero.ratingText}</span>
            </div>
          )}
        </div>
      </section>

      {/* MISSION + STATS */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Mission */}
          <div className="lg:col-span-1 rounded-2xl bg-[#1e1e1e] p-6 sm:p-8 text-white">
            <h3 className="text-lg font-semibold mb-2">{aboutUs.mission.title}</h3>
            <p className="text-sm leading-relaxed text-gray-300">
              {aboutUs.mission.description}
            </p>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {aboutUs.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-6 sm:p-8"
              >
                <h4 className="text-2xl sm:text-3xl font-semibold">
                  {stat.value}
                </h4>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <ClientMarquee />
        </div>
      </section>

      {/* TEAM */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Text */}
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
              {aboutUs.teamSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-md leading-relaxed">
              {aboutUs.teamSectionSubtitle}
            </p>
          </div>

          {/* Founders */}
          {aboutUs.founders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {aboutUs.founders.map((member) => (
                <TeamCard
                  key={member.name}
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  linkedin={member.linkedin}
                  email={member.email}
                  calendly={member.calendly}
                />
              ))}
            </div>
          )}

          {/* Team Members */}
          {aboutUs.teamMembers.length > 0 && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {aboutUs.teamMembers.map((member) => (
                <TeamCard
                  key={member.name}
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  linkedin={member.linkedin}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
