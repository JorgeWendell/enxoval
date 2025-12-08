"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { createLinenItem } from "@/actions/create-linen-item";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLinenTypes } from "@/actions/get-linen-types";
import { getRooms } from "@/actions/get-rooms";
import { useEffect, useState } from "react";

const createLinenItemSchema = z.object({
  linenTypeId: z.string().min(1, { message: "Tipo de enxoval é obrigatório" }),
  roomId: z.string().optional(),
  description: z.string().optional(),
  purchaseDate: z.string().optional(),
  cnpjFornecedor: z.string().optional(),
  nfe: z.string().optional(),
});

interface CreateLinenItemFormProps {
  onSuccess?: () => void;
}

export function CreateLinenItemForm({ onSuccess }: CreateLinenItemFormProps) {
  const router = useRouter();
  const [linenTypes, setLinenTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [rooms, setRooms] = useState<Array<{ id: string; number: string }>>([]);

  const form = useForm<z.infer<typeof createLinenItemSchema>>({
    resolver: zodResolver(createLinenItemSchema),
    defaultValues: {
      linenTypeId: "",
      roomId: "",
      description: "",
      purchaseDate: "",
      cnpjFornecedor: "",
      nfe: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      const [typesResult, roomsResult] = await Promise.all([
        getLinenTypes({}),
        getRooms({}),
      ]);

      if (typesResult?.data?.data) {
        setLinenTypes(
          typesResult.data.data.map((t) => ({ id: t.id, name: t.name }))
        );
      }

      if (roomsResult?.data?.data) {
        setRooms(
          roomsResult.data.data.map((r) => ({ id: r.id, number: r.number }))
        );
      }
    }

    loadData();
  }, []);

  async function onSubmit(values: z.infer<typeof createLinenItemSchema>) {
    const result = await createLinenItem({
      linenTypeId: values.linenTypeId,
      roomId: values.roomId || undefined,
      description: values.description || undefined,
      purchaseDate: values.purchaseDate
        ? new Date(values.purchaseDate)
        : undefined,
      cnpjFornecedor: values.cnpjFornecedor || undefined,
      nfe: values.nfe || undefined,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    toast.success("Item de enxoval criado com sucesso");
    form.reset();
    router.refresh();
    onSuccess?.();
  }

  return (
    <FieldGroup>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="linenTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Enxoval</FormLabel>
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
                    {linenTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
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
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quarto (Opcional)</FormLabel>
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
                    <SelectItem value="none">Nenhum (Estoque)</SelectItem>
                    {rooms.map((room) => (
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição do item" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Compra (Opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnpjFornecedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ Fornecedor (Opcional)</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="##.###.###/####-##"
                    mask="_"
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                    customInput={Input}
                    placeholder="00.000.000/0000-00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nfe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NFE (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Número da Nota Fiscal Eletrônica" {...field} />
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
                Criando...
              </>
            ) : (
              "Criar Item"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}
