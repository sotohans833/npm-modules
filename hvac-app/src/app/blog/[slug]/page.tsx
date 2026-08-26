import { POSTS } from "@/content/posts";
import { PostView } from "./PostView";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostView slug={slug} />;
}
