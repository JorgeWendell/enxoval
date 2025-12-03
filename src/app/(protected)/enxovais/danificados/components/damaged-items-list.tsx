"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wrench, Trash2, Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { repairItem } from "@/actions/repair-item";
import { discardItem } from "@/actions/discard-item";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface DamagedItem {
  id: string;
  linenTypeName: string;
  roomNumber: string | null;
  description: string | null;
  condition: string;
  notes: string | null;
  lastWashDate: Date | null;
  updatedAt: Date;
}

interface DamagedItemsListProps {
  items: DamagedItem[];
}

export function DamagedItemsList({ items }: DamagedItemsListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DamagedItem | null>(null);
  const [action, setAction] = useState<"repair" | "discard" | null>(null);
  const [notes, setNotes] = useState("");

  const handleRepair = async (item: DamagedItem) => {
    setLoading(item.id);
    const result = await repairItem({
      itemId: item.id,
      notes: notes || undefined,
    });

    if (result?.serverError || result?.data?.error) {
      toast.error(result?.serverError || result?.data?.error);
      setLoading(null);
      return;
    }

    toast.success("Item reparado e retornado ao estoque");
    setSelectedItem(null);
    setAction(null);
    setNotes("");
    setLoading(null);
    router.refresh();
  };

  const handleDiscard = async (item: DamagedItem) => {
    if (
      !window.confirm(
        "Tem certeza que deseja descartar este item definitivamente? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setLoading(item.id);
    const result = await discardItem({
      itemId: item.id,
      notes: notes || undefined,
    });

    if (result?.serverError || result?.data?.error) {
      toast.error(result?.serverError || result?.data?.error);
      setLoading(null);
      return;
    }

    toast.success("Item descartado definitivamente");
    setSelectedItem(null);
    setAction(null);
    setNotes("");
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm">{item.linenTypeName}</p>
              <Badge variant="destructive">Danificado</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {item.description && (
                <span>Descrição: {item.description}</span>
              )}
              {item.description && <span>•</span>}
              <span>ID: {item.id.slice(0, 8)}</span>
              {item.roomNumber && (
                <>
                  <span>•</span>
                  <span>Quarto: {item.roomNumber}</span>
                </>
              )}
              {item.lastWashDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Última lavagem:{" "}
                    {new Date(item.lastWashDate).toLocaleDateString("pt-BR")}
                  </span>
                </>
              )}
            </div>
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-1">
                Observações: {item.notes}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Danificado em: {new Date(item.updatedAt).toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setSelectedItem(item);
                    setAction("repair");
                    setNotes("");
                  }}
                  disabled={loading === item.id}
                >
                  {loading === item.id ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Wrench className="mr-1 h-3 w-3" />
                  )}
                  Reparar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reparar Item</DialogTitle>
                  <DialogDescription>
                    O item será marcado como reparado e retornará ao estoque
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">{item.linenTypeName}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {item.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Observações (Opcional)
                    </label>
                    <Textarea
                      placeholder="Descreva o reparo realizado..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(null);
                        setAction(null);
                        setNotes("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={() => handleRepair(item)}>
                      Confirmar Reparo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedItem(item);
                    setAction("discard");
                    setNotes("");
                  }}
                  disabled={loading === item.id}
                >
                  {loading === item.id ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-3 w-3" />
                  )}
                  Descartar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Descartar Item</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita. O item será marcado como
                    descartado definitivamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">{item.linenTypeName}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {item.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Observações (Opcional)
                    </label>
                    <Textarea
                      placeholder="Motivo do descarte..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(null);
                        setAction(null);
                        setNotes("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDiscard(item)}>
                      Confirmar Descarte
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
    </div>
  );
}

