import {
  Film,
  Scissors,
  MonitorPlay,
  Camera,
  Video,
  Clapperboard,
  ImageIcon,
  PenTool,
  Presentation,
  Printer,
  Type,
  Aperture,
  Layout,
  Globe,
  ShoppingCart,
  Palette,
  Smartphone,
  Code,
  Layers,
  Plug,
  Database,
  Cloud,
  Shield,
  Search,
  MousePointerClick,
  Mail,
  TrendingUp,
  Target,
  LineChart,
  Share2,
  PenSquare,
  MessageCircle,
  AtSign,
  BarChart3,
  Rss,
  Crown,
  Handshake,
  UsersRound,
  Newspaper,
  Award,
  Podcast,
  Bot,
  Brain,
  Zap,
  Cog,
  FileText,
  Network,
  Lightbulb,
  BookOpen,
  Briefcase,
  MapPin,
  Languages,
  GraduationCap,
  FileCode,
  Mic2,
  Megaphone,
  LifeBuoy,
  Headphones,
  HardDrive,
  CreditCard,
  Store,
  Package,
  type LucideIcon,
} from "lucide-react";

export type RapydService = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type RapydCategory = {
  slug: string;
  category: string;
  shortName: string;
  icon: LucideIcon;
  description: string;
  longDescription: string;
  services: RapydService[];
  keywords: string[];
};

export const BRAND_RED = "#ED1C24";
export const BRAND_RED_HOVER = "#d0171e";

