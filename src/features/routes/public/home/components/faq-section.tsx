'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from '@/components/core/accordion';
import { Badge } from '@/components/core/badge';
import { Card, CardContent } from '@/components/core/card';
import type { PublicHomeCopy } from '../types';

export function FaqSection({
  faqSection,
  withAnchorId = true,
}: {
  faqSection: PublicHomeCopy['faqSection'];
  withAnchorId?: boolean;
}) {
  return (
    <section
      id={withAnchorId ? 'sss' : undefined}
      className="scroll-mt-20 space-y-6"
    >
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <Badge variant="outline">{faqSection.badge}</Badge>
        <h2 className="font-heading text-title text-text sm:text-display">
          {faqSection.title}
        </h2>
        <p className="text-body-sm text-text-muted">{faqSection.description}</p>
      </div>

      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-4 sm:p-6">
          <AccordionRoot type="single" collapsible className="w-full">
            {faqSection.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-body-sm text-text-muted">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </AccordionRoot>
        </CardContent>
      </Card>
    </section>
  );
}
