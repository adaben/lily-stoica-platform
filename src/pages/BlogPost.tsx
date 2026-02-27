import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Loader2, Calendar, ArrowLeft, Clock, Eye, Share2, Check, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { apiGetBlogPost } from "@/lib/api";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => apiGetBlogPost(slug!),
    enabled: !!slug,
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const pageUrl = post ? `${siteUrl}/blog/${post.slug}` : siteUrl;
  const ogTitle = post?.seo_title || post?.title || "";
  const ogDescription = post?.seo_description || post?.excerpt || "";
  const ogImage = post?.featured_image_url || "";

  return (
    <>
      <SiteHeader />

      {isLoading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : post ? (
        <>
          <Helmet>
            <title>{ogTitle} | LiLy Stoica Blog</title>
            <meta name="description" content={ogDescription} />
            {/* Open Graph */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={ogDescription} />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:site_name" content="LiLy Stoica - Neurocoach and Hypnotherapist" />
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta property="article:author" content={post.author_name} />
            {post.published_at && <meta property="article:published_time" content={post.published_at} />}
            {post.tags && (post.tags as string[]).map((tag: string) => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle} />
            <meta name="twitter:description" content={ogDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
            {/* Canonical */}
            <link rel="canonical" href={pageUrl} />
          </Helmet>

          <article className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
              >
                <ArrowLeft className="w-4 h-4" /> Back to blog
              </Link>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.reading_time} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {post.view_count} views
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author_name}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-cormorant font-bold text-foreground mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg text-muted-foreground italic mb-6 border-l-4 border-primary/30 pl-4">
                  {post.excerpt}
                </p>
              )}

              {post.featured_image_url && (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full rounded-2xl mb-8 object-cover max-h-96"
                />
              )}

              <div
                className="prose prose-lg max-w-none prose-headings:font-cormorant prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags + Share */}
              <div className="flex flex-wrap items-center justify-between mt-10 pt-6 border-t border-border/40">
                <div className="flex flex-wrap gap-2">
                  {post.tags && (post.tags as string[]).map((tag: string) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-xs px-3 py-1 rounded-full bg-accent text-foreground/70 hover:bg-accent/80 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-primary/8 rounded-full hover:bg-primary/15 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied" : "Share"}
                </button>
              </div>
            </div>
          </article>
        </>
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Article not found.</p>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
