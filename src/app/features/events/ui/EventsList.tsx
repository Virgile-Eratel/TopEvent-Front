import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useEventsList } from "@/app/features/events/api/queries";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";

dayjs.locale("fr");

export default function EventsList() {
    const { data, isLoading, isError, error } = useEventsList();

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold">Événements</h1>
                <div className="text-sm text-muted-foreground">
                    Chargement des événements...
                </div>
            </div>
        );
    }

    if (isError) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return (
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold">Événements</h1>
                <div className="text-sm text-destructive">
                    Une erreur est survenue : {message}
                </div>
            </div>
        );
    }

    const sortedEvents = [...(data ?? [])].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-semibold">Événements</h1>

            <div className="mb-3 text-sm text-muted-foreground">
                Résultats : {sortedEvents.length}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Fin</TableHead>
                        <TableHead>Lieu</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Public</TableHead>
                        <TableHead>Places</TableHead>
                        <TableHead>Créé par</TableHead>
                        <TableHead>Inscriptions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEvents.map((e) => (
                        <TableRow key={String(e.id)}>
                            <TableCell className="font-medium">{e.name}</TableCell>
                            <TableCell>
                                {dayjs(e.startDate).format("DD/MM/YYYY HH:mm")}
                            </TableCell>
                            <TableCell>
                                {dayjs(e.endDate).format("DD/MM/YYYY HH:mm")}
                            </TableCell>
                            <TableCell>{e.location}</TableCell>
                            <TableCell className="capitalize">
                                {e.type ?? "-"}
                            </TableCell>
                            <TableCell>{e.isPublic ? "Oui" : "Non"}</TableCell>
                            <TableCell>{e.totalPlaces ?? "-"}</TableCell>
                            <TableCell>
                                {e.createdBy
                                    ? `${e.createdBy.firstName} ${e.createdBy.lastName}`
                                    : "-"}
                            </TableCell>
                            <TableCell>{e.subscriptions?.length ?? 0}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}