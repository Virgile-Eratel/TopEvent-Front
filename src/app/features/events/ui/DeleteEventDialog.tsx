import { useState } from "react";
import { toast } from "react-hot-toast";

import { useDeleteEventMutation } from "@/app/features/event/api/queries";
import { type Event } from "@/app/features/event/api/schema";
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";

type DeleteEventDialogProps = {
    event: Event | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function DeleteEventDialog({
    event,
    open,
    onOpenChange,
    onSuccess,
}: DeleteEventDialogProps) {
    const { mutateAsync: deleteEvent, isPending } = useDeleteEventMutation();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!event) return;

        setIsDeleting(true);
        try {
            await deleteEvent(event.id);
            toast.success("Événement supprimé avec succès !");
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la suppression de l'événement.";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer l&apos;événement</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer l&apos;événement{" "}
                        <strong>&quot;{event?.name}&quot;</strong> ? Cette action est
                        irréversible et toutes les inscriptions associées seront également
                        supprimées.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending || isDeleting}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending || isDeleting}
                    >
                        {isPending || isDeleting ? "Suppression..." : "Supprimer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

