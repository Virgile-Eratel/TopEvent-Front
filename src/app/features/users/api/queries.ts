import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { httpPatch } from "@/shared/lib/http";

import { UserSchema, UserUpdateSchema, type User, type UserUpdateInput } from "./schema";

const UpdateUserResponseSchema = z.object({
    data: UserSchema,
});

type UpdateUserVariables = {
    id: number;
    values: UserUpdateInput;
};

async function updateUserRequest({ id, values }: UpdateUserVariables): Promise<User> {
    const body = UserUpdateSchema.parse(values);
    const json = await httpPatch<typeof body, unknown>(`/user/${id}`, body);
    
    const parsed = UpdateUserResponseSchema.parse(json);
    return parsed.data;
}

export function useUpdateUserMutation() {
    return useMutation({
        mutationFn: updateUserRequest,
    });
}

