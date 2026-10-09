"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { CompareContextType } from "@/types/compare";

const COMPARE_STORAGE_KEY = "nexphone_compare_ids_v1";
const MAX_COMPARE_ITEMS = 3;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage asynchronously on client mount
  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSelectedIds(parsed.slice(0, MAX_COMPARE_ITEMS));
          }
        }
      } catch (e) {
        console.error("Failed to load compare items from localStorage", e);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(selectedIds));
    } catch (e) {
      console.error("Failed to save compare items to localStorage", e);
    }
  }, [selectedIds, isInitialized]);

  const addPhone = (id: string): boolean => {
    if (selectedIds.includes(id)) return true;
    if (selectedIds.length >= MAX_COMPARE_ITEMS) {
      return false;
    }
    setSelectedIds((prev) => [...prev, id]);
    return true;
  };

  const removePhone = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const toggleCompare = (id: string) => {
    if (selectedIds.includes(id)) {
      removePhone(id);
    } else {
      addPhone(id);
    }
  };

  const clearCompare = () => {
    setSelectedIds([]);
  };

  const isInCompare = (id: string) => selectedIds.includes(id);

  return (
    <CompareContext.Provider
      value={{
        selectedIds,
        addPhone,
        removePhone,
        toggleCompare,
        clearCompare,
        isInCompare,
        totalCompare: selectedIds.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}

export default CompareContext;
