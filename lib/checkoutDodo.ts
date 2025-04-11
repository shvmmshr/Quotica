'use client';

import { useRouter } from 'next/navigation';

type Product = {
  product_id: string;
  name: string;
  redirectUrl: string;
  userId?: string;
  email?: string;
  fullName?: string;
};

export const useCheckout = () => {
  const router = useRouter();

  const checkoutProduct = async (
    product: Product,
    useDynamicPaymentLinks: boolean,
    amount: number | 200,
    credits: number | 20
  ) => {
    if (useDynamicPaymentLinks) {
      const productType = 'onetime';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/dodo/checkout/${productType}?productId=${product.product_id}&redirect_url=${product.redirectUrl}&userId=${product.userId}&email=${product.email}&fullName=${product.fullName}&amount=${amount}&credits=${credits}`,
        {
          cache: 'no-store',
        }
      );
      const data = await response.json();

      if (data?.payment_link) {
        window.location.href = data.payment_link;
      } else {
        throw new Error('Checkout URL not received');
      }
    } else {
      const checkoutUrl = `https://test.checkout.dodopayments.com/buy/${product.product_id}?quantity=1&redirect_url=${product.redirectUrl}`;

      router.push(checkoutUrl);
    }
  };

  return { checkoutProduct };
};
