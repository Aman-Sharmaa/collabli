# Kalp.ltd - Premium Next.js Website

A modern, premium product-focused company website built with Next.js 14, Tailwind CSS, and Framer Motion.

---

## 📋 Prompt: Reuse this UI in a new project

Copy the prompt below and use it in a new repo (or with an AI) to bootstrap a project with the **same design system and UI** as Kalp.ltd:

```
Set up a Next.js (App Router) + TypeScript project with the same UI/design system as this one. Use:

**Design system**
- Tailwind CSS with dark mode via class (.dark on html). Semantic colors from CSS variables: --background, --foreground, --primary, --secondary, --muted, --accent, --destructive, --border, --input, --ring, --card, --popover, --radius. Map these in tailwind.config (colors, borderRadius) and define :root + .dark in globals.css.
- Plugins: tailwindcss-animate, @tailwindcss/typography. Font: Inter (var(--font-inter) or system fallback).
- Utility: lib/utils.ts with cn() using clsx + tailwind-merge. Use cn() for all component classNames.

**UI components (shadcn-style, in components/ui/)**
- Radix UI: Avatar, Checkbox, Collapsible, Dialog, Dropdown Menu, Label, Popover, Scroll Area, Select, Separator, Slot, Switch, Tabs, Tooltip. Plus Button (with cva variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon), Card (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), Input, Textarea, Form (react-hook-form + zod + Label). Optional: Calendar (react-day-picker), Sheet, Sidebar, Skeleton, Table, Breadcrumb, Badge.
- Icons: lucide-react. Toasts: sonner. Animations: framer-motion.

**Theme**
- ThemeProvider (light/dark/system) that sets .light/.dark on documentElement and persists to localStorage. useTheme() hook.

**Dependencies to add**
- @radix-ui/react-avatar, react-checkbox, react-collapsible, react-dialog, react-dropdown-menu, react-label, react-popover, react-scroll-area, react-select, react-separator, react-slot, react-switch, react-tabs, react-tooltip
- class-variance-authority, clsx, tailwind-merge, tailwindcss-animate, @tailwindcss/typography, lucide-react, framer-motion, react-hook-form, @hookform/resolvers, zod, sonner

Do not change the visual design tokens or component APIs; keep the same look and behavior. See docs/DESIGN-LIBRARY.md in this repo for the full package list and token reference.
```

For the full package list, design tokens, and component reference, see **[docs/DESIGN-LIBRARY.md](docs/DESIGN-LIBRARY.md)**.

---

## 🚀 Features

- **Modern Design**: Apple-level polished, minimal, and performance-focused
- **Dark/Light Mode**: System-based theme toggle with smooth transitions
- **Glassmorphism Header**: iOS-style mirror effect with backdrop blur
- **Smooth Animations**: Framer Motion powered animations throughout
- **Fully Responsive**: Mobile-first design that works on all devices
- **SEO Optimized**: Built with Next.js App Router for optimal SEO
- **Accessible**: ARIA labels and keyboard navigation support

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **tailwindcss-animate** + **@tailwindcss/typography**
- **Radix UI** (Dialog, Select, Tabs, Dropdown, etc.)
- **Framer Motion**
- **Lucide React** (Icons)
- **React Hook Form** + **Zod** + **Sonner** (forms & toasts)

**Design system:** Full package list, CSS variables, and component reference → **[docs/DESIGN-LIBRARY.md](docs/DESIGN-LIBRARY.md)**

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
kalp.ltd/
├── app/
│   ├── layout.tsx       # Root layout with theme provider
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles and Tailwind
├── components/
│   ├── header.tsx       # Navigation with glassmorphism
│   ├── hero.tsx         # Hero section
│   ├── client-marquee.tsx # Scrolling client logos
│   ├── products-section.tsx # Products showcase
│   ├── about-section.tsx   # About Us section
│   ├── testimonials-section.tsx # Customer testimonials
│   ├── faq-section.tsx     # FAQ accordion
│   ├── footer.tsx         # Footer component
│   └── theme-provider.tsx # Dark/light theme provider
└── ...
```

## 🎨 Customization

### Colors & Theme
Edit `app/globals.css` to customize colors and theme variables.

### Products
Update the products array in `components/products-section.tsx` to add/modify products.

### Content
All content is in the component files. Edit directly to update text, testimonials, FAQs, etc.

## 📝 Sections

1. **Header**: Sticky navigation with glassmorphism effect
2. **Hero**: Large headline with animated gradients and client logos
3. **Products**: Grid showcase of company products
4. **About Us**: Split layout with company introduction
5. **Testimonials**: Customer testimonials with slider
6. **FAQs**: Accordion-style frequently asked questions
7. **Footer**: Clean footer with links and contact info

## 🚢 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
```

Or push to GitHub and connect to Vercel for automatic deployments.

## 📄 License

All rights reserved © Kalp.ltd
