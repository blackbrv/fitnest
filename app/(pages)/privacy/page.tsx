import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — FitNest',
}

const sections = [
  {
    id: 'information-we-collect',
    heading: 'Information We Collect',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          When you create a FitNest account, we collect your name, email address, and a
          hashed version of your password. We never store plain-text passwords.
        </p>
        <p className="text-muted leading-relaxed mb-3">
          As you use the platform, we collect fitness data you enter directly — workout
          completions, notes, and activity logs — as well as limited usage data such as
          session timestamps and feature interactions. This helps us keep the product
          working correctly and improve over time.
        </p>
        <p className="text-muted leading-relaxed">
          If you upload a profile photo, the image is stored as a base64 string associated
          with your account. Family member data you add is stored under your family record
          and accessible only to members of that family.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    heading: 'How We Use Your Information',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          We use your information to provide and operate the FitNest service, including
          authenticating your account, displaying your fitness data, and enabling family
          coordination features.
        </p>
        <p className="text-muted leading-relaxed mb-3">
          We may use anonymised, aggregated usage data to improve the product — for example,
          to understand which features are most useful or to diagnose errors.
        </p>
        <p className="text-muted leading-relaxed">
          If you have opted into notifications, we will send you workout reminders and
          family activity updates via the platform. You can manage notification preferences
          at any time from your account settings.
        </p>
      </>
    ),
  },
  {
    id: 'data-sharing',
    heading: 'Data Sharing',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          We do not sell, rent, or trade your personal data to third parties. Full stop.
        </p>
        <p className="text-muted leading-relaxed">
          We share data only with the service providers necessary to operate FitNest —
          specifically our database host and transactional email provider. These providers
          are contractually bound to handle your data securely and only for the purposes
          we specify.
        </p>
      </>
    ),
  },
  {
    id: 'data-security',
    heading: 'Data Security',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          We apply industry-standard security practices across the FitNest platform.
          Passwords are hashed with bcrypt before storage. Authentication sessions are
          managed via HTTP-only cookies that are not accessible to client-side JavaScript.
          All data transmitted between your browser and our servers is encrypted via HTTPS.
        </p>
        <p className="text-muted leading-relaxed">
          No system can guarantee absolute security, but we take reasonable and appropriate
          technical measures to protect your data from unauthorised access, alteration,
          or destruction.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    heading: 'Your Rights',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          You have the right to access the personal data we hold about you, to correct
          inaccurate data, and to request deletion of your account and associated data.
        </p>
        <p className="text-muted leading-relaxed">
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:privacy@fitnest.app" className="text-primary hover:underline">
            privacy@fitnest.app
          </a>
          . We will respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: 'data-retention',
    heading: 'Data Retention',
    content: (
      <p className="text-muted leading-relaxed">
        We retain data for as long as your account is active. If you delete your account,
        we will permanently purge your personal data — including your profile, family records,
        workout history, and any uploaded media — within 30 days of the deletion request.
        Anonymised, aggregated statistics derived from your usage may be retained for product
        analysis purposes.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact Us',
    content: (
      <p className="text-muted leading-relaxed">
        If you have questions about this privacy policy or how we handle your data, please
        reach out at{' '}
        <a href="mailto:privacy@fitnest.app" className="text-primary hover:underline">
          privacy@fitnest.app
        </a>
        . We take privacy concerns seriously and will do our best to address them promptly.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: March 2026</p>
        <p className="mt-4 text-muted leading-relaxed max-w-2xl">
          Your privacy matters. This policy explains what information FitNest collects,
          how we use it, and what choices you have. We&apos;ve written it to be clear and
          straightforward — not buried in legalese.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">{section.heading}</h2>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  )
}
