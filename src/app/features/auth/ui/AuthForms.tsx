import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthView = "login" | "register";

export function AuthForms() {
    const [view, setView] = useState<AuthView>("login");

    const isLogin = view === "login";
    const title = isLogin ? "Connexion" : "Créer un compte";
    const description = isLogin
        ? "Accédez à votre espace en utilisant vos identifiants."
        : "Renseignez vos informations pour rejoindre la plateforme.";

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Bienvenue sur TopEvent</h1>
                <p className="text-muted-foreground">
                    {isLogin
                        ? "Connectez-vous pour retrouver vos événements."
                        : "Créez un compte pour organiser ou suivre vos événements."}
                </p>
            </div>

            <Card className="border-primary/20 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLogin ? <LoginForm /> : <RegisterForm />}

                    <div className="space-y-1 text-center ">
                        <p className="text-sm text-muted-foreground">
                            {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
                            <span
                                onClick={() => setView(isLogin ? "register" : "login")}
                                className="cursor-pointer text-primary hover:underline"
                                tabIndex={0}
                                role="button"
                                onKeyDown={e => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        setView(isLogin ? "register" : "login");
                                    }
                                }}
                            >
                                {isLogin ? "Créer un compte" : "Se connecter"}
                            </span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default AuthForms;

