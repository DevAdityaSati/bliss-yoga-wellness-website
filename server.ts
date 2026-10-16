import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Local JSON fallback store for payment transactions if DB isn't available
const LOCAL_TXN_FILE = path.join(process.cwd(), ".payment_txns.json");

function loadLocalTxns(): any[] {
  try {
    if (fs.existsSync(LOCAL_TXN_FILE)) {
      const data = fs.readFileSync(LOCAL_TXN_FILE, "utf-8");
      return JSON.parse(data) || [];
    }
  } catch (e) {
    console.warn("Could not read local payment txns file:", e);
  }
  return [];
}

function saveLocalTxn(txn: any): void {
  try {
    const list = loadLocalTxns();
    // Replace if exists, else prepend
    const existingIndex = list.findIndex((t: any) => t.id === txn.id || (t.transaction_id && t.transaction_id === txn.transaction_id));
    if (existingIndex !== -1) {
      list[existingIndex] = { ...list[existingIndex], ...txn };
    } else {
      list.unshift(txn);
    }
    fs.writeFileSync(LOCAL_TXN_FILE, JSON.stringify(list, null, 2));
  } catch (e) {
    console.warn("Could not save local payment txn:", e);
  }
}

// Global memory cache of transactions for instant lookup
let memoryTxns: any[] = loadLocalTxns();

/**
 * Sanitize strings to protect against XSS and injection
 */
