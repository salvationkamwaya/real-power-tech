"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessRedirect() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const params = sp.toString();
    const target = params ? `/portal/success?${params}` : "/portal/success";
    router.replace(target);
  }, [sp, router]);

  return null;
}

export default function SuccessRedirectPage() {
  return (
    <Suspense fallback={null}>
      <SuccessRedirect />
    </Suspense>
  );
}
