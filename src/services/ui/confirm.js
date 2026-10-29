const loadSwal = () => import("sweetalert2").then((m) => m.default);

export const warmConfirm = () => {
  const run = () => loadSwal().catch(() => {});

  if ("requestIdleCallback" in window) requestIdleCallback(run);
  else setTimeout(run, 1500);
};

export const confirmAction = async ({
  title,
  text,
  confirmText,
  confirmColor = "#ef4444",
  cancelColor = "#64748b",
  reverse = false,
}) => {
  const Swal = await loadSwal();

  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    reverseButtons: reverse,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: confirmColor,
    cancelButtonColor: cancelColor,
  });

  return result.isConfirmed;
};
