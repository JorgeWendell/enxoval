"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageOpen, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoveLinenItemForm } from "@/app/(protected)/enxovais/components/move-linen-item-form";

const statusLabels = {
  limpo: "Limpo",
  sujo: "Sujo",
  em_lavagem: "Em Lavagem",
  danificado: "Danificado",
  estoque: "Estoque",
  descartado: "Descartado",
};

interface StockItemsListProps {
  items: Array<{
    id: string;
    linenTypeName: string;
    status: string;
    condition: string;
    description: string | null;
  }>;
}

export function StockItemsList({ items }: StockItemsListProps) {
  const router = useRouter();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const handleSuccess = () => {
    setOpenDialogId(null);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-3">
            <PackageOpen className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">
                {item.linenTypeName || `Item #${item.id.slice(0, 8)}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.description && `Descrição: ${item.description}`}
                {item.description && item.id && " • "}
                {item.id && `ID: ${item.id.slice(0, 8)}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {statusLabels[item.status as keyof typeof statusLabels]}
            </Badge>
            <Badge variant="outline">{item.condition}</Badge>
            {item.status === "estoque" && (
              <Dialog
                open={openDialogId === item.id}
                onOpenChange={(open) => setOpenDialogId(open ? item.id : null)}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Truck className="mr-2 h-4 w-4" />
                    Enviar para Quarto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enviar Item para Quarto</DialogTitle>
                    <DialogDescription>
                      Selecione o quarto de destino para este item
                    </DialogDescription>
                  </DialogHeader>
                  <MoveLinenItemForm
                    linenItemId={item.id}
                    currentRoomId={null}
                    onSuccess={handleSuccess}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

