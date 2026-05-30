import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — FitNest',
}

const sections = [
  {
    id: 'acceptance',
    heading: 'Acceptance of Terms',
    content: (
      <p className="text-muted leading-relaxed">
        By accessing or using the FitNest platform — including our website, mobile-optimised
        web app, and any related services — you agree to be bound by these Terms of Service.
        If you do not agree with any part of these terms, you must not use the service.
        Your continued use of FitNest after any changes to these terms constitutes your
        acceptance of the revised terms.
      </p>
    ),
  },
  {
    id: 'account-responsibilities',
    heading: 'Account Responsibilities',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          You are responsible for maintaining the confidentiality of your account credentials.
          Do not share your password with others. You are accountable for all activity that
          occurs under your account, whether or not you authorised it.
        </p>
        <p className="text-muted leading-relaxed">
          If you suspect unauthorised access to your account, notify us immediately at{' '}
          <a href="mailto:legal@fitnest.app" className="text-primary hover:underline">
            legal@fitnest.app
          </a>
          {' '}and change your password without delay.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable Use',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          You agree to use FitNest only for its intended purpose: tracking and coordinating
          fitness activity for yourself and your family. You must not:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-muted leading-relaxed">
          <li>Use the service for any unlawful purpose or in violation of any applicable laws</li>
          <li>Send spam, unsolicited messages, or automated requests to our systems</li>
          <li>Impersonate another person or misrepresent your identity</li>
          <li>Attempt to gain unauthorised access to other users&apos; data or our infrastructure</li>
          <li>Introduce malware, viruses, or other harmful code into the platform</li>
        </ul>
      </>
    ),
  },
  {
    id: 'family-data',
    heading: 'Family Data',
    content: (
      <p className="text-muted leading-relaxed">
        FitNest allows you to create a family group and add members. By adding another person&apos;s
        data to your family account, you represent that you have obtained appropriate consent from
        that individual, or — in the case of minors — that you are their parent or legal guardian
        and are acting on their behalf. You are responsible for ensuring that all data entered
        for family members complies with applicable privacy laws in your jurisdiction.
      </p>
    ),
  },
  {
    id: 'service-availability',
    heading: 'Service Availability',
    content: (
      <>
        <p className="text-muted leading-relaxed mb-3">
          FitNest is provided &quot;as is&quot; and &quot;as available&quot; without warranty of any kind, either
          express or implied. We do not guarantee uninterrupted or error-free access to the
          service, and we make no uptime commitments.
        </p>
        <p className="text-muted leading-relaxed">
          We reserve the right to modify, suspend, or discontinue the service — or any part
          of it — at any time, with or without notice. We will not be liable to you or any
          third party for any such modification, suspension, or discontinuation.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    heading: 'Termination',
    content: (
      <p className="text-muted leading-relaxed">
        We reserve the right to suspend or terminate your access to FitNest at our discretion
        if you violate these terms, engage in fraudulent or harmful behaviour, or for any
        other reason we deem necessary to protect the integrity of the service or the safety
        of other users. You may also delete your account at any time from your account settings.
      </p>
    ),
  },
  {
    id: 'governing-law',
    heading: 'Governing Law',
    content: (
      <p className="text-muted leading-relaxed">
        These Terms of Service shall be governed by and construed in accordance with
        internationally recognised principles of commercial law. Any disputes arising from
        your use of FitNest will be resolved through good-faith negotiation in the first
        instance. If a dispute cannot be resolved informally, it shall be submitted to
        binding arbitration under internationally accepted arbitration rules.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to These Terms',
    content: (
      <p className="text-muted leading-relaxed">
        We may update these Terms of Service from time to time to reflect changes in the
        law, our service, or our policies. We will indicate the date of the most recent
        revision at the top of this page. Your continued use of FitNest after any changes
        have been published constitutes your acceptance of the updated terms.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact',
    content: (
      <p className="text-muted leading-relaxed">
        Questions or concerns about these terms? Reach out at{' '}
        <a href="mailto:legal@fitnest.app" className="text-primary hover:underline">
          legal@fitnest.app
        </a>
        . We&apos;ll do our best to respond within a reasonable timeframe.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">Terms of Service</h1>
        <p className="text-sm text-muted">Last updated: March 2026</p>
        <p className="mt-4 text-muted leading-relaxed max-w-2xl">
          Please read these terms carefully before using FitNest. They govern your use of
          our platform and outline both your rights and responsibilities.
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
