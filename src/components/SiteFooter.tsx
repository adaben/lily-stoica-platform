import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-lily-charcoal text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <div className="inline-block bg-white rounded-xl px-3 py-2">
                <img
                  src="/logo-transparent.png"
                  alt="Calm Lily"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60 mb-4">
              Neurocoach and Licensed Hypnotherapist based in South West London.
              Specialising in stress recovery, addiction support, nervous system
              regulation and personal transformation.
            </p>
            <p className="text-xs text-white/40">
              PHPA Registered Hypnotherapy Practitioner
              <br />
              Level 5 IAPCP Accredited Life Coach
              <br />
              Certified Addiction Specialist
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-inter font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/about" className="text-sm hover:text-white transition-colors">About Lily</Link>
              <Link to="/services" className="text-sm hover:text-white transition-colors">Services</Link>
              <Link to="/book" className="text-sm hover:text-white transition-colors">Book a Session</Link>
              <Link to="/events" className="text-sm hover:text-white transition-colors">Events &amp; Workshops</Link>
              <Link to="/blog" className="text-sm hover:text-white transition-colors">Blog &amp; Resources</Link>
              <Link to="/contact" className="text-sm hover:text-white transition-colors">Get in Touch</Link>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-inter font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h4>
            <nav className="flex flex-col gap-2.5">
              <span className="text-sm">Neurocoaching</span>
              <span className="text-sm">Hypnotherapy</span>
              <span className="text-sm">Addiction Recovery Support</span>
              <span className="text-sm">Nervous System Regulation</span>
              <span className="text-sm">Stress &amp; Burnout Prevention</span>
              <span className="text-sm">Weight &amp; Metabolism Reset</span>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-inter font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span className="text-sm">Balham, South West London<br />SW12</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <a href="mailto:hello@lilystoica.co.uk" className="text-sm hover:text-white transition-colors">
                  hello@lilystoica.co.uk
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span className="text-sm">By appointment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Calm Lily Ltd (Company No. 16832636). All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
