import { Reveal } from "@/components/Reveal";

export function SectionHeading({
  tag,
  title,
  sub,
}: {
  tag: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="max-w-2xl">
      <p className="tag">{tag}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl md:text-[2.75rem] md:leading-[1.05]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-muted">{sub}</p>}
    </Reveal>
  );
}
