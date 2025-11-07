import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useMemo } from "react";
import { useEvent } from "@/app/features/events/api/queries";
import { Badge } from "@/shared/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/app/features/auth/context/AuthContext";
import { useCreateSubscriptionMutation } from "@/app/features/subscriptions/api/queries";
import { toast } from "react-hot-toast";

dayjs.locale("fr");

type EventDetailProps = {
    backLink?: string;
    hideSubscriptionButton?: boolean;
};

export default function EventDetail({ backLink = "/events", hideSubscriptionButton = false }: EventDetailProps) {
    const params = useParams<{ eventId: string }>();
    const eventIdParam = params.eventId;
    const { user, isAuthenticated } = useAuth();
    const { mutateAsync: createSubscription, isPending: isSubscribing } = useCreateSubscriptionMutation();
    
    const eventId = useMemo(() => {
        if (!eventIdParam) return null;
        const numeric = Number(eventIdParam);
        return Number.isFinite(numeric) ? numeric : null;
    }, [eventIdParam]);

    const isValidId = typeof eventId === "number" && eventId >= 0;
    const {
        data: event,
        isLoading,
        isError,
        error,
    } = useEvent(isValidId ? eventId : 0);

    if (!eventIdParam || !isValidId) {
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <div className="text-sm text-destructive">
                    Identifiant d&apos;événement invalide.
                </div>
                <Button asChild variant="ghost" className="w-fit">
                    <Link to={backLink}>&larr; Retour à la liste</Link>
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <div className="h-8 w-56 animate-pulse rounded bg-muted" />
                <div className="h-48 w-full animate-pulse rounded-xl bg-muted" />
            </div>
        );
    }

    if (isError) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle>Impossible de charger l&apos;événement</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild variant="ghost">
                            <Link to={backLink}>&larr; Retour à la liste</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Événement introuvable</CardTitle>
                        <CardDescription>
                            L&apos;événement demandé n&apos;existe pas ou n&apos;est plus disponible.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild variant="ghost">
                            <Link to={backLink}>&larr; Retour à la liste</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const availablePlaces = event.totalPlaces 
        ? event.totalPlaces - (event.currentSubscribers ?? 0)
        : null;
    const hasAvailablePlaces = availablePlaces === null || availablePlaces > 0;
    
    const isUserSubscribed = user && event.subscriptions.some(
        (sub) => sub.userId === user.id
    );
    
    const isSubscriptionClosed = event.limitSubscriptionDate 
        ? dayjs().isAfter(dayjs(event.limitSubscriptionDate))
        : false;

    const handleSubscribe = async () => {
        if (!eventId) return;
        
        try {
            await createSubscription({ eventId });
            toast.success("Inscription réussie !");
        } catch (error) {
            const message = error instanceof Error 
                ? error.message 
                : "Une erreur est survenue lors de l'inscription.";
            toast.error(message);
        }
    };

    const duration = `${dayjs(event.startDate).format("DD MMMM YYYY HH:mm")} → ${dayjs(event.endDate).format("DD MMMM YYYY HH:mm")}`;
    const limitDate = event.limitSubscriptionDate
        ? dayjs(event.limitSubscriptionDate).format("DD MMMM YYYY HH:mm")
        : "Aucune";

    return (
        <div className="mx-auto flex max-w-4xl flex-1 flex-col gap-6 p-6">
            <Button asChild variant="ghost" className="w-fit">
                <Link to={backLink}>&larr; Retour à la liste</Link>
            </Button>

            <Card>
                <CardHeader className="gap-3">
                    <div className="flex items-center gap-3">
                        <CardTitle>{event.name}</CardTitle>
                        {event.type && (
                            <Badge className="capitalize" variant="secondary">
                                {event.type}
                            </Badge>
                        )}
                        <Badge variant={event.isPublic ? "default" : "outline"}>
                            {event.isPublic ? "Public" : "Privé"}
                        </Badge>
                    </div>
                    {event.description && (
                        <CardDescription>{event.description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                            <dt className="text-muted-foreground">Horaires</dt>
                            <dd className="text-right font-medium">{duration}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                            <dt className="text-muted-foreground">Lieu</dt>
                            <dd className="text-right font-medium">{event.location}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                            <dt className="text-muted-foreground">Clôture des inscriptions</dt>
                            <dd className="text-right font-medium">{limitDate}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Places disponibles</dt>
                            <dd className="text-right font-medium">
                                {availablePlaces !== null 
                                    ? `${availablePlaces} / ${event.totalPlaces}` 
                                    : "Illimité"}
                            </dd>
                        </div>
                    </dl>

                    <div className="space-y-4 rounded-lg border border-border/60 p-4">
                        <h2 className="text-lg font-semibold">Organisateur</h2>
                        <div className="text-sm font-medium">
                            {event.createdBy
                                ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
                                : "Non renseigné"}
                        </div>
                        {event.createdBy && (
                            <div className="text-sm text-muted-foreground">
                                <div>{event.createdBy.mail}</div>
                            </div>
                        )}
                    </div>
                </CardContent>
                {!hideSubscriptionButton && (
                    <CardFooter className="flex-col items-stretch gap-4">
                        {event.isPublic && (
                            <div className="flex items-center justify-center">
                                {!isAuthenticated ? (
                                    <Button asChild variant="outline">
                                        <Link to="/auth">Connectez-vous pour vous inscrire</Link>
                                    </Button>
                                ) : isUserSubscribed ? (
                                    <Badge variant="secondary" className="px-4 py-2">
                                        Vous êtes déjà inscrit
                                    </Badge>
                                ) : isSubscriptionClosed ? (
                                    <Badge variant="outline" className="px-4 py-2">
                                        Inscriptions closes
                                    </Badge>
                                ) : !hasAvailablePlaces ? (
                                    <Badge variant="outline" className="px-4 py-2">
                                        Plus de places disponibles
                                    </Badge>
                                ) : (
                                    <Button 
                                        onClick={handleSubscribe} 
                                        disabled={isSubscribing}
                                        className="w-full md:w-auto"
                                    >
                                        {isSubscribing ? "Inscription..." : "S'inscrire"}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}