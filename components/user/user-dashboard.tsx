"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, DollarSign, Clock, AlertTriangle } from "lucide-react";

interface Loan {
  id: string;
  applicantName: string;
  loanAmount: number;
  status: "Pending" | "Approved" | "Rejected";
  dueDate: string;
  repaymentDestination: string;
  documentUrl: string;
  rejectionReason?: string;
  repaymentStatus?: "Paid" | "Unpaid" | "Overdue";
  appliedDate: string;
}

interface UserDashboardProps {
  user: { name: string; email: string };
  loans: Loan[];
  currentLoan?: Loan | null;
  onApplyForLoan: () => void;
  onLogout: () => void;
}

export function UserDashboard({
  user,
  loans = [],
  currentLoan,
  onApplyForLoan,
  onLogout,
}: UserDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "unpaid":
        return "bg-orange-100 text-orange-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const calculateDaysRemaining = (dueDate: string) => {
    if (!dueDate) return 0;

    try {
      const due = new Date(dueDate);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return 0;
    }
  };

  const formatAmount = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "0";
    }
    return amount.toLocaleString();
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Normalize loan data to ensure consistent property access
  const normalizeLoan = (loan: Loan) => ({
    ...loan,
    amount: loan.loanAmount,
    approvedDate: loan.appliedDate, // Use appliedDate as fallback
    dueDate: loan.dueDate,
    repaymentStatus: loan.repaymentStatus || "Unpaid",
    rejectionReason: loan.rejectionReason,
  });

  const normalizedCurrentLoan = currentLoan ? normalizeLoan(currentLoan) : null;
  const normalizedLoans = loans.map(normalizeLoan);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Infinity Lenders
              </h1>
              <p className="text-slate-600">
                Welcome back, {user?.name || "User"}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Loan Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Current Loan Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {normalizedCurrentLoan ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You cannot apply for another loan until your current
                        loan is settled.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Amount Owed:</span>
                        <span className="font-semibold">
                          R{formatAmount(normalizedCurrentLoan.amount)}
                        </span>
                      </div>
                      {normalizedCurrentLoan.dueDate && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Days Remaining:
                            </span>
                            <span
                              className={`font-semibold ${
                                calculateDaysRemaining(
                                  normalizedCurrentLoan.dueDate
                                ) < 7
                                  ? "text-red-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {calculateDaysRemaining(
                                normalizedCurrentLoan.dueDate
                              )}{" "}
                              days
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Due Date:</span>
                            <span className="font-semibold">
                              {formatDate(normalizedCurrentLoan.dueDate)}
                            </span>
                          </div>
                          {normalizedCurrentLoan.repaymentStatus && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Payment Status:
                              </span>
                              <Badge
                                className={getStatusColor(
                                  normalizedCurrentLoan.repaymentStatus
                                )}
                              >
                                {normalizedCurrentLoan.repaymentStatus}
                              </Badge>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-slate-600">No active loans</p>
                    <Button
                      onClick={onApplyForLoan}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Apply for New Loan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Loan History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600" />
                  Loan History
                </CardTitle>
                <CardDescription>
                  Your past loan applications and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {normalizedLoans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No loan applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {normalizedLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              R{formatAmount(loan.amount)}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              Applied on {formatDate(loan.dueDate)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(loan.status)}>
                              {loan.status}
                            </Badge>
                            {loan.status === "Approved" &&
                              loan.repaymentStatus && (
                                <Badge
                                  className={getStatusColor(
                                    loan.repaymentStatus
                                  )}
                                >
                                  {loan.repaymentStatus}
                                </Badge>
                              )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {loan.approvedDate && (
                            <div>
                              <span className="text-slate-600">Approved:</span>
                              <span className="ml-2">
                                {formatDate(loan.approvedDate)}
                              </span>
                            </div>
                          )}
                          {loan.dueDate && (
                            <div>
                              <span className="text-slate-600">Due Date:</span>
                              <span className="ml-2">
                                {formatDate(loan.dueDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        {loan.rejectionReason && (
                          <Alert className="mt-3">
                            <AlertDescription>
                              <strong>Rejection Reason:</strong>{" "}
                              {loan.rejectionReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
