import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/app/features/auth/context/AuthContext";
import { UserUpdateSchema, type UserUpdateInput } from "@/app/features/users/api/schema";
import { useUpdateUserMutation } from "@/app/features/users/api/queries";

type UserUpdateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function UserUpdateDialog({ open, onOpenChange }: UserUpdateDialogProps) {
    const { user, updateUser } = useAuth();
    const { mutateAsync: updateAccount, isPending } = useUpdateUserMutation();

    const form = useForm<UserUpdateInput>({
        resolver: zodResolver(UserUpdateSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            mail: "",
        },
    });

    useEffect(() => {
        if (user && open) {
            form.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                mail: user.mail,
            });
        }
    }, [user, open, form]);

    const onSubmit = async (values: UserUpdateInput) => {
        if (!user) return;

        try {
            const updatedUser = await updateAccount({ id: user.id, values });
            updateUser(updatedUser);
            toast.success("Profil mis à jour avec succès !");
            onOpenChange(false);
        } catch (error) {
             const message =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la mise à jour du profil.";
            toast.error(message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier mon profil</DialogTitle>
                    <DialogDescription>
                        Mettez à jour vos informations personnelles ici.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jean" {...field} />
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
                                        <Input placeholder="Dupont" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="mail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="jean.dupont@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Enregistrement..." : "Enregistrer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

