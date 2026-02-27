import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Brain, Heart, Shield, Leaf, Activity, Sparkles,
  Clock, Check, Calendar, ArrowRight,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIAssistant from "@/components/AIAssistant";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";

const services = [
  {
    id: "neurocoaching",
    icon: Brain,
    title: "Neurocoaching",
    subtitle: "Rewire, rebuild, perform",
    price: "From £80 per session",
    duration: "60 minutes",
    description:
      "Neurocoaching combines neuroscience principles with practical coaching to help you rewire thought patterns, build mental resilience and achieve sustainable change. It works at the level where habits, beliefs and automatic responses are formed.",
    suitable: [
      "Professionals experiencing burnout or chronic stress",
      "Career transitions and decision fatigue",
      "Chronic overthinking and perfectionism",
      "Building confidence after setbacks",
      "Leadership performance and clarity",
    ],
    includes: [
      "Initial assessment of current challenges and goals",
      "Personalised neuro-protocol tailored to your needs",
      "Practical exercises and techniques to use between sessions",
      "Session recordings where appropriate for continued practice",
      "Email support between sessions",
    ],
  },
  {
    id: "hypnotherapy",
    icon: Activity,
    title: "Clinical Hypnotherapy",
    subtitle: "Access the subconscious mind",
    price: "From £90 per session",
    duration: "60-75 minutes",
    description:
      "Licensed clinical hypnotherapy to address the root causes of anxiety, stress, phobias, unwanted habits and behavioural patterns. By working with the subconscious mind, we can create change at a deeper level than willpower alone allows.",
    suitable: [
      "Anxiety and stress disorders",
      "Phobias and fear responses",
      "Sleep difficulties and insomnia",
      "Confidence and self-esteem",
      "Pain management",
      "Smoking cessation",
    ],
    includes: [
      "Detailed intake consultation",
      "Tailored hypnotherapy scripts",
      "Binaural beat-enhanced audio recordings for home practice",
      "Post-session integration guidance",
      "Follow-up support via email",
    ],
  },
  {
    id: "addiction",
    icon: Shield,
    title: "Addiction Recovery Support",
    subtitle: "Break the cycle at the source",
    price: "From £95 per session",
    duration: "60-90 minutes",
    description:
      "Certified addiction specialist support for alcohol, sugar, screen dependency, emotional eating and behavioural addictions. This approach works at the subconscious level to address cravings, habit loops and the emotional triggers that drive addictive behaviour.",
    suitable: [
      "Alcohol reduction or cessation",
      "Sugar and emotional eating patterns",
      "Screen and digital addiction",
      "Workaholism and compulsive productivity",
      "Gambling and behavioural addictions",
    ],
    includes: [
      "Comprehensive addiction assessment",
      "Hypnotherapy sessions targeting craving reduction",
      "Nervous system regulation practices",
      "Neuroplasticity-focused exercises",
      "Recorded hypnosis enhanced with binaural beats",
      "Ongoing support and accountability",
    ],
  },
  {
    id: "nervous-system",
    icon: Leaf,
    title: "Nervous System Regulation",
    subtitle: "From survival mode to restoration",
    price: "From £75 per session",
    duration: "50-60 minutes",
    description:
      "Somatic practices, vagus nerve activation techniques and guided relaxation to help your body shift from chronic fight-or-flight into a state of genuine rest and recovery. Particularly effective for people living with chronic fatigue, FND or trauma responses.",
    suitable: [
      "Chronic fatigue and low energy",
      "Functional Neurological Disorder (FND)",
      "Post-COVID recovery",
      "PTSD and trauma responses",
      "Feeling constantly wired but exhausted",
      "Somatic symptoms without clear medical cause",
    ],
    includes: [
      "Nervous system state assessment",
      "Guided somatic movement and breathwork",
      "Vagus nerve activation protocols",
      "Take-home audio recordings for daily practice",
      "Progress tracking across sessions",
    ],
  },
  {
    id: "burnout",
    icon: Heart,
    title: "Stress and Burnout Prevention",
    subtitle: "Prevent, do not just recover",
    price: "From £80 per session",
    duration: "60 minutes",
    description:
      "A proactive approach for high-performing individuals who recognise the signs of burnout before it becomes a clinical problem. Combines coaching, hypnotherapy and nervous system practices to build sustainable resilience.",
    suitable: [
      "High-pressure careers and leadership roles",
      "Entrepreneurs and business owners",
      "People returning to work after illness",
      "Those with a history of burnout",
      "Anyone feeling stretched and on the edge",
    ],
    includes: [
      "Burnout risk assessment",
      "Personalised prevention strategy",
      "Stress regulation techniques",
      "Hypnotherapy for mental restoration",
      "Practical boundary-setting tools",
    ],
  },
  {
    id: "weight",
    icon: Sparkles,
    title: "Weight and Metabolism Reset",
    subtitle: "Body and brain in harmony",
    price: "From £85 per session",
    duration: "60 minutes",
    description:
      "Addressing the emotional and subconscious drivers of weight challenges, emotional eating, IBS and metabolic imbalance. This is not a diet programme. It is a neurological and emotional reset that helps your body and brain work together.",
    suitable: [
      "Emotional eating and binge patterns",
      "IBS and digestive sensitivity",
      "Yo-yo dieting and weight cycling",
      "Body image and self-worth",
      "Metabolic fatigue and brain fog",
    ],
    includes: [
      "Metabolic and emotional eating assessment",
      "Mindful eating protocols (including raisin mindfulness)",
      "Metabolic weight reset hypnotherapy recordings",
      "Nutritional guidance aligned with brain health",
      "21-day neuroplasticity programme",
    ],
  },
];

