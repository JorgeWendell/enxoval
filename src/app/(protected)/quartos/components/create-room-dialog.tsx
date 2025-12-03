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
import { CreateRoomForm } from "./create-room-form";

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Quarto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Quarto</DialogTitle>
          <DialogDescription>
            Adicione um novo quarto ao sistema
          </DialogDescription>
        </DialogHeader>
        <CreateRoomForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

