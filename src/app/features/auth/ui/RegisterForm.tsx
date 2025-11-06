import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
import { cn } from "@/shared/lib/utils";
import { queueToastAfterRedirect } from "@/shared/lib/toast";

import { RegisterSchema, type RegisterInput } from "../api/schema";
import { useRegisterMutation } from "../api/queries";
import { UserRoleEnum } from "@/app/features/users/api/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/features/auth/context/AuthContext";

const selectClasses =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function RegisterForm() {
    const form = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            mail: "",
            password: "",
            role: "user",
        },
    });
    const { mutateAsync: register, isPending } = useRegisterMutation();
    const { login: authenticate } = useAuth();
    const navigate = useNavigate();

    const roleOptions = UserRoleEnum.options;

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

    const onSubmit = async (values: RegisterInput) => {
        form.clearErrors("root");

        try {
            const auth = await register(values);
            authenticate(auth);
            queueToastAfterRedirect({ type: "success", message: "Compte créé avec succès !" });
            redirectAfterSuccess();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la création du compte.";
            form.setError("root", { type: "manual", message });
            toast.error(message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" autoComplete="given-name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" autoComplete="family-name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                                    autoComplete="new-password"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>6 caractères minimum.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rôle</FormLabel>
                            <FormControl>
                                <select
                                    {...field}
                                    className={cn(selectClasses, "capitalize")}
                                >
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role} className="capitalize">
                                            {role === "admin" ? "Organisateur" : "Utilisateur"}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormDescription>
                                Choisissez le rôle attribué au compte.
                            </FormDescription>
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
                    {isPending ? "Création en cours..." : "Créer le compte"}
                </Button>
            </form>
        </Form>
    );
}

