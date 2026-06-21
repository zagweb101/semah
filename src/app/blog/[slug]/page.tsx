import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/blog" />}
      >
        ← Back to blog
      </Button>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="mt-6 rounded-xl"
        />
      )}
      <div className="mt-6 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
