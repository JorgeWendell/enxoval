"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UpdateRoomStatusForm } from "./update-room-status-form";

interface UpdateRoomStatusDialogProps {
  roomId: string;
  currentStatus: "disponivel" | "ocupado" | "limpeza" | "manutencao" | "reservado";
}

export function UpdateRoomStatusDialog({
  roomId,
  currentStatus,
}: UpdateRoomStatusDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Alterar Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Status do Quarto</DialogTitle>
          <DialogDescription>
            Altere o status atual do quarto
          </DialogDescription>
        </DialogHeader>
        <UpdateRoomStatusForm
          roomId={roomId}
          currentStatus={currentStatus}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

