"use client";

interface ExportCsvButtonProps {
  filename?: string;
  data: Record<string, any>[];
}

export default function ExportCsvButton({
  filename = "device-data.csv",
  data,
}: ExportCsvButtonProps) {
  const escapeCsv = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const normalizeValue = (value: unknown) => {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Build stable headers from all rows (not only first row)
    const headers = Array.from(
      new Set(data.flatMap((item) => Object.keys(item))),
    );

    // Convert objects → CSV rows with robust escaping
    const rows = data
      .map((item) =>
        headers
          .map((header) => escapeCsv(normalizeValue(item[header])))
          .join(",")
      )
      .join("\n");

    const csvContent = `\uFEFF${headers.join(",")}\n${rows}`;

    // Create a downloadable file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {data?.length ? `Export CSV (${data.length})` : "Export CSV"}
    </button>
  );
}
