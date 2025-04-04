export const productsMap = {
  creditsRecharge: {
    productName: 'Credits Recharge',
    productId:
      process.env.NODE_ENV === 'production'
        ? 'pdt_ydqBMENmnxfPc1Jy6pisx'
        : 'pdt_g5avtCIbCS0ptsn0HMRUV',
    productType: 'onetime',
    redirectUrl: '/chat',
    minProductPrice: '2.00',
  },
};
