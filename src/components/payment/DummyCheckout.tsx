import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDummyPayment, PaymentSession } from '@/hooks/useDummyPayment';
import { CreditCard, Lock, Check, X } from 'lucide-react';

const DummyCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { simulatePayment } = useDummyPayment();
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiryDate, setExpiryDate] = useState('12/25');
  const [cvv, setCvv] = useState('123');
  const [billingName, setBillingName] = useState('John Doe');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      const sessionData = localStorage.getItem(`payment_session_${sessionId}`);
      if (sessionData) {
        setSession(JSON.parse(sessionData));
      }
    }
  }, [searchParams]);

  const handlePayment = async (success: boolean) => {
    if (!session) return;

    setProcessing(true);
    try {
      await simulatePayment(session.id, success);
      
      // Redirect after payment
      setTimeout(() => {
        if (success) {
          navigate('/dashboard?payment=success');
        } else {
          navigate('/pricing?payment=failed');
        }
      }, 2000);
    } catch (error) {
      console.error('Payment simulation error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Invalid Session</h2>
              <p className="text-muted-foreground mb-4">
                The payment session could not be found or has expired.
              </p>
              <Button onClick={() => navigate('/pricing')} variant="outline">
                Back to Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan</span>
                <span>Professional Plan</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Billing Cycle</span>
                <Badge variant="outline">
                  {session.billing_cycle}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${session.amount}</span>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">What's included:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Custom integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Team collaboration
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Demo Payment Gateway</h4>
                <p className="text-sm text-blue-700">
                  This is a demonstration checkout. No real payment will be processed.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="billing-name">Cardholder Name</Label>
                  <Input
                    id="billing-name"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  onClick={() => handlePayment(true)}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? 'Processing...' : `Pay $${session.amount}`}
                </Button>

                <Button
                  onClick={() => handlePayment(false)}
                  disabled={processing}
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  Simulate Failed Payment
                </Button>

                <Button
                  onClick={() => navigate('/pricing')}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <Lock className="h-3 w-3 inline mr-1" />
                Your payment information is secure and encrypted
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DummyCheckout;