declare module "razorpay" {
  interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: any;
  }

  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status: string;
  }

  class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(params: RazorpayOrderOptions): Promise<RazorpayOrder>;
    };
  }

  export = Razorpay;
}
