import { useEventsTop } from "../../events/api/queries";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@radix-ui/react-separator";
import { useNavigate } from "react-router-dom";

dayjs.locale("fr");

export function HomeForms() {
   const a = useEventsTop();
   const data = a?.data ?? [];
   const navigate = useNavigate();

   console.log(data);

    return (
        <div className="h-full w-full p-6 bg-blue-100">
            <Card className="w-full border-0 shadow-none bg-transparent">
                <CardHeader className="space-y-1">
                    <CardTitle className="yeseva-one-regular text-3xl">📅 Vos prochains événements à venir</CardTitle>
                </CardHeader>
                <CardContent className="mt-5 space-y-6">
                    <div className="space-y-6">
                        {data.sort((a, b) => dayjs(a.startDate).isAfter(dayjs(b.startDate)) ? 1 : -1).slice(0, 3).map((event) => (
                            <>
                                <Label key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="space-y-6 text-lg yeseva-one-regular">
                                    <span>✦ </span>
                                    {event.name}{", "}
                                    {dayjs(event.startDate).format("DD/MM/YYYY")} {"- "}
                                    {dayjs(event.endDate).format("DD/MM/YYYY")}{", "}
                                    {event.location}
                                </Label>
                                
                                <Separator />
                            </>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-10 h-px w-1/3 mx-auto bg-black/30 rounded-full" />
            
            {/* Section des évènements conseillés */}
            <Card className="w-full border-0 shadow-none bg-transparent">
                <CardHeader className="space-y-1">
                    <CardTitle className="yeseva-one-regular text-3xl">⭐ Événements recommandés pour vous</CardTitle>
                </CardHeader>
                <CardContent className="mt-5 space-y-6">
                    <div className="space-y-6">
                        {data.map((event) => (
                            <>
                                <Label key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="space-y-6 text-lg yeseva-one-regular">
                                    <span className="text-sm">✦ </span>
                                    {event.name}{", "}
                                    {dayjs(event.startDate).format("DD/MM/YYYY")} {"- "}
                                    {dayjs(event.endDate).format("DD/MM/YYYY")}{", "}
                                    {event.location}
                                </Label>

                                <Separator />
                            </>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}