import Swal from "sweetalert2";

export const confirmAction = async ({
  title,
  text,
  confirmText,
  confirmColor = "#ef4444",
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: confirmColor,
    cancelButtonColor: "#64748b",
  });

  return result.isConfirmed;
};
