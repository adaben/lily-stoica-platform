import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Brain, Heart, Shield, Sparkles, ArrowRight, Calendar,
  Star, Users, Leaf, Activity, MessageCircle,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import AIAssistant from "@/components/AIAssistant";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedSection";

const services = [
  {
    icon: Brain,
    title: "Neurocoaching",
    description:
      "Rewire thought patterns and build mental resilience using evidence-based neuroscience techniques. Suitable for professionals navigating burnout, career transitions or chronic overthinking.",
  },
  {
    icon: Activity,
    title: "Hypnotherapy",
    description:
      "Licensed clinical hypnotherapy to address the subconscious drivers behind stress, anxiety, phobias and unwanted habits. PHPA registered and fully insured.",
  },
  {
    icon: Shield,
    title: "Addiction Recovery",
    description:
      "Specialist support for breaking free from alcohol, sugar, screen dependency and behavioural addictions. Working at the level where habits are formed, not just managed.",
  },
  {
    icon: Leaf,
    title: "Nervous System Reset",
    description:
      "Regulate your autonomic nervous system through somatic techniques, breathwork and guided neuroplasticity exercises. Ideal for chronic fatigue, FND and long COVID recovery.",
  },
  {
    icon: Heart,
    title: "Stress & Burnout Prevention",
    description:
      "Structured programmes for high-performance professionals who need sustainable strategies for managing stress without sacrificing their career or wellbeing.",
  },
  {
    icon: Sparkles,
    title: "Weight & Metabolism Support",
    description:
      "Address the neurological and emotional roots of unhealthy eating patterns. Combining hypnotherapy with metabolic coaching for lasting change beyond dieting.",
  },
];

