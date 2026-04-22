"use client";

import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { label: "Semua Waktu", value: "all" },
  { label: "Hari Ini", value: "today" },
  { label: "Minggu Ini", value: "week" },
  { label: "Bulan Ini", value: "month" },
];

export function LaporanFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") ?? "all";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("period");
    } else {
      params.set("period", value);
    }
    router.push(`/laporan?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border rounded-xl px-3 py-2 text-sm bg-white/70 backdrop-blur-sm shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