function sanitizeInput(str: any): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>?/gm, "") // strip HTML tags
    .replace(/['"`;]/g, "") // remove quotes/semicolons
    .trim();
}

/**
 * Validate PayPal Transaction ID pattern:
 * PayPal Transaction IDs, Capture IDs, or Order IDs are 12 to 20 uppercase alphanumeric characters
 * Example: 1AA23456BC789012D, 9A1234567890B, 4AB12345CD678901E
 */
function isValidPayPalTxnFormat(id: string): boolean {
  if (!id) return false;
  const paypalRegex = /^[A-Z0-9]{12,20}$/i;
  return paypalRegex.test(id);
}

/**
 * Attempt PayPal REST API verification if Client ID & Secret are configured
 */
async function verifyWithPayPalApi(
  txnId: string,
  expectedAmount: number,
  expectedCurrency: string,
  clientId?: string,
  clientSecret?: string,
  env: "sandbox" | "production" = "sandbox"
): Promise<{ verified: boolean; message: string; details?: any }> {
  const pClientId = clientId || process.env.PAYPAL_CLIENT_ID;
  const pSecret = clientSecret || process.env.PAYPAL_CLIENT_SECRET;

  if (!pClientId || !pSecret) {
    return {
      verified: false,
      message: "PayPal API credentials not configured. Payment marked for manual verification.",
    };
  }

  try {
    const baseUrl =
      env === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // 1. Get OAuth Access Token
    const authHeader = Buffer.from(`${pClientId}:${pSecret}`).toString("base64");
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.warn("PayPal OAuth error:", errText);
      return {
        verified: false,
        message: "Failed to authenticate with PayPal API.",
      };
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch Payment/Capture Details
    let detailsRes = await fetch(`${baseUrl}/v2/checkout/orders/${txnId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!detailsRes.ok) {
      // Try capture endpoint
      detailsRes = await fetch(`${baseUrl}/v1/payments/capture/${txnId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    if (!detailsRes.ok) {
      return {
        verified: false,
        message: `Transaction ID ${txnId} was not found on PayPal (${env}).`,
      };
    }

    const txnDetails = await detailsRes.json();
    const status = txnDetails.status || txnDetails.state;

    if (status !== "COMPLETED" && status !== "APPROVED" && status !== "approved") {
      return {
        verified: false,
        message: `PayPal transaction status is '${status}', not completed.`,
        details: txnDetails,
      };
    }

    // Verify Amount & Currency if present
    const amountVal =
      txnDetails.purchase_units?.[0]?.amount?.value ||
      txnDetails.amount?.total;
    const currencyVal =
      txnDetails.purchase_units?.[0]?.amount?.currency_code ||
      txnDetails.amount?.currency;

    if (amountVal && Math.abs(parseFloat(amountVal) - expectedAmount) > 0.5) {
      return {
        verified: false,
        message: `Payment amount ($${amountVal}) does not match required booking amount ($${expectedAmount}).`,
        details: txnDetails,
      };
    }

    if (currencyVal && currencyVal.toUpperCase() !== expectedCurrency.toUpperCase()) {
      return {
        verified: false,
        message: `Payment currency (${currencyVal}) does not match required currency (${expectedCurrency}).`,
        details: txnDetails,
      };
    }

    return {
      verified: true,
      message: "Transaction successfully verified via PayPal API.",
      details: txnDetails,
    };
  } catch (err: any) {
    console.error("PayPal API verification exception:", err);
    return {
      verified: false,
      message: `PayPal API check error: ${err?.message || "Connection failed"}`,
    };
  }
}

// API ROUTE: Verify and store student payment confirmation
app.post("/api/payments/verify", async (req, res) => {
  try {
    const {
      bookingId,
      studentName,
      studentEmail,
      programTitle,
      amount,
      currency = "USD",
      paymentDate,
      transactionId,
      receiptScreenshot,
      paypalClientId,
      paypalSecret,
      environment = "sandbox",
    } = req.body;

    // 1. Sanitize Inputs
    const cleanName = sanitizeInput(studentName);
    const cleanEmail = sanitizeInput(studentEmail).toLowerCase();
    const cleanProgram = sanitizeInput(programTitle);
    const cleanDate = sanitizeInput(paymentDate) || new Date().toISOString().split("T")[0];
    const rawTxnId = String(transactionId || "").trim();
    const cleanTxnId = rawTxnId.toUpperCase() || ("PAY-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase());
    const numAmount = parseFloat(amount) || 0;

    // 2. Reject Empty Required Fields
    if (!cleanName || !cleanEmail || !cleanProgram || !numAmount) {
      return res.status(400).json({
        success: false,
        verificationStatus: "Invalid Request",
        error: "Missing required fields. Full Name, Email, Program, and Amount are required.",
      });
    }

    // 3. Format & Length Validation for Transaction ID (if explicitly provided)
    if (rawTxnId && (paypalClientId || process.env.PAYPAL_CLIENT_ID) && !isValidPayPalTxnFormat(cleanTxnId)) {
      return res.status(400).json({
        success: false,
        verificationStatus: "Invalid Transaction ID",
        error: "Invalid PayPal Transaction ID format. PayPal Transaction IDs must contain 12 to 20 uppercase alphanumeric characters.",
      });
    }

    // 4. Duplicate Transaction ID Check
    memoryTxns = loadLocalTxns();
    const isDuplicate = memoryTxns.some(
      (t) =>
        (t.transaction_id && t.transaction_id.toUpperCase() === cleanTxnId) ||
        (t.transaction_ref && t.transaction_ref.toUpperCase() === cleanTxnId)
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        verificationStatus: "Duplicate Transaction ID",
        error: `Duplicate Transaction ID: The Transaction ID '${cleanTxnId}' has already been submitted and recorded in our system.`,
      });
    }

    // 5. PayPal API Automated Verification (if credentials provided or in env)
    const paypalCheck = await verifyWithPayPalApi(
      cleanTxnId,
      numAmount,
      currency,
      paypalClientId,
      paypalSecret,
      environment
    );

    let verificationStatus: string = "Pending Verification";
    let paymentStatus: string = "Payment Pending Verification";

    if (paypalCheck.verified) {
      verificationStatus = "Verified";
      paymentStatus = "Paid";
    } else if (paypalCheck.message.includes("does not match") || paypalCheck.message.includes("was not found")) {
      // If credentials were provided and PayPal explicitly rejected it
      if (paypalClientId && paypalSecret) {
        return res.status(400).json({
          success: false,
          verificationStatus: "Failed",
          error: `PayPal Verification Failed: ${paypalCheck.message}`,
        });
      }
    }

    // 6. Record Verified/Pending Payment Transaction
    const newTransaction = {
      id: "pay-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      booking_id: bookingId || "bk-" + Date.now(),
      student_name: cleanName,
      student_email: cleanEmail,
      program_title: cleanProgram,
      amount: numAmount,
      currency: currency || "USD",
      provider: "paypal",
      status: paymentStatus,
      verification_status: verificationStatus,
      transaction_id: cleanTxnId,
      transaction_ref: cleanTxnId,
      payment_date: cleanDate,
      receipt_url: receiptScreenshot || "",
      created_at: new Date().toISOString(),
    };

    saveLocalTxn(newTransaction);
    memoryTxns = loadLocalTxns();

    return res.json({
      success: true,
      verificationStatus,
      paymentStatus,
      transaction: newTransaction,
      message: paypalCheck.verified
        ? "Payment verified instantly via PayPal API."
        : "Payment confirmation submitted successfully. Status: Pending Manual Verification.",
    });
  } catch (error: any) {
    console.error("Error in /api/payments/verify:", error);
    return res.status(500).json({
      success: false,
      verificationStatus: "Failed",
      error: error?.message || "Internal server error during payment verification.",
    });
  }
});

// API ROUTE: Check Student Eligibility for 12-Day / 15-Day Program Login
app.post("/api/auth/verify-eligibility", (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ isEligible: false, reason: "Email address required." });
    }

    const txns = loadLocalTxns();
    const is12or15Day = (str?: string) => {
      if (!str) return false;
      const lower = str.toLowerCase();
      return lower.includes("12-day") || lower.includes("15-day") || lower.includes("12 day") || lower.includes("15 day");
    };

    const userTxns = txns.filter(
      (t) => t.student_email && t.student_email.trim().toLowerCase() === cleanEmail && is12or15Day(t.program_title)
    );

    if (userTxns.length === 0) {
      return res.json({
        isEligible: false,
        reason: "Access Restricted: Only students enrolled in the 12-Day or 15-Day Program with approved payment can log into the Student Portal.",
      });
    }

    const hasApproved = userTxns.some(
      (t) => t.status === "Paid" || t.verification_status === "Verified" || t.verification_status === "Approved"
    );

    if (hasApproved) {
      return res.json({ isEligible: true });
    } else {
      return res.json({
        isEligible: false,
        reason: "Access Pending Admin Approval: Your 12-Day / 15-Day Program payment is pending Admin Verification.",
      });
    }
  } catch (e: any) {
    return res.status(500).json({ isEligible: false, reason: e?.message || "Server error" });
  }
});

