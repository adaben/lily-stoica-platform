import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Calm Lily</title>
        <meta name="description" content="Privacy policy for Calm Lily neurocoaching and hypnotherapy services." />
        <link rel="canonical" href="https://calm-lily.co.uk/privacy" />
      </Helmet>

      <SiteHeader />

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-headings:font-cormorant prose-headings:text-foreground prose-p:text-muted-foreground">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Who we are</h2>
          <p>
            Calm Lily Ltd (company number 16832636), incorporated on 4 November 2025,
            operates the website lilystoica.com and provides neurocoaching, hypnotherapy
            and related wellbeing services. Our registered office is at 23 Hereward Road,
            London, SW17 7EY, United Kingdom. When we refer to "we", "us" or "our" in
            this policy, we mean Calm Lily Ltd.
          </p>

          <h2>2. Information we collect</h2>
          <p>We collect the following categories of personal data:</p>
          <ul>
            <li>
              <strong>Account information</strong> - name, email address, telephone number,
              and any concerns or notes you share during registration.
            </li>
            <li>
              <strong>Booking data</strong> - session type, date, time, and any notes
              provided when booking a session.
            </li>
            <li>
              <strong>Contact form submissions</strong> - name, email, telephone number
              and message content.
            </li>
            <li>
              <strong>Lead magnet data</strong> - first name and email address when
              requesting our free resources.
            </li>
            <li>
              <strong>Usage data</strong> - standard server logs including IP address,
              browser type, pages visited and timestamps.
            </li>
            <li>
              <strong>Video session data</strong> - session connection metadata (no
              recordings are made without explicit consent).
            </li>
          </ul>

          <h2>3. How we use your data</h2>
          <p>We use your personal data to:</p>
          <ul>
            <li>Provide and manage your neurocoaching and hypnotherapy sessions.</li>
            <li>Process and confirm bookings.</li>
            <li>Send session reminders and follow-up communications.</li>
            <li>Deliver requested resources (such as recordings and guides).</li>
            <li>Respond to your enquiries via the contact form.</li>
            <li>Improve our services and website experience.</li>
            <li>Comply with legal and regulatory obligations.</li>
          </ul>

          <h2>4. Legal basis for processing</h2>
          <p>We process your personal data on the following legal bases:</p>
          <ul>
            <li><strong>Consent</strong> - where you have given clear consent (e.g. subscribing to resources).</li>
            <li><strong>Contract</strong> - where processing is necessary to fulfil a booking or service agreement.</li>
            <li><strong>Legitimate interest</strong> - where processing is necessary for our legitimate business interests, such as improving services, provided these do not override your rights.</li>
          </ul>

          <h2>5. Data sharing</h2>
          <p>
            We do not sell your personal data. We may share data with trusted
            third-party service providers who assist us in operating our platform:
          </p>
          <ul>
            <li><strong>Email delivery</strong> - Resend (for transactional emails).</li>
            <li><strong>Hosting</strong> - our virtual private server provider.</li>
            <li><strong>AI assistant</strong> - Google Gemini processes anonymised conversation data to provide guidance. No personally identifiable information is sent to the AI service.</li>
            <li><strong>Payment processing</strong> - Stripe (when payment features are active).</li>
          </ul>

          <h2>6. Data retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfil
            the purposes for which it was collected. Account data is retained for
            the duration of your account and for up to 12 months after closure.
            Contact form submissions are retained for 6 months. Server logs are
            retained for 90 days.
          </p>

          <h2>7. Your rights</h2>
          <p>Under the UK General Data Protection Regulation, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (subject to legal obligations).</li>
            <li>Withdraw consent at any time.</li>
            <li>Object to processing based on legitimate interest.</li>
            <li>Request data portability.</li>
            <li>Lodge a complaint with the Information Commissioner's Office (ICO).</li>
          </ul>

          <h2>8. Cookies</h2>
          <p>
            We use only essential cookies required for authentication and security.
            We do not use tracking or advertising cookies. Session tokens are stored
            in your browser's local storage for authentication purposes only.
          </p>

          <h2>9. Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect
            your personal data, including encrypted connections (TLS/SSL), secure
            password hashing, and access controls. Video sessions use peer-to-peer
            encryption (WebRTC DTLS-SRTP).
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be
            posted on this page with an updated revision date. We encourage you to
            review this policy periodically.
          </p>

          <h2>11. Contact us</h2>
          <p>
            If you have any questions about this privacy policy or wish to exercise
            your data rights, please contact us at:
          </p>
          <ul>
            <li>Email: hello@lilystoica.co.uk</li>
            <li>Registered office: 23 Hereward Road, London, SW17 7EY</li>
            <li>Company number: 16832636</li>
          </ul>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
