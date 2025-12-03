"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createLinenType } from "@/actions/create-linen-type";
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

const createLinenTypeSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  description: z.string().optional(),
  category: z.enum(["cama", "banho", "mesa", "decoracao", "outros"], {
    required_error: "Categoria é obrigatória",
  }),
  unit: z.string().min(1, { message: "Unidade é obrigatória" }),
  minStock: z.coerce
    .number()
    .int()
    .min(0, { message: "Estoque mínimo deve ser 0 ou maior" }),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

interface CreateLinenTypeFormProps {
  onSuccess?: () => void;
}

export function CreateLinenTypeForm({
  onSuccess,
}: CreateLinenTypeFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof createLinenTypeSchema>>({
    resolver: zodResolver(createLinenTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: undefined,
      unit: "unidade",
      minStock: 0,
      imageUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createLinenTypeSchema>) {
    const result = await createLinenType(values);

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    toast.success("Tipo de enxoval criado com sucesso");
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Lençol Solteiro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cama">Cama</SelectItem>
                    <SelectItem value="banho">Banho</SelectItem>
                    <SelectItem value="mesa">Mesa</SelectItem>
                    <SelectItem value="decoracao">Decoração</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: unidade, par, jogo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Mínimo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
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
                  <Input placeholder="Descrição do tipo de enxoval" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Imagem (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    {...field}
                  />
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
              "Criar Tipo de Enxoval"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}

