export type HomeSectionKey =
  | "hero"
  | "products"
  | "services"
  | "about"
  | "videoTestimonial"
  | "testimonials"
  | "faq";

export type HomeHeroSettings = {
  announcementText: string;
  announcementHref: string;
  titleStatic: string;
  titleTyping: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaTargetId: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustedText: string;
  clientLogos: string[];
};

export type HomeAboutSettings = {
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
};

export type HomeTestimonialItem = {
  quote: string;
  name: string;
  role: string;
};

export type HomeTestimonialsSettings = {
  title: string;
  subtitle: string;
  items: HomeTestimonialItem[];
};

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export type HomeFaqSettings = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  items: HomeFaqItem[];
};

export type HomeVideoTestimonialSettings = {
  sectionLabel: string;
  title: string;
  founderName: string;
  founderRole: string;
  founderImage: string;
  quote: string;
  description: string;
  companyName: string;
  companyCategory: string;
  companyLink: string;
  companyImage: string;
  socialHandle: string;
  instagramFollowers: string;
  youtubeSubscribers: string;
  reelEmbedUrl: string;
};

export type HomePageSettings = {
  sectionOrder: HomeSectionKey[];
  hero: HomeHeroSettings;
  about: HomeAboutSettings;
  testimonials: HomeTestimonialsSettings;
  faq: HomeFaqSettings;
  videoTestimonial: HomeVideoTestimonialSettings;
};

export const DEFAULT_HOME_PAGE_SETTINGS: HomePageSettings = {
  sectionOrder: [
    "hero",
    "products",
    "services",
    "about",
    "videoTestimonial",
    "testimonials",
    "faq",
  ],
  hero: {
    announcementText: "Gram App is now Live",
    announcementHref: "/gram",
    titleStatic: "Built in India.",
    titleTyping: " Designed for the Future.",
    description:
      'Kalp operates into innovative products and expert services, with 2 key products " Gram, SniffUrl " and 1 core service "Rapydlaunch".',
    primaryCtaLabel: "Explore Products",
    primaryCtaTargetId: "product",
    secondaryCtaLabel: "Book a Call",
    secondaryCtaHref: "https://cal.com/amansharma",
    trustedText: "Trusted by 100+ clients",
    clientLogos: [
      "/clients/dm.svg",
      "/clients/as.svg",
      "/clients/medone.svg",
      "/clients/zuari.svg",
      "/clients/dmca.svg",
      "/clients/flp.svg",
      "/clients/serrisvg.svg",
      "/clients/smep.svg",
      "/clients/floro.svg",
      "/clients/pmc.png",
    ],
  },
  about: {
    title: "Our Founders",
    description:
      "Creating jobs, inspiring youth, and building businesses for a stronger, brighter future.",
    linkLabel: "Learn more about us",
    linkHref: "/about-us",
  },
  testimonials: {
    title: "Scale faster than ever.",
    subtitle: "Built to create impact, not just dashboards.",
    items: [
      {
        quote: "Donation platform is seamless and easy to use. Our donors love it!",
        name: "Matt Elston",
        role: "Donor Money",
      },
      {
        quote: "Medicine delivered in minutes. Medone has truly transformed our service.",
        name: "Ankit Bist",
        role: "Medone",
      },
      {
        quote: "VVD made learning engaging and fun. Students love the platform!",
        name: "Rishabh Shrivastav",
        role: "VVD",
      },
      {
        quote: "Our video showcase website looks professional and works flawlessly.",
        name: "Momita Jaisi",
        role: "Pinkfrogfilms",
      },
      {
        quote: "DMCA DENT simplifies managing digital content. Very user-friendly.",
        name: "William",
        role: "DMCA DENT",
      },
      {
        quote: "Couture Click allows our customers to book tailor services effortlessly.",
        name: "Anurag",
        role: "Couture Click",
      },
      {
        quote: "Our sensor monitoring system is accurate and reliable, thanks to Duton.",
        name: "Rohith",
        role: "Duton",
      },
      {
        quote: "Florosense website is clean, fast, and beautifully designed.",
        name: "Adarsh",
        role: "Florosense",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle:
      "Find answers about Kalp Intelligence, our products, operations, and how we empower businesses and youth in India.",
    ctaLabel: "Contact us",
    ctaHref: "/contact",
    items: [
      {
        question: "How many products does Kalp Intelligence have?",
        answer:
          "Kalp Intelligence currently has 3 main products: Gram, SniffUrl, and RapydLaunch, designed to empower businesses and individuals with innovative solutions.",
      },
      {
        question: "What does Kalp mean?",
        answer:
          "The word 'Kalp' signifies creation and innovation. It reflects our mission to build impactful products and generate opportunities for a better India.",
      },
      {
        question: "Where is Kalp Intelligence registered?",
        answer:
          "Kalp Intelligence Private Limited is registered in Bangalore, Karnataka, with CIN U62013KA2025PTC203953. The company was incorporated on 10th June, 2025.",
      },
      {
        question: "Who are the key management personnel of Kalp?",
        answer:
          "The company has two directors/key management personnel: Aman Kumar and Muskan Sharma.",
      },
      {
        question: "What activities does Kalp Intelligence engage in?",
        answer:
          "Kalp Intelligence is involved in providing software support and maintenance to clients, along with building innovative SaaS and digital solutions.",
      },
      {
        question: "Where is Kalp Intelligence's registered office?",
        answer:
          "The registered office is located at 12, R.no. 402, BBMP Ward 191, Parappana Agrahara, Electronics City, Bangalore South, Karnataka, India, 560100.",
      },
      {
        question: "Does Kalp Intelligence support startups?",
        answer:
          "Yes. We provide end-to-end product strategy, rapid prototyping, development, and ongoing support to help startups scale faster and smarter.",
      },
      {
        question: "Is Kalp Intelligence listed for government projects?",
        answer:
          "Kalp Intelligence is a private non-government company, but we focus on delivering software solutions to businesses of all sizes, including startups and enterprises.",
      },
    ],
  },
  videoTestimonial: {
    sectionLabel: "Client Story",
    title: "Founders who trust us to build",
    founderName: "Kiran M.R",
    founderRole: "Founder, Flying Passport",
    founderImage: "/clients/kiran.png",
    quote:
      "We trusted Kalp for our mobile application.\nThey have a very strong team - and what we expected,\nAman delivered.",
    description:
      "From clarity in planning to precision in execution, the experience felt reliable, professional, and founder-driven. This is how real product teams operate.",
    companyName: "Flying Passport",
    companyCategory: "Travel & Creator Brand",
    companyLink: "https://www.instagram.com/flyingpassport_tours/",
    companyImage: "/clients/flp.png",
    socialHandle: "@flyingpassport_tours",
    instagramFollowers: "500K+",
    youtubeSubscribers: "1M+",
    reelEmbedUrl: "https://www.instagram.com/reel/DRXX1kfj9up/embed",
  },
};
