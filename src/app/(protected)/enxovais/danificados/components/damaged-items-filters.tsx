"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filters } from "@/components/common/filters";

interface LinenType {
  id: string;
  name: string;
}

interface DamagedItemsFiltersProps {
  linenTypes: LinenType[];
}

export function DamagedItemsFilters({ linenTypes }: DamagedItemsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [linenTypeId, setLinenTypeId] = useState(
    searchParams.get("linenTypeId") || ""
  );

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/enxovais/danificados?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/enxovais/danificados?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setLinenTypeId("");
    router.push("/enxovais/danificados");
  };

  return (
    <Filters
      searchPlaceholder="Buscar por nome, código de barras ou ID..."
      searchValue={search}
      onSearchChange={handleSearchChange}
      filters={[
        {
          key: "linenTypeId",
          label: "Tipo de Enxoval",
          options: linenTypes.map((type) => ({
            value: type.id,
            label: type.name,
          })),
          value: linenTypeId,
          onChange: (value) => {
            setLinenTypeId(value);
            updateParams("linenTypeId", value);
          },
        },
      ]}
      onClear={handleClear}
    />
  );
}

