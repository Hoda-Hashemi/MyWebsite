import type { Metadata } from "next";
import { Download, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { education, experience, projects, skills } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About & CV",
  description:
    "Hoda Hashemi — computational physicist at AUB. M.Sc. Computational Science, B.Sc. Theoretical Physics. Ocean dynamics, numerical modeling, CUDA/HPC.",
};

function TimelineSection({
  tag,
  entries,
}: {
  tag: string;
  entries: { period: string; title: string; place: string; note: string }[];
}) {
  return (
    <section className="mt-16">
      <Reveal>
        <h2 className="tag">{tag}</h2>
      </Reveal>
      <ol className="mt-6 border-l border-line">
        {entries.map((e, i) => (
          <Reveal as="li" key={e.title + e.period} delay={i * 0.06} className="relative pb-10 pl-8 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full border-2 border-accent bg-bg"
            />
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">
              {e.period}
            </p>
            <h3 className="mt-2 text-lg font-semibold">{e.title}</h3>
            <p className="mt-0.5 text-sm font-medium text-fg/80">{e.place}</p>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{e.note}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="container-page py-20 md:py-28">
      {/* header */}
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <p className="tag">About — CV</p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
            Hoda <span className="text-gradient">Hashemi</span>
          </h1>
          <p className="mt-3 font-mono text-[0.78rem] uppercase tracking-[0.16em] text-muted">
            {site.role} · American University of Beirut
          </p>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
            My work sits where continuous physics meets discrete computation:
            translating the equations of geophysical flow into stable, fast,
            inspectable numerical systems — and building the tools that make
            those systems easier to drive.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.cvPdf} download className="btn btn-primary">
              <Download className="h-4 w-4" aria-hidden="true" /> Download CV (PDF)
            </a>
            <a href={`mailto:${site.email}`} className="btn btn-ghost">
              <Mail className="h-4 w-4" aria-hidden="true" /> Email
            </a>
          </div>
        </Reveal>

        {/* facts card */}
        <Reveal delay={0.12}>
          <div className="corners card relative h-fit p-7">
            <span className="corner-b" aria-hidden="true" />
            <dl className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                    Location
                  </dt>
                  <dd className="mt-0.5 font-medium">{site.location}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                    Contact
                  </dt>
                  <dd className="mt-0.5 space-y-0.5">
                    <a className="block font-medium hover:text-accent" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                    <a className="block font-medium hover:text-accent" href={`mailto:${site.academicEmail}`}>
                      {site.academicEmail}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Github className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                    GitHub
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      className="font-medium hover:text-accent"
                      href={site.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github.com/Hoda-Hashemi
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                    LinkedIn
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      className="font-medium hover:text-accent"
                      href={site.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      hoda-hashemi
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>

      <TimelineSection
        tag="Education"
        entries={education.map((e) => ({
          period: e.period,
          title: e.degree,
          place: e.school,
          note: e.note,
        }))}
      />

      <TimelineSection
        tag="Research"
        entries={experience.map((e) => ({
          period: e.period,
          title: e.role,
          place: e.org,
          note: e.note,
        }))}
      />

      {/* projects */}
      <section className="mt-16">
        <Reveal>
          <h2 className="tag">Selected projects</h2>
        </Reveal>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal as="li" key={p.name} delay={i * 0.06}>
              <div className="card card-hover h-full p-6">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent">
                  {p.period}
                </p>
                <h3 className="mt-2 text-base font-semibold">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.note}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* skills */}
      <section className="mt-16">
        <Reveal>
          <h2 className="tag">Stack</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s, i) => (
            <Reveal key={s.group} delay={i * 0.06}>
              <div className="card h-full p-6">
                <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                  {s.group}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line bg-bg-subtle px-3 py-1 text-[0.8rem] font-medium"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
