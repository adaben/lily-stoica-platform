import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function TermsOfUse() {
  return (
    <>
      <Helmet>
        <title>Terms of Use | Calm Lily</title>
        <meta name="description" content="Terms of use for Calm Lily neurocoaching and hypnotherapy platform." />
        <link rel="canonical" href="https://calm-lily.co.uk/terms" />
      </Helmet>

      <SiteHeader />

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-headings:font-cormorant prose-headings:text-foreground prose-p:text-muted-foreground">
          <h1 className="text-4xl font-bold">Terms of Use</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>

          <h2>1. About these terms</h2>
          <p>
            These terms of use govern your access to and use of the website and
            services provided by Calm Lily Ltd (company number 16832636), whose
            registered office is at 23 Hereward Road, London, SW17 7EY, operating
            as LiLy Stoica Neurocoaching and Hypnotherapy ("we", "us", "our").
            By accessing our website or booking a session, you agree to be bound
            by these terms.
          </p>

          <h2>2. Services</h2>
          <p>
            We provide neurocoaching, clinical hypnotherapy and related wellbeing
            services. Our services are intended to support personal development,
            behavioural change and emotional wellbeing. They are not a substitute
            for medical treatment, psychiatric care or emergency services.
          </p>
          <p>
            If you are experiencing a mental health crisis, please contact the
            Samaritans (116 123), NHS 111 or your local emergency services.
          </p>

          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years of age to use our services. By registering
            an account, you confirm that you are 18 or older and that the information
            you provide is accurate.
          </p>

          <h2>4. Account responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activity under your account. Please notify us
            immediately if you suspect unauthorised access.
          </p>

          <h2>5. Booking and cancellation</h2>
          <ul>
            <li>
              <strong>Booking confirmation</strong> - bookings are confirmed via email
              once approved. A booking is not confirmed until you receive a confirmation
              email.
            </li>
            <li>
              <strong>Cancellation policy</strong> - you may cancel or reschedule a
              session up to 24 hours before the scheduled time at no charge. Cancellations
              made less than 24 hours in advance may be subject to the full session fee.
            </li>
            <li>
              <strong>Non-attendance</strong> - if you do not attend a confirmed session
              without prior notice, the full session fee may apply.
            </li>
            <li>
              <strong>Our right to cancel</strong> - we reserve the right to cancel or
              reschedule sessions due to illness or unforeseen circumstances. In such
              cases, we will offer an alternative time or a full refund.
            </li>
          </ul>

          <h2>6. Fees and payment</h2>
          <p>
            Session fees are displayed on our website and are subject to change.
            Discovery calls are offered free of charge. Payment for paid sessions
            is due at the time of booking or as otherwise agreed. All prices are
            in British pounds (GBP).
          </p>

          <h2>7. Video sessions</h2>
          <p>
            Video sessions are conducted via our platform using peer-to-peer
            encrypted connections. You are responsible for ensuring you have a
            stable internet connection, a working camera and microphone, and a
            private, quiet environment. Sessions are not recorded unless both
            parties give explicit written consent.
          </p>

          <h2>8. Confidentiality</h2>
          <p>
            The content of your sessions is treated as strictly confidential.
            We will not disclose information shared during sessions to third
            parties except where required by law, where there is a serious risk
            of harm to yourself or others, or with your explicit consent.
          </p>

          <h2>9. AI assistant</h2>
          <p>
            Our website includes an AI-powered assistant that can answer general
            questions about our services. The AI assistant does not provide
            therapeutic advice, medical guidance or personalised treatment
            recommendations. It is designed for informational purposes only.
          </p>

          <h2>10. Intellectual property</h2>
          <p>
            All content on this website, including text, images, logos, audio
            recordings and downloadable resources, is the intellectual property
            of Calm Lily Ltd. You may not reproduce, distribute or commercially
            exploit any content without our written permission.
          </p>

          <h2>11. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Calm Lily Ltd shall not be
            liable for any indirect, incidental or consequential damages arising
            from your use of our website or services. Our total liability for
            any claim shall not exceed the fees you have paid for services in
            the preceding 12 months.
          </p>

          <h2>12. Governing law</h2>
          <p>
            These terms are governed by and construed in accordance with the
            laws of England and Wales. Any disputes arising from these terms
            shall be subject to the exclusive jurisdiction of the English courts.
          </p>

          <h2>13. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of our
            website and services following any changes constitutes acceptance
            of the revised terms.
          </p>

          <h2>14. Contact</h2>
          <p>
            For questions about these terms, please contact us at
            hello@lilystoica.co.uk or through our contact page.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Calm Lily Ltd &middot; Company number 16832636 &middot; Registered office: 23 Hereward Road, London, SW17 7EY
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
