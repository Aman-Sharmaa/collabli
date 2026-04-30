import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rapydlaunch | Video Editing, Graphic Design, Web Development, Marketing, AI & More | Kalp.ltd",
  description:
    "Full-service digital agency from India. Video editing, graphic design, web design, software development, digital marketing, social media management, influencer marketing, AI automation, branding, and 60+ services. Launch anything in 45 days. Trusted by 100+ clients worldwide.",
  keywords: [
    "video editing services",
    "graphic design agency",
    "web design company India",
    "software development India",
    "digital marketing agency",
    "social media management",
    "influencer marketing",
    "AI development",
    "SaaS development",
    "mobile app development",
    "SEO services India",
    "branding agency",
    "content marketing",
    "Rapydlaunch",
  ],
};

export default function RapydlaunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