export const serviceCategories: RapydCategory[] = [
  {
    slug: "video-editing",
    category: "Video Editing & Production",
    shortName: "Video Editing",
    icon: Film,
    description: "End-to-end video production for brands, startups, and creators worldwide.",
    longDescription:
      "From YouTube channels and Instagram Reels to corporate ads and animated explainers, we deliver broadcast-quality video editing with fast turnarounds. Our India-based team works across time zones so your content never stops.",
    services: [
      { icon: Film, title: "YouTube Video Editing", description: "Professional editing for YouTube channels including cuts, color grading, thumbnails, intros, outros, and shorts optimized for watch time." },
      { icon: Scissors, title: "Reels & Short-Form Content", description: "Instagram Reels, TikTok, YouTube Shorts with trend-aware editing optimized for maximum virality and engagement." },
      { icon: Clapperboard, title: "Corporate & Ad Films", description: "Product demos, explainer videos, customer testimonials, brand commercials, and recruitment videos." },
      { icon: MonitorPlay, title: "Motion Graphics & Animation", description: "2D/3D animations, kinetic typography, logo reveals, animated infographics, and explainer animations." },
      { icon: Camera, title: "Podcast & Webinar Editing", description: "Multi-cam editing, audio cleanup, audiogram creation, highlight clips, and podcast-to-video packaging." },
      { icon: Video, title: "UGC & Social Ads Editing", description: "User-generated style ads, A/B test creatives, dynamic product ads, and performance-optimized video clips." },
    ],
    keywords: ["video editing", "YouTube editor", "reels editing", "motion graphics", "corporate video", "video production India"],
  },
  {
    slug: "graphic-design",
    category: "Graphic Design",
    shortName: "Graphic Design",
    icon: ImageIcon,
    description: "Stunning visuals that communicate your brand story across every touchpoint.",
    longDescription:
      "Whether you need a complete brand identity, social media creatives, or pitch decks that close deals, our design team delivers pixel-perfect work that elevates your brand across print and digital.",
    services: [
      { icon: ImageIcon, title: "Brand Identity Design", description: "Logos, brand guidelines, color systems, typography, and complete visual identity kits that stand out." },
      { icon: PenTool, title: "Social Media Creatives", description: "Posts, stories, carousels, banners, cover images, and ad creatives tailored for every platform." },
      { icon: Presentation, title: "Pitch Deck & Presentation Design", description: "Investor decks, sales presentations, keynote templates, and corporate presentation systems." },
      { icon: Printer, title: "Print & Packaging Design", description: "Business cards, brochures, flyers, posters, packaging, labels, and merchandise design." },
      { icon: Type, title: "Infographic & Data Visualization", description: "Complex data transformed into beautiful, shareable infographics and visual stories." },
      { icon: Aperture, title: "UI Graphics & Illustrations", description: "Custom icons, hero illustrations, app graphics, website visual elements, and stock-free imagery." },
    ],
    keywords: ["graphic design", "brand identity", "logo design", "social media creatives", "pitch deck design", "packaging design"],
  },
  {
    slug: "web-design",
    category: "Web Design & Development",
    shortName: "Web Design",
    icon: Globe,
    description: "Websites and web apps that convert visitors into customers, designed for global audiences.",
    longDescription:
      "We build fast, beautiful, SEO-optimized websites that work flawlessly across devices. From landing pages and corporate sites to full e-commerce stores, designed to convert and engineered for performance.",
    services: [
      { icon: Layout, title: "Landing Page Design", description: "High-converting landing pages with A/B tested layouts, persuasive copy, and optimized forms." },
      { icon: Globe, title: "Corporate & Business Websites", description: "Professional multi-page websites with CMS, SEO, analytics, and multi-language support." },
      { icon: ShoppingCart, title: "E-Commerce Development", description: "Shopify, WooCommerce, and custom stores with payment gateways, inventory, and order management." },
      { icon: Palette, title: "UI/UX Design", description: "User research, wireframes, interactive prototypes, usability testing, and pixel-perfect interfaces." },
      { icon: Smartphone, title: "Responsive & PWA Development", description: "Mobile-first websites, Progressive Web Apps, AMP pages, and cross-device optimization." },
      { icon: Code, title: "WordPress & CMS Development", description: "Custom themes, plugins, headless CMS, migrations, and platform setup for WordPress, Webflow, and more." },
    ],
    keywords: ["web design", "website development", "landing page", "ecommerce development", "UI UX design", "WordPress development India"],
  },
  {
    slug: "software-development",
    category: "Software Development",
    shortName: "Software Dev",
    icon: Layers,
    description: "Custom software, SaaS platforms, and mobile apps engineered for scale.",
    longDescription:
      "From SaaS MVPs to enterprise platforms, we architect, build, and deploy production-grade software. Our full-stack team handles everything: frontend, backend, APIs, databases, cloud infra, and ongoing maintenance.",
    services: [
      { icon: Layers, title: "SaaS Product Development", description: "Full-stack SaaS platforms with authentication, billing, dashboards, APIs, and multi-tenancy." },
      { icon: Smartphone, title: "Mobile App Development", description: "Native iOS/Android and cross-platform apps using React Native, Flutter, or Swift/Kotlin." },
      { icon: Plug, title: "API & Integration Development", description: "REST/GraphQL APIs, third-party integrations, payment gateways, webhooks, and middleware." },
      { icon: Database, title: "Backend & Database Architecture", description: "Scalable backend systems, database design, caching, microservices, and event-driven architecture." },
      { icon: Cloud, title: "Cloud & DevOps", description: "AWS, GCP, Azure deployment, CI/CD pipelines, Docker, Kubernetes, and infrastructure as code." },
      { icon: Shield, title: "QA Testing & Security Audits", description: "Automated testing, penetration testing, code reviews, OWASP compliance, and security hardening." },
    ],
    keywords: ["software development India", "SaaS development", "mobile app development", "API development", "cloud DevOps", "custom software"],
  },
  {
    slug: "digital-marketing",
    category: "Digital Marketing",
    shortName: "Marketing",
    icon: Target,
    description: "Full-funnel marketing strategies that drive growth across every channel.",
    longDescription:
      "We plan, execute, and optimize marketing campaigns across search, social, email, and paid channels. Data-driven strategies that turn ad spend into revenue with transparent reporting and continuous optimization.",
    services: [
      { icon: Search, title: "SEO & Organic Growth", description: "Technical SEO audits, keyword research, on-page optimization, content strategy, and link building." },
      { icon: MousePointerClick, title: "PPC & Paid Advertising", description: "Google Ads, Meta Ads, LinkedIn Ads campaign setup, bid optimization, creative testing, and scaling." },
      { icon: Mail, title: "Email & WhatsApp Marketing", description: "Drip campaigns, newsletters, automation flows, segmentation, and WhatsApp business outreach." },
      { icon: TrendingUp, title: "Content Marketing & Strategy", description: "Blog strategy, content calendars, SEO articles, thought leadership, and content distribution." },
      { icon: Target, title: "Performance Marketing", description: "ROI-driven campaigns with pixel tracking, attribution modeling, and conversion rate optimization." },
      { icon: LineChart, title: "Analytics & Reporting", description: "GA4 setup, custom dashboards, funnel analysis, A/B testing, and data-driven recommendations." },
    ],
    keywords: ["digital marketing", "SEO services India", "PPC agency", "email marketing", "performance marketing", "Google Ads management"],
  },
  {
    slug: "social-media",
    category: "Social Media Management",
    shortName: "Social Media",
    icon: Share2,
    description: "Build, manage, and grow your social presence across every platform.",
    longDescription:
      "We handle your entire social media presence, from strategy and content creation to daily posting, engagement, and analytics. Grow your audience organically and turn followers into customers.",
    services: [
      { icon: Share2, title: "Social Media Strategy", description: "Platform selection, content pillars, audience personas, posting schedules, and growth roadmaps." },
      { icon: PenSquare, title: "Content Creation & Scheduling", description: "Platform-native posts, stories, reels, carousels, and automated publishing calendars." },
      { icon: MessageCircle, title: "Community Management", description: "Comment moderation, DM responses, engagement strategies, crisis response, and brand voice." },
      { icon: AtSign, title: "Platform Management", description: "Instagram, LinkedIn, X/Twitter, Facebook, Pinterest, YouTube, and Threads. Full channel management." },
      { icon: BarChart3, title: "Social Analytics & Insights", description: "Performance tracking, competitor analysis, audience insights, sentiment analysis, and monthly reports." },
      { icon: Rss, title: "Social Listening & Trends", description: "Brand monitoring, trend analysis, hashtag research, and opportunity identification in real time." },
    ],
    keywords: ["social media management", "Instagram management", "LinkedIn management", "social media agency India", "community management"],
  },
  {
    slug: "influencer-pr",
    category: "Influencer & PR Management",
    shortName: "Influencer & PR",
    icon: Crown,
    description: "Connect your brand with the right voices and build lasting public trust.",
    longDescription:
      "We identify, negotiate, and manage influencer partnerships that drive real results. From nano-influencers to celebrity endorsements, combined with PR and media outreach to build brand credibility.",
    services: [
      { icon: Crown, title: "Influencer Discovery & Outreach", description: "Find and vet influencers by niche, reach, engagement rate, audience demographics, and brand fit." },
      { icon: Handshake, title: "Campaign Management", description: "End-to-end influencer campaign planning, negotiation, execution, content approval, and ROI analysis." },
      { icon: UsersRound, title: "Micro & Nano Influencer Programs", description: "Scalable programs with micro-influencers for authentic, high-engagement campaigns at lower cost." },
      { icon: Newspaper, title: "PR & Media Outreach", description: "Press releases, media kits, journalist outreach, feature placements, and crisis communications." },
      { icon: Award, title: "Reputation Management", description: "Online reputation monitoring, review management, brand sentiment analysis, and response strategies." },
      { icon: Podcast, title: "Podcast & Event Sponsorships", description: "Identify and manage sponsorship opportunities across podcasts, events, and industry conferences." },
    ],
    keywords: ["influencer marketing", "PR agency India", "influencer management", "reputation management", "media outreach"],
  },
  {
    slug: "ai-automation",
    category: "AI & Automation",
    shortName: "AI & Automation",
    icon: Bot,
    description: "Leverage AI and automation to 10x your business efficiency and capabilities.",
    longDescription:
      "From custom AI chatbots and ML models to workflow automation and CRM setup, we help businesses integrate cutting-edge AI to reduce costs, increase speed, and unlock capabilities that weren't possible before.",
    services: [
      { icon: Bot, title: "AI Chatbots & Agents", description: "Custom chatbots, customer support bots, sales agents, voice AI systems, and conversational interfaces." },
      { icon: Brain, title: "AI/ML Model Development", description: "Custom models for NLP, computer vision, recommendation engines, predictive analytics, and classification." },
      { icon: Zap, title: "Workflow Automation", description: "Zapier, Make, n8n. Automate repetitive tasks across your entire tech stack with custom triggers." },
      { icon: Cog, title: "CRM & Business Automation", description: "HubSpot, Salesforce, custom CRM setup with sales pipelines, marketing automation, and lead scoring." },
      { icon: FileText, title: "Document & Data Processing", description: "Automated document extraction, OCR, data pipelines, intelligent form processing, and classification." },
      { icon: Network, title: "AI Integration & APIs", description: "OpenAI, Anthropic, Google AI, custom LLM integrations into your existing products and workflows." },
    ],
    keywords: ["AI development India", "chatbot development", "ML models", "workflow automation", "AI integration", "business automation"],
  },
  {
    slug: "branding-strategy",
    category: "Branding & Strategy",
    shortName: "Branding",
    icon: Lightbulb,
    description: "Build a brand that resonates globally and commands premium positioning.",
    longDescription:
      "We help you define who you are, who you serve, and how you win. From brand strategy and market positioning to go-to-market plans and international expansion. Strategic thinking that drives business results.",
    services: [
      { icon: Lightbulb, title: "Brand Strategy & Positioning", description: "Market positioning, value proposition, competitive analysis, brand narrative, and messaging framework." },
      { icon: BookOpen, title: "Go-to-Market Strategy", description: "Launch planning, pricing strategy, channel selection, partnership models, and market entry roadmaps." },
      { icon: Briefcase, title: "Business Consulting", description: "Revenue model design, growth strategy, operational optimization, unit economics, and scaling plans." },
      { icon: MapPin, title: "International Market Entry", description: "Localization, cultural adaptation, regulatory guidance, competitor mapping, and market research for global expansion." },
      { icon: Languages, title: "Multilingual & Localization", description: "Website translation, content localization, culturally adapted marketing materials, and SEO for local markets." },
      { icon: GraduationCap, title: "Training & Workshops", description: "Team training on digital tools, marketing best practices, AI adoption, and growth frameworks." },
    ],
    keywords: ["brand strategy", "go-to-market strategy", "business consulting India", "international expansion", "branding agency"],
  },
  {
    slug: "content-copywriting",
    category: "Content & Copywriting",
    shortName: "Copywriting",
    icon: PenSquare,
    description: "Words that sell, educate, and build trust in every format.",
    longDescription:
      "From high-converting website copy and SEO blogs to technical documentation and video scripts, our writers craft content that drives action. Native-level English with deep understanding of global markets.",
    services: [
      { icon: PenSquare, title: "Website & Landing Page Copy", description: "Conversion-focused copy for websites, landing pages, product pages, and SaaS onboarding flows." },
      { icon: FileCode, title: "Technical & SaaS Writing", description: "API documentation, whitepapers, case studies, technical blogs, knowledge bases, and user guides." },
      { icon: Mic2, title: "Script Writing", description: "Video scripts, podcast scripts, ad scripts, webinar scripts, and presentation narratives." },
      { icon: Mail, title: "Email Copywriting", description: "Sales sequences, newsletters, onboarding emails, re-engagement campaigns, and transactional copy." },
      { icon: Newspaper, title: "Blog & Article Writing", description: "SEO-optimized articles, thought leadership pieces, guest posts, and long-form content strategy." },
      { icon: Megaphone, title: "Ad Copy & Creatives", description: "Google Ads, Meta Ads, LinkedIn Ads copy. Headline testing, creative briefs, and A/B test variants." },
    ],
    keywords: ["copywriting services", "content writing India", "SEO blog writing", "SaaS copywriting", "technical writing", "ad copy"],
  },
  {
    slug: "support-operations",
    category: "Support, Maintenance & Operations",
    shortName: "Support & Ops",
    icon: LifeBuoy,
    description: "Keep your digital assets running smoothly with 24/7 support from India to the world.",
    longDescription:
      "Ongoing maintenance, customer support setup, server management, and operational support. We keep your websites, apps, and digital infrastructure running at peak performance so you can focus on growth.",
    services: [
      { icon: LifeBuoy, title: "Website & App Maintenance", description: "Bug fixes, performance tuning, security patches, feature updates, and regular health checks." },
      { icon: Headphones, title: "Customer Support Setup", description: "Help desk setup, knowledge base creation, chatbot integration, ticketing systems, and support workflows." },
      { icon: HardDrive, title: "Server & Hosting Management", description: "VPS management, cloud hosting, SSL certificates, domain management, and 24/7 uptime monitoring." },
      { icon: CreditCard, title: "Payment & Billing Integration", description: "Stripe, Razorpay, PayPal. Subscription billing, invoicing, tax compliance, and financial dashboard setup." },
      { icon: Store, title: "Marketplace & Listing Management", description: "Amazon, Flipkart, Google My Business. Product listings, optimization, reviews, and account management." },
      { icon: Package, title: "Project Management & Operations", description: "End-to-end project coordination, sprint planning, resource allocation, and delivery management." },
    ],
    keywords: ["website maintenance", "app support India", "server management", "customer support setup", "DevOps services"],
  },
];

export function getCategoryBySlug(slug: string): RapydCategory | undefined {
  return serviceCategories.find((c) => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return serviceCategories.map((c) => c.slug);
}
