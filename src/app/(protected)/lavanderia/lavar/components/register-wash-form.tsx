"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { registerWash } from "@/actions/register-wash";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const registerWashSchema = z.object({
  laundryIds: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um item",
  }),
  notes: z.string().optional(),
});

interface RegisterWashFormProps {
  items: Array<{
    id: string;
    linenTypeName: string;
    linenItemCondition: string;
    linenItemDescription: string | null;
    collectedAt: Date;
  }>;
}

export function RegisterWashForm({ items }: RegisterWashFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerWashSchema>>({
    resolver: zodResolver(registerWashSchema),
    defaultValues: {
      laundryIds: [],
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerWashSchema>) {
    const result = await registerWash(values);

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    toast.success(
      `${result.data?.washed || 0} item(ns) registrado(s) como lavado(s)`
    );
    form.reset();
    router.refresh();
  }

  return (
    <FieldGroup>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {items.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhum item coletado aguardando lavagem
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
                    <FormLabel>Itens Lavados</FormLabel>
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
                                              ...(field.value || []),
                                              item.id,
                                            ])
                                          : field.onChange(
                                              (field.value || []).filter(
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
                                        <p className="text-xs text-muted-foreground">
                                          Coletado em:{" "}
                                          {new Date(
                                            item.collectedAt
                                          ).toLocaleString("pt-BR")}
                                        </p>
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
                  <Input placeholder="Observações sobre a lavagem" {...field} />
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
                Registrando...
              </>
            ) : (
              "Registrar Lavagem"
            )}
          </Button>
        </form>
      </Form>
    </FieldGroup>
  );
}

