"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface FilterOption {
  value: string;
  label: string;
}

interface FiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: FilterOption[];
    value?: string;
    onChange?: (value: string) => void;
  }>;
  onClear?: () => void;
}

export function Filters({
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  filters = [],
  onClear,
}: FiltersProps) {
  const hasActiveFilters =
    searchValue ||
    filters.some((filter) => filter.value && filter.value !== "");

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {onSearchChange && (
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {filters.map((filter) => (
          <div key={filter.key} className="w-full md:w-[200px]">
            <Select
              value={filter.value || "all"}
              onValueChange={(value) => {
                if (filter.onChange) {
                  filter.onChange(value === "all" ? "" : value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {hasActiveFilters && onClear && (
          <Button variant="outline" onClick={onClear}>
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </Card>
  );
}

