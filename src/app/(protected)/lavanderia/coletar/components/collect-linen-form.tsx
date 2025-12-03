"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useEffect, useState } from "react";

import { collectLinen } from "@/actions/collect-linen";
import { getRoomLinenItems } from "@/actions/get-room-linen-items";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const collectLinenSchema = z.object({
  roomId: z.string().min(1, { message: "Selecione um quarto" }),
  linenItemIds: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um item",
  }),
  notes: z.string().optional(),
});

interface CollectLinenFormProps {
  rooms: Array<{ id: string; number: string; floor: number }>;
}

export function CollectLinenForm({ rooms }: CollectLinenFormProps) {
  const router = useRouter();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [availableItems, setAvailableItems] = useState<
    Array<{
      id: string;
      linenTypeName: string;
      condition: string;
      description: string | null;
    }>
  >([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const form = useForm<z.infer<typeof collectLinenSchema>>({
    resolver: zodResolver(collectLinenSchema),
    defaultValues: {
      roomId: "",
      linenItemIds: [],
      notes: "",
    },
  });

  useEffect(() => {
    async function loadItems() {
      const roomId = form.watch("roomId");
      if (!roomId) {
        setAvailableItems([]);
        return;
      }

      setLoadingItems(true);
      const result = await getRoomLinenItems({ roomId });

      if (result?.data?.data) {
        setAvailableItems(result.data.data);
      }
      setLoadingItems(false);
    }

    const subscription = form.watch((value, { name }) => {
      if (name === "roomId") {
        form.setValue("linenItemIds", []);
        loadItems();
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: z.infer<typeof collectLinenSchema>) {
    const result = await collectLinen(values);

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    toast.success(
      `${result.data?.data?.collected || 0} item(ns) coletado(s) com sucesso`
    );
    form.reset();
    setAvailableItems([]);
    router.refresh();
  }

  return (
    <FieldGroup>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quarto</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedRoomId(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o quarto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Quarto {room.number} - Andar {room.floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {loadingItems && (
            <div className="text-sm text-muted-foreground">
              Carregando itens...
            </div>
          )}

          {!loadingItems && availableItems.length === 0 && selectedRoomId && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhum item sujo encontrado neste quarto
                </p>
              </CardContent>
            </Card>
          )}

          {!loadingItems && availableItems.length > 0 && (
            <FormField
              control={form.control}
              name="linenItemIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Itens para Coletar</FormLabel>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {availableItems.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="linenItemIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">
                                          {item.linenTypeName}
                                        </p>
                                        {item.description && (
                                          <p className="text-xs text-muted-foreground">
                                            Descrição: {item.description}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {item.condition}
                                      </span>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Observações sobre a coleta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting || availableItems.length === 0}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Coletando...
              </>
            ) : (
              "Coletar Itens"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}

