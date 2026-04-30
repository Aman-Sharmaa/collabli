import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CmsSetting } from "@/models/CmsSetting";
import { requireCmsAccess } from "@/lib/cms-auth";
import { DEFAULT_HOME_PAGE_SETTINGS } from "@/lib/home-page-defaults";

export const dynamic = "force-dynamic";

const DEFAULT_DASHBOARD_OVERVIEW = {
    admin: {
        title: "Dashboard",
        subtitle: "Overview for Kalp.ltd",
        ctaLabel: "New project",
        ctaLink: "/dashboard/projects",
        showCta: true,
        quickLinks: [
            { label: "Projects", href: "/dashboard/projects", icon: "FolderKanban" },
            { label: "Team", href: "/dashboard/people", icon: "Users" },
            { label: "Clients", href: "/dashboard/clients", icon: "Building2" },
            { label: "Expenses", href: "/dashboard/expenses", icon: "Wallet" },
            { label: "Monitor", href: "/dashboard/monitor", icon: "Activity" },
            { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
        ],
        sections: {
            metrics: true,
            taskPerformance: true,
            upcomingPayments: true,
            monthlyOverall: true,
            secondaryMetrics: true,
            moneyInOut: true,
            profitLossChart: true,
            netPLGrowth: true,
            revenueChart: true,
            monitorOverview: true,
            meetingStatus: true,
            meetingStats: true,
        },
    },
    employee: {
        title: "Overview",
        subtitle: "Your dashboard · Check in/out, projects, and quick links.",
        quickLinks: [
            { label: "My projects", href: "/dashboard/projects", icon: "FolderKanban" },
            { label: "Team members", href: "/dashboard/people", icon: "Users" },
            { label: "Attendance", href: "/dashboard/attendance", icon: "Clock" },
            { label: "Reimbursement", href: "/dashboard/reimbursements", icon: "Receipt" },
            { label: "Payslips", href: "/dashboard/payslips", icon: "FileText" },
            { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
        ],
        sections: {
            checkInOut: true,
            statsCards: true,
            taskCounts: true,
            taskPerformance: true,
            projects: true,
        },
    },
};

export async function GET() {
    try {
        await connectDB();
        let settings = await CmsSetting.findOne().lean();
        if (!settings) {
            // Return default structure if no settings exist
            settings = {
                seo: {
                    enableGoogleAnalytics: false,
                    googleAnalyticsId: "",
                    googleSearchConsoleMetaTag: "",
                    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd",
                    defaultMetaTitle: "Kalp.ltd - Innovation Studio",
                    defaultMetaDescription: "Born to create innovative products. Building modern SaaS & digital products.",
                    twitterHandle: "",
                    openGraphImage: "",
                },
                header: {
                    navItems: [],
                    cta: { show: true, label: "Book a call", href: "https://cal.com/amansharma" }
                },
                footer: {
                    companyName: "Kalp Intelligence Pvt Ltd",
                    description: "Empowering startups to scale smarter and faster.",
                    contactEmail: "hello@kalp.ltd",
                    meetingCta: { label: "Book a Meeting", href: "https://cal.com/amansharma" },
                    columns: [],
                    social: {}
                },
                products: [],
                services: [],
                rapydlaunch: {
                    header: {
                        logo: "/rl_logo.svg",
                        navItems: [
                            { label: "About Us", href: "/about-us", external: false },
                            { label: "Book a Call", href: "https://cal.com/amansharma", external: true },
                        ],
                        cta: { label: "Get Started", show: true },
                        bookCallUrl: "https://cal.com/amansharma",
                    },
                    footer: {
                        description: "Full-service digital partner for brands, startups, and businesses worldwide. One team, one goal.",
                        email: "hello@kalp.ltd",
                        companyLinks: [
                            { label: "About Us", href: "/about-us", external: false },
                            { label: "Contact", href: "/contact", external: false },
                            { label: "Book a Call", href: "https://cal.com/amansharma", external: true },
                            { label: "Kalp.ltd Home", href: "/", external: false },
                        ],
                    },
                },
                aboutUs: {
                    hero: {
                        title: "We empower startups to scale smarter and faster",
                        subtitle: "We are a team of designers and engineers driven by one goal — helping ambitious startups build products that grow.",
                        ratingText: "Rated 5.0 by founders worldwide",
                    },
                    mission: {
                        title: "Our Mission",
                        description: "Empower teams and founders with tools that reduce friction, simplify workflows, and enable sustainable growth.",
                    },
                    stats: [
                        { value: "250+", label: "Projects Supported" },
                        { value: "85%", label: "Client Retention Rate" },
                        { value: "98%", label: "Client Satisfaction" },
                        { value: "30+", label: "Integrations Supported" },
                    ],
                    teamSectionTitle: "Our Founders & Team",
                    teamSectionSubtitle: "Our team combines deep industry knowledge with hands-on experience to help startups grow smarter and faster.",
                    founders: [
                        { name: "Aman Sharma", role: "Founder & CEO", image: "/team/aman.png", linkedin: "https://www.linkedin.com/in/amnshrma/", email: "mailto:aman@rapydlaunch.com", calendly: "https://cal.com/amansharma" },
                        { name: "Muskan Sharma", role: "Co-Founder & CFO", image: "/team/muskan.png", linkedin: "https://www.linkedin.com/in/muskan07/" },
                    ],
                    teamMembers: [
                        { name: "Honey Pathkar", role: "Full Stack Developer", image: "/team/honey.png", linkedin: "https://www.linkedin.com/in/honey-pathkar/" },
                        { name: "Archana Kumari", role: "Full Stack Developer", image: "/team/archana.png", linkedin: "https://www.linkedin.com/in/archana-kumari-dev/" },
                        { name: "Sandeep Shakya", role: "Area Manager (Gram)", image: "/team/sandeep.png", linkedin: "https://www.linkedin.com/in/sandeep-shakya-857014249/" },
                        { name: "Krishna Mohan", role: "Area Manager (Gram)", image: "/team/krishna.png", linkedin: "https://www.linkedin.com/in/krishna-mohan-836529187/" },
                        { name: "Anshul Jha", role: "Inventory Manager (Gram)", image: "/team/anshul.png" },
                        { name: "Amit Kumar Nayak", role: "Inventory & Scripting (Gram)", image: "/team/amit.jpg" },
                        { name: "Gopal Bajpai", role: "Video Editor (Gram)", image: "/team/gopal.png" },
                    ],
                },
                dashboardOverview: DEFAULT_DASHBOARD_OVERVIEW,
                homePage: DEFAULT_HOME_PAGE_SETTINGS,
            };
        }
        // Ensure rapydlaunch and aboutUs fields exist even if settings were saved before these were added
        if (!settings.rapydlaunch) {
            settings.rapydlaunch = {
                header: {
                    logo: "/rl_logo.svg",
                    navItems: [
                        { label: "About Us", href: "/about-us", external: false },
                        { label: "Book a Call", href: "https://cal.com/amansharma", external: true },
                    ],
                    cta: { label: "Get Started", show: true },
                    bookCallUrl: "https://cal.com/amansharma",
                },
                footer: {
                    description: "Full-service digital partner for brands, startups, and businesses worldwide. One team, one goal.",
                    email: "hello@kalp.ltd",
                    companyLinks: [
                        { label: "About Us", href: "/about-us", external: false },
                        { label: "Contact", href: "/contact", external: false },
                        { label: "Book a Call", href: "https://cal.com/amansharma", external: true },
                        { label: "Kalp.ltd Home", href: "/", external: false },
                    ],
                },
            };
        }
        if (!(settings as any).dashboardOverview) {
            (settings as any).dashboardOverview = DEFAULT_DASHBOARD_OVERVIEW;
        }
        if (!(settings as any).seo) {
            (settings as any).seo = {
                enableGoogleAnalytics: false,
                googleAnalyticsId: "",
                googleSearchConsoleMetaTag: "",
                siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd",
                defaultMetaTitle: "Kalp.ltd - Innovation Studio",
                defaultMetaDescription: "Born to create innovative products. Building modern SaaS & digital products.",
                twitterHandle: "",
                openGraphImage: "",
            };
        }
        if (!(settings as any).homePage) {
            (settings as any).homePage = DEFAULT_HOME_PAGE_SETTINGS;
        }
        if (!(settings as any).footer?.contactEmail) {
            (settings as any).footer = {
                ...(settings as any).footer,
                contactEmail: "hello@kalp.ltd",
            };
        }
        if (!(settings as any).footer?.meetingCta) {
            (settings as any).footer = {
                ...(settings as any).footer,
                meetingCta: { label: "Book a Meeting", href: "https://cal.com/amansharma" },
            };
        }
        if (!settings.aboutUs) {
            settings.aboutUs = {
                hero: {
                    title: "We empower startups to scale smarter and faster",
                    subtitle: "We are a team of designers and engineers driven by one goal — helping ambitious startups build products that grow.",
                    ratingText: "Rated 5.0 by founders worldwide",
                },
                mission: {
                    title: "Our Mission",
                    description: "Empower teams and founders with tools that reduce friction, simplify workflows, and enable sustainable growth.",
                },
                stats: [
                    { value: "250+", label: "Projects Supported" },
                    { value: "85%", label: "Client Retention Rate" },
                    { value: "98%", label: "Client Satisfaction" },
                    { value: "30+", label: "Integrations Supported" },
                ],
                teamSectionTitle: "Our Founders & Team",
                teamSectionSubtitle: "Our team combines deep industry knowledge with hands-on experience to help startups grow smarter and faster.",
                founders: [
                    { name: "Aman Sharma", role: "Founder & CEO", image: "/team/aman.png", linkedin: "https://www.linkedin.com/in/amnshrma/", email: "mailto:aman@rapydlaunch.com", calendly: "https://cal.com/amansharma" },
                    { name: "Muskan Sharma", role: "Co-Founder & CFO", image: "/team/muskan.png", linkedin: "https://www.linkedin.com/in/muskan07/" },
                ],
                teamMembers: [
                    { name: "Honey Pathkar", role: "Full Stack Developer", image: "/team/honey.png", linkedin: "https://www.linkedin.com/in/honey-pathkar/" },
                    { name: "Archana Kumari", role: "Full Stack Developer", image: "/team/archana.png", linkedin: "https://www.linkedin.com/in/archana-kumari-dev/" },
                    { name: "Sandeep Shakya", role: "Area Manager (Gram)", image: "/team/sandeep.png", linkedin: "https://www.linkedin.com/in/sandeep-shakya-857014249/" },
                    { name: "Krishna Mohan", role: "Area Manager (Gram)", image: "/team/krishna.png", linkedin: "https://www.linkedin.com/in/krishna-mohan-836529187/" },
                    { name: "Anshul Jha", role: "Inventory Manager (Gram)", image: "/team/anshul.png" },
                    { name: "Amit Kumar Nayak", role: "Inventory & Scripting (Gram)", image: "/team/amit.jpg" },
                    { name: "Gopal Bajpai", role: "Video Editor (Gram)", image: "/team/gopal.png" },
                ],
            };
        }
        return NextResponse.json({ settings });
    } catch (e) {
        console.error("GET settings error", e);
        // Always return JSON - never let HTML error page leak through
        return NextResponse.json(
            { settings: null, message: "Server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const auth = await requireCmsAccess();
    if (!auth) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    try {
        await connectDB();
        const body = await req.json();

        // Update or create the single settings document
        // We use findOneAndUpdate with upsert to ensure only one document exists
        const settings = await CmsSetting.findOneAndUpdate(
            {},
            { $set: body },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ settings });
    } catch (e) {
        console.error("PUT settings error", e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
