"use client";

import { Suspense, useEffect, useState } from "react";
import PaddockViewClient from "@/components/PaddockViewClient";

export default function Page() {
  const [paddockId, setPaddockId] = useState<number | null>(null);
  const [paddockName, setPaddockName] = useState<string>("");

  useEffect(() => {
    const data = sessionStorage.getItem("paddockData");
    if (data) {
      const { paddockId, paddockName } = JSON.parse(data);
      setPaddockId(paddockId);
      setPaddockName(paddockName);
    }
  }, []);

  return (
    <Suspense fallback={<p>Loading paddock...</p>}>
      <PaddockViewClient />
    </Suspense>
  );
}
