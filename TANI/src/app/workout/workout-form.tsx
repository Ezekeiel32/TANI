'use client';

import { useActionState } from 'react';
import { useState } from 'react';
import { Dumbbell, Clock, AlertCircle } from 'lucide-react';
import { generateWorkoutAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const initialState = {
  workoutRoutine: '',
  error: '',
};

export default function WorkoutForm() {
  const [state, formAction] = useActionState(generateWorkoutAction, initialState);
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
          <Dumbbell className="mr-2" />
          Your Fitness Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fitnessPreferences">Fitness Preferences</Label>
              <Input
                id="fitnessPreferences"
                name="fitnessPreferences"
                placeholder="e.g., strength training, cardio, yoga"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fitnessLevel">Fitness Level</Label>
              <Select name="fitnessLevel" defaultValue="beginner" required>
                <SelectTrigger id="fitnessLevel">
                  <SelectValue placeholder="Select your fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeConstraint">Time Constraint (minutes)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="timeConstraint"
                name="timeConstraint"
                type="number"
                placeholder="e.g., 30"
                required
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? 'Generating Workout...' : 'Generate Workout'}
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
        {state.workoutRoutine && (
          <div className="mt-8">
            <h3 className="text-2xl font-headline font-semibold mb-4">Your Personalized Workout</h3>
            <div className="p-6 bg-secondary rounded-lg prose prose-lg max-w-none whitespace-pre-wrap font-body">
              {state.workoutRoutine}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
