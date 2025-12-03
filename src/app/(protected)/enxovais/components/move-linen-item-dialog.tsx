"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoveLinenItemForm } from "./move-linen-item-form";

interface MoveLinenItemDialogProps {
  linenItemId: string;
  currentRoomId: string | null;
}

export function MoveLinenItemDialog({
  linenItemId,
  currentRoomId,
}: MoveLinenItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Mover
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover Item</DialogTitle>
          <DialogDescription>
            Mova este item para outro quarto ou altere seu status
          </DialogDescription>
        </DialogHeader>
        <MoveLinenItemForm
          linenItemId={linenItemId}
          currentRoomId={currentRoomId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

