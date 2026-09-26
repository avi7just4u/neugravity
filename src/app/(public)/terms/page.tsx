import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "NeuGravity Terms of Service.",
}

const lastUpdated = "September 2026"

const sections = [
  { title: "1. Acceptance", content: "By accessing or using NeuGravity, you agree to these Terms of Service. If you do not agree, do not use the platform." },
  { title: "2. Services", content: "NeuGravity provides technology information, news, educational content, tools directory, and related services. We reserve the right to modify, suspend, or discontinue services at any time." },
  { title: "3. User Accounts", content: "You are responsible for maintaining the security of your account and all activity under it. You must provide accurate information at registration. Accounts may be suspended or terminated for violations of these terms." },
  { title: "4. Content Standards", content: "Community content must not be illegal, harmful, deceptive, or violate third-party rights. We reserve the right to remove content that violates these standards. Do not upload copyrighted material without permission." },
  { title: "5. Intellectual Property", content: "NeuGravity content, including original articles, analysis, and editorial work, is protected by copyright. You may not reproduce, distribute, or create derivative works without permission. Technology information sourced from third parties is attributed accordingly." },
  { title: "6. Courses and Payments", content: "Course purchases are subject to our refund policy (30 days from purchase for unused courses). Pricing is subject to change. We do not guarantee course outcomes." },
  { title: "7. Disclaimer", content: "NeuGravity provides information for educational and informational purposes only. Technology information may become outdated. We do not warrant the accuracy, completeness, or fitness for purpose of any information on the platform." },
  { title: "8. Limitation of Liability", content: "To the extent permitted by law, NeuGravity is not liable for indirect, incidental, or consequential damages arising from use of the platform." },
  { title: "9. Governing Law", content: "These terms are governed by applicable law. Disputes shall be resolved through binding arbitration, except where prohibited by law." },
  { title: "10. Changes", content: "We may update these terms periodically. Continued use after changes constitutes acceptance. We will notify registered users of material changes." },
  { title: "11. Contact", content: "For questions about these terms: legal@neugravity.com" },
]

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-400 mb-10">Last updated: {lastUpdated}</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">{s.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
