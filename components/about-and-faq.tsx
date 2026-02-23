/**
 * Indexable About + FAQ for SEO and AI discoverability.
 * Content is in the DOM so crawlers and chatbots can summarize the product.
 */
const faqItems = [
  {
    question: 'What is Markos?',
    answer:
      'Markos is a free, minimal markdown editor that shows your writing and a live-rendered preview side by side. You can use it in the browser with no sign-up or install.',
  },
  {
    question: 'Is Markos free?',
    answer: 'Yes. Markos is free to use with no account required.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. You can start writing and previewing markdown immediately without signing up.',
  },
  {
    question: 'Does Markos work offline?',
    answer:
      'Once the app is loaded, you can keep editing in the browser. Saving or exporting may require a connection depending on your use.',
  },
  {
    question: 'Where is my content stored?',
    answer:
      'Your content stays in your browser. Markos does not upload or store your text on a server unless you use a feature that explicitly does so.',
  },
] as const

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

export function AboutAndFaq() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <aside
        className="shrink-0 border-b border-foreground/[0.06] bg-muted/30 px-4 py-2"
        aria-label="About Markos and FAQ"
      >
        <p className="text-center text-xs text-muted-foreground">
          Markos is a free, no-sign-up markdown editor with live side-by-side preview. Write in the left panel, see the result on the right.
        </p>
        <details className="group mt-2">
          <summary className="cursor-pointer list-none text-center text-xs text-muted-foreground hover:text-foreground/80 [&::-webkit-details-marker]:hidden">
            What is Markos?
          </summary>
          <p className="mt-2 max-w-2xl mx-auto text-center text-xs text-muted-foreground/90">
            Markos is a minimal, elegant markdown editor that runs in your browser. It shows your raw markdown on the left and a live-rendered preview on the right. There is no sign-up, no account, and no install—just open the app and start writing. It is ideal for quick notes, drafts, and anyone who wants to see markdown rendered as they type.
          </p>
        </details>
        <details className="group mt-2">
          <summary className="cursor-pointer list-none text-center text-xs text-muted-foreground hover:text-foreground/80 [&::-webkit-details-marker]:hidden">
            FAQ
          </summary>
          <section className="mt-3 max-w-2xl mx-auto space-y-3" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="sr-only">
              Frequently asked questions about Markos
            </h2>
            <dl className="space-y-2">
              {faqItems.map(({ question, answer }) => (
                <div key={question}>
                  <dt className="text-xs font-medium text-foreground/90">{question}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </details>
      </aside>
    </>
  )
}
