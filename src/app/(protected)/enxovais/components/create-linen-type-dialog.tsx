"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateLinenTypeForm } from "./create-linen-type-form";

export function CreateLinenTypeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Tipo de Enxoval</DialogTitle>
          <DialogDescription>
            Adicione um novo tipo de enxoval ao sistema
          </DialogDescription>
        </DialogHeader>
        <CreateLinenTypeForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

