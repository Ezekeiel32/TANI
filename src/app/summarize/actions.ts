'use server';
import { summarizeArticle } from '@/ai/flows/article-summarization-flow';

export async function summarizeArticleAction(
  prevState: { summary: string; error: string },
  formData: FormData
) {
  const articleText = formData.get('articleText') as string;

  if (!articleText || articleText.trim().length < 100) {
    return {
      summary: '',
      error: 'Article text is too short. Please provide a longer article.',
    };
  }

  try {
    const result = await summarizeArticle(articleText);
    return {
      summary: result.summary,
      error: '',
    };
  } catch (error) {
    console.error('Error summarizing article:', error);
    return {
      summary: '',
      error:
        'An unexpected error occurred while generating the summary. Please try again later.',
    };
  }
}
