"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { deliverLinen } from "@/actions/deliver-linen";
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

const deliverLinenSchema = z.object({
  roomId: z.string().min(1, { message: "Selecione um destino" }),
  laundryIds: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um item",
  }),
  notes: z.string().optional(),
});

interface DeliverLinenFormProps {
  items: Array<{
    id: string;
    linenTypeName: string;
    linenItemCondition: string;
    linenItemDescription: string | null;
    washedAt: Date | null;
  }>;
  rooms: Array<{ id: string; number: string; floor: number }>;
}

export function DeliverLinenForm({
  items,
  rooms,
}: DeliverLinenFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof deliverLinenSchema>>({
    resolver: zodResolver(deliverLinenSchema),
    defaultValues: {
      roomId: "",
      laundryIds: [],
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof deliverLinenSchema>) {
    const result = await deliverLinen(values);

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    const isToStock = values.roomId === "estoque";
    toast.success(
      `${result.data?.data?.delivered || 0} item(ns) ${isToStock ? "enviado(s) para estoque" : "entregue(s)"} com sucesso`
    );
    form.reset();
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
                <FormLabel>Destino</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destino" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="estoque">Estoque</SelectItem>
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

          {items.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhum item lavado aguardando entrega
                </p>
              </CardContent>
            </Card>
          ) : (
            <FormField
              control={form.control}
              name="laundryIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Itens para Entregar</FormLabel>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {items.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="laundryIds"
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
                                        {item.linenItemDescription && (
                                          <p className="text-xs text-muted-foreground">
                                            Descrição: {item.linenItemDescription}
                                          </p>
                                        )}
                                        {item.washedAt && (
                                          <p className="text-xs text-muted-foreground">
                                            Lavado em:{" "}
                                            {new Date(
                                              item.washedAt
                                            ).toLocaleString("pt-BR")}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {item.linenItemCondition}
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
                  <Input placeholder="Observações sobre a entrega" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting || items.length === 0}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {form.watch("roomId") === "estoque" ? "Enviando para estoque..." : "Entregando..."}
              </>
            ) : (
              form.watch("roomId") === "estoque" ? "Enviar para Estoque" : "Entregar Itens"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}

