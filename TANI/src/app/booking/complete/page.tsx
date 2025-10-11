'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentStep({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setLoading(true);
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/booking/complete?bookingId=' + bookingId + '&step=waiver',
      },
      redirect: 'if_required',
    });
    
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Processing...' : 'Save Payment Method'}
      </Button>
    </form>
  );
}

function WaiverStep({ bookingId, userId, onSuccess }: { bookingId: string; userId: string; onSuccess: () => void }) {
  const sigPad = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert('Please sign the waiver');
      return;
    }
    
    setLoading(true);
    const signatureDataUrl = sigPad.current.toDataURL();
    
    const res = await fetch('/api/waiver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        userId,
        name: 'User',
        signatureDataUrl,
        ip: '',
        userAgent: navigator.userAgent,
      }),
    });
    
    if (res.ok) {
      onSuccess();
    } else {
      alert('Failed to save waiver');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Liability Waiver & Cancellation Policy</h3>
        <div className="text-sm space-y-2 p-4 border rounded bg-muted/50 max-h-64 overflow-y-auto">
          <p><strong>Liability Waiver:</strong></p>
          <p>I understand that participation in MMA training involves inherent risks including physical injury. I voluntarily assume all risks and release the trainer from any liability.</p>
          <p><strong>Cancellation Policy:</strong></p>
          <p>Cancellations must be made at least 24 hours before the scheduled session. Cancellations within 24 hours will be charged in full.</p>
          <p><strong>Payment:</strong></p>
          <p>Payment will be automatically charged after the session is completed using the saved payment method.</p>
        </div>
      </div>
      <div>
        <Label>Sign Below</Label>
        <div className="border rounded bg-white">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{ className: 'w-full h-48' }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => sigPad.current?.clear()}
        >
          Clear
        </Button>
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Sign & Confirm Booking'}
      </Button>
    </div>
  );
}

function CompleteBookingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bookingId = searchParams.get('bookingId');
  const [step, setStep] = useState<'payment' | 'waiver' | 'confirmed'>('payment');
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
    }
  }, [status, router]);

  useEffect(() => {
    if (!bookingId || !session?.user?.id) return;
    
    // Get SetupIntent client secret
    fetch('/api/stripe/setup-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, email: session.user.email }),
    })
      .then((r) => r.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [bookingId, session]);

  if (status === 'loading' || !bookingId) {
    return <div className="container mx-auto px-4 py-16" style={{ marginTop: '-80px', paddingTop: '96px' }}>Loading...</div>;
  }

  if (step === 'confirmed') {
    return (
      <div className="container mx-auto px-4 py-16 text-center" style={{ marginTop: '-80px', paddingTop: '96px' }}>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>✅ Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Your session has been confirmed. You'll receive a confirmation email shortly.</p>
            <Button onClick={() => router.push('/dashboard')}>View My Bookings</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={step} onValueChange={(v) => setStep(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="waiver" disabled={!clientSecret}>Waiver</TabsTrigger>
            </TabsList>
            <TabsContent value="payment">
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentStep bookingId={bookingId} onSuccess={() => setStep('waiver')} />
                </Elements>
              )}
            </TabsContent>
            <TabsContent value="waiver">
              <WaiverStep
                bookingId={bookingId}
                userId={session?.user?.id || ''}
                onSuccess={async () => {
                  // Confirm booking
                  await fetch(`/api/bookings/${bookingId}/confirm`, { method: 'POST' });
                  setStep('confirmed');
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompleteBookingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16" style={{ marginTop: '-80px', paddingTop: '96px' }}>Loading...</div>}>
      <CompleteBookingInner />
    </Suspense>
  );
}

