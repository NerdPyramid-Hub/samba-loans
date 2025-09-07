"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { LandingPage } from "./components/landing/landing-page";
import { LoginForm } from "./components/auth/login-form";
import { SignupForm } from "./components/auth/signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { authService, type UserProfile } from "./lib/auth";
import {
  loanService,
  type LoanApplication,
  type DashboardApplication,
  type LoanApplicationInput,
} from "./lib/loans";
import {
  showSuccess,
  showError,
  showConfirmation,
  showLoading,
  hideLoading,
} from "./lib/sweetalert";
import type { User } from "@supabase/supabase-js";

// Lazy load heavy components for better performance
const AdminDashboard = lazy(() =>
  import("./components/admin/admin-dashboard").then((module) => ({
    default: module.AdminDashboard,
  }))
);
const AdminAnalytics = lazy(() =>
  import("./components/admin/admin-analytics").then((module) => ({
    default: module.AdminAnalytics,
  }))
);
const UserDashboard = lazy(() =>
  import("./components/user/user-dashboard").then((module) => ({
    default: module.UserDashboard,
  }))
);
const LoanApplicationForm = lazy(() =>
  import("./components/user/loan-application-form").then((module) => ({
    default: module.LoanApplicationForm,
  }))
);

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

type View =
  | "landing"
  | "login"
  | "signup"
  | "user-dashboard"
  | "admin-dashboard"
  | "loan-form";

