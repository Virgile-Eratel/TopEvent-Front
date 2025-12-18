import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useEffect, useMemo, useState } from "react";
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPageSize,
    PaginationPrevious,
} from "@/shared/components/ui/pagination";

dayjs.locale("fr");

const DEFAULT_PAGE_SIZE = 10;

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
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const sortedSubscriptions = useMemo(() => {
        const subscriptions = data ?? [];
        return [...subscriptions].sort(
            (a, b) => b.subscriptionDate.getTime() - a.subscriptionDate.getTime()
        );
    }, [data]);

    // Pagination calculations
    const totalPages = Math.ceil(sortedSubscriptions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSubscriptions = sortedSubscriptions.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Reset page when page size changes
    // (so we don't end up on a page number that doesn't exist anymore)
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

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

    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-semibold">Mes inscriptions</h1>

            {sortedSubscriptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                    Vous n'êtes inscrit à aucun événement pour le moment.
                </div>
            ) : (
                <>
                    <div className="mb-3 text-sm text-muted-foreground">
                        Nombre d'inscriptions : {sortedSubscriptions.length} {totalPages > 1 && `(Page ${currentPage}/${totalPages})`}
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
                            {paginatedSubscriptions.map((subscription) => (
                                <SubscriptionRow
                                    key={subscription.id}
                                    subscription={subscription}
                                />
                            ))}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="mt-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <PaginationPageSize
                                    value={pageSize}
                                    onValueChange={(next) => {
                                        setPageSize(next);
                                        setCurrentPage(1);
                                    }}
                                />
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => goToPage(currentPage - 1)}
                                                aria-disabled={currentPage === 1}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <PaginationItem key={pageNum}>
                                                    <PaginationLink
                                                        onClick={() => goToPage(pageNum)}
                                                        isActive={currentPage === pageNum}
                                                        className="cursor-pointer"
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => goToPage(currentPage + 1)}
                                                aria-disabled={currentPage === totalPages}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
