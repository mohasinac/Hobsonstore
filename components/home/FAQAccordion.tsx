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
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-8 text-center text-xl font-extrabold uppercase tracking-tight text-gray-900 sm:text-2xl">
          Frequently Asked Questions
        </h2>
        <Accordion items={accordionItems} />
      </div>
    </section>
  );
}
