"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type PublicChatSettings = {
  facebookPageId: string | null;
  facebookAppId: string | null;
};

declare global {
  interface Window {
    FB?: {
      init: (params: { appId?: string; xfbml: boolean; version: string }) => void;
      XFBML?: { parse: () => void };
    };
  }
}

export function FacebookChatWidget() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<PublicChatSettings | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);
  const isHiddenRoute = pathname.startsWith("/admin") || pathname.startsWith("/studio");

  useEffect(() => {
    // Set development mode after mount
    setIsDevelopment(window.location.hostname === "localhost");
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        setSettings({
          facebookPageId: data.facebookPageId ?? null,
          facebookAppId: data.facebookAppId ?? null,
        });
        // Debug: Log pageId
        console.log("Facebook Chat Debug - Page ID from DB:", data.facebookPageId);
      })
      .catch(() => {
        if (mounted) setSettings(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHiddenRoute) return;
    const pageId = settings?.facebookPageId?.trim();
    if (!pageId) return;

    // Skip Facebook SDK loading in development mode
    if (isDevelopment) {
      console.log("Facebook Chat Debug - Development mode: Using mockup instead of real SDK");
      return;
    }

    // Ensure fb-root exists
    if (!document.getElementById("fb-root")) {
      const root = document.createElement("div");
      root.id = "fb-root";
      document.body.appendChild(root);
    }

    const init = () => {
      if (window.FB) {
        window.FB.init({
          appId: settings?.facebookAppId?.trim() || undefined,
          xfbml: true,
          version: "v18.0",
        });
        window.FB.XFBML?.parse();
      }
    };

    const existingScript = document.getElementById("facebook-jssdk") as HTMLScriptElement | null;
    if (existingScript) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    // Use all.js for development mode (less strict domain validation)
    script.src = isDevelopment 
      ? "https://connect.facebook.net/en_US/sdk/all.js"
      : "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";
    script.onload = init;
    document.body.appendChild(script);
  }, [isHiddenRoute, settings, isDevelopment]);

  const pageId = settings?.facebookPageId?.trim();
  if (isHiddenRoute || !pageId) return null;

  return <FacebookCustomerChatBox pageId={pageId} isDevelopment={isDevelopment} />;
}

function FacebookCustomerChatBox({ pageId, isDevelopment }: { pageId: string; isDevelopment: boolean }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isDevelopment || !isClient) return; // Skip Facebook SDK operations in development

    const el = document.getElementById("fb-customerchat-box");
    if (!el) return;
    el.setAttribute("attribution", "biz_inbox");
    el.setAttribute("page_id", pageId);
    
    // Development mode: Add attributes to bypass domain validation
    if (window.location.hostname === "localhost") {
      el.setAttribute("theme_color", "#0084ff");
      el.setAttribute("logged_in_greeting", "สวัสดีครับ มีอะไรให้ช่วยไหม?");
      el.setAttribute("logged_out_greeting", "สวัสดีครับ กรุณาล็อกอินเพื่อแชทกับเรา");
      el.setAttribute("greeting_dialog_display", "show");
      el.setAttribute("greeting_dialog_delay", "0");
    }
    
    window.FB?.XFBML?.parse();
  }, [pageId, isDevelopment, isClient]);

  // Development mode: Show mockup button
  if (isDevelopment) {
    return (
      <div className="fixed bottom-6 right-6 z-[999] hidden md:block">
        <div
          className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#1877F2] p-4 text-white shadow-xl shadow-[#1877F2]/40 ring-1 ring-[#1877F2]/40 transition-transform hover:scale-110 cursor-pointer"
          onClick={() => {
            alert(`Facebook Chat Mockup\n\nPage ID: ${pageId}\n\nThis is a development mockup. In production, this will open the real Facebook Customer Chat.`);
          }}
          title="Facebook Chat (Development Mode)"
        >
          <svg
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      </div>
    );
  }

  // Production mode: Real Facebook chat box
  return <div id="fb-customerchat-box" className="fb-customerchat" />;
}
