"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Check,
  X,
  FileText,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoanApplication {
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

interface AdminDashboardProps {
  applications: LoanApplication[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onUpdateRepaymentStatus: (
    id: string,
    status: "Paid" | "Unpaid" | "Overdue"
  ) => void;
  onLogout: () => void;
}

export function AdminDashboard({
  applications,
  onApprove,
  onReject,
  onUpdateRepaymentStatus,
  onLogout,
}: AdminDashboardProps) {
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [chargingId, setChargingId] = useState<string | null>(null);
  const [viewingDocumentUrl, setViewingDocumentUrl] = useState<string | null>(
    null
  );
  const [viewingDocumentType, setViewingDocumentType] = useState<string | null>(
    null
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Paid":
        return "bg-emerald-100 text-emerald-800";
      case "Unpaid":
        return "bg-orange-100 text-orange-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Memoized calculations for performance
  const statistics = useMemo(() => {
    const approvedLoans = applications.filter(
      (app) => app.status === "Approved"
    );
    const pendingLoans = applications.filter((app) => app.status === "Pending");
    const rejectedLoans = applications.filter(
      (app) => app.status === "Rejected"
    );

    const paidLoans = approvedLoans.filter(
      (app) => app.repaymentStatus === "Paid"
    );
    const unpaidLoans = approvedLoans.filter(
      (app) => app.repaymentStatus !== "Paid"
    );
    const overdueLoans = approvedLoans.filter(
      (app) => app.repaymentStatus === "Overdue"
    );

    const totalProfitRealized = paidLoans.reduce(
      (sum, app) => sum + app.loanAmount * 0.3,
      0
    );
    const potentialProfit = unpaidLoans.reduce(
      (sum, app) => sum + app.loanAmount * 0.3,
      0
    );

    return {
      totalLoansIssued: approvedLoans.length,
      totalProfitRealized,
      potentialProfit,
      pendingLoansCount: pendingLoans.length,
      overdueLoansCount: overdueLoans.length,
      // Pre-filtered arrays for render optimization
      approvedLoans,
      pendingLoans,
      rejectedLoans,
    };
  }, [applications]);

  const handleReject = useCallback(() => {
    if (selectedApp && rejectionReason.trim()) {
      onReject(selectedApp.id, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedApp(null);
    }
  }, [selectedApp, rejectionReason, onReject]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Total Loans Issued
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statistics.totalLoansIssued}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Profit Realized
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    R{statistics.totalProfitRealized.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Pending Loans
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statistics.pendingLoansCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Potential Profit
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    R{statistics.potentialProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">From unpaid loans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Overdue Loans
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statistics.overdueLoansCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
            <CardDescription>
              Manage and review loan applications by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Pending ({statistics.pendingLoansCount})
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Approved ({statistics.totalLoansIssued})
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Rejected ({statistics.rejectedLoans.length})
                </TabsTrigger>
              </TabsList>

              {/* Pending Applications */}
              <TabsContent value="pending" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-yellow-50">
                        <TableHead>Applicant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Days Remaining</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.pendingLoans.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-slate-500"
                          >
                            No pending applications
                          </TableCell>
                        </TableRow>
                      ) : (
                        statistics.pendingLoans.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">
                              {app.applicantName}
                            </TableCell>
                            <TableCell>
                              R{app.loanAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(app.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  calculateDaysRemaining(app.dueDate) < 7
                                    ? "text-red-600 font-semibold"
                                    : ""
                                }
                              >
                                {calculateDaysRemaining(app.dueDate)} days
                              </span>
                            </TableCell>
                            <TableCell className="max-w-32 truncate">
                              {app.repaymentDestination}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewingDocumentUrl(app.documentUrl);
                                  setViewingDocumentType(
                                    app.documentUrl
                                      .split(".")
                                      .pop()
                                      ?.toLowerCase() || null
                                  );
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => onApprove(app.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Approved Applications */}
              <TabsContent value="approved" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead>Applicant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Approved Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Days Remaining</TableHead>
                        <TableHead>Repayment Status</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.approvedLoans.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-8 text-slate-500"
                          >
                            No approved applications
                          </TableCell>
                        </TableRow>
                      ) : (
                        statistics.approvedLoans.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">
                              {app.applicantName}
                            </TableCell>
                            <TableCell>
                              R{app.loanAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(app.appliedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(app.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  calculateDaysRemaining(app.dueDate) < 7
                                    ? "text-red-600 font-semibold"
                                    : ""
                                }
                              >
                                {calculateDaysRemaining(app.dueDate)} days
                              </span>
                            </TableCell>
                            <TableCell>
                              {app.repaymentStatus && (
                                <Badge
                                  className={getStatusColor(
                                    app.repaymentStatus
                                  )}
                                >
                                  {app.repaymentStatus}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-32 truncate">
                              {app.repaymentDestination}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewingDocumentUrl(app.documentUrl);
                                  setViewingDocumentType(
                                    app.documentUrl
                                      .split(".")
                                      .pop()
                                      ?.toLowerCase() || null
                                  );
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {app.repaymentStatus !== "Paid" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                                    onClick={() =>
                                      onUpdateRepaymentStatus(app.id, "Paid")
                                    }
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                                {app.repaymentStatus !== "Unpaid" &&
                                  app.repaymentStatus !== "Paid" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                      onClick={() =>
                                        onUpdateRepaymentStatus(
                                          app.id,
                                          "Unpaid"
                                        )
                                      }
                                    >
                                      Mark Unpaid
                                    </Button>
                                  )}
                                {app.repaymentStatus !== "Overdue" &&
                                  app.repaymentStatus !== "Paid" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        onUpdateRepaymentStatus(
                                          app.id,
                                          "Overdue"
                                        )
                                      }
                                    >
                                      Mark Overdue
                                    </Button>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Rejected Applications */}
              <TabsContent value="rejected" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50">
                        <TableHead>Applicant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Document</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.rejectedLoans.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-slate-500"
                          >
                            No rejected applications
                          </TableCell>
                        </TableRow>
                      ) : (
                        statistics.rejectedLoans.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">
                              {app.applicantName}
                            </TableCell>
                            <TableCell>
                              R{app.loanAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(app.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-48">
                                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                  {app.rejectionReason || "No reason provided"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-32 truncate">
                              {app.repaymentDestination}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewingDocumentUrl(app.documentUrl);
                                  setViewingDocumentType(
                                    app.documentUrl
                                      .split(".")
                                      .pop()
                                      ?.toLowerCase() || null
                                  );
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this loan application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog
        open={!!viewingDocumentUrl}
        onOpenChange={() => setViewingDocumentUrl(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Uploaded Document</DialogTitle>
          </DialogHeader>
          {viewingDocumentUrl ? (
            viewingDocumentType === "pdf" ? (
              <iframe
                src={viewingDocumentUrl}
                title="Document Preview"
                width="100%"
                height="500px"
                style={{ border: "none" }}
              />
            ) : viewingDocumentType === "jpg" ||
              viewingDocumentType === "jpeg" ||
              viewingDocumentType === "png" ? (
              <img
                src={viewingDocumentUrl}
                alt="Document Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  margin: "0 auto",
                }}
              />
            ) : (
              <p>Cannot preview this file type.</p>
            )
          ) : (
            <p>No document available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
