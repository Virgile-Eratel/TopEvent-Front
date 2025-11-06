import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Button } from "@/shared/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";
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
import { cn } from "@/shared/lib/utils";

import {
    EventCreateSchema,
    EventTypeEnum,
    type EventCreateInput,
} from "@/app/features/event/api/schema";
import { useCreateEventMutation } from "@/app/features/event/api/queries";

const selectClasses =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function EventCreate() {
    const navigate = useNavigate();
    const { mutateAsync: createEvent, isPending } = useCreateEventMutation();

    const defaultValues: EventCreateInput = {
        name: "",
        description: "",
        location: "",
        type: EventTypeEnum.enum.concert,
        isPublic: true,
        startDate: "",
        endDate: "",
        limitSubscriptionDate: null,
        totalPlaces: null,
    };

    const form = useForm<EventCreateInput>({
        resolver: zodResolver(EventCreateSchema) as Resolver<EventCreateInput>,
        defaultValues,
    });

    const typeOptions = EventTypeEnum.options;

    const onSubmit = async (values: EventCreateInput) => {
        form.clearErrors("root");

        const payload: EventCreateInput = {
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
            const created = await createEvent(payload);
            toast.success("Événement créé avec succès !");
            form.reset(defaultValues);
            navigate(`/events/${created.id}`);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la création de l'événement.";
            form.setError("root", { type: "manual", message });
            toast.error(message);
        }
    };

    return (
        <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 p-6">
        <div>
                <Button
                    type="button"
                    variant="ghost"
                    className="w-fit"
                    onClick={() => navigate(-1)}
                >
                    &larr; Retour
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Créer un événement</CardTitle>
                    <CardDescription>
                        Renseignez l&apos;ensemble des informations nécessaires pour publier votre
                        événement.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                {isPending ? "Création en cours..." : "Créer l'événement"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}