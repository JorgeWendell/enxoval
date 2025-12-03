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
import { EditRoomForm } from "./edit-room-form";

interface EditRoomDialogProps {
  roomId: string;
  defaultValues: {
    number: string;
    floor: number;
    type: "single" | "double" | "triple" | "suite" | "master";
    capacity: number;
    description: string | null;
    status: "disponivel" | "ocupado" | "limpeza" | "manutencao" | "reservado";
  };
}

export function EditRoomDialog({ roomId, defaultValues }: EditRoomDialogProps) {
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
          <DialogTitle>Editar Quarto</DialogTitle>
          <DialogDescription>
            Atualize as informações do quarto
          </DialogDescription>
        </DialogHeader>
        <EditRoomForm
          roomId={roomId}
          defaultValues={defaultValues}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

