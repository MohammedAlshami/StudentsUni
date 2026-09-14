import Link from "next/link";
import { Button } from "@/components/ui/button";

const SERVICES = [
  {
    title: "Free Consultation",
    description:
      "Sit down with our education counselors to discuss your options. We help you understand what's available based on your qualifications, budget, and career goals.",
    steps: ["Book an appointment", "Discuss your goals", "Get personalized recommendations"],
  },
  {
    title: "University Selection",
    description:
      "We help you shortlist universities and programs that match your profile. We consider factors like entry requirements, fees, location, and career outcomes.",
    steps: ["Share your qualifications", "Receive a shortlist", "Compare options side by side"],
  },
  {
    title: "Application Assistance",
    description:
      "From filling out forms to preparing your documents, we guide you through the entire application process. We make sure nothing is missed.",
    steps: ["Prepare documents", "Complete application forms", "Submit and track"],
  },
  {
    title: "Visa Guidance",
    description:
      "Navigating visa requirements can be confusing. We provide up-to-date guidance on student visa applications for international students.",
    steps: ["Understand requirements", "Prepare paperwork", "Apply with confidence"],
  },
  {
    title: "Pre-Departure Briefing",
    description:
      "Before you leave, we brief you on what to expect — accommodation, banking, transport, and settling into student life in Malaysia.",
    steps: ["Attend briefing session", "Get your checklist", "Arrive prepared"],
  },
  {
    title: "Post-Arrival Support",
    description:
      "We don't disappear after you land. Reach out to us for help with any issues you face during your first weeks in Malaysia.",
    steps: ["Airport pickup coordination", "Campus orientation tips", "Ongoing support"],
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Header */}
      <div className="border-b border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-2xl font-bold">Our Services</h1>
          <p className="mt-2 text-sm text-black/60">
            End-to-end support for your education journey in Malaysia. All services are free for students.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.title} className="border border-black/10 p-5">
              <h2 className="text-base font-bold">{service.title}</h2>
              <p className="mt-2 text-xs text-black/60 leading-relaxed">
                {service.description}
              </p>
              <ol className="mt-4 space-y-1">
                {service.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-black/50">
                    <span className="font-bold text-black/30">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-bold text-center">How It Works</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {[
              { step: "1", title: "Contact Us", desc: "Reach out via WhatsApp, form, or phone." },
              { step: "2", title: "Consultation", desc: "We discuss your goals and options." },
              { step: "3", title: "Apply", desc: "We help you apply to your chosen university." },
              { step: "4", title: "Enroll", desc: "Get accepted and start your journey." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center border-2 border-black text-lg font-bold">
                  {item.step}
                </div>
                <p className="mt-3 text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-black/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <p className="text-sm text-black/60">Ready to get started?</p>
          <Link href="/contact" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              Book Free Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
