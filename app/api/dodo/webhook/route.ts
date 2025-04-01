import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { dodopayments } from "@/lib/dodoPayment";

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);

export async function POST(request: Request) {
  const headersList = await headers();

  try {
    const rawBody = await request.text();
    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };
    await webhook.verify(rawBody, webhookHeaders);
    const payload = JSON.parse(rawBody);

    if (payload.data.payload_type === "Subscription") {
      switch (payload.type) {
        case "subscription.active":
          const subscription = await dodopayments.subscriptions.retrieve(
            payload.data.subscription_id
          );
          console.log("-------SUBSCRIPTION DATA START ---------");
          console.log(subscription);
          console.log("-------SUBSCRIPTION DATA END ---------");
          break;
        case "subscription.failed":
          break;
        case "subscription.cancelled":
          break;
        case "subscription.renewed":
          break;
        case "subscription.on_hold":
          break;
        default:
          break;
      }
    } else if (payload.data.payload_type === "Payment") {
      switch (payload.type) {
        case "payment.succeeded":
          const paymentDataResp = await dodopayments.payments.retrieve(
            payload.data.payment_id
          );
          console.log("-------PAYMENT DATA START ---------");
          console.log(paymentDataResp);
          console.log("-------PAYMENT DATA END ---------");
          const metadata = paymentDataResp.metadata;
          const userId = metadata.metadata_userId;
          const creds = metadata.metadata_creds;
          const transactionNumber = paymentDataResp.payment_id;
          const amount = metadata.metadata_amount;
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/credits/addCreds`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
                creds: creds,
              }),
            }
          );
          const data = await response.json();
          console.log("-------ADD CREDITS DATA START ---------");
          console.log(data);
          console.log("-------ADD CREDITS DATA END ---------");

          const transaction = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/transactions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
                type: "credit",
                amount: amount,
                creds: creds,
                transactionNumber: transactionNumber,
              }),
            }
          );
          const transactionData = await transaction.json();
          console.log("-------ADD TRANSACTION DATA START ---------");
          console.log(transactionData);
          console.log("-------ADD TRANSACTION DATA END ---------");

          break;
        default:
          break;
      }
    }
    return Response.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(" ----- webhoook verification failed -----");
    console.log(error);
    return Response.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  }
}
