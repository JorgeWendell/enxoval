"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filters } from "@/components/common/filters";
import { getRooms } from "@/actions/get-rooms";

const movementTypeOptions = [
  { value: "entrada", label: "Entrada" },
  { value: "saida", label: "Saída" },
  { value: "lavagem", label: "Lavagem" },
  { value: "descarte", label: "Descarte" },
  { value: "transferencia", label: "Transferência" },
];

export function MovementsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [movementType, setMovementType] = useState(
    searchParams.get("movementType") || ""
  );
  const [roomId, setRoomId] = useState(searchParams.get("roomId") || "");
  const [roomOptions, setRoomOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    async function loadRooms() {
      const roomsResult = await getRooms({});
      if (roomsResult?.data?.data) {
        setRoomOptions(
          roomsResult.data.data.map((r) => ({
            value: r.id,
            label: `Quarto ${r.number}`,
          }))
        );
      }
    }

    loadRooms();
  }, []);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/movimentacoes?${params.toString()}`);
  };

  const handleClear = () => {
    setMovementType("");
    setRoomId("");
    router.push("/movimentacoes");
  };

  return (
    <Filters
      filters={[
        {
          key: "movementType",
          label: "Tipo de Movimentação",
          options: movementTypeOptions,
          value: movementType,
          onChange: (value) => {
            setMovementType(value);
            updateParams("movementType", value);
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

