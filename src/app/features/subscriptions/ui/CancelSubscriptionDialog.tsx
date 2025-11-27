import { useState } from "react";
import { toast } from "react-hot-toast";

import { useCancelSubscriptionMutation } from "@/app/features/subscriptions/api/queries";
import { type Subscription } from "@/app/features/subscriptions/api/schema";
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";

type CancelSubscriptionDialogProps = {
    subscription: Subscription | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function CancelSubscriptionDialog({
    subscription,
    open,
    onOpenChange,
    onSuccess,
}: CancelSubscriptionDialogProps) {
    const { mutateAsync: cancelSubscription, isPending } = useCancelSubscriptionMutation();
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (!subscription) return;

        setIsCancelling(true);
        try {
            await cancelSubscription(subscription.id);
            toast.success("Désinscription réussie !");
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la désinscription.";
            toast.error(message);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Se désinscrire de l&apos;événement</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir vous désinscrire de cet événement ? Cette action
                        peut être annulée en vous réinscrivant si des places sont encore disponibles.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending || isCancelling}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isPending || isCancelling}
                    >
                        {isPending || isCancelling ? "Désinscription..." : "Se désinscrire"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

