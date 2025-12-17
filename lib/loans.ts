import { supabase } from "./supabase";
import fetchWithAuth from "./api";

export interface LoanApplication {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  loan_amount: number;
  due_date: string;
  repayment_amount: number;
  repayment_destination: string;
  document_url?: string;
  status: "pending" | "approved" | "rejected";
  repayment_status: "paid" | "unpaid" | "overdue";
  rejection_reason?: string;
  approved_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationInput {
  full_name: string;
  phone_number: string;
  email: string;
  loan_amount: number;
  due_date: string;
  repayment_destination: string;
  document?: File;
}

// Interface for transformed applications for AdminDashboard
export interface DashboardApplication {
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

export const loanService = {
  // Submit a new loan application
  async submitApplication(
    userId: string,
    applicationData: LoanApplicationInput
  ): Promise<LoanApplication> {
    const repaymentAmount = applicationData.loan_amount * 1.3;

    // Upload document if provided
    let documentUrl = null;
    if (applicationData.document) {
      const fileExt = applicationData.document.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("loan-documents")
        .upload(fileName, applicationData.document);

      if (uploadError) {
        console.warn("Document upload failed:", uploadError);
        throw new Error("Document upload failed. Please try again.");
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("loan-documents").getPublicUrl(fileName);
        documentUrl = publicUrl;
      }
    } else {
      throw new Error("Document is required for loan application.");
    }

    const { data, error } = await supabase
      .from("loan_applications")
      .insert({
        user_id: userId,
        full_name: applicationData.full_name,
        phone_number: applicationData.phone_number,
        email: applicationData.email,
        loan_amount: applicationData.loan_amount,
        due_date: applicationData.due_date,
        repayment_amount: repaymentAmount,
        repayment_destination: applicationData.repayment_destination,
        document_url: documentUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's loan applications
  async getUserApplications(userId: string): Promise<LoanApplication[]> {
    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user's current active loan
  async getCurrentLoan(userId: string): Promise<LoanApplication | null> {
    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "approved")
      .in("repayment_status", ["unpaid", "overdue"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  // Admin: Get all loan applications (via API route)
  async getAllApplications(): Promise<DashboardApplication[]> {
    try {
      console.log("Fetching applications from API...");
      // Include current user's access token so server can verify admin
      const response = await fetchWithAuth("/api/admin/applications");
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("API response result:", result);

      if (result.error) {
        throw new Error(result.error);
      }

      const applications = result.data || [];
      console.log("Raw applications from database:", applications);

      // Transform data to match AdminDashboard interface
      const transformedApplications = applications.map(
        (app: LoanApplication): DashboardApplication => ({
          id: app.id,
          applicantName: app.full_name,
          loanAmount: app.loan_amount,
          status: (app.status === "pending"
            ? "Pending"
            : app.status === "approved"
            ? "Approved"
            : "Rejected") as "Pending" | "Approved" | "Rejected",
          dueDate: app.due_date,
          repaymentDestination: app.repayment_destination,
          documentUrl: app.document_url || "",
          rejectionReason: app.rejection_reason,
          repaymentStatus: (app.repayment_status === "paid"
            ? "Paid"
            : app.repayment_status === "unpaid"
            ? "Unpaid"
            : "Overdue") as "Paid" | "Unpaid" | "Overdue",
          appliedDate: app.created_at,
        })
      );

      console.log("Transformed applications:", transformedApplications);
      return transformedApplications;
    } catch (error) {
      console.error("Error fetching all applications:", error);
      // Fallback to regular client (will only show user's own applications)
      const { data, error: fallbackError } = await supabase
        .from("loan_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Fallback error:", fallbackError);
        throw fallbackError;
      }

      console.log("Using fallback data:", data);

      // Transform fallback data as well
      const transformedFallback = (data || []).map(
        (app: LoanApplication): DashboardApplication => ({
          id: app.id,
          applicantName: app.full_name,
          loanAmount: app.loan_amount,
          status: (app.status === "pending"
            ? "Pending"
            : app.status === "approved"
            ? "Approved"
            : "Rejected") as "Pending" | "Approved" | "Rejected",
          dueDate: app.due_date,
          repaymentDestination: app.repayment_destination,
          documentUrl: app.document_url || "",
          rejectionReason: app.rejection_reason,
          repaymentStatus: (app.repayment_status === "paid"
            ? "Paid"
            : app.repayment_status === "unpaid"
            ? "Unpaid"
            : "Overdue") as "Paid" | "Unpaid" | "Overdue",
          appliedDate: app.created_at,
        })
      );

      console.log("Transformed fallback applications:", transformedFallback);
      return transformedFallback;
    }
  },

  // Admin: Approve loan application (via API route)
  async approveApplication(applicationId: string): Promise<LoanApplication> {
    const response = await fetchWithAuth(
      `/api/admin/applications/${applicationId}/approve`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  },

  // Admin: Reject loan application (via API route)
  async rejectApplication(
    applicationId: string,
    rejectionReason: string
  ): Promise<LoanApplication> {
    const response = await fetchWithAuth(
      `/api/admin/applications/${applicationId}/reject`,
      { method: "POST", body: JSON.stringify({ rejectionReason }) }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  },

  // Admin: Update repayment status (via API route)
  async updateRepaymentStatus(
    applicationId: string,
    repaymentStatus: "paid" | "unpaid" | "overdue"
  ): Promise<LoanApplication> {
    const response = await fetchWithAuth(
      `/api/admin/applications/${applicationId}/repayment-status`,
      { method: "PATCH", body: JSON.stringify({ repaymentStatus }) }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  },

  // Get monthly analytics data (via API route)
  async getMonthlyAnalytics() {
    try {
      const { data: { session } = {} as any } = await (
        supabase as any
      ).auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetchWithAuth("/api/admin/analytics");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return [];
    }
  },
};
