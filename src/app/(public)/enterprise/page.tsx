import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Code2, Cloud, Building2, BookOpen, Globe, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Enterprise",
  description: "Technology intelligence and advisory services for enterprise teams.",
}

const services = [
  { title: "AI Strategy", icon: <Zap className="h-5 w-5" />, description: "Assess AI readiness, identify opportunities, and build an actionable AI adoption roadmap for your organization." },
  { title: "Architecture Review", icon: <Code2 className="h-5 w-5" />, description: "Expert review of your technology architecture with actionable recommendations for scalability and resilience." },
  { title: "Cloud Strategy", icon: <Cloud className="h-5 w-5" />, description: "Cloud platform selection, migration planning, cost optimization, and governance framework design." },
  { title: "Executive Workshops", icon: <Building2 className="h-5 w-5" />, description: "Tailored workshops for technology executives and boards on AI, digital transformation, and technology strategy." },
  { title: "Custom Training", icon: <BookOpen className="h-5 w-5" />, description: "Custom learning programs for engineering teams, covering AI, cloud, DevOps, and emerging technologies." },
  { title: "Custom Research", icon: <Globe className="h-5 w-5" />, description: "Bespoke technology research and competitive analysis to inform strategic technology investments." },
]

const benefits = [
  "Trusted by technology and engineering leaders",
  "Structured, evidence-based methodology",
  "Deliverables aligned to your business outcomes",
  "Flexible engagement models",
  "Confidentiality and data security standards",
]

const companySizes = ["1–50 employees", "51–200 employees", "201–1,000 employees", "1,000–10,000 employees", "10,000+ employees"]
const serviceOptions = ["AI Strategy", "Architecture Review", "Cloud Strategy", "Executive Workshop", "Custom Training", "Custom Research", "Other"]

export default function EnterprisePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-zinc-900 py-16 md:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">Enterprise</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Technology intelligence for enterprise teams
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              AI strategy, cloud architecture, technology advisory, and custom training for engineering and executive teams. Rigorous, structured, outcome-focused.
            </p>
            <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">
              <a href="#contact">Talk to us</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 border-b border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s.title} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">{s.icon}</div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NeuGravity */}
      <section className="py-16 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Why NeuGravity</h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">NeuGravity combines deep technology intelligence with structured advisory practice. Our work is grounded in evidence, not vendor interests.</p>
              <ul className="space-y-2">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ value: "50+", label: "Enterprise engagements" }, { value: "8", label: "Service areas" }, { value: "100%", label: "NDA protected" }, { value: "4.9/5", label: "Client satisfaction" }].map((s) => (
                <div key={s.label} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center">
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-zinc-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Get in touch</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">Tell us about your needs and we will respond within one business day.</p>
            <form action="/api/enterprise/leads" method="POST" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="first_name">First name *</label>
                  <input required id="first_name" name="first_name" type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="last_name">Last name *</label>
                  <input required id="last_name" name="last_name" type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="email">Work email *</label>
                <input required id="email" name="email" type="email" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="company">Company *</label>
                  <input required id="company" name="company" type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="role">Your role</label>
                  <input id="role" name="role" type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="company_size">Company size</label>
                  <select id="company_size" name="company_size" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400">
                    <option value="">Select size</option>
                    {companySizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="service">Service of interest</label>
                  <select id="service" name="service" className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400">
                    <option value="">Select service</option>
                    {serviceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={4} placeholder="Describe your needs..." className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none" />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">Send message</Button>
              <p className="text-xs text-zinc-400">We respond within one business day. Your information is kept confidential.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
