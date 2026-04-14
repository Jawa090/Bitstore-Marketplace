import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What does the condition mean?",
    a: "Our devices are graded by condition: New (sealed), Like New (minimal signs of use), Good (light cosmetic wear), Fair (visible wear but fully functional), and Refurbished (professionally restored to like-new).",
  },
  {
    q: "What does the warranty cover?",
    a: "Our 12-month warranty covers all manufacturing defects and malfunctions under normal usage — the same as a new device warranty. It does not cover accidental damage, water damage, or theft.",
  },
  {
    q: "When will I receive my order?",
    a: "Orders placed before 2 PM are shipped same-day within Dubai & Sharjah. All other UAE emirates receive delivery within 1-3 business days. You'll receive tracking updates via SMS and email.",
  },
  {
    q: "Can I return the product?",
    a: "Yes! We offer a 7-day return policy. If you're not satisfied, simply initiate a return from your account and we'll arrange a free pickup.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept Credit/Debit Cards, Apple Pay, Google Pay, Cash on Delivery, and Buy Now Pay Later through installment partners.",
  },
];

const ProductFAQ = () => (
  <div className="rounded-xl border border-border overflow-hidden">
    <div className="px-5 py-4 border-b border-border bg-secondary/30">
      <h3 className="font-semibold">Frequently Asked Questions</h3>
    </div>
    <Accordion type="single" collapsible className="px-5">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default ProductFAQ;
