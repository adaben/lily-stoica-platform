import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileText,
  Headphones,
  Video,
  BookMarked,
  ExternalLink,
  Download,
  Loader2,
  Lock,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { apiGetResource, apiTrackResourceDownload, type Resource } from "@/lib/api";

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-6 h-6" />,
  audio: <Headphones className="w-6 h-6" />,
  video: <Video className="w-6 h-6" />,
  guide: <BookMarked className="w-6 h-6" />,
  link: <ExternalLink className="w-6 h-6" />,
};

const typeLabels: Record<string, string> = {
  pdf: "PDF Document",
  audio: "Audio Recording",
  video: "Video",
  guide: "Written Guide",
  link: "External Link",
};

export default function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ["resource", slug],
    queryFn: () => apiGetResource(slug!),
    enabled: !!slug,
  });

  const handleDownload = async (res: Resource) => {
    await apiTrackResourceDownload(res.slug);
    if (res.file) {
      window.open(res.file, "_blank");
    } else if (res.external_url) {
      window.open(res.external_url, "_blank");
    }
  };

  return (
    <>
      <Helmet>
        <title>{resource?.title || "Resource"} | Calm Lily</title>
      </Helmet>

      <SiteHeader />

      <section className="py-12 bg-accent/20 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border/60">
              {!isAuthenticated ? (
                <>
                  <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    This resource requires you to be logged in.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground">Resource not found.</p>
              )}
            </div>
          ) : resource ? (
            <div className="bg-white rounded-2xl border border-border/60 shadow-card overflow-hidden">
              {/* Thumbnail */}
              {resource.thumbnail && (
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="w-full h-56 object-cover"
                />
              )}

              <div className="p-6 sm:p-8">
                {/* Type badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                    {typeIcons[resource.resource_type] || <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
                      {typeLabels[resource.resource_type] || resource.resource_type}
                    </span>
                    {resource.is_premium && (
                      <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full uppercase">
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-cormorant font-bold text-foreground mb-3">
                  {resource.title}
                </h1>

                {resource.description && (
                  <p className="text-muted-foreground mb-6">{resource.description}</p>
                )}

                {/* Written guide content */}
                {resource.content && (
                  <div
                    className="prose prose-sm max-w-none mb-6 text-foreground/85"
                    dangerouslySetInnerHTML={{ __html: resource.content }}
                  />
                )}

                {/* Download / link button */}
                {(resource.file || resource.external_url) && (
                  <button
                    onClick={() => handleDownload(resource)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
                  >
                    {resource.file ? (
                      <>
                        <Download className="w-4 h-4" /> Download Resource
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" /> Open Resource
                      </>
                    )}
                  </button>
                )}

                {/* Meta */}
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-4 text-xs text-muted-foreground">
                  {resource.category_name && (
                    <span>Category: {resource.category_name}</span>
                  )}
                  <span>{resource.download_count} downloads</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
