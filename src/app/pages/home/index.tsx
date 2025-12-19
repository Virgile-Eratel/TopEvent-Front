import { useAuth } from "@/app/features/auth/context/AuthContext";
import HomeSubscription from "@/app/features/home/ui/HomeSubscription";
import { HomeTopEvent } from "@/app/features/home/ui/HomeTopEvent";

export default function HomePage() {
    const {isAuthenticated} = useAuth();


    return (
        <div className="flex flex-col item-center justify-center h-full w-full">
            {isAuthenticated && (
                <HomeSubscription />
            )}
            <HomeTopEvent />
        </div>
    );
}
