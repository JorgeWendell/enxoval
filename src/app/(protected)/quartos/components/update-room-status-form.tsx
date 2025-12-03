"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { updateRoomStatus } from "@/actions/update-room-status";
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

const updateRoomStatusSchema = z.object({
  status: z.enum([
    "disponivel",
    "ocupado",
    "limpeza",
    "manutencao",
    "reservado",
  ]),
});

interface UpdateRoomStatusFormProps {
  roomId: string;
  currentStatus: "disponivel" | "ocupado" | "limpeza" | "manutencao" | "reservado";
  onSuccess?: () => void;
}

export function UpdateRoomStatusForm({
  roomId,
  currentStatus,
  onSuccess,
}: UpdateRoomStatusFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof updateRoomStatusSchema>>({
    resolver: zodResolver(updateRoomStatusSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  async function onSubmit(values: z.infer<typeof updateRoomStatusSchema>) {
    const result = await updateRoomStatus({
      roomId,
      status: values.status,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    toast.success("Status do quarto atualizado com sucesso");
    router.refresh();
    onSuccess?.();
  }

  return (
    <FieldGroup>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="ocupado">Ocupado</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                  </SelectContent>
                </Select>
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
                Atualizando...
              </>
            ) : (
              "Atualizar Status"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}

