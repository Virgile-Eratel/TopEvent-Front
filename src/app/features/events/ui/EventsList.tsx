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

dayjs.locale("fr");

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

    const debouncedSearch = useDebounce(search, 500);
    const debouncedLocation = useDebounce(location, 500);

    const filters = {
        search: debouncedSearch || undefined,
        location: debouncedLocation || undefined,
        category: category === "all" ? undefined : category,
        date: date || undefined,
    };

    const { data, isLoading, isError, error } = useEventsList(filters);
    const navigate = useNavigate();

    const sortedEvents = [...(data ?? [])].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    const resetFilters = () => {
        setSearch("");
        setLocation("");
        setCategory(undefined);
        setDate("");
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
                {isLoading ? "Chargement..." : `Résultats : ${sortedEvents.length}`}
            </div>

            {isError ? (
                <div className="text-sm text-destructive">
                    Une erreur est survenue : {error instanceof Error ? error.message : "Erreur inconnue"}
                </div>
            ) : (
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
            )}
        </div>
    );
}
