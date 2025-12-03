"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditLinenTypeForm } from "./edit-linen-type-form";

interface EditLinenTypeDialogProps {
  linenTypeId: string;
  defaultValues: {
    name: string;
    description: string | null;
    category: "cama" | "banho" | "mesa" | "decoracao" | "outros";
    unit: string;
    minStock: number;
    imageUrl: string | null;
  };
}

export function EditLinenTypeDialog({
  linenTypeId,
  defaultValues,
}: EditLinenTypeDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Tipo de Enxoval</DialogTitle>
          <DialogDescription>
            Atualize as informações do tipo de enxoval
          </DialogDescription>
        </DialogHeader>
        <EditLinenTypeForm
          linenTypeId={linenTypeId}
          defaultValues={defaultValues}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

