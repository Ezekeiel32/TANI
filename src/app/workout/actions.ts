'use server';
import { generateWorkout } from '@/ai/flows/personalized-workout-generator';
import { z } from 'zod';

const WorkoutSchema = z.object({
  fitnessPreferences: z.string().min(1, 'Fitness preferences are required.'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  timeConstraint: z.coerce
    .number()
    .min(5, 'Time constraint must be at least 5 minutes.')
    .max(180, 'Time constraint must be 3 hours or less.'),
});

export async function generateWorkoutAction(
  prevState: { workoutRoutine: string; error: string },
  formData: FormData
) {
  const validatedFields = WorkoutSchema.safeParse({
    fitnessPreferences: formData.get('fitnessPreferences'),
    fitnessLevel: formData.get('fitnessLevel'),
    timeConstraint: formData.get('timeConstraint'),
  });

  if (!validatedFields.success) {
    return {
      workoutRoutine: '',
      error: validatedFields.error.flatten().fieldErrors[
        Object.keys(validatedFields.error.flatten().fieldErrors)[0]
      ]?.[0] || 'Invalid input.',
    };
  }

  try {
    const result = await generateWorkout(validatedFields.data);
    return {
      workoutRoutine: result.workoutRoutine,
      error: '',
    };
  } catch (error) {
    console.error('Error generating workout:', error);
    return {
      workoutRoutine: '',
      error: 'An unexpected error occurred while generating the workout. Please try again later.',
    };
  }
}
