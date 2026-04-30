import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/page-hero";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services: Record<
  string,
  { title: string; description: string; longDescription: string }
> = {
  "saas-development": {
    title: "SaaS Development",
    description: "Scalable & secure web apps",
    longDescription:
      "We build modern, scalable SaaS applications from the ground up. Clean architecture, secure APIs, and a focus on performance and maintainability so your product can grow with your business.",
  },
  "saas-maintenance": {
    title: "SaaS Maintenance",
    description: "Ongoing support & upgrades",
    longDescription:
      "Keep your product running smoothly with ongoing support, security updates, dependency upgrades, and performance tuning. We handle the ops so you can focus on growth.",
  },
  "mobile-app-development": {
    title: "Mobile App Development",
    description: "iOS & Android applications",
    longDescription:
      "Native and cross-platform mobile apps that feel fast and intuitive. From MVPs to full-featured products, we ship iOS and Android experiences your users will love.",
  },
  "saas-designing": {
    title: "SaaS Designing",
    description: "UI/UX that converts",
    longDescription:
      "UI/UX design that balances clarity, conversion, and delight. We create interfaces that help users get things done and support your business goals.",
  },
  "marketing-branding": {
    title: "Marketing & Branding",
    description: "Growth-focused positioning",
    longDescription:
      "Positioning, messaging, and campaigns that resonate. We help you stand out, tell your story, and reach the right audience with consistency and clarity.",
  },
  "video-editing": {
    title: "Video Editing",
    description: "Product & brand storytelling",
    longDescription:
      "Product demos, explainers, and brand videos that communicate clearly and hold attention. We turn your ideas into polished, shareable content.",
  },
};

export async function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services[slug];
  if (!service) notFound();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />
      <PageHero
        title={service.title}
        subtitle={service.longDescription}
      />
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(0,120,255,0.08)] p-8 sm:p-12 max-w-2xl">
            <p className="text-gray-600 leading-relaxed mb-8">
              Ready to get started? Book a call or send us a message,we’d love to
              hear about your project.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
              >
                Contact us
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f8f6f2] text-gray-900 text-sm font-medium hover:bg-gray-200 transition"
              >
                View all services
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
