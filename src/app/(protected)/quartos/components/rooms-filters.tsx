"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filters } from "@/components/common/filters";

const statusOptions = [
  { value: "disponivel", label: "Disponível" },
  { value: "ocupado", label: "Ocupado" },
  { value: "limpeza", label: "Limpeza" },
  { value: "manutencao", label: "Manutenção" },
  { value: "reservado", label: "Reservado" },
];

const typeOptions = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "triple", label: "Triple" },
  { value: "suite", label: "Suite" },
  { value: "master", label: "Master" },
];

const floorOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Andar ${i + 1}`,
}));

export function RoomsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [floor, setFloor] = useState(searchParams.get("floor") || "");

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/quartos?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/quartos?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setType("");
    setFloor("");
    router.push("/quartos");
  };

  return (
    <Filters
      searchPlaceholder="Buscar por número ou descrição..."
      searchValue={search}
      onSearchChange={handleSearchChange}
      filters={[
        {
          key: "status",
          label: "Status",
          options: statusOptions,
          value: status,
          onChange: (value) => {
            setStatus(value);
            updateParams("status", value);
          },
        },
        {
          key: "type",
          label: "Tipo",
          options: typeOptions,
          value: type,
          onChange: (value) => {
            setType(value);
            updateParams("type", value);
          },
        },
        {
          key: "floor",
          label: "Andar",
          options: floorOptions,
          value: floor,
          onChange: (value) => {
            setFloor(value);
            updateParams("floor", value);
          },
        },
      ]}
      onClear={handleClear}
    />
  );
}