export default function LoanApplicationSystem() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState<DashboardApplication[]>([]);
  const [allApplications, setAllApplications] = useState<
    DashboardApplication[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState("dashboard");

  // Demo mode detection
  const isDemoMode = process.env.NODE_ENV === "production";

  // Demo mode indicator component
  const DemoModeIndicator = () => {
    if (!isDemoMode) return null;

    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <strong>Demo Mode:</strong> This application is running in demo
              mode. All data and transactions are simulated.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const checkAuthState = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);

        // Fetch user profile
        const profile = await authService.getUserProfile(currentUser.id);
        setUserProfile(profile);

        // Check if user is admin and set appropriate view
        if (profile?.role === "admin") {
          setCurrentView("admin-dashboard");
        } else {
          setCurrentView("user-dashboard");
        }
      } else {
        setCurrentView("landing");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setCurrentView("landing");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (user: User | null) => {
      if (user) {
        hideLoading(); // Close any loading modal
        setUser(user);
        setIsLoggedIn(true);

        const profile = await authService.getUserProfile(user.id);
        setUserProfile(profile);

        if (profile?.role === "admin") {
          setCurrentView("admin-dashboard");
        } else {
          setCurrentView("user-dashboard");
        }
      } else {
        hideLoading(); // Close any loading modal
        setUser(null);
        setUserProfile(null);
        setIsLoggedIn(false);
        setCurrentView("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserLoans = async () => {
    if (!user) return;

    try {
      const data = await loanService.getUserApplications(user.id);
      const normalizedLoans = data.map(
        (loan): DashboardApplication => ({
          id: loan.id,
          applicantName: loan.full_name,
          loanAmount: loan.loan_amount,
          status:
            loan.status === "pending"
              ? "Pending"
              : loan.status === "approved"
              ? "Approved"
              : "Rejected",
          dueDate: loan.due_date,
          repaymentDestination: loan.repayment_destination,
          documentUrl: loan.document_url || "",
          rejectionReason: loan.rejection_reason,
          repaymentStatus:
            loan.repayment_status === "paid"
              ? "Paid"
              : loan.repayment_status === "unpaid"
              ? "Unpaid"
              : "Overdue",
          appliedDate: loan.created_at,
        })
      );
      setLoans(normalizedLoans);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      showError("Failed to load your loan applications");
    }
  };

  const fetchAllApplications = async () => {
    try {
      const data = await loanService.getAllApplications();
      setAllApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      showError("Failed to load applications");
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const data = await loanService.getMonthlyAnalytics();
      setMonthlyData(data);
    } catch (error) {
      console.error("Failed to fetch monthly data:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      if (userProfile?.role === "admin") {
        fetchAllApplications();
        fetchMonthlyData();
      } else {
        fetchUserLoans();
      }
    }
  }, [isLoggedIn, user, userProfile]);

  const handleLogin = async (email: string, password: string) => {
    try {
      showLoading("Signing you in...");
      await authService.signIn(email, password);
      hideLoading();
      // User state will be updated through onAuthStateChange listener
    } catch (error: any) {
      hideLoading();
      console.error("Login failed:", error);
      showError(
        error.message || "Login failed. Please check your credentials."
      );
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      showLoading("Creating your account...");
      await authService.signUp(email, password, name);
      hideLoading();
      showSuccess(
        "Account created successfully! Please check your email to verify your account."
      );
      // User state will be updated through onAuthStateChange listener
    } catch (error: any) {
      hideLoading();
      console.error("Signup failed:", error);
      showError(error.message || "Failed to create account. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      showLoading("Connecting to Google...");
      await authService.signInWithGoogle();
      hideLoading();
      // User state will be updated through onAuthStateChange listener
    } catch (error: any) {
      hideLoading();
      console.error("Google login failed:", error);
      showError(
        error.message || "Google login failed. Please try email login instead."
      );
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentView("landing");
    } catch (error) {
      console.error("Logout failed:", error);
      showError("Failed to logout. Please try again.");
    }
  };

  const handleLoanSubmit = async (loanData: any) => {
    if (!user || !userProfile) {
      showError("User not authenticated");
      return;
    }

    try {
      showLoading("Submitting your loan application...");

      // Transform the form data to match LoanApplicationInput interface
      const applicationData: LoanApplicationInput = {
        full_name: loanData.fullName || userProfile.full_name,
        phone_number: loanData.phoneNumber,
        email: loanData.email || userProfile.email,
        loan_amount: loanData.loanAmount,
        due_date: loanData.dueDate,
        repayment_destination: loanData.repaymentDestination,
        document: loanData.document,
      };

      await loanService.submitApplication(user.id, applicationData);

      hideLoading();
      showSuccess("Loan application submitted successfully!");
      await fetchUserLoans();
      setCurrentView("user-dashboard");
    } catch (error) {
      hideLoading();
      console.error("Loan submission failed:", error);
      showError("Failed to submit loan application. Please try again.");
    }
  };

  const handleApplyForLoan = () => {
    setCurrentView("loan-form");
  };

  const handleBackToDashboard = () => {
    if (userProfile?.role === "admin") {
      setCurrentView("admin-dashboard");
    } else {
      setCurrentView("user-dashboard");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await loanService.approveApplication(id);
      showSuccess("Application approved successfully!");
      await fetchAllApplications();
    } catch (error) {
      console.error("Failed to approve application:", error);
      showError("Failed to approve application");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await loanService.rejectApplication(id, reason);
      showSuccess("Application rejected successfully!");
      await fetchAllApplications();
    } catch (error) {
      console.error("Failed to reject application:", error);
      showError("Failed to reject application");
    }
  };

  const handleUpdateRepaymentStatus = async (
    id: string,
    status: "Paid" | "Unpaid" | "Overdue"
  ) => {
    try {
      const dbStatus = status.toLowerCase() as "paid" | "unpaid" | "overdue";
      await loanService.updateRepaymentStatus(id, dbStatus);
      showSuccess("Repayment status updated successfully!");
      await fetchAllApplications();
    } catch (error) {
      console.error("Failed to update repayment status:", error);
      showError("Failed to update repayment status");
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (currentView === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setCurrentView("login")}
        onAdminAccess={() => setCurrentView("login")}
      />
    );
  }

  if (currentView === "login") {
    return (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToSignup={() => setCurrentView("signup")}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  if (currentView === "signup") {
    return (
      <SignupForm
        onSignup={handleSignup}
        onSwitchToLogin={() => setCurrentView("login")}
        onGoogleSignup={handleGoogleLogin}
      />
    );
  }

  if (currentView === "loan-form") {
    return (
      <>
        <DemoModeIndicator />
        <Suspense fallback={<LoadingComponent />}>
          <LoanApplicationForm
            user={
              userProfile
                ? { name: userProfile.full_name, email: userProfile.email }
                : { name: "User", email: "user@example.com" }
            }
            onSubmit={handleLoanSubmit}
            onBack={handleBackToDashboard}
          />
        </Suspense>
      </>
    );
  }

  if (currentView === "user-dashboard") {
    return (
      <>
        <DemoModeIndicator />
        <Suspense fallback={<LoadingComponent />}>
          <UserDashboard
            user={
              userProfile
                ? { name: userProfile.full_name, email: userProfile.email }
                : { name: "User", email: "user@example.com" }
            }
            loans={loans}
            onLogout={handleLogout}
            onApplyForLoan={handleApplyForLoan}
          />
        </Suspense>
      </>
    );
  }

  if (currentView === "admin-dashboard") {
    return (
      <>
        <DemoModeIndicator />
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs
              value={adminTab}
              onValueChange={setAdminTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <Suspense fallback={<LoadingComponent />}>
                  <AdminDashboard
                    applications={allApplications}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onUpdateRepaymentStatus={handleUpdateRepaymentStatus}
                    onLogout={handleLogout}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Suspense fallback={<LoadingComponent />}>
                  <AdminAnalytics monthlyData={monthlyData} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </>
    );
  }

  return null;
}
