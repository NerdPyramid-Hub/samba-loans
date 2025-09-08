"use client";

import type React from "react";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Upload,
  ArrowLeft,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface LoanApplicationFormProps {
  user: { name: string; email: string };
  onSubmit: (formData: any) => Promise<void>;
  onBack: () => void;
}

export function LoanApplicationForm({
  user,
  onSubmit,
  onBack,
}: LoanApplicationFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [repaymentDestination, setRepaymentDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardVerified, setCardVerified] = useState(false);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 40);

  const repaymentAmount = loanAmount
    ? (Number.parseFloat(loanAmount) * 1.3).toFixed(2)
    : "0.00";

  // Dynamically load Paystack script
  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackReady(true);
      return;
    }

    if (typeof document !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        console.log("Paystack script loaded successfully");
        setPaystackReady(true);
        setScriptError(null);
      };
      script.onerror = () => {
        console.error("Failed to load Paystack script");
        setScriptError(
          "Failed to load payment system. Please refresh the page."
        );
        setPaystackReady(false);
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  // Handle card verification
  const handleCardVerification = () => {
    if (!paystackReady) {
      alert(
        "Payment system is still loading. Please wait a moment and try again."
      );
      return;
    }

    if (!window.PaystackPop) {
      alert("Payment system is not available. Please refresh the page.");
      return;
    }

    setVerifying(true);
    setScriptError(null);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: user.email,
      amount: 100, // R1.00 in cents
      currency: "ZAR",
      ref: "verif_" + Date.now(),
      onClose: () => {
        setVerifying(false);
        console.log("Payment popup closed by user");
      },
      callback: (response: any) => {
        (async () => {
          try {
            console.log("Sending reference to backend:", response.reference);
            const res = await fetch("/api/verify-card", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference }),
            });
            const data = await res.json();
            if (data.success) {
              setCardVerified(true);
              setAuthCode(data.authCode);
              alert("Card verified successfully!");
            } else {
              alert("Verification failed: " + data.error);
            }
          } catch (err: any) {
            console.error("Verification API error:", err);
            alert("Verification failed: " + err.message);
          } finally {
            setVerifying(false);
          }
        })();
      },
      "data-testing": false,
    });

    handler.openIframe();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      fullName: user.name,
      phoneNumber,
      email: user.email,
      loanAmount: Number.parseFloat(loanAmount),
      dueDate: dueDate?.toISOString(),
      document: uploadedDocument, // renamed from uploadedDocument
      repaymentDestination,
      repaymentAmount: Number.parseFloat(repaymentAmount),
      paystackAuthCode: authCode,
    };

    await onSubmit(formData);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (allowedTypes.includes(file.type)) {
        setUploadedDocument(file);
      } else {
        alert("Please upload a PDF, JPEG, or PNG file");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Loan Application
            </CardTitle>
            <CardDescription>
              Fill out the form below to apply for a loan. All fields are
              required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={user.name}
                      readOnly
                      className="bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user.email}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Loan Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount (ZAR)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="Enter loan amount"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Select due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) =>
                            date < new Date() || date > maxDate
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-slate-600">
                      Must be within 40 days from today
                    </p>
                  </div>
                </div>

                {/* Repayment Estimate */}
                {loanAmount && (
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Repayment Estimate:</strong> R{repaymentAmount}{" "}
                      (includes 30% interest)
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Documentation
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="document">Payslip or Bank Statement</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <input
                      id="document"
                      type="file"
                      accept=".pdf,.jpeg,.jpg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <Label htmlFor="document" className="cursor-pointer">
                      <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-slate-600"> or drag and drop</span>
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">
                      PDF, JPEG, PNG up to 10MB
                    </p>
                    {uploadedDocument && (
                      <p className="text-sm text-emerald-600 mt-2">
                        Selected: {uploadedDocument.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Repayment Destination */}
              <div className="space-y-2">
                <Label htmlFor="repaymentDestination">
                  Repayment Destination Details
                </Label>
                <Input
                  id="repaymentDestination"
                  placeholder="e.g., Capitec - 123456789 - John Smith"
                  value={repaymentDestination}
                  onChange={(e) => setRepaymentDestination(e.target.value)}
                  required
                />
                <p className="text-sm text-slate-600">
                  Where should we send your approved loan?
                </p>
              </div>

              {/* Card Verification */}
              <div className="space-y-2">
                <Label>Card Verification (Required)</Label>

                {!paystackReady && !scriptError && (
                  <p className="text-sm text-slate-600">
                    Loading payment system...
                  </p>
                )}
                {scriptError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{scriptError}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-2">
                  <Button
                    type="button"
                    className={
                      cardVerified
                        ? "bg-emerald-500 hover:bg-emerald-600 cursor-default"
                        : verifying
                        ? "bg-emerald-400 cursor-wait"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }
                    onClick={handleCardVerification}
                    disabled={!paystackReady || cardVerified || verifying}
                    style={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      borderRadius: "0.5rem",
                      transition: "background 0.2s",
                    }}
                  >
                    {cardVerified ? (
                      "✅ Card Verified"
                    ) : verifying ? (
                      "Verifying..."
                    ) : (
                      <span>
                        <span
                          style={{
                            background:
                              "linear-gradient(90deg,#10b981,#059669)",
                            color: "#fff",
                            padding: "0.25em 1em",
                            borderRadius: "0.375rem",
                            fontWeight: 600,
                            boxShadow: "0 1px 2px rgba(16,185,129,0.10)",
                          }}
                        >
                          Verify Card (R1.00)
                        </span>
                      </span>
                    )}
                  </Button>
                </div>
                {!cardVerified && (
                  <p className="text-sm text-slate-600">
                    You must verify your card before submitting your loan
                    application. A R1.00 test charge will be immediately
                    refunded.
                  </p>
                )}
                {cardVerified && (
                  <p className="text-sm text-emerald-600">
                    ✅ Card verified and saved for future repayment.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading || !cardVerified}
              >
                {loading
                  ? "Submitting Application..."
                  : "Submit Loan Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
