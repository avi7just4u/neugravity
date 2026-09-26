import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NeuGravity Privacy Policy — how we collect, use, and protect your information.",
}

const lastUpdated = "September 2026"

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly (account registration, newsletter subscriptions, contact forms, enterprise inquiries) and information collected automatically (usage data, device information, cookies). We do not collect payment card data directly — payments are handled by PCI-compliant processors.`,
  },
  {
    title: "2. How We Use Information",
    content: `We use information to operate and improve NeuGravity, send newsletters and product updates (with your consent), respond to inquiries, process payments, enforce our terms of service, and comply with legal obligations. We do not sell personal information.`,
  },
  {
    title: "3. Sharing Information",
    content: `We share information with service providers necessary to operate the platform (hosting, analytics, email, payment processing). We do not share personal information with third parties for their marketing purposes. We may disclose information if required by law.`,
  },
  {
    title: "4. Data Retention",
    content: `Account data is retained while your account is active and for a reasonable period afterward. Newsletter subscriber data is retained until you unsubscribe. Enterprise lead data is retained for the duration of the business relationship. Analytics data may be retained in aggregate form indefinitely.`,
  },
  {
    title: "5. Your Rights",
    content: `Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data; withdraw consent; and lodge a complaint with a supervisory authority. To exercise these rights, contact us at privacy@neugravity.com.`,
  },
  {
    title: "6. Cookies",
    content: `We use essential cookies for authentication and session management. We may use analytics cookies to understand how the platform is used. You can control cookie preferences through your browser settings.`,
  },
  {
    title: "7. Security",
    content: `We implement appropriate technical and organizational measures to protect personal information, including encryption in transit and at rest, access controls, and regular security review. No system is completely secure.`,
  },
  {
    title: "8. Children",
    content: `NeuGravity is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this policy periodically. We will notify subscribers of material changes. Continued use of the platform after changes constitutes acceptance of the revised policy.`,
  },
  {
    title: "10. Contact",
    content: `For privacy-related questions or to exercise your data rights, contact: privacy@neugravity.com`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Privacy Policy</h1>
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
