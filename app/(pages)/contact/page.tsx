import type { Metadata } from 'next'
import { Mail, Clock, Code2 } from 'lucide-react'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact — FitNest',
}

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@fitnest.app',
    href: 'mailto:hello@fitnest.app',
  },
  {
    icon: Clock,
    label: 'Response time',
    value: 'Typically within 48 hours',
    href: null,
  },
  {
    icon: Code2,
    label: 'GitHub',
    value: 'github.com/blackbrv/fitnest',
    href: 'https://github.com/blackbrv/fitnest',
  },
]

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">Get in Touch</h1>
        <p className="text-muted leading-relaxed max-w-xl">
          Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
          Fill out the form and we&apos;ll get back to you as soon as we can.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: contact info */}
        <div className="lg:col-span-2 space-y-4">
          {contactItems.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">{label}</p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-foreground">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
