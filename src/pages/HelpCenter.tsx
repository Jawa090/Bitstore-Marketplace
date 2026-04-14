import { useState, useMemo } from "react";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HelpCircle, MessageSquare, Phone, Mail, Search } from "lucide-react";

interface HelpContent {
  title: string;
  subtitle: string;
  faqs: { question: string; answer: string }[];
  contact_cards: { title: string; description: string; icon: string; action: string }[];
}

const fallback: HelpContent = {
  title: "Help Center",
  subtitle: "Find answers to common questions or get in touch with our team",
  faqs: [
    { question: "How do I track my order?", answer: "Go to your account dashboard and click on 'Orders'. You'll see real-time tracking information for each order." },
    { question: "What payment methods do you accept?", answer: "We accept Visa, Mastercard, Apple Pay, and Cash on Delivery (COD) across all UAE emirates." },
    { question: "Can I change or cancel my order?", answer: "Orders can be modified or cancelled within 30 minutes of placement. Contact our support team for assistance." },
    { question: "Do you offer warranty on products?", answer: "Yes, all new products come with manufacturer warranty. Refurbished items include a 6-month BitStores warranty." },
    { question: "How does the auction system work?", answer: "Browse live auctions, place bids on bulk lots, and win items at competitive prices. All auctions have transparent bidding with anti-snipe protection." },
    { question: "What is wholesale pricing?", answer: "Business buyers can access bulk pricing tiers with discounts up to 25%. Visit our Wholesale page to learn more." },
  ],
  contact_cards: [
    { title: "Live Chat", description: "Chat with BitBot AI assistant 24/7", icon: "message", action: "Start Chat" },
    { title: "Call Us", description: "+971 4 123 4567", icon: "phone", action: "Call Now" },
    { title: "Email", description: "support@bitstores.com", icon: "mail", action: "Send Email" },
  ],
};

const iconMap: Record<string, React.ElementType> = { message: MessageSquare, phone: Phone, mail: Mail, help: HelpCircle };

const HelpCenter = () => {
  const { data } = useStorefrontContent<HelpContent>("page_help", fallback);
  const content = data?.content || fallback;
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return content.faqs;
    const q = search.toLowerCase();
    return content.faqs.filter(
      (faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    );
  }, [search, content.faqs]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-display mb-2">{content.title}</h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {content.contact_cards.map((c, i) => {
            const Icon = iconMap[c.icon] || HelpCircle;
            return (
              <Card key={i} className="bg-secondary/30 border-border/50 text-center">
                <CardHeader className="pb-2">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-base">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{c.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="pl-10"
          />
        </div>
        {filteredFaqs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No matching questions found. Try a different search term.</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-lg px-4 bg-secondary/20">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
      <StorefrontFooter />
    </div>
  );
};

export default HelpCenter;
