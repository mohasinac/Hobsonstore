import { Accordion } from "@/components/ui/Accordion";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import type { FAQItem } from "@/types/content";

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  if (items.length === 0) return null;

  const accordionItems = items.map((item) => ({
    id: item.id,
    question: item.question,
    answer: <RichTextRenderer html={item.answer} />,
  }));

  return (
    <section
      className="py-10 sm:py-16"
      style={{
        background: "var(--surface-warm)",
        borderTop: "4px solid var(--color-yellow)",
      }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <h2
          className="mb-8 text-center"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "0.08em",
            color: "var(--color-yellow)",
          }}
        >
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <Accordion items={accordionItems} />
      </div>
    </section>
  );
}
