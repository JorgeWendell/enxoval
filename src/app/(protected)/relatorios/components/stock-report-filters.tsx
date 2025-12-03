"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryOptions = [
  { value: "cama", label: "Cama" },
  { value: "banho", label: "Banho" },
  { value: "mesa", label: "Mesa" },
  { value: "decoracao", label: "Decoração" },
  { value: "outros", label: "Outros" },
];

export function StockReportFilters() {
  return (
    <div className="flex gap-4">
      <Select defaultValue="">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas as Categorias</SelectItem>
          {categoryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

