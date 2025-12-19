import { useUserSubscriptions } from "../../subscriptions/api/queries";
import { type Subscription } from "@/app/features/subscriptions/api/schema";
import { useEvent } from "../../events/api/queries";
import dayjs from "dayjs";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@radix-ui/react-separator";

const getDayRaining = (date: Date | undefined): number | undefined => {
    if (!date)
        return undefined;

    const today = dayjs().startOf("day");
    const target = dayjs(date).startOf("day");

    return target.diff(today, "day")
}

const SubscriptionRow = ({ subscription }: { subscription: Subscription}) => {
    const { data: event, isLoading: isLoadingEvent } = useEvent(subscription.eventId);
    const dayRaining = getDayRaining(event?.startDate);

    if (isLoadingEvent) {
        return (
            <div className="p-6">
                <div className="text-sm text-muted-foreground">
                    Chargement de l'évènement...
                </div>
            </div>
        );
    }

    return (
        <>
            {event ?
                <Label className="space-y-6 text-lg">
                    Plus que <b>{dayRaining} jours</b> avant votre évènement {event.name} à <i>{event.location}</i>.
                </Label>

                :
                <></>
            }
        </>
    )
}


export default function HomeSubscription() {
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
        (a, b) => a.subscriptionDate.getTime() - b.subscriptionDate.getTime()
    );

    return (
        <div className="flex justify-center h-full w-full p-6 poppins-regular">
            <div className="space-y-15">
                <h1 className="mt-5 text-3xl text-center">📅 Vos prochains événements à venir</h1>

                <div className="space-y-6">
                    {sortedSubscriptions.length > 0 ? (
                        <>
                            {sortedSubscriptions.map((sub: Subscription) => (
                                <div key={sub.id}>
                                    <span className="text-sm">✦ </span>
                                    <SubscriptionRow subscription={sub}/>
                                </div>
                            ))}

                            <Separator className="mt-20 h-px w-1/3 mx-auto bg-black/30 rounded-full" />
                        </>
                    ) : (
                        <>
                            <Label className="text-lg">
                                Vous n'avez pas d'évènements à venir. Inscrivez-vous dès maintenant !
                            </Label>

                            <Separator className="mt-20 h-px w-1/3 mx-auto bg-black/30 rounded-full" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}