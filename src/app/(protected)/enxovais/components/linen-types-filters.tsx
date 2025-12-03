"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filters } from "@/components/common/filters";

const categoryOptions = [
  { value: "cama", label: "Cama" },
  { value: "banho", label: "Banho" },
  { value: "mesa", label: "Mesa" },
  { value: "decoracao", label: "Decoração" },
  { value: "outros", label: "Outros" },
];

export function LinenTypesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/enxovais?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/enxovais?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");
    router.push("/enxovais");
  };

  return (
    <Filters
      searchPlaceholder="Buscar por nome ou descrição..."
      searchValue={search}
      onSearchChange={handleSearchChange}
      filters={[
        {
          key: "category",
          label: "Categoria",
          options: categoryOptions,
          value: category,
          onChange: (value) => {
            setCategory(value);
            updateParams("category", value);
          },
        },
      ]}
      onClear={handleClear}
    />
  );
}

