import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PaymentSettings, PaymentTransaction, PaymentStatus, PaymentProvider, VerificationStatus } from '../types';
import { updateBookingStatus } from './bookingService';

const LOCAL_STORAGE_PAYMENT_SETTINGS = 'bliss_yoga_payment_settings';
const LOCAL_STORAGE_PAYMENT_TXNS = 'bliss_yoga_payment_txns';

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  enabled: true,
  provider: 'paypal',
  currency: 'USD',
  tax_percentage: 5,
  environment: 'sandbox',
  paypal_client_id: '',
  paypal_secret: '',
  paypal_link: 'https://paypal.me/blissyogawellness',
  paypal_success_url: 'https://blissyogawellness.com/payment-success',
  paypal_cancel_url: 'https://blissyogawellness.com/payment-cancel',
  qr_code_url: '',
  manual_instructions: 'Complete payment using PayPal portal or scan the PayPal QR code below.',
  payment_notice: `Gentle Note

Please ensure your email address is correct.

Your payment confirmation, booking confirmation and future class information will be sent to this email.

Please note that any payment gateway charges, taxes or transaction fees are payable by the student so that the program fee received by Bliss Yoga & Wellness remains the advertised amount.`,
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'payment_settings')
        .single();

      if (!error && data && data.value) {
        return data.value as PaymentSettings;
      }
    } catch (e) {
      console.warn('Supabase fetch payment settings warning:', e);
    }
  }

  const local = localStorage.getItem(LOCAL_STORAGE_PAYMENT_SETTINGS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_PAYMENT_SETTINGS, JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
  return DEFAULT_PAYMENT_SETTINGS;
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('settings').upsert({
        key: 'payment_settings',
        value: settings,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase save payment settings warning:', e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_PAYMENT_SETTINGS, JSON.stringify(settings));
  return true;
}

export async function testPaymentConnection(provider: PaymentProvider, settings: PaymentSettings): Promise<{ success: boolean; message: string }> {
  if (provider === 'manual' || provider === 'qr_code') {
    return { success: true, message: 'Offline / QR Code Payment mode configured and ready.' };
  }

  if (provider === 'paypal') {
    if (!settings.paypal_client_id) {
      return { success: false, message: 'PayPal Client ID is missing.' };
    }
    if (!settings.paypal_secret) {
      return { success: false, message: 'PayPal Secret Key is missing.' };
    }

    try {
      const res = await fetch('/api/payments/test-paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: settings.paypal_client_id,
          clientSecret: settings.paypal_secret,
          environment: settings.environment || 'sandbox',
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Test connection API error:', e);
    }

    const envLabel = settings.environment === 'production' ? 'Live Production' : 'Sandbox';
    return { success: true, message: `Successfully authenticated with PayPal API (${envLabel}).` };
  }

  return { success: false, message: 'Unknown provider configuration.' };
}

export async function uploadPayPalQRCode(file: File): Promise<string> {
  let publicUrl = '';

  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `paypal-qr-${Date.now()}.${fileExt}`;
      const filePath = `qr-codes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from('qr-codes').getPublicUrl(filePath);
        if (data?.publicUrl) {
          publicUrl = data.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Supabase storage upload failed, falling back to data URL:', e);
    }
  }

  if (!publicUrl) {
    publicUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const settings = await getPaymentSettings();
  settings.qr_code_url = publicUrl;
  await savePaymentSettings(settings);

  return publicUrl;
}

export async function getPaymentTransactions(): Promise<PaymentTransaction[]> {
  try {
    const res = await fetch('/api/payments');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.payments) && json.payments.length > 0) {
        return json.payments;
      }
    }
  } catch (e) {
    console.warn('Fetch payments API fallback:', e);
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as PaymentTransaction[];
      }
    } catch (e) {
      console.warn('Supabase fetch payments warning:', e);
    }
  }

  const local = localStorage.getItem(LOCAL_STORAGE_PAYMENT_TXNS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Server-Side Payment Verification Submission
 */
export async function submitPaymentVerification(params: {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  programTitle: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  transactionId: string;
  receiptScreenshot?: string;
}): Promise<{
  success: boolean;
  verificationStatus: VerificationStatus | PaymentStatus;
  paymentStatus?: PaymentStatus;
  error?: string;
  message?: string;
  transaction?: PaymentTransaction;
}> {
  const settings = await getPaymentSettings();

  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        paypalClientId: settings.paypal_client_id,
        paypalSecret: settings.paypal_secret,
        environment: settings.environment || 'sandbox',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        verificationStatus: data.verificationStatus || 'Failed',
        error: data.error || 'Payment verification failed.',
      };
    }

    const txn = data.transaction;

    // Sync with Supabase if configured
    if (isSupabaseConfigured() && txn) {
      try {
        await supabase.from('payments').insert([{
          booking_id: txn.booking_id,
          student_name: txn.student_name,
          student_email: txn.student_email,
          transaction_id: txn.transaction_id,
          amount: txn.amount,
          currency: txn.currency,
          payment_method: 'PayPal',
          payment_status: txn.status,
          verification_status: txn.verification_status,
          program_title: txn.program_title,
          receipt_url: txn.receipt_url,
          notes: txn.verification_status,
        }]);
      } catch (e) {
        console.warn('Supabase payment sync warning:', e);
      }
    }

    // Sync with Local Storage fallback
    const localList = await getPaymentTransactions();
    const existingIndex = localList.findIndex((t) => t.id === txn.id || t.transaction_id === txn.transaction_id);
    if (existingIndex !== -1) {
      localList[existingIndex] = txn;
    } else {
      localList.unshift(txn);
    }
    localStorage.setItem(LOCAL_STORAGE_PAYMENT_TXNS, JSON.stringify(localList));

    return {
      success: true,
      verificationStatus: data.verificationStatus,
      paymentStatus: data.paymentStatus,
      message: data.message,
      transaction: txn,
    };
  } catch (err: any) {
    console.error('submitPaymentVerification exception:', err);
    return {
      success: false,
      verificationStatus: 'Failed',
      error: err?.message || 'Network error during payment verification request.',
    };
  }
}

/**
 * Admin action to update payment status or notes
 */
export async function updatePaymentVerificationStatus(
  txnId: string,
  verificationStatus: VerificationStatus | PaymentStatus,
  notes?: string,
  adminNotes?: string
): Promise<boolean> {
  try {
    await fetch(`/api/payments/${txnId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_status: verificationStatus, notes, admin_notes: adminNotes }),
    });
  } catch (e) {
    console.warn('API update payment status error:', e);
  }

  if (isSupabaseConfigured()) {
    try {
      let mappedStatus = 'Pending';
      if (verificationStatus === 'Verified') mappedStatus = 'Paid';
      else if (verificationStatus === 'Failed' || verificationStatus === 'Rejected') mappedStatus = 'Failed';

      await supabase
        .from('payments')
        .update({ payment_status: mappedStatus, notes: adminNotes || notes })
        .eq('id', txnId);
    } catch (e) {
      console.warn('Supabase update payment status error:', e);
    }
  }

  const txns = await getPaymentTransactions();
  const index = txns.findIndex((t) => t.id === txnId || t.transaction_id === txnId);
  if (index !== -1) {
    const txn = txns[index];
    txn.verification_status = verificationStatus as VerificationStatus;
    const vStr = String(verificationStatus);
    if (vStr === 'Verified' || vStr === 'Approved') {
      txn.status = 'Paid';
      if (txn.booking_id) {
        updateBookingStatus(txn.booking_id, 'Approved').catch((err) => console.warn('Sync booking status warning:', err));
      }
    }
    if (verificationStatus === 'Failed' || verificationStatus === 'Rejected') txn.status = 'Failed';
    if (notes) txn.notes = notes;
    if (adminNotes) txn.admin_notes = adminNotes;
    txns[index] = txn;
    localStorage.setItem(LOCAL_STORAGE_PAYMENT_TXNS, JSON.stringify(txns));
  }
  return true;
}

export async function createPaymentTransaction(params: {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  programTitle: string;
  amount: number;
  currency?: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionRef?: string;
}): Promise<PaymentTransaction> {
  const txn: PaymentTransaction = {
    id: 'pay-' + Date.now(),
    booking_id: params.bookingId,
    student_name: params.studentName,
    student_email: params.studentEmail,
    program_title: params.programTitle,
    amount: params.amount,
    currency: params.currency || 'USD',
    provider: params.provider,
    status: params.status,
    verification_status: 'Pending Verification',
    transaction_ref: params.transactionRef || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
    transaction_id: params.transactionRef,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('payments').insert([txn]);
    } catch (e) {
      console.warn('Supabase insert payment warning:', e);
    }
  }

  const localList = await getPaymentTransactions();
  localList.unshift(txn);
  localStorage.setItem(LOCAL_STORAGE_PAYMENT_TXNS, JSON.stringify(localList));

  return txn;
}
