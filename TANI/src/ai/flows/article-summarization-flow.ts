'use server';
/**
 * @fileOverview Summarizes a given article.
 *
 * - summarizeArticle - A function that summarizes the article.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.string().describe('The full text of the article to summarize.');
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the article.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(articleText: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(articleText);
}

const prompt = ai.definePrompt({
  name: 'articleSummarizationPrompt',
  input: {schema: SummarizeArticleInputSchema},
  output: {schema: SummarizeArticleOutputSchema},
  prompt: `Summarize the following article in a concise paragraph:

{{{articleText}}}`,
});

const summarizeArticleFlow = ai.defineFlow(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async articleText => {
    const {output} = await prompt(articleText);
    return {
      summary: output!.summary,
    };
  }
);
