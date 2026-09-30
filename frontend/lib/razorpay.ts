export type RazorpayPaymentResult = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export type RazorpayOrder = {
  orderId: string
  amount: number
  currency: string
  keyId: string
  alreadyPaid?: boolean
  alreadyUnlocked?: boolean
}

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string
      order_id: string
      amount: number
      currency: string
      name: string
      description: string
      handler: (result: RazorpayPaymentResult) => void
      modal: { ondismiss: () => void }
    }) => { open: () => void }
  }
}

async function loadCheckout(): Promise<void> {
  if (window.Razorpay) return
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Unable to load the payment provider"))
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout(
  order: RazorpayOrder,
  description: string,
  onSuccess: (payment: RazorpayPaymentResult) => void,
  onDismiss: () => void,
): Promise<void> {
  await loadCheckout()
  if (!window.Razorpay) throw new Error("Payment checkout is unavailable")
  new window.Razorpay({
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: "FertileLandMakers",
    description,
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
  }).open()
}
