"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type SiteContentRow = {
  contentTh: string | null;
  contentEn: string | null;
  contentCn: string | null;
  imageUrl: string | null;
  visible: boolean;
};

type SiteContentMap = Record<string, SiteContentRow>;

type SiteContentContextValue = {
  content: SiteContentMap;
  setContentKey: (key: string, row: Partial<SiteContentRow>) => void;
  refetch: () => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentMap>({});

  const refetch = useCallback(async () => {
    const res = await fetch("/api/site-content");
    if (res.ok) {
      const data = await res.json();
      setContent(data);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const setContentKey = useCallback(
    (key: string, row: Partial<SiteContentRow>) => {
      setContent((prev) => ({
        ...prev,
        [key]: { ...prev[key], ...row } as SiteContentRow,
      }));
    },
    []
  );

  return (
    <SiteContentContext.Provider value={{ content, setContentKey, refetch }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}
