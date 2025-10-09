'use client';

import { useEffect, useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Button } from './ui/button';

// Mock server action
async function subscribeAction(prevState: any, formData: FormData) {
  const email = formData.get('email');
  if (!email || !email.toString().includes('@')) {
    return { message: 'Please enter a valid email.', success: false };
  }
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: `Thank you for subscribing, ${email}!`, success: true };
}

const initialState = {
  message: '',
  success: false,
};

export default function ContactForm() {
  const [state, formAction] = useActionState(subscribeAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-2 max-w-md">
      <Input
        type="email"
        name="email"
        placeholder="Enter Your Email"
        required
        className="flex-grow"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Join
      </Button>
    </form>
  );
}
