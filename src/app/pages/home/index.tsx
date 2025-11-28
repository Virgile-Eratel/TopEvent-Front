import { useAuth } from "@/app/features/auth/context/AuthContext";
import HomeSubscription from "@/app/features/home/ui/HomeSubscription";
import { HomeTopEvent } from "@/app/features/home/ui/HomeTopEvent";

export default function HomePage() {
    const {isAuthenticated} = useAuth();


    return (
        <div className="flex flex-col item-center justify-center h-full w-full bg-gradient-to-br from-indigo-100 via-pink-100 to-red-200">
            {isAuthenticated && (
                <HomeSubscription />
            )}
            <HomeTopEvent />
        </div>
    );
}
