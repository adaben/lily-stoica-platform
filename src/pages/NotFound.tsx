import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | LiLy Stoica</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl font-cormorant font-bold text-foreground">404</h1>
            <p className="text-lg text-muted-foreground">
              This page could not be found.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return home
          </Link>
        </div>
      </div>
    </>
  );
}
