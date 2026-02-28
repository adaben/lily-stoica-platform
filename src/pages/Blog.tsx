import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Calendar, ArrowRight, Search, Pin, Eye, Clock, X } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIAssistant from "@/components/AIAssistant";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { apiGetBlogPosts, apiGetBlogTags, type BlogPost as BlogPostType } from "@/lib/api";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["blog", page, activeTag, search],
    queryFn: () => apiGetBlogPosts(page, activeTag || undefined, search || undefined),
  });

  const { data: tags } = useQuery({
    queryKey: ["blog-tags"],
    queryFn: apiGetBlogTags,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Blog | Calm Lily</title>
        <meta name="description" content="Articles on neuroscience, hypnotherapy, addiction recovery, stress management and nervous system health by LiLy Stoica." />
        <link rel="canonical" href="https://calm-lily.co.uk/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Calm Lily" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:title" content="Blog | Calm Lily" />
        <meta property="og:description" content="Articles on neuroscience, hypnotherapy, addiction recovery, stress management and nervous system health by LiLy Stoica." />
        <meta property="og:url" content="https://calm-lily.co.uk/blog" />
        <meta property="og:image" content="https://calm-lily.co.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | Calm Lily" />
        <meta name="twitter:description" content="Articles on neuroscience, hypnotherapy, addiction recovery, stress management and nervous system health." />
        <meta name="twitter:image" content="https://calm-lily.co.uk/og-image.png" />
      </Helmet>

      <SiteHeader />

      <section className="py-20 bg-gradient-to-br from-accent/30 via-white to-lily-blush/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h1 className="text-4xl sm:text-5xl font-cormorant font-bold text-foreground mb-4">
              Blog and Resources
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practical insights on neuroscience, mental health, addiction recovery
              and nervous system regulation. Written from both professional
              knowledge and lived experience.
            </p>
          </AnimatedSection>

          {/* Search */}
          <AnimatedSection variant="fadeIn" delay={0.2}>
          <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </form>
          </AnimatedSection>
        </div>
      </section>

      {/* Tag pills */}
      {tags && tags.length > 0 && (
        <div className="bg-white border-b border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => { setActiveTag(null); setPage(1); }}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                !activeTag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {tags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => { setActiveTag(tag); setPage(1); }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  activeTag === tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data?.results && data.results.length > 0 ? (
            <>
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.results.map((post: BlogPostType) => (
                  <StaggerItem key={post.id}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-card-hover transition-all"
                  >
                    {post.is_pinned && (
                      <span className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    {post.featured_image_url && (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.published_at || post.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.reading_time} min read
                        </span>
                      </div>
                      <h2 className="text-lg font-cormorant font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                          Read more <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" /> {post.view_count}
                        </span>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(post.tags as string[]).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-foreground/70">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Pagination */}
              {(data.total_pages ?? 1) > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: data.total_pages ?? 1 }, (_, i) => i + 1).map((p: number) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        page === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                {search || activeTag ? "No articles match your search." : "Articles are on their way. Check back soon."}
              </p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
      <AIAssistant />
    </>
  );
}
