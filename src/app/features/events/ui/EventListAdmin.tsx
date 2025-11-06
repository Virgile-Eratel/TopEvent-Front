import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { toast } from "react-hot-toast";
import { useForm, type Resolver } from "react-hook-form";

import { useUpdateEventMutation } from "@/app/features/event/api/queries";
import {
    EventCreateSchema,
    EventTypeEnum,
    type Event,
    type EventCreateInput,
} from "@/app/features/event/api/schema";
import { useAdminEventsList } from "@/app/features/events/api/queries";
import { Button } from "@/shared/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/shared/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

dayjs.locale("fr");

const selectClasses =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type EventFormValues = EventCreateInput;

export default function EventListAdmin() {
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useAdminEventsList();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const sortedEvents = useMemo(() => {
        return [...(data ?? [])].sort(
            (a, b) => a.startDate.getTime() - b.startDate.getTime(),
        );
    }, [data]);

    const openEditSheet = (event: Event) => {
        setSelectedEvent(event);
        setIsSheetOpen(true);
    };

    const handleSheetToggle = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) {
            setSelectedEvent(null);
        }
    };

    const handleEditSuccess = () => {
        setIsSheetOpen(false);
        setSelectedEvent(null);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold">Mes événements</h1>
                <div className="text-sm text-muted-foreground">
                    Chargement de vos événements...
                </div>
            </div>
        );
    }

    if (isError) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return (
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold">Mes événements</h1>
                <div className="text-sm text-destructive">
                    Une erreur est survenue : {message}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Mes événements</h1>
                <Button variant="outline" onClick={() => navigate("/admin/events/create")}>Nouveau</Button>
            </div>

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
                        <TableHead>Inscriptions</TableHead>
                        <TableHead className="w-[140px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEvents.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="py-10 text-center text-sm text-muted-foreground"
                            >
                                Aucun événement pour le moment.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedEvents.map((event) => (
                            <TableRow
                                key={String(event.id)}
                                role="link"
                                tabIndex={0}
                                className="cursor-pointer"
                                onClick={() => navigate(`/events/${event.id}`)}
                                onKeyDown={(evt) => {
                                    if (evt.key === "Enter" || evt.key === " ") {
                                        evt.preventDefault();
                                        navigate(`/events/${event.id}`);
                                    }
                                }}
                            >
                                <TableCell className="font-medium">{event.name}</TableCell>
                                <TableCell>
                                    {dayjs(event.startDate).format("DD/MM/YYYY HH:mm")}
                                </TableCell>
                                <TableCell>
                                    {dayjs(event.endDate).format("DD/MM/YYYY HH:mm")}
                                </TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell className="capitalize">
                                    {event.type ?? "-"}
                                </TableCell>
                                <TableCell>{event.isPublic ? "Oui" : "Non"}</TableCell>
                                <TableCell>{event.totalPlaces ?? "-"}</TableCell>
                                <TableCell>{event.subscriptions?.length ?? 0}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(evt) => {
                                            evt.stopPropagation();
                                            openEditSheet(event);
                                        }}
                                    >
                                        Modifier
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Sheet open={isSheetOpen} onOpenChange={handleSheetToggle}>
                <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
                    {selectedEvent ? (
                        <EventEditForm event={selectedEvent} onSuccess={handleEditSuccess} />
                    ) : (
                        <div className="p-6 text-sm text-muted-foreground">
                            Sélectionnez un événement à modifier.
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

type EventEditFormProps = {
    event: Event;
    onSuccess: () => void;
};

function EventEditForm({ event, onSuccess }: EventEditFormProps) {
    const { mutateAsync: updateEvent, isPending } = useUpdateEventMutation();

    const defaultValues = useMemo<EventFormValues>(
        () => ({
            name: event.name,
            description: event.description ?? "",
            location: event.location,
            type: event.type ?? EventTypeEnum.enum.concert,
            isPublic: event.isPublic,
            startDate: dayjs(event.startDate).format("YYYY-MM-DDTHH:mm"),
            endDate: dayjs(event.endDate).format("YYYY-MM-DDTHH:mm"),
            limitSubscriptionDate: event.limitSubscriptionDate
                ? dayjs(event.limitSubscriptionDate).format("YYYY-MM-DDTHH:mm")
                : null,
            totalPlaces: event.totalPlaces,
        }),
        [event],
    );

    const form = useForm<EventFormValues>({
        resolver: zodResolver(EventCreateSchema) as Resolver<EventFormValues>,
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const typeOptions = EventTypeEnum.options;

    const onSubmit = async (values: EventFormValues) => {
        form.clearErrors("root");

        const payload: EventFormValues = {
            ...values,
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
            limitSubscriptionDate: values.limitSubscriptionDate
                ? new Date(values.limitSubscriptionDate).toISOString()
                : null,
            totalPlaces:
                values.totalPlaces === null || values.totalPlaces === undefined
                    ? null
                    : Number(values.totalPlaces),
        };

        try {
            await updateEvent({ eventId: event.id, values: payload });
            toast.success("Événement mis à jour avec succès !");
            onSuccess();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la mise à jour de l'événement.";
            form.setError("root", { type: "manual", message });
            toast.error(message);
        }
    };

    return (
        <>
            <SheetHeader className="px-6 pt-6">
                <SheetTitle>Modifier un événement</SheetTitle>
                <SheetDescription>{event.name}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Nom de l&apos;événement</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Concert de Jazz"
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className={cn(selectClasses, "capitalize")}
                                            >
                                                {typeOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormDescription>
                                            Choisissez la catégorie la plus adaptée.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibilité</FormLabel>
                                        <FormControl>
                                            <select
                                                className={selectClasses}
                                                value={field.value ? "true" : "false"}
                                                onChange={(event) =>
                                                    field.onChange(event.target.value === "true")
                                                }
                                            >
                                                <option value="true">Public</option>
                                                <option value="false">Privé</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="totalPlaces"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de places</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="100"
                                                value={field.value ?? ""}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    field.onChange(value === "" ? null : Number(value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Laissez vide si le nombre de places est illimité.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            rows={5}
                                            className={textareaClasses}
                                            placeholder="Un magnifique concert de jazz avec des artistes locaux"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lieu</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Salle de spectacle, Paris"
                                            autoComplete="off"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de début</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de fin</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="limitSubscriptionDate"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Date limite d&apos;inscription</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                value={field.value ?? ""}
                                                onChange={(event) =>
                                                    field.onChange(
                                                        event.target.value === ""
                                                            ? null
                                                            : event.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optionnel. Doit être antérieur au début de l&apos;événement.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.formState.errors.root && (
                            <p className="text-sm font-medium text-destructive">
                                {form.formState.errors.root.message}
                            </p>
                        )}

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
}