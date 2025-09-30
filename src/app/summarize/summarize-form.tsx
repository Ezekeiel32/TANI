'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { summarizeArticleAction } from './actions';
import { AlertCircle, FileText } from 'lucide-react';

const initialState = {
  summary: '',
  error: '',
};

export default function SummarizeForm() {
  const [state, formAction] = useFormState(summarizeArticleAction, initialState);
  const [isPending, setIsPending] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    await formAction(formData);
    setIsPending(false);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2" />
          Enter Article
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Textarea
            name="articleText"
            placeholder="Paste your article text here..."
            rows={15}
            className="w-full text-base"
            required
          />
          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? 'Summarizing...' : 'Summarize'}
          </Button>
        </form>

        {state.error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-start">
            <AlertCircle className="mr-2 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold">An error occurred</p>
              <p>{state.error}</p>
            </div>
          </div>
        )}

        {state.summary && (
          <div className="mt-8">
            <h3 className="text-2xl font-headline font-semibold mb-4">Summary</h3>
            <div className="p-6 bg-secondary rounded-lg prose prose-lg max-w-none">
              <p>{state.summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
