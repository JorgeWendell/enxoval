"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, AlertTriangle, Loader2, Droplet } from "lucide-react";
import Link from "next/link";

import { updateChecklistItem } from "@/actions/update-checklist-item";
import { addChecklistItem } from "@/actions/add-checklist-item";
import { completeCleaningChecklist } from "@/actions/complete-cleaning-checklist";
import { getLinenItems } from "@/actions/get-linen-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ChecklistItem {
  id: string;
  linenItemId: string | null;
  linenTypeId: string;
  linenTypeName: string;
  status: "presente" | "ausente" | "danificado" | "substituido" | "sujo";
  conditionNotes: string | null;
  replacementItemId: string | null;
  currentItemDescription: string | null;
}

interface CleaningChecklistFormProps {
  checklist: {
    id: string;
    roomId: string;
    status: string;
    roomNumber: string;
  };
  items: ChecklistItem[];
  currentRoomItems: Array<{
    id: string;
    linenTypeId: string;
    status: string;
    description: string | null;
  }>;
  room: {
    id: string;
    number: string;
    type: string;
  };
}

export function CleaningChecklistForm({
  checklist,
  items: initialItems,
  currentRoomItems,
  room,
}: CleaningChecklistFormProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItemForAdd, setSelectedItemForAdd] = useState<{
    checklistItemId: string;
    linenTypeId: string;
  } | null>(null);
  const [availableItems, setAvailableItems] = useState<
    Array<{ id: string; description: string | null; linenTypeName?: string | null }>
  >([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const itemsByType = items.reduce(
    (acc, item) => {
      if (!acc[item.linenTypeId]) {
        acc[item.linenTypeId] = [];
      }
      acc[item.linenTypeId].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  const stats = {
    total: items.length,
    presentes: items.filter((i) => i.status === "presente").length,
    ausentes: items.filter((i) => i.status === "ausente").length,
    danificados: items.filter((i) => i.status === "danificado").length,
    sujos: items.filter((i) => i.status === "sujo").length,
  };

  const handleStatusChange = async (
    itemId: string,
    status: "presente" | "ausente" | "danificado" | "substituido" | "sujo",
    notes?: string
  ) => {
    setLoading(true);
    
    const item = items.find((i) => i.id === itemId);
    
    const result = await updateChecklistItem({
      itemId,
      status,
      conditionNotes: notes,
    });

    if (result?.serverError || result?.data?.error) {
      toast.error(result?.serverError || result?.data?.error);
      setLoading(false);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status, conditionNotes: notes || null } : item
      )
    );
    toast.success("Status atualizado");
    setLoading(false);
    router.refresh();
  };

  const handleAddItem = async (linenItemId: string, checklistItemId: string) => {
    if (!selectedItemForAdd) return;

    setLoading(true);
    const result = await addChecklistItem({
      checklistId: checklist.id,
      linenTypeId: selectedItemForAdd.linenTypeId,
      linenItemId,
    });

    if (result?.serverError || result?.data?.error) {
      toast.error(result?.serverError || result?.data?.error);
      setLoading(false);
      return;
    }

    toast.success("Item adicionado ao quarto");
    setSelectedItemForAdd(null);
    setLoading(false);
    router.refresh();
  };

  const loadAvailableItems = async (linenTypeId: string) => {
    setLoadingItems(true);
    const result = await getLinenItems({
      linenTypeId,
      status: "estoque",
    });

    if (result?.data?.data) {
      setAvailableItems(result.data.data);
    }
    setLoadingItems(false);
  };

  const handleComplete = async () => {
    if (stats.ausentes > 0 || stats.danificados > 0 || stats.sujos > 0) {
      const confirm = window.confirm(
        `Há ${stats.ausentes} item(ns) ausente(s), ${stats.sujos} sujo(s) e ${stats.danificados} danificado(s). Deseja finalizar mesmo assim?`
      );
      if (!confirm) return;
    }

    setLoading(true);
    const result = await completeCleaningChecklist({
      checklistId: checklist.id,
      notes: notes || undefined,
    });

    if (result?.serverError || result?.data?.error) {
      toast.error(result?.serverError || result?.data?.error);
      setLoading(false);
      return;
    }

    toast.success("Checklist finalizado com sucesso");
    router.push(`/quartos/${room.id}`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-3xl">Limpeza - Quarto {checklist.roomNumber}</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Verifique todos os enxovais do quarto
          </p>
        </div>
        <Link href={`/quartos/${room.id}`}>
          <Button variant="outline" className="w-full md:w-auto">Voltar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.presentes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sujos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.sujos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.ausentes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Danificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.danificados}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {Object.entries(itemsByType).map(([linenTypeId, typeItems]) => (
          <Card key={linenTypeId}>
            <CardHeader>
              <CardTitle>{typeItems[0].linenTypeName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {typeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-start md:justify-between md:p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-2">
                        <p className="font-medium text-sm mb-1">
                          {item.linenTypeName}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.currentItemDescription && (
                            <Badge variant="outline">
                              {item.currentItemDescription}
                            </Badge>
                          )}
                          {item.linenItemId && (
                            <span className="text-xs text-muted-foreground">
                              ID: {item.linenItemId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Button
                          size="sm"
                          variant={
                            item.status === "presente" ? "default" : "outline"
                          }
                          onClick={() =>
                            handleStatusChange(item.id, "presente")
                          }
                          disabled={loading}
                          className="flex-1 min-w-[100px] md:flex-none"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Presente</span>
                          <span className="sm:hidden">OK</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            item.status === "ausente" ? "destructive" : "outline"
                          }
                          onClick={() => handleStatusChange(item.id, "ausente")}
                          disabled={loading}
                          className="flex-1 min-w-[100px] md:flex-none"
                        >
                          <X className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Ausente</span>
                          <span className="sm:hidden">X</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            item.status === "sujo" ? "secondary" : "outline"
                          }
                          onClick={() => handleStatusChange(item.id, "sujo")}
                          disabled={loading}
                          className="flex-1 min-w-[100px] md:flex-none"
                        >
                          <Droplet className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Sujo</span>
                          <span className="sm:hidden">💧</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            item.status === "danificado"
                              ? "destructive"
                              : "outline"
                          }
                          onClick={() =>
                            handleStatusChange(item.id, "danificado")
                          }
                          disabled={loading}
                          className="flex-1 min-w-[100px] md:flex-none"
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Danificado</span>
                          <span className="sm:hidden">!</span>
                        </Button>
                      </div>

                      {item.status === "ausente" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItemForAdd({
                                  checklistItemId: item.id,
                                  linenTypeId: item.linenTypeId,
                                });
                                loadAvailableItems(item.linenTypeId);
                              }}
                            >
                              Adicionar do Estoque
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adicionar Item do Estoque</DialogTitle>
                              <DialogDescription>
                                Selecione um item disponível em estoque
                              </DialogDescription>
                            </DialogHeader>
                            {loadingItems ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : availableItems.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center p-4">
                                Nenhum item disponível em estoque
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {availableItems.map((availableItem) => (
                                  <div
                                    key={availableItem.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">
                                        {availableItem.linenTypeName || `Item #${availableItem.id.slice(0, 8)}`}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {availableItem.description && (
                                          <span className="text-xs text-muted-foreground">
                                            {availableItem.description}
                                          </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                          ID: {availableItem.id.slice(0, 8)}
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleAddItem(availableItem.id, item.id)
                                      }
                                      disabled={loading}
                                    >
                                      Adicionar
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}

                      {(item.status === "danificado" ||
                        item.status === "presente" ||
                        item.status === "sujo") && (
                        <div className="mt-2">
                          <Textarea
                            placeholder={
                              item.status === "sujo"
                                ? "Observações sobre o estado do item (manchas, etc.)"
                                : "Observações (manchas, danos, etc.)"
                            }
                            value={item.conditionNotes || ""}
                            onChange={(e) => {
                              handleStatusChange(
                                item.id,
                                item.status,
                                e.target.value
                              );
                            }}
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end md:block">
                      <Badge
                        variant={
                          item.status === "presente"
                            ? "default"
                            : item.status === "ausente"
                              ? "destructive"
                              : item.status === "sujo"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações sobre a limpeza do quarto..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link href={`/quartos/${room.id}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
        </Link>
        <Button onClick={handleComplete} disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizando...
            </>
          ) : (
            "Finalizar Limpeza"
          )}
        </Button>
      </div>
    </div>
  );
}

