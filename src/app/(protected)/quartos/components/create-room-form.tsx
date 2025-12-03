"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createRoom } from "@/actions/create-room";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
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

const createRoomSchema = z.object({
  number: z.string().min(1, { message: "Número do quarto é obrigatório" }),
  floor: z.number().int().positive({ message: "Andar deve ser um número positivo" }),
  block: z.string().min(1, { message: "Bloco é obrigatório" }),
  type: z.enum(["single", "double", "triple", "suite", "master"]),
  capacity: z.number().int().positive({ message: "Capacidade deve ser um número positivo" }),
  description: z.string().optional(),
});

interface CreateRoomFormProps {
  onSuccess?: () => void;
}

export function CreateRoomForm({ onSuccess }: CreateRoomFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      number: "",
      floor: 1,
      block: "",
      type: undefined,
      capacity: 1,
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createRoomSchema>) {
    const result = await createRoom(values);

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    toast.success("Quarto criado com sucesso");
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
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Quarto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Andar</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 1"
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
            name="block"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bloco</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: A, B, Torre 1..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
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
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidade</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 2"
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
                  <Input placeholder="Descrição do quarto" {...field} />
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
              "Criar Quarto"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}

