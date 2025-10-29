"use client";

import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ManualTriggerDialog = ({
  open,
  onOpenChange
}: Props) => {


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AlertDialogHeader>
          <DialogTitle>Manual Trigger</DialogTitle>
          <DialogDescription>
            Configure settings for the manual trigger node.
          </DialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Used to manually execute a workflow, no configuration available.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
