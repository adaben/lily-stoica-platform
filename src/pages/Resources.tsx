import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Loader2, FileText, Headphones, Video, ExternalLink, BookOpen,
  Download, Search, X, Lock,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIAssistant from "@/components/AIAssistant";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import {
  apiGetResourceCategories, apiGetResources, apiTrackResourceDownload,
  type Resource, type ResourceCategory,
} from "@/lib/api";

const TYPE_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  audio: Headphones,
  video: Video,
  link: ExternalLink,
  guide: BookOpen,
};

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["resource-categories"],
    queryFn: apiGetResourceCategories,
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources", activeCategory, search],
    queryFn: () => apiGetResources(activeCategory || undefined, search || undefined),
  });

  const handleDownload = async (resource: Resource) => {
    await apiTrackResourceDownload(resource.slug);
    const url = resource.file || resource.external_url;
    if (url) window.open(url, "_blank");
  };

  return (
    <>
      <Helmet>
        <title>Resource Hub | Calm Lily - Neurocoach and Hypnotherapist</title>
        <meta
          name="description"
          content="Free resources, guides, recordings and tools for mental health, nervous system regulation and addiction recovery by Lily Stoica."
        />
      </Helmet>

      <SiteHeader />

      <section className="py-20 bg-gradient-to-br from-accent/30 via-white to-lily-blush/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h1 className="text-4xl sm:text-5xl font-cormorant font-bold text-foreground mb-4">
              Resource Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free guides, recordings and tools to support your journey towards
              better mental health and nervous system regulation.
            </p>
          </AnimatedSection>

          <AnimatedSection variant="fadeIn" delay={0.2}>

          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Category pills */}
      {categories && categories.length > 0 && (
        <div className="bg-white border-b border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {categories.map((cat: ResourceCategory) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.name} ({cat.resource_count})
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
          ) : resources && resources.length > 0 ? (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource: Resource) => {
                const Icon = TYPE_ICONS[resource.resource_type] || FileText;
                return (
                  <StaggerItem
                    key={resource.id}
                    className="rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-card-hover transition-all"
                  >
                    {resource.thumbnail && (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={resource.thumbnail}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{resource.resource_type}</span>
                        {resource.is_premium && (
                          <span className="flex items-center gap-0.5 text-amber-600">
                            <Lock className="w-3 h-3" /> Premium
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-cormorant font-bold text-foreground mb-2">
                        {resource.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleDownload(resource)}
                          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {resource.resource_type === "link" ? "Open" : "Download"}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {resource.download_count} downloads
                        </span>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                {search || activeCategory ? "No resources match your search." : "Resources are being prepared. Check back soon."}
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
