"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useEffect, useState } from "react";

import { moveLinenItem } from "@/actions/move-linen-item";
import { getRooms } from "@/actions/get-rooms";
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

const createMoveLinenItemSchema = (requireRoom: boolean) => z.object({
  toRoomId: requireRoom 
    ? z.string().min(1, { message: "Selecione um quarto" })
    : z.string().optional(),
  movementType: z.enum(["entrada", "saida", "lavagem", "descarte", "transferencia"]),
  notes: z.string().optional(),
});

interface MoveLinenItemFormProps {
  linenItemId: string;
  currentRoomId?: string | null;
  onSuccess?: () => void;
}

export function MoveLinenItemForm({
  linenItemId,
  currentRoomId,
  onSuccess,
}: MoveLinenItemFormProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Array<{ id: string; number: string }>>(
    []
  );

  const requireRoom = currentRoomId === null;
  const moveLinenItemSchema = createMoveLinenItemSchema(requireRoom);

  const form = useForm<z.infer<typeof moveLinenItemSchema>>({
    resolver: zodResolver(moveLinenItemSchema),
    defaultValues: {
      toRoomId: "",
      movementType: currentRoomId === null ? "entrada" : "transferencia",
      notes: "",
    },
  });

  useEffect(() => {
    async function loadRooms() {
      const roomsResult = await getRooms({});
      if (roomsResult?.data?.data) {
        setRooms(
          roomsResult.data.data.map((r) => ({ id: r.id, number: r.number }))
        );
      }
    }

    loadRooms();
  }, []);

  async function onSubmit(values: z.infer<typeof moveLinenItemSchema>) {
    const result = await moveLinenItem({
      linenItemId,
      toRoomId: values.toRoomId || undefined,
      movementType: values.movementType,
      notes: values.notes || undefined,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    toast.success("Item movido com sucesso");
    form.reset();
    router.refresh();
    onSuccess?.();
  }

  return (
    <FieldGroup>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {currentRoomId !== null && (
            <FormField
              control={form.control}
              name="movementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="lavagem">Lavagem</SelectItem>
                      <SelectItem value="descarte">Descarte</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="toRoomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {currentRoomId === null ? "Quarto de Destino" : "Quarto de Destino (Opcional)"}
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? "" : value);
                  }}
                  defaultValue={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o quarto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currentRoomId !== null && (
                      <SelectItem value="none">Nenhum</SelectItem>
                    )}
                    {rooms
                      .filter((r) => r.id !== currentRoomId)
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Quarto {room.number}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Observações sobre a movimentação" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Movendo...
              </>
            ) : (
              currentRoomId === null ? "Enviar para Quarto" : "Mover Item"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}

