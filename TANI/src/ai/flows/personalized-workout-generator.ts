'use server';

/**
 * @fileOverview Personalized workout generator.
 *
 * This flow generates a personalized daily workout routine based on user
 * preferences.
 *
 * - `generateWorkout`: Generates a workout routine.
 * - `PersonalizedWorkoutInput`: Input type for the flow.
 * - `PersonalizedWorkoutOutput`: Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PersonalizedWorkoutInputSchema = z.object({
  fitnessPreferences: z
    .string()
    .describe('The users fitness preferences (e.g., strength training, cardio, yoga).'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('The users current fitness level.'),
  timeConstraint: z
    .number()
    .describe('The amount of time the user has to workout in minutes.'),
});

export type PersonalizedWorkoutInput = z.infer<typeof PersonalizedWorkoutInputSchema>;

const PersonalizedWorkoutOutputSchema = z.object({
  workoutRoutine: z.string().describe('The generated workout routine.'),
});

export type PersonalizedWorkoutOutput = z.infer<typeof PersonalizedWorkoutOutputSchema>;

export async function generateWorkout(input: PersonalizedWorkoutInput): Promise<PersonalizedWorkoutOutput> {
  return personalizedWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWorkoutPrompt',
  input: {schema: PersonalizedWorkoutInputSchema},
  output: {schema: PersonalizedWorkoutOutputSchema},
  prompt: `Generate a personalized daily workout routine for a user with the following preferences:

Fitness Preferences: {{{fitnessPreferences}}}
Fitness Level: {{{fitnessLevel}}}
Time Constraint: {{{timeConstraint}}} minutes

Ensure the workout is safe and effective for the user's fitness level.`,
});

const personalizedWorkoutFlow = ai.defineFlow(
  {
    name: 'personalizedWorkoutFlow',
    inputSchema: PersonalizedWorkoutInputSchema,
    outputSchema: PersonalizedWorkoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
