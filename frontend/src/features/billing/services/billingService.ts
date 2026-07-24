import { API_BASE } from "../../../config/api";

const API_BASE_V1 = `${API_BASE}/v1`;

const getAuthHeaders = (): Record<string, string> => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        return {
          Authorization: `Bearer ${user.token}`,
        };
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }
  return {};
};

// --- Interfaces ---

export interface PlanDto {
  id: number;
  name: string;
  description: string;
  amount: number;
  currency: string;
  billingInterval: string;
  razorpayPlanId: string;
}

export interface SubscriptionDto {
  id: number;
  razorpaySubscriptionId: string;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  shortUrl: string;
  createdAt: string;
}

export interface PaymentTransactionDto {
  id: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  errorCode: string | null;
  errorDescription: string | null;
  createdAt: string;
}

export interface CheckoutConfig {
  subscriptionId: string;
  razorpayKeyId: string;
  planName: string;
  amount: number;
  currency: string;
  userName: string;
  userEmail: string;
  userMobile: string;
}

// --- API Methods ---

export const getPlans = async (): Promise<PlanDto[]> => {
  const res = await fetch(`${API_BASE_V1}/billing/plans`);
  if (!res.ok) {
    throw new Error("Failed to fetch plans");
  }
  return res.json();
};

export const createSubscription = async (razorpayPlanId: string): Promise<CheckoutConfig> => {
  const res = await fetch(`${API_BASE_V1}/billing/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ razorpayPlanId, totalCount: 12 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create subscription");
  }
  return res.json();
};

export const verifySubscription = async (data: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_V1}/billing/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Payment verification failed");
  }
  return res.json();
};

export const getActiveSubscription = async (): Promise<SubscriptionDto | null> => {
  try {
    const res = await fetch(`${API_BASE_V1}/billing/subscription`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok || res.status === 204) {
      return null;
    }
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

export const cancelSubscription = async (): Promise<SubscriptionDto> => {
  const res = await fetch(`${API_BASE_V1}/billing/cancel`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to cancel subscription");
  }
  return res.json();
};

export const getTransactions = async (): Promise<PaymentTransactionDto[]> => {
  try {
    const res = await fetch(`${API_BASE_V1}/billing/transactions`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok || res.status === 204) {
      return [];
    }
    const text = await res.text();
    if (!text) return [];
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
};

export interface UpiSubmissionResponse {
  id: number;
  utrNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  isPremium: boolean;
}

export const submitUtrPayment = async (data: {
  utrNumber: string;
  amount?: number;
}): Promise<UpiSubmissionResponse> => {
  const res = await fetch(`${API_BASE_V1}/payments/submit-utr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit UTR for verification");
  }
  return res.json();
};

export const getMyUpiPaymentStatus = async (): Promise<{
  isPremium: boolean;
  role: string;
  latestTransaction: {
    id: number;
    utrNumber: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
}> => {
  const res = await fetch(`${API_BASE_V1}/payments/my-status`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch payment status");
  }
  return res.json();
};

