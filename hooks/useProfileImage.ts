// src/hooks/useProfileImage.ts
import { useState, useEffect } from "react";

export function useProfileImage(isLoggedIn: boolean | null) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
  if (!isLoggedIn) return; // only fetch when logged in

  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch("https://account.snabbb.com/api/account/profile", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      // 401 (no valid Odoo session) is a normal response, not an exception.
      if (!res.ok) return;

      const data = await res.json();
      if (!data?.ok) return;

      const imageUrl = data.partner?.has_image
        ? `https://account.snabbb.com/web/image/res.partner/${data.partner_id}/image_128?unique=${Date.now()}`
        : null;
      setProfileImageUrl(imageUrl);
    } catch {
      
      // Network error, aborted request, or non-JSON body: keep the current image.
    }
  })();

  return () => controller.abort();
}, [isLoggedIn]); // ← re-run when login state changes

  return { profileImageUrl };
}