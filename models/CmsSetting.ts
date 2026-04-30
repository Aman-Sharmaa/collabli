import mongoose, { Schema, Document, model, models } from "mongoose";
import type { HomePageSettings } from "@/lib/home-page-defaults";

export interface IHeaderNavItem {
    label: string;
    href: string;
    type: "link" | "dropdown";
    children?: { label: string; href: string; description?: string; icon?: string }[];
}

export interface IFooterLink {
    label: string;
    href: string;
}

export interface IFooterColumn {
    title: string;
    links: IFooterLink[];
}

export interface IRapydNavItem {
    label: string;
    href: string;
    external?: boolean;
}

export interface ITeamMember {
    name: string;
    role: string;
    image: string;
    linkedin?: string;
    email?: string;
    calendly?: string;
}

export interface IStat {
    value: string;
    label: string;
}

export interface IDashboardQuickLink {
    label: string;
    href: string;
    icon: string;
}

export interface IDashboardOverview {
    admin: {
        title: string;
        subtitle: string;
        ctaLabel: string;
        ctaLink: string;
        showCta: boolean;
        quickLinks: IDashboardQuickLink[];
        sections: {
            metrics: boolean;
            taskPerformance: boolean;
            upcomingPayments: boolean;
            monthlyOverall: boolean;
            secondaryMetrics: boolean;
            moneyInOut: boolean;
            profitLossChart: boolean;
            netPLGrowth: boolean;
            revenueChart: boolean;
            monitorOverview: boolean;
            meetingStatus: boolean;
            meetingStats: boolean;
        };
    };
    employee: {
        title: string;
        subtitle: string;
        quickLinks: IDashboardQuickLink[];
        sections: {
            checkInOut: boolean;
            statsCards: boolean;
            taskCounts: boolean;
            taskPerformance: boolean;
            projects: boolean;
        };
    };
}

export interface ISeoAnalytics {
    enableGoogleAnalytics: boolean;
    googleAnalyticsId: string; // e.g. G-XXXXXXXXXX
    googleSearchConsoleMetaTag: string; // verification meta content value
    siteUrl: string; // e.g. https://kalp.ltd - used for canonical, sitemap
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    twitterHandle: string; // e.g. @kalpltd (optional)
    openGraphImage: string; // default OG image URL
}

export interface ICustomScript {
    type: "url" | "inline";
    value: string; // URL for type "url", raw script content for type "inline"
}

export interface ICmsSetting extends Document {
    seo?: ISeoAnalytics;
    header: {
        logo: string;
        logoDark: string;
        navItems: IHeaderNavItem[];
        cta: { label: string; href: string; show: boolean };
        /** Additional JavaScript injected into every page (head) */
        customScripts?: ICustomScript[];
    };
    footer: {
        companyName: string;
        description: string;
        contactEmail?: string;
        meetingCta?: { label: string; href: string };
        social: {
            linkedin: string;
            twitter: string;
            instagram: string;
            facebook: string;
        };
        columns: IFooterColumn[];
    };
    products: { name: string; tagline: string; image: string; href: string }[];
    services: { title: string; icon: string; href: string }[];
    rapydlaunch: {
        header: {
            logo: string;
            navItems: IRapydNavItem[];
            cta: { label: string; show: boolean };
            bookCallUrl: string;
        };
        footer: {
            description: string;
            email: string;
            companyLinks: IRapydNavItem[];
        };
    };
    aboutUs: {
        hero: {
            title: string;
            subtitle: string;
            ratingText: string;
        };
        mission: {
            title: string;
            description: string;
        };
        stats: IStat[];
        teamSectionTitle: string;
        teamSectionSubtitle: string;
        founders: ITeamMember[];
        teamMembers: ITeamMember[];
    };
    dashboardOverview: IDashboardOverview;
    homePage?: HomePageSettings;
}

const FooterLinkSchema = new Schema({
    label: String,
    href: String,
});

const FooterColumnSchema = new Schema({
    title: String,
    links: [FooterLinkSchema],
});

const HeaderNavItemSchema = new Schema({
    label: String,
    href: String,
    type: { type: String, enum: ["link", "dropdown"], default: "link" },
    children: [{
        label: String,
        href: String,
        description: String,
        icon: String
    }],
});

const RapydNavItemSchema = new Schema({
    label: String,
    href: String,
    external: { type: Boolean, default: false },
});

const TeamMemberSchema = new Schema({
    name: String,
    role: String,
    image: String,
    linkedin: String,
    email: String,
    calendly: String,
});

const StatSchema = new Schema({
    value: String,
    label: String,
});

const DashboardQuickLinkSchema = new Schema({
    label: String,
    href: String,
    icon: String,
});

