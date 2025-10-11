'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

type Payment = {
  id: string;
  booking: {
    id: string;
    service: { name: string };
    user: { name?: string; email: string };
    start: string;
  };
  amountCents: number;
  currency: string;
  status: string;
  stripePaymentIntentId?: string;
  failureReason?: string;
  createdAt: string;
};

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const res = await fetch('/api/dashboard/payments');
    const data = await res.json();
    setPayments(data.payments);
    setLoading(false);
  };

  const handleRetryCharge = async (bookingId: string) => {
    if (!confirm('Retry charging this booking?')) return;
    
    const res = await fetch(`/api/bookings/${bookingId}/complete`, {
      method: 'POST',
    });
    
    if (res.ok) {
      alert('Charge initiated');
      fetchPayments();
    } else {
      alert('Failed to retry charge');
    }
  };

  const handleRefund = async (paymentId: string, stripePaymentIntentId: string) => {
    if (!confirm('Refund this payment?')) return;
    
    const res = await fetch('/api/dashboard/payments/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, stripePaymentIntentId }),
    });
    
    if (res.ok) {
      alert('Refund initiated');
      fetchPayments();
    } else {
      alert('Failed to refund');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: 'secondary',
      SUCCEEDED: 'default',
      FAILED: 'destructive',
      REFUNDED: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Session Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.createdAt), 'MMM d')}</TableCell>
                  <TableCell>
                    <div>
                      <div>{payment.booking.user.name || payment.booking.user.email}</div>
                      <div className="text-sm text-muted-foreground">{payment.booking.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{payment.booking.service.name}</TableCell>
                  <TableCell>{format(new Date(payment.booking.start), 'MMM d h:mm a')}</TableCell>
                  <TableCell>
                    {payment.currency} {(payment.amountCents / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                    {payment.failureReason && (
                      <div className="text-xs text-destructive mt-1">{payment.failureReason}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.status === 'FAILED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetryCharge(payment.booking.id)}
                      >
                        Retry
                      </Button>
                    )}
                    {payment.status === 'SUCCEEDED' && payment.stripePaymentIntentId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRefund(payment.id, payment.stripePaymentIntentId!)}
                      >
                        Refund
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
