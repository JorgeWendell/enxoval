"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filters } from "@/components/common/filters";
import { getLinenTypes } from "@/actions/get-linen-types";
import { getRooms } from "@/actions/get-rooms";

const statusOptions = [
  { value: "limpo", label: "Limpo" },
  { value: "sujo", label: "Sujo" },
  { value: "em_lavagem", label: "Em Lavagem" },
  { value: "danificado", label: "Danificado" },
  { value: "estoque", label: "Estoque" },
  { value: "descartado", label: "Descartado" },
];

export function LinenItemsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [linenTypeId, setLinenTypeId] = useState(
    searchParams.get("linenTypeId") || ""
  );
  const [roomId, setRoomId] = useState(searchParams.get("roomId") || "");
  const [linenTypeOptions, setLinenTypeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [roomOptions, setRoomOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    async function loadOptions() {
      const [typesResult, roomsResult] = await Promise.all([
        getLinenTypes({}),
        getRooms({}),
      ]);

      if (typesResult?.data?.data) {
        setLinenTypeOptions(
          typesResult.data.data.map((t) => ({ value: t.id, label: t.name }))
        );
      }

      if (roomsResult?.data?.data) {
        setRoomOptions(
          roomsResult.data.data.map((r) => ({
            value: r.id,
            label: `Quarto ${r.number}`,
          }))
        );
      }
    }

    loadOptions();
  }, []);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/enxovais/itens?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/enxovais/itens?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setLinenTypeId("");
    setRoomId("");
    router.push("/enxovais/itens");
  };

  return (
    <Filters
      searchPlaceholder="Buscar por código de barras ou ID..."
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
          key: "linenTypeId",
          label: "Tipo",
          options: linenTypeOptions,
          value: linenTypeId,
          onChange: (value) => {
            setLinenTypeId(value);
            updateParams("linenTypeId", value);
          },
        },
        {
          key: "roomId",
          label: "Quarto",
          options: roomOptions,
          value: roomId,
          onChange: (value) => {
            setRoomId(value);
            updateParams("roomId", value);
          },
        },
      ]}
      onClear={handleClear}
    />
  );
}

