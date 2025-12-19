import { useEventsTop } from "../../events/api/queries";
import dayjs from "dayjs";
import { Label } from "@/shared/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

dayjs.locale("fr");

export function HomeTopEvent() {
    const navigate = useNavigate();
    const a = useEventsTop();
    const data = a?.data ?? [];


    return (
        <div className="flex justify-center h-full w-full p-6">
            <div className="space-y-15">
                <h1 className="text-3xl text-center">⭐ Événements recommandés pour vous</h1>
                
                <div className="space-y-6">
                    {data.map((event) => (
                        <div key={event.id} className="flex item-center gap-20">
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm text-center">✦ </span>
                                <Label className="text-lg">
                                    <i>{event.location}</i>
                                    {", l'évènement "}
                                    {event.name}{", se déroulera le "}
                                    {dayjs(event.startDate).format("dddd DD MMMM YYYY")} {"à "}
                                    {dayjs(event.startDate).format("H")}{"H. "}
                                </Label>
                            </div>

                            <div className="ml-auto">
                                <Button onClick={() => navigate(`/events/${event.id}`)}
                                        className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition">
                                    Voir le détail
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}