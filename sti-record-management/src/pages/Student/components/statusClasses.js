export const getStatusClasses = (status, variant = "table") => {
  switch (status) {
    case "Approved":
    case "Resolved":
      return variant === "modal"
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-green-100 text-green-700 font-medium";

    case "Pending":
    case "In Progress":
      return variant === "modal"
        ? "bg-yellow-400 text-yellow-900 border-yellow-500"
        : "bg-yellow-100 text-yellow-700 font-medium";

    case "Denied":
    case "Rejected":
      return variant === "modal"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-red-100 text-red-700 font-medium";

    case "Cancelled":
      return variant === "modal"
        ? "bg-gray-300 text-gray-800 border-gray-400"
        : "bg-gray-200 text-gray-700 font-medium";

    case "Inactive":
      return variant === "modal"
        ? "bg-slate-200 text-slate-700 border-slate-300"
        : "bg-slate-100 text-slate-700 font-medium";

    default:
      return variant === "modal"
        ? "bg-gray-200 text-gray-700 border-gray-300"
        : "bg-gray-200 text-gray-700 font-medium";
  }
};
