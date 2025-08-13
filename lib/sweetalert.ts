import Swal from "sweetalert2";

// Custom SweetAlert configurations
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#059669", // emerald-600
    timer: 3000,
    showConfirmButton: false,
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc2626", // red-600
  });
};

export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#d97706", // amber-600
  });
};

export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#2563eb", // blue-600
  });
};

export const showConfirmation = (title: string, text?: string) => {
  return Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#059669", // emerald-600
    cancelButtonColor: "#dc2626", // red-600
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  });
};

export const showDeleteConfirmation = (
  title: string = "Are you sure?",
  text: string = "This action cannot be undone!"
) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#dc2626", // red-600
    cancelButtonColor: "#6b7280", // gray-500
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });
};

export const showLoading = (title: string = "Processing...") => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const hideLoading = () => {
  Swal.close();
};
