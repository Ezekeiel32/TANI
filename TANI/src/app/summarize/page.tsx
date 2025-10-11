import SummarizeForm from './summarize-form';

export default function SummarizePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">
          Article Summarizer
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Paste any article text below and our AI will provide a concise summary.
        </p>
      </div>
      <SummarizeForm />
    </div>
  );
}
