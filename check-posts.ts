
import { connectDB } from "./lib/db";
import { CmsPost } from "./models/CmsPost";
import { CmsCategory } from "./models/CmsCategory";
import mongoose from "mongoose";

async function main() {
    await connectDB();
    console.log("Connected to DB");

    const posts = await CmsPost.find({}).populate("categoryId").lean();
    console.log(`Total posts: ${posts.length}`);

    const published = posts.filter((p: any) => p.status === "published");
    console.log(`Published posts: ${published.length}`);

    published.forEach((p: any) => {
        console.log(`- ${p.title} (Slug: ${p.slug}, Category: ${p.categoryId?.slug || 'None'}, Status: ${p.status})`);
    });

    const categories = await CmsCategory.find().lean();
    console.log(`Categories: ${categories.map((c: any) => c.slug).join(", ")}`);

    mongoose.disconnect();
}

main().catch(console.error);
