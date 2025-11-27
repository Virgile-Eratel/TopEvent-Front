import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useState } from "react";
import { useUserSubscriptions } from "@/app/features/subscriptions/api/queries";
import { useEvent } from "@/app/features/events/api/queries";
import { type Subscription } from "@/app/features/subscriptions/api/schema";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

dayjs.locale("fr");

function SubscriptionRow({ subscription }: { subscription: Subscription }) {
    const navigate = useNavigate();
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const { data: event, isLoading: isLoadingEvent } = useEvent(subscription.eventId);

    if (isLoadingEvent) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Chargement de l'événement...
                </TableCell>
            </TableRow>
        );
    }

    if (!event) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">
                    Événement introuvable
                </TableCell>
            </TableRow>
        );
    }

    return (
        <>
            <TableRow>
                <TableCell 
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => navigate(`/events/${event.id}`)}
                >
                    {event.name}
                </TableCell>
                <TableCell>
                    {dayjs(event.startDate).format("DD/MM/YYYY HH:mm")}
                </TableCell>
                <TableCell>
                    {dayjs(event.endDate).format("DD/MM/YYYY HH:mm")}
                </TableCell>
                <TableCell>
                    {dayjs(subscription.subscriptionDate).format("DD/MM/YYYY HH:mm")}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">Inscrit</Badge>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsCancelDialogOpen(true)}
                        >
                            Se désinscrire
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
            <CancelSubscriptionDialog
                subscription={subscription}
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
            />
        </>
    );
}

export default function SubscriptionList() {
    const { data, isLoading, isError, error } = useUserSubscriptions();

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold">Mes inscriptions</h1>
                <div className="text-sm text-muted-foreground">
                    Chargement de vos inscriptions...
                </div>
            </div>
        );
    }

    if (isError) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return (
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold">Mes inscriptions</h1>
                <div className="text-sm text-destructive">
                    Une erreur est survenue : {message}
                </div>
            </div>
        );
    }

    const subscriptions = data ?? [];
    const sortedSubscriptions = [...subscriptions].sort(
        (a, b) => b.subscriptionDate.getTime() - a.subscriptionDate.getTime()
    );

    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-semibold">Mes inscriptions</h1>

            {subscriptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                    Vous n'êtes inscrit à aucun événement pour le moment.
                </div>
            ) : (
                <>
                    <div className="mb-3 text-sm text-muted-foreground">
                        Nombre d'inscriptions : {subscriptions.length}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Événement</TableHead>
                                <TableHead>Date de début</TableHead>
                                <TableHead>Date de fin</TableHead>
                                <TableHead>Date d'inscription</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSubscriptions.map((subscription) => (
                                <SubscriptionRow
                                    key={subscription.id}
                                    subscription={subscription}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
        </div>
    );
}
