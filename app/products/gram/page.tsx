import { Header } from "@/components/header";
import { ProductDetailSection } from "@/components/product-detail-section";
import { Footer } from "@/components/footer";

export default function GramPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <ProductDetailSection
        number="01"
        title="Gram"
        description="Social media management made simple. Create, schedule, and analyze your content all in one place. Get everything ready in minutes."
        image="/gram_logo.svg"
        imageAlt="Gram - Social Media Management"
      />
      <Footer />
    </main>
  );
}
