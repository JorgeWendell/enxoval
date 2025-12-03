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
import { CreateLinenItemForm } from "./create-linen-item-form";

export function CreateLinenItemDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Item de Enxoval</DialogTitle>
          <DialogDescription>
            Adicione um novo item individual ao sistema
          </DialogDescription>
        </DialogHeader>
        <CreateLinenItemForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

