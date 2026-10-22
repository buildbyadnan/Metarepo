import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import experience from "@/data/experience.json";

type Exp = { role: string; company: string; period: string; highlights: string[] };

export default function ExperienceSection() {
  return (
    <Section id="experience" title="Experience" subtitle="Roles, impact, and responsibilities">
      <div className="space-y-6">
        {(experience as Exp[]).map((e) => (
          <Card key={e.role + e.company}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">{e.role}</h3>
                <p className="text-sm text-slate-400">{e.company}</p>
              </div>
              <span className="mt-2 md:mt-0 text-xs text-slate-400">{e.period}</span>
            </div>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-300">
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}