const SeoAnalyticsSchema = new Schema({
    enableGoogleAnalytics: { type: Boolean, default: false },
    googleAnalyticsId: { type: String, default: "" },
    googleSearchConsoleMetaTag: { type: String, default: "" },
    siteUrl: { type: String, default: "" },
    defaultMetaTitle: { type: String, default: "Kalp.ltd - Innovation Studio" },
    defaultMetaDescription: { type: String, default: "Born to create innovative products. Building modern SaaS & digital products." },
    twitterHandle: { type: String, default: "" },
    openGraphImage: { type: String, default: "" },
}, { _id: false });

const CmsSettingSchema = new Schema<ICmsSetting>(
    {
        seo: { type: SeoAnalyticsSchema, default: undefined },
        header: {
            logo: String,
            logoDark: String,
            navItems: [HeaderNavItemSchema],
            cta: { label: String, href: String, show: Boolean },
            customScripts: [{ type: { type: String, enum: ["url", "inline"] }, value: String }],
        },
        footer: {
            companyName: String,
            description: String,
            contactEmail: String,
            meetingCta: {
                label: String,
                href: String,
            },
            social: {
                linkedin: String,
                twitter: String,
                instagram: String,
                facebook: String,
            },
            columns: [FooterColumnSchema],
        },
        products: [{ name: String, tagline: String, image: String, href: String }],
        services: [{ title: String, icon: String, href: String }],
        rapydlaunch: {
            header: {
                logo: String,
                navItems: [RapydNavItemSchema],
                cta: { label: String, show: Boolean },
                bookCallUrl: String,
            },
            footer: {
                description: String,
                email: String,
                companyLinks: [RapydNavItemSchema],
            },
        },
        aboutUs: {
            hero: {
                title: String,
                subtitle: String,
                ratingText: String,
            },
            mission: {
                title: String,
                description: String,
            },
            stats: [StatSchema],
            teamSectionTitle: String,
            teamSectionSubtitle: String,
            founders: [TeamMemberSchema],
            teamMembers: [TeamMemberSchema],
        },
        dashboardOverview: {
            admin: {
                title: String,
                subtitle: String,
                ctaLabel: String,
                ctaLink: String,
                showCta: { type: Boolean, default: true },
                quickLinks: [DashboardQuickLinkSchema],
                sections: {
                    metrics: { type: Boolean, default: true },
                    taskPerformance: { type: Boolean, default: true },
                    upcomingPayments: { type: Boolean, default: true },
                    monthlyOverall: { type: Boolean, default: true },
                    secondaryMetrics: { type: Boolean, default: true },
                    moneyInOut: { type: Boolean, default: true },
                    profitLossChart: { type: Boolean, default: true },
                    netPLGrowth: { type: Boolean, default: true },
                    revenueChart: { type: Boolean, default: true },
                    monitorOverview: { type: Boolean, default: true },
                    meetingStatus: { type: Boolean, default: true },
                    meetingStats: { type: Boolean, default: true },
                },
            },
            employee: {
                title: String,
                subtitle: String,
                quickLinks: [DashboardQuickLinkSchema],
                sections: {
                    checkInOut: { type: Boolean, default: true },
                    statsCards: { type: Boolean, default: true },
                    taskCounts: { type: Boolean, default: true },
                    taskPerformance: { type: Boolean, default: true },
                    projects: { type: Boolean, default: true },
                },
            },
        },
        homePage: {
            sectionOrder: [String],
            hero: {
                announcementText: String,
                announcementHref: String,
                titleStatic: String,
                titleTyping: String,
                description: String,
                primaryCtaLabel: String,
                primaryCtaTargetId: String,
                secondaryCtaLabel: String,
                secondaryCtaHref: String,
                trustedText: String,
                clientLogos: [String],
            },
            about: {
                title: String,
                description: String,
                linkLabel: String,
                linkHref: String,
            },
            testimonials: {
                title: String,
                subtitle: String,
                items: [{ quote: String, name: String, role: String }],
            },
            faq: {
                title: String,
                subtitle: String,
                ctaLabel: String,
                ctaHref: String,
                items: [{ question: String, answer: String }],
            },
            videoTestimonial: {
                sectionLabel: String,
                title: String,
                founderName: String,
                founderRole: String,
                founderImage: String,
                quote: String,
                description: String,
                companyName: String,
                companyCategory: String,
                companyLink: String,
                companyImage: String,
                socialHandle: String,
                instagramFollowers: String,
                youtubeSubscribers: String,
                reelEmbedUrl: String,
            },
        },
    },
    { timestamps: true }
);

export const CmsSetting = models.CmsSetting || model<ICmsSetting>("CmsSetting", CmsSettingSchema);