const sessionTypes = [
  {
    name: "Discovery Call",
    duration: "20 minutes",
    price: "Free",
    description: "A no-obligation conversation to understand your needs and see whether we are a good fit.",
  },
  {
    name: "Standard Session",
    duration: "60 minutes",
    price: "From £75",
    description: "A full session combining assessment, intervention and take-home tools.",
  },
  {
    name: "Intensive Session",
    duration: "90 minutes",
    price: "From £120",
    description: "Extended session for complex issues or when deeper work is needed in a single sitting.",
  },
  {
    name: "Workshop / Group",
    duration: "2-3 hours",
    price: "From £15",
    description: "In-person events in Balham covering specific themes. Concessions available.",
  },
];

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Services | Calm Lily - Neurocoach and Hypnotherapist</title>
        <meta
          name="description"
          content="Neurocoaching, hypnotherapy, addiction recovery, nervous system regulation and burnout prevention. View services and pricing."
        />
      </Helmet>

      <SiteHeader />

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-accent/30 via-white to-lily-blush/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h1 className="text-4xl sm:text-5xl font-cormorant font-bold text-foreground mb-4">
              Services
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Every service is delivered with genuine care, professional rigour and
              practical tools you can use immediately. All sessions are available
              in person (Balham, SW London) or online via secure video call.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services list */}
      <section className="py-20 bg-white">
        <StaggerContainer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((svc, i) => (
            <StaggerItem
              key={svc.id}
              className={`grid lg:grid-cols-5 gap-8 ${i > 0 ? "pt-16 border-t border-border/40" : ""}`}
            >
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <svc.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-cormorant font-bold text-foreground">{svc.title}</h2>
                    <p className="text-sm text-muted-foreground">{svc.subtitle}</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{svc.description}</p>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Suitable for</h4>
                  <ul className="space-y-1.5">
                    {svc.suitable.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-accent/30 rounded-2xl p-6 sticky top-24">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{svc.duration}</span>
                  </div>
                  <p className="text-xl font-cormorant font-bold text-foreground mb-4">{svc.price}</p>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Each session includes</h4>
                  <ul className="space-y-1.5 mb-6">
                    {svc.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/book"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book This Service
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Session types */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-cormorant font-bold text-foreground mb-10 text-center">
              Session Types and Pricing
            </h2>
          </AnimatedSection>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sessionTypes.map((st) => (
              <StaggerItem key={st.name} className="bg-white rounded-2xl p-6 border border-border/60">
                <h3 className="text-lg font-cormorant font-bold text-foreground mb-1">{st.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{st.duration}</p>
                <p className="text-2xl font-cormorant font-bold text-primary mb-3">{st.price}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{st.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Concessions available for those facing financial hardship or supported by disability charities.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-cormorant font-bold text-primary-foreground mb-4">
              Not sure which service is right for you?
            </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Start with a free discovery call. We will discuss your situation and I
            will recommend the best approach.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Book Free Discovery Call
            <ArrowRight className="w-4 h-4" />
          </Link>
          </AnimatedSection>
        </div>
      </section>

      <SiteFooter />
      <AIAssistant />
    </>
  );
}
