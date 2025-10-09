import WorkoutForm from './workout-form';

export default function WorkoutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">
          Personalized Workout Generator
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Tell us your preferences, and our AI will create a daily workout routine just for you.
        </p>
      </div>
      <WorkoutForm />
    </div>
  );
}
