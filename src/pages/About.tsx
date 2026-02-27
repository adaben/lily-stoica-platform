import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Brain, Heart, Shield, Award, BookOpen, Users,
  Calendar, GraduationCap, Briefcase,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIAssistant from "@/components/AIAssistant";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";

const qualifications = [
  "Level 5 IAPCP Accredited Life Coach (NLP, Hypnotherapy, Human Needs Psychology)",
  "PHPA Registered Hypnotherapy Practitioner",
  "Certified Addiction Specialist (Evolve Life Coaching College)",
  "Somatic Experiencing Practitioner",
  "10x Confidence Trainer",
  "Neurodiversity Practitioner (ASD, VAST)",
  "DBI (Dialectic Behavioural Interventions) Coach",
  "Weight Management Coach (Emotional Eating, IBS)",
  "Hypnotherapy and Counselling for Children",
  "Level 2 Menopause Coach",
  "Level 3 Autism Coach",
  "ThetaHealing Advanced DNA Practitioner",
  "Regression to Cause and Pain Management (Romanian accreditation)",
  "Level 4 OCR Diploma in Careers Information, Advice and Guidance",
  "Chartered Institute of Linguists (Metropolitan Police Legal Interpreting)",
];

const timeline = [
  {
    year: "2007",
    title: "Arrived in London",
    description: "Began building a career in the UK with a background in teaching and translation.",
  },
  {
    year: "2015-2019",
    title: "Careers Adviser and Employment Support",
    description:
      "Worked as an IAG Accredited Careers Adviser, Employment Specialist and Talent Developer across multiple London boroughs, supporting hundreds of people into sustainable employment.",
  },
  {
    year: "2019-2023",
    title: "Mental Health Employment Specialist",
    description:
      "Transitioned into mental health employment support at Twining Enterprise and the Royal Borough of Greenwich. Began formal training in life coaching and hypnotherapy.",
  },
  {
    year: "2021",
    title: "Qualified as a Life Coach and Hypnotherapist",
    description:
      "Completed Level 5 Diploma through Birkbeck University and Evolve Life Coaching College. Began practising alongside full-time employment.",
  },
  {
    year: "2021-2024",
    title: "Personal Health Journey",
    description:
      "Experienced FND, chronic fatigue, long COVID and burnout firsthand. This lived experience became the foundation for deeper understanding of what clients truly need.",
  },
  {
    year: "2024-Present",
    title: "Calm Lily Ltd",
    description:
      "Founded own practice specialising in neurocoaching, hypnotherapy, addiction recovery and nervous system regulation. Running regular in-person events in Balham and online sessions.",
  },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Lily | Calm Lily - Neurocoach and Hypnotherapist</title>
        <meta
          name="description"
          content="Learn about Lily Stoica's journey from careers adviser to neurocoach and hypnotherapist. Lived experience combined with professional accreditation."
        />
      </Helmet>

      <SiteHeader />

      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-accent/30 via-white to-lily-blush/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <h1 className="text-4xl sm:text-5xl font-cormorant font-bold text-foreground mb-6">
                About Lily
              </h1>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  My name is Liliana Stoica and I am the founder of Calm Lily Ltd. I am a Romanian-born
                  neurocoach, licensed hypnotherapist and complementary therapist, based in London
                  since 2007.
                </p>
                <p>
                  I hold a Level 5 internationally accredited Life Coaching diploma incorporating
                  NLP, Hypnotherapy and the Psychology of Human Needs. I am registered on the
                  PHPA as a Hypnotherapy Practitioner and hold specialist certifications in addiction
                  recovery, somatic experiencing, neurodiversity, confidence training and weight management.
                </p>
                <p>
                  Before entering this field, I spent over a decade supporting people into employment
                  across some of London's most challenging boroughs. That work taught me something
                  fundamental: lasting change happens when someone feels genuinely heard and understood.
                </p>
                <p>
                  My own experience of anxiety, depression, FND, chronic fatigue and long COVID
                  shaped every aspect of how I work today. I do not offer theoretical advice. I
                  offer practical tools tested through lived experience and refined through
                  continuous professional development.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection variant="scaleIn" className="flex justify-center">
              <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-lily-warm/10 rotate-3" />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tl from-primary/5 to-accent/20 -rotate-2 flex items-center justify-center">
                  <div className="text-center space-y-3 p-8">
                    <Brain className="w-14 h-14 text-primary mx-auto" />
                    <p className="font-cormorant text-2xl font-bold text-foreground">
                      Lily Stoica
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Neurocoach, Hypnotherapist
                      <br />
                      Addiction Specialist
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-cormorant font-bold text-foreground mb-10 text-center">
              My Approach
            </h2>
          </AnimatedSection>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Neuroscience-Led",
                text: "Every technique is grounded in current neuroscience research. I work with the brain, not against it.",
              },
              {
                icon: Heart,
                title: "Compassion First",
                text: "No judgement, no pressure. Real change begins when you feel safe enough to be honest.",
              },
              {
                icon: Shield,
                title: "Evidence-Based",
                text: "Licensed, registered, insured and continuously trained. Your safety and wellbeing come first.",
              },
              {
                icon: Users,
                title: "Person-Centred",
                text: "Every session is tailored to you. There is no one-size-fits-all protocol in my practice.",
              },
              {
                icon: BookOpen,
                title: "Lived Experience",
                text: "I have been through burnout, chronic illness and recovery. That understanding informs everything I do.",
              },
              {
                icon: Award,
                title: "Ongoing Development",
                text: "I invest in continuous professional development across multiple modalities to give clients the best possible care.",
              },
            ].map((item) => (
              <StaggerItem key={item.title} className="p-6 rounded-2xl border border-border/60">
                <item.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-cormorant font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-cormorant font-bold text-foreground mb-12 text-center">
              My Journey
            </h2>
          </AnimatedSection>
          <StaggerContainer className="space-y-8">
            {timeline.map((item, i) => (
              <StaggerItem key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{item.year.split("-")[0].slice(-2)}</span>
                  </div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-primary/15 mt-2" />}
                </div>
                <div className="pb-2">
                  <p className="text-xs text-primary font-medium mb-0.5">{item.year}</p>
                  <h3 className="text-lg font-cormorant font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Qualifications */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-cormorant font-bold text-foreground mb-10 text-center">
              Qualifications and Certifications
            </h2>
          </AnimatedSection>
          <StaggerContainer className="grid sm:grid-cols-2 gap-3">
            {qualifications.map((q, i) => (
              <StaggerItem key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/30">
                <GraduationCap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{q}</span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Previous career */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Briefcase className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-cormorant font-bold text-foreground mb-4">
              Previous Career
            </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
            Before focusing fully on neurocoaching and hypnotherapy, I worked for over a decade
            in employment support, careers guidance and talent development across London. I held
            roles at the Royal Borough of Greenwich, Twining Enterprise, Richmond and Wandsworth
            Councils, and AEET, supporting hundreds of individuals from all backgrounds into
            meaningful and sustainable employment.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            That career gave me transferable skills in rapport-building, empathy, assessment,
            motivational interviewing and cross-cultural communication that remain at the core
            of my practice today.
          </p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-cormorant font-bold text-primary-foreground mb-4">
              Ready to Begin?
            </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Book a free discovery session and let us talk about what you need.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Book Free Discovery Call
          </Link>
          </AnimatedSection>
        </div>
      </section>

      <SiteFooter />
      <AIAssistant />
    </>
  );
}