// API ROUTE: Fetch all transactions for Admin Dashboard
app.get("/api/payments", (req, res) => {
  try {
    const list = loadLocalTxns();
    return res.json({ success: true, payments: list });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message });
  }
});

// API ROUTE: Update Payment Verification Status (Admin Action)
app.patch("/api/payments/:id/verify", (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status, notes, admin_notes } = req.body;

    const list = loadLocalTxns();
    const txnIndex = list.findIndex((t) => t.id === id || t.transaction_id === id);

    if (txnIndex === -1) {
      return res.status(404).json({ success: false, error: "Payment transaction not found." });
    }

    const current = list[txnIndex];
    let newPaymentStatus = current.status;

    if (verification_status === "Verified") {
      newPaymentStatus = "Paid";
    } else if (verification_status === "Failed" || verification_status === "Rejected") {
      newPaymentStatus = "Failed";
    } else if (verification_status === "Duplicate Transaction ID" || verification_status === "Invalid Transaction ID") {
      newPaymentStatus = "Failed";
    }

    const updated = {
      ...current,
      verification_status: verification_status || current.verification_status,
      status: newPaymentStatus,
      notes: notes || current.notes,
      admin_notes: admin_notes || current.admin_notes,
      updated_at: new Date().toISOString(),
    };

    saveLocalTxn(updated);
    return res.json({ success: true, payment: updated });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message });
  }
});

// API ROUTE: Test PayPal API Connection
app.post("/api/payments/test-paypal", async (req, res) => {
  const { clientId, clientSecret, environment = "sandbox" } = req.body;

  if (!clientId || !clientSecret) {
    return res.json({ success: false, message: "Client ID and Secret Key are required." });
  }

  try {
    const baseUrl =
      environment === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const authHeader = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString("base64");
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (tokenRes.ok) {
      return res.json({
        success: true,
        message: `Successfully authenticated with PayPal REST API (${environment === "production" ? "Live" : "Sandbox"}).`,
      });
    } else {
      const errBody = await tokenRes.json();
      return res.json({
        success: false,
        message: `PayPal Authentication Failed: ${errBody.error_description || "Invalid Client ID or Secret Key."}`,
      });
    }
  } catch (err: any) {
    return res.json({
      success: false,
      message: `Connection Error: ${err?.message || "Could not reach PayPal API."}`,
    });
  }
});

async function startServer() {
  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
