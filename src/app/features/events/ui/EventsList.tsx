import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/shared/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { EventTypeEnum } from "@/app/features/event/api/schema";
import { Button } from "@/shared/components/ui/button";
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

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function EventsList() {
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [date, setDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const debouncedSearch = useDebounce(search, 500);
    const debouncedLocation = useDebounce(location, 500);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, debouncedLocation, category, date, pageSize]);

    const filters = {
        search: debouncedSearch || undefined,
        location: debouncedLocation || undefined,
        category: category === "all" ? undefined : category,
        date: date || undefined,
        page: currentPage,
        limit: pageSize,
    };

    const { data, isLoading, isError, error } = useEventsList(filters);
    const navigate = useNavigate();

    const sortedEvents = [...(data ?? [])].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    // Determine if there are more pages
    const hasNextPage = sortedEvents.length === pageSize;
    const hasPreviousPage = currentPage > 1;

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const resetFilters = () => {
        setSearch("");
        setLocation("");
        setCategory(undefined);
        setDate("");
        setCurrentPage(1);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col gap-4 mb-6">
                <h1 className="text-2xl font-semibold">Événements</h1>

                <div className="grid gap-4 md:grid-cols-5 items-end">
                    <Input
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Input
                        placeholder="Lieu..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            {EventTypeEnum.options.map((type) => (
                                <SelectItem key={type} value={type} className="capitalize">
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Button variant="outline" onClick={resetFilters}>
                        Réinitialiser
                    </Button>
                </div>
            </div>

            <div className="mb-3 text-sm text-muted-foreground">
                {isLoading
                    ? "Chargement..."
                    : `Résultats : ${sortedEvents.length} (Page ${currentPage})`}
            </div>

            {isError ? (
                <div className="text-sm text-destructive">
                    Une erreur est survenue : {error instanceof Error ? error.message : "Erreur inconnue"}
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
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
                                {isLoading && sortedEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            Chargement des événements...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            Aucun événement trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedEvents.map((e) => (
                                        <TableRow
                                            key={String(e.id)}
                                            role="link"
                                            tabIndex={0}
                                            className="cursor-pointer opacity-100 transition-opacity data-[loading=true]:opacity-50"
                                            data-loading={isLoading}
                                            onClick={() => navigate(`/events/${e.id}`)}
                                            onKeyDown={(evt) => {
                                                if (evt.key === "Enter" || evt.key === " ") {
                                                    evt.preventDefault();
                                                    navigate(`/events/${e.id}`);
                                                }
                                            }}
                                        >
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
                                            <TableCell>{e.currentSubscribers ?? 0}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {(hasPreviousPage || hasNextPage) && (
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
                                                aria-disabled={!hasPreviousPage}
                                                className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {currentPage > 1 && (
                                            <PaginationItem>
                                                <PaginationLink onClick={() => goToPage(1)}>
                                                    1
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}

                                        <PaginationItem>
                                            <PaginationLink isActive>
                                                {currentPage}
                                            </PaginationLink>
                                        </PaginationItem>

                                        {hasNextPage && (
                                            <PaginationItem>
                                                <PaginationLink onClick={() => goToPage(currentPage + 1)}>
                                                    {currentPage + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => goToPage(currentPage + 1)}
                                                aria-disabled={!hasNextPage}
                                                className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
