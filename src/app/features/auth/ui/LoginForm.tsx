import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Button } from "@/shared/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { queueToastAfterRedirect } from "@/shared/lib/toast";

import { useAuth } from "@/app/features/auth/context/AuthContext";

import { LoginSchema, type LoginInput } from "../api/schema";
import { useLoginMutation } from "../api/queries";

export function LoginForm() {
    const form = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            mail: "",
            password: "",
        },
    });
    const { mutateAsync: login, isPending } = useLoginMutation();
    const { login: authenticate } = useAuth();
    const navigate = useNavigate();

    const redirectAfterSuccess = () => {
        if (typeof window === "undefined") {
            navigate("/", { replace: true });
            return;
        }

        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/", { replace: true });
        }
    };

    const onSubmit = async (values: LoginInput) => {
        form.clearErrors("root");

        try {
            const auth = await login(values);
            authenticate(auth);
            queueToastAfterRedirect({ type: "success", message: "Connexion réussie !" });
            redirectAfterSuccess();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Une erreur est survenue, vérifiez vos identifiants.";
            form.setError("root", { type: "manual", message });
            toast.error(message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="mail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresse email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="exemple@test.com"
                                    autoComplete="email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="********"
                                    autoComplete="current-password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.root.message}
                    </p>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Connexion..." : "Se connecter"}
                </Button>
            </form>
        </Form>
    );
}

