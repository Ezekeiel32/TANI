"use client";
import { useEffect, useMemo, useState } from 'react';
import { formatISO, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ReCAPTCHA from 'react-google-recaptcha';
import { Calendar } from '@/components/ui/calendar';

type Service = { id: string; name: string; durationMinutes: number };

// All sessions take place in Arizona
const ARIZONA_TIMEZONE = 'America/Phoenix';

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [trainerId, setTrainerId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  let recaptchaRef: any;
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Simple bootstrapping: fetch services & default trainer
    fetch('/api/bootstrap').then((r) => r.json()).then((data) => {
      setServices(data.services);
      setTrainerId(data.trainerId);
    });
  }, []);

  const fromTo = useMemo(() => {
    const from = date ? new Date(date) : new Date();
    const to = addDays(from, 7);
    return { from: formatISO(from), to: formatISO(to) };
  }, [date]);

  useEffect(() => {
    (async () => {
      if (!trainerId || !serviceId || !fromTo.from || !fromTo.to) return;
      const q = new URLSearchParams({ trainerId, serviceId, from: fromTo.from, to: fromTo.to });
      const res = await fetch(`/api/availability?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots.map((s: any) => ({ start: s.start, end: s.end })));
      } else {
        setSlots([]);
      }
    })();
  }, [trainerId, serviceId, fromTo.from, fromTo.to]);

  const handleBook = async () => {
    if (!selectedSlot || !serviceId || !trainerId) return;
    const slot = JSON.parse(selectedSlot);
    if (!verified) {
      alert('Please verify your phone first.');
      return;
    }
    // get reCAPTCHA token if configured
    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && recaptchaRef?.executeAsync) {
      const token = await recaptchaRef.executeAsync();
      setRecaptchaToken(token);
    }
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-recaptcha-token': recaptchaToken || '' },
      body: JSON.stringify({ trainerId, serviceId, start: slot.start, end: slot.end, hold: true }),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = `/booking/complete?bookingId=${data.booking.id}`;
    } else {
      alert(data.error || 'Failed');
    }
  };

  const sendVerification = async () => {
    if (!guestPhone) return alert('Enter phone');
    const res = await fetch('/api/verify/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: guestPhone }) });
    if (res.ok) setVerificationSent(true); else alert('Failed to send code');
  };

  const checkVerification = async () => {
    const res = await fetch('/api/verify/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: guestPhone, code: verifyCode }) });
    const data = await res.json();
    if (data.ok) {
      setVerified(true);
      await fetch('/api/guest/upsert-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: guestEmail || `${guestPhone}@guest.local`, phone: guestPhone, timezone: ARIZONA_TIMEZONE }) });
      alert('Verified! You can now hold a slot.');
    } else {
      alert('Invalid code');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Book a Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block mb-2">Service</label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2">Pick a date</label>
              <Calendar selected={date} onSelect={setDate as any} mode="single" />
            </div>
            <div>
              <label className="block mb-2">Guest phone verification</label>
              <div className="space-y-2">
                <input className="border rounded p-2 w-full" placeholder="Phone e.g. +15551234567" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                <input className="border rounded p-2 w-full" placeholder="Email (optional)" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                {!verificationSent ? (
                  <Button variant="outline" onClick={sendVerification}>Send Code</Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input className="border rounded p-2" placeholder="Code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
                    <Button variant="outline" onClick={checkVerification}>Verify</Button>
                    {verified && <span className="text-green-600 text-sm">Verified</span>}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-2">Available Slots</label>
              <div className="flex flex-col gap-2 max-h-72 overflow-auto border rounded p-2">
                {slots.length === 0 && <div className="text-sm text-muted-foreground">No slots</div>}
                {slots.map((s) => (
                  <Button key={s.start} variant={selectedSlot === JSON.stringify(s) ? 'default' : 'secondary'} onClick={() => setSelectedSlot(JSON.stringify(s))}>
                    {new Date(s.start).toLocaleString()} - {new Date(s.end).toLocaleTimeString()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleBook} disabled={!selectedSlot || !serviceId}>Hold & Continue</Button>
          </div>
          {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
            <ReCAPTCHA
              ref={(r) => (recaptchaRef = r)}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
              size="invisible"
              onChange={(t) => setRecaptchaToken(t || '')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}



