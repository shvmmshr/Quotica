"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCheckout } from "@/lib/checkoutDodo";
import { useUser } from "@clerk/nextjs";
import { use } from "react";
import { productsMap } from "@/data/productInfo";

type Product = {
  product_id: string;
  name: string;
  redirectUrl: string;
  userId?: string;
  email?: string;
  fullName?: string;
};
export default function SubscriptionPage() {
  const { user } = useUser();
  const userId = user?.id;
  const email = user?.primaryEmailAddress?.emailAddress;
  const fullName = user?.fullName || "";
  const { checkoutProduct } = useCheckout();
  const type = "creditsRecharge";
  const { productId, productName, productType } = productsMap[type];
  const product: Product = {
    product_id: productId,
    name: productName,
    redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    userId: userId,
    email: email,
    fullName: fullName,
  };

  const handlePayment = async () => {
    try {
      await checkoutProduct(product, true);
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Free Plan */}
        <Card className="border border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl">Free Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Basic AI-generated quotes</li>
              <li>Limited customization options</li>
              <li>Watermarked images</li>
            </ul>
            <Link href="/editor">
              <Button className="w-full mt-4" variant="outline" disabled>
                Current Plan
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Paid Plan */}
        <Card className="border border-green-500">
          <CardHeader>
            <CardTitle className="text-xl">Lifetime Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Unlimited AI-generated quotes</li>
              <li>Full customization options</li>
              <li>No watermark</li>
              <li>Lifetime access</li>
            </ul>

            <Button
              className="w-full mt-4 bg-green-500 hover:bg-green-600"
              onClick={() => {
                handlePayment();
              }}
            >
              Get Lifetime Access - $10
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
