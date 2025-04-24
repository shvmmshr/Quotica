'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/lib/checkoutDodo';
import { useUser } from '@clerk/nextjs';
import { productsMap } from '@/data/productInfo';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface MembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipDialog({ open, onOpenChange }: MembershipDialogProps) {
  const { user } = useUser();
  const userId = user?.id;
  const email = user?.primaryEmailAddress?.emailAddress;
  const fullName = user?.fullName || '';
  const { checkoutProduct } = useCheckout();
  const type = 'creditsRecharge';
  const { productId, productName } = productsMap[type];

  const [amount, setAmount] = useState(2);

  // Calculate credits with bonus
  const calculateCredits = (dollars: number) => {
    const baseCredits = dollars * 100;
    let bonusPercentage = 0;

    if (dollars >= 5 && dollars < 10) {
      bonusPercentage = 100;
    } else if (dollars >= 10 && dollars <= 20) {
      bonusPercentage = 150;
    } else if (dollars > 20 && dollars <= 50) {
      bonusPercentage = 200;
    }

    const bonusCredits = Math.round(baseCredits * (bonusPercentage / 100));
    return {
      baseCredits,
      bonusCredits,
      totalCredits: baseCredits + bonusCredits,
      bonusPercentage,
    };
  };

  const creditDetails = calculateCredits(amount);

  const handlePayment = async () => {
    try {
      const product = {
        product_id: productId,
        name: productName,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        userId: userId,
        email: email,
        fullName: fullName,
      };

      const credits = creditDetails.totalCredits;

      await checkoutProduct(product, true, amount * 100, credits); // Convert to cents
      onOpenChange(false); // Close dialog after checkout initiated
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            Add more credits to your account to continue creating beautiful images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="border border-green-500">
            <CardHeader>
              <CardTitle className="text-xl">Credit Recharge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Amount: ${amount}</span>
                  <span>{creditDetails.totalCredits} credits</span>
                </div>
                <Slider
                  value={[amount]}
                  min={2}
                  max={50}
                  step={1}
                  onValueChange={(value) => setAmount(value[0])}
                  className="py-4"
                />
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>$2</span>
                  <span>$50</span>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p>
                  <strong>Base Credits:</strong> {creditDetails.baseCredits}
                </p>
                {creditDetails.bonusCredits > 0 && (
                  <p>
                    <strong>Bonus Credits ({creditDetails.bonusPercentage}%):</strong>{' '}
                    {creditDetails.bonusCredits}
                  </p>
                )}
                <p className="font-bold mt-1">Total: {creditDetails.totalCredits} credits</p>
              </div>

              <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handlePayment}>
                Purchase ${amount} ({creditDetails.totalCredits} credits)
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
