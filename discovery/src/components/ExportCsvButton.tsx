"use client";

interface ExportCsvButtonProps {
  filename?: string;
  data: Record<string, any>[];
}

export default function ExportCsvButton({
  filename = "device-data.csv",
  data,
}: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Extract CSV header
    const headers = Object.keys(data[0]).join(",");

    // Convert objects → CSV rows
    const rows = data
      .map((item) =>
        Object.values(item)
          .map((value) => `"${value ?? ""}"`)
          .join(",")
      )
      .join("\n");

    const csvContent = `${headers}\n${rows}`;

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
      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
    >
      Export CSV
    </button>
  );
}