const testimonials = [
  {
    text: "After just three sessions with Lily, I felt a shift I had not experienced in years of traditional therapy. She gets to the root of things with remarkable precision.",
    name: "Sarah M.",
    role: "Marketing Director, London",
  },
  {
    text: "Lily helped me overcome a 15-year struggle with alcohol dependency. Her approach is compassionate, structured and genuinely transformative. I cannot recommend her highly enough.",
    name: "James T.",
    role: "Software Engineer",
  },
  {
    text: "The nervous system reset sessions changed my life. I went from constant fight-or-flight to feeling genuinely calm for the first time in years. Lily is exceptional.",
    name: "Priya K.",
    role: "NHS Nurse, Tooting",
  },
];

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Calm Lily | Neurocoaching &amp; Hypnotherapy by LiLy Stoica</title>
        <meta
          name="description"
          content="Professional neurocoaching and licensed hypnotherapy in Balham, South West London. Specialising in stress recovery, addiction support and nervous system regulation. Book a free discovery call."
        />
      </Helmet>

      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background orbs */}
        <div className="absolute inset-0 bg-gradient-to-br from-lily-sage-light/40 via-white to-lily-blush/30" />
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-96 h-96 bg-lily-warm/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 rounded-full border border-primary/10"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-gentle-pulse" />
                <span className="text-xs font-medium text-primary tracking-wide uppercase">
                  Now accepting new clients
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-cormorant font-bold text-foreground leading-[1.05] tracking-tight"
              >
                Rewire your brain.
                <br />
                <span className="text-primary relative">
                  Reclaim your life.
                  <motion.span
                    className="absolute -bottom-2 left-0 h-[3px] bg-primary/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg"
              >
                Professional neurocoaching and licensed hypnotherapy for people
                ready to break free from stress, burnout and addictive patterns.
                Based in Balham, South West London.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link
                  to="/book"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
                >
                  <Calendar className="w-4 h-4" />
                  Book Free Discovery Call
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur text-foreground font-medium rounded-full border border-border hover:border-primary/30 hover:bg-white transition-all duration-300"
                >
                  Explore Services
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center gap-6 pt-2"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">500+ clients supported</span>
                </div>
              </motion.div>
            </div>

            {/* Hero visual — animated brain illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-80 h-80 lg:w-[440px] lg:h-[440px]">
                {/* Outer rotating ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-primary/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                {/* Secondary reverse ring */}
                <motion.div
                  className="absolute inset-3 rounded-full border border-primary/5"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                />
                {/* Glow pulse */}
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/10 to-lily-warm/10 animate-glow" />
                {/* Neural particle dots — orbiting */}
                {[0, 60, 120, 180, 240, 300].map((deg, idx) => (
                  <motion.div
                    key={deg}
                    className="absolute w-2 h-2 rounded-full bg-primary/40"
                    style={{ top: "50%", left: "50%", transformOrigin: `0 ${idx % 2 === 0 ? 160 : 190}px` }}
                    animate={{ rotate: [deg, deg + 360] }}
                    transition={{ duration: 20 + idx * 3, repeat: Infinity, ease: "linear" }}
                  />
                ))}
                {/* Inner content circle */}
                <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-primary/5 via-accent/10 to-lily-warm/5 flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <div className="text-center space-y-3">
                    {/* Animated detailed brain SVG */}
                    <motion.div
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative"
                    >
                      <svg viewBox="0 0 120 120" className="w-24 h-24 lg:w-28 lg:h-28 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Neural glow background */}
                        <defs>
                          <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#418F6C" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#418F6C" stopOpacity="0" />
                          </radialGradient>
                          <linearGradient id="brainGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#418F6C" />
                            <stop offset="1" stopColor="#2D6B52" />
                          </linearGradient>
                        </defs>
                        <circle cx="60" cy="60" r="55" fill="url(#brainGlow)" />
                        {/* Left hemisphere */}
                        <path d="M58 30 C48 28, 32 34, 30 48 C28 58, 32 68, 36 74 C38 78, 34 84, 38 88 C42 92, 52 90, 56 88 L58 58 Z"
                          stroke="url(#brainGrad)" strokeWidth="2" fill="#418F6C" fillOpacity="0.08" strokeLinecap="round">
                          <animate attributeName="fill-opacity" values="0.08;0.15;0.08" dur="3s" repeatCount="indefinite" />
                        </path>
                        {/* Right hemisphere */}
                        <path d="M62 30 C72 28, 88 34, 90 48 C92 58, 88 68, 84 74 C82 78, 86 84, 82 88 C78 92, 68 90, 64 88 L62 58 Z"
                          stroke="url(#brainGrad)" strokeWidth="2" fill="#418F6C" fillOpacity="0.08" strokeLinecap="round">
                          <animate attributeName="fill-opacity" values="0.08;0.15;0.08" dur="3s" begin="0.3s" repeatCount="indefinite" />
                        </path>
                        {/* Brain folds — left */}
                        <path d="M40 42 C46 40, 50 44, 48 50" stroke="#418F6C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        <path d="M34 56 C40 52, 48 56, 44 62" stroke="#418F6C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        <path d="M38 70 C44 66, 50 70, 48 76" stroke="#418F6C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        {/* Brain folds — right */}
                        <path d="M80 42 C74 40, 70 44, 72 50" stroke="#418F6C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        <path d="M86 56 C80 52, 72 56, 76 62" stroke="#418F6C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        <path d="M82 70 C76 66, 70 70, 72 76" stroke="#418F6C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        {/* Central divide + stem */}
                        <line x1="60" y1="30" x2="60" y2="88" stroke="#418F6C" strokeWidth="1.5" opacity="0.3" />
                        <path d="M56 88 C56 96, 60 100, 60 104 C60 100, 64 96, 64 88" stroke="#418F6C" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                        {/* Neural pulse dots */}
                        <circle cx="44" cy="46" r="2" fill="#418F6C" opacity="0.6">
                          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="76" cy="46" r="2" fill="#418F6C" opacity="0.6">
                          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite" />
                          <animate attributeName="r" values="2;3;2" dur="2s" begin="0.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="60" cy="60" r="2.5" fill="#D4937A" opacity="0.7">
                          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="r" values="2.5;3.5;2.5" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="40" cy="68" r="1.5" fill="#418F6C" opacity="0.5">
                          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="80" cy="68" r="1.5" fill="#418F6C" opacity="0.5">
                          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="1.5s" repeatCount="indefinite" />
                        </circle>
                        {/* Neural connection lines */}
                        <line x1="44" y1="46" x2="60" y2="60" stroke="#418F6C" strokeWidth="0.5" opacity="0.2">
                          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                        </line>
                        <line x1="76" y1="46" x2="60" y2="60" stroke="#418F6C" strokeWidth="0.5" opacity="0.2">
                          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" begin="0.5s" repeatCount="indefinite" />
                        </line>
                      </svg>
                    </motion.div>
                    <p className="font-cormorant text-2xl lg:text-3xl font-bold text-foreground">
                      Feed Your Brain
                    </p>
                    <p className="text-xs text-muted-foreground px-4">
                      Nervous system regulation, metabolism reset, somatic healing
                    </p>
                  </div>
                </div>
                {/* Floating badges with stagger */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -top-2 right-8 bg-white rounded-xl shadow-card px-4 py-2.5 animate-float"
                >
                  <p className="text-xs font-semibold text-primary">PHPA Registered</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute bottom-4 -left-4 bg-white rounded-xl shadow-card px-4 py-2.5 animate-float"
                  style={{ animationDelay: "2s" }}
                >
                  <p className="text-xs font-semibold text-primary">Level 5 Accredited</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute top-1/2 -right-6 bg-white rounded-xl shadow-card px-4 py-2.5 animate-float"
                  style={{ animationDelay: "4s" }}
                >
                  <p className="text-xs font-semibold text-primary">Addiction Specialist</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <AnimatedSection variant="fadeIn" className="bg-white border-y border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted-foreground">
            {[
              { icon: Shield, label: "Fully Insured" },
              { icon: Star, label: "PHPA Registered" },
              { icon: Brain, label: "Level 5 IAPCP Accredited" },
              { icon: Heart, label: "Lived Experience" },
              { icon: Activity, label: "Certified Addiction Specialist" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 transition-colors hover:text-primary">
                <Icon className="w-4 h-4 text-primary" /> {label}
              </span>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Services */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-xs font-inter font-semibold text-primary uppercase tracking-[0.2em] mb-3">
              What I Offer
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cormorant font-bold text-foreground mb-5">
              How I Can Help
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Every person is different. I combine neuroscience, clinical hypnotherapy
              and somatic practices to address the root cause, not just the symptoms.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((svc) => (
              <StaggerItem key={svc.title}>
                <div className="group relative p-7 rounded-2xl border border-border/60 bg-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-500 h-full overflow-hidden">
                  {/* Subtle gradient hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/3 group-hover:to-transparent transition-all duration-500 rounded-2xl" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 group-hover:scale-110 transition-all duration-300">
                      <svc.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-cormorant font-bold text-foreground mb-3">
                      {svc.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {svc.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <AnimatedSection className="text-center mt-12" delay={0.3}>
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all services and pricing
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-24 lg:py-32 bg-accent/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection variant="slideLeft">
              <span className="inline-block text-xs font-inter font-semibold text-primary uppercase tracking-[0.2em] mb-4">
                About Lily
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cormorant font-bold text-foreground mb-6 leading-tight">
                Lived experience is not a weakness. It is the foundation of genuine understanding.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I am Lily, a Romanian-born life coach, neurocoach and licensed
                  hypnotherapist living in London since 2007. My journey into this
                  work was not academic alone. It was deeply personal.
                </p>
                <p>
                  After years of high-performance roles in employment support and
                  careers guidance, I experienced burnout, anxiety, FND, chronic
                  fatigue and long COVID. I know what it feels like when your body
                  and brain stop cooperating.
                </p>
                <p>
                  That experience is precisely what drives the quality of care I
                  provide. I do not offer generic advice. I offer tools that I have
                  tested on myself, refined through professional training and
                  delivered to hundreds of people from all walks of life.
                </p>
              </div>
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 mt-8 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Read my full story
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-2 gap-5">
              {[
                { stat: "5+", label: "Years in Practice" },
                { stat: "500+", label: "Clients Supported" },
                { stat: "12+", label: "Professional Certifications" },
                { stat: "4.9", label: "Average Rating" },
              ].map((item) => (
                <StaggerItem key={item.label}>
                  <div className="bg-white rounded-2xl p-7 shadow-soft hover:shadow-card-hover transition-shadow duration-500 text-center">
                    <p className="text-4xl font-cormorant font-bold text-primary">{item.stat}</p>
                    <p className="text-sm text-muted-foreground mt-2">{item.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-xs font-inter font-semibold text-primary uppercase tracking-[0.2em] mb-3">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cormorant font-bold text-foreground mb-4">
              Words from Those I Have Worked With
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <StaggerItem key={i}>
                <div className="group p-7 rounded-2xl border border-border/60 bg-card hover:shadow-card-hover transition-all duration-500 h-full flex flex-col">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="border-t border-border/40 pt-4">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Lead magnet */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/20 to-lily-blush/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-20 w-56 h-56 bg-lily-warm/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="inline-block text-xs font-inter font-semibold text-primary uppercase tracking-[0.2em] mb-3">
              Get Started
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cormorant font-bold text-foreground mb-5">
              Not Sure Where to Start?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto text-lg">
              Book a free 20-minute discovery call. No obligation, no sales pitch.
              Just a conversation to understand where you are and whether I can
              help. Or leave your details and receive a free nervous system reset
              audio recording.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/book"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                Book Free Discovery Call
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="scaleIn" delay={0.2}>
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-card p-8 lg:p-10 max-w-md mx-auto border border-white/50">
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-cormorant font-bold text-foreground">
                  Free Nervous System Reset Audio
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Leave your details and receive a guided relaxation recording
                enhanced with binaural beats, designed for stress relief and
                better sleep.
              </p>
              <LeadMagnetForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 bg-primary overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cormorant font-bold text-primary-foreground mb-5">
              Your brain can change. Let me show you how.
            </h2>
            <p className="text-primary-foreground/80 mb-10 max-w-lg mx-auto text-lg">
              Whether you are dealing with stress, addiction, burnout or simply
              want to perform at your best, the first step is a conversation.
            </p>
            <Link
              to="/book"
              className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Calendar className="w-5 h-5" />
              Book Your Session
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <SiteFooter />
      <AIAssistant />
    </>
  );
}
