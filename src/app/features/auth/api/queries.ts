import { useMutation } from "@tanstack/react-query";

import { httpPost } from "@/shared/lib/http";

import { AuthResponseSchema, LoginSchema, RegisterSchema } from "./schema";
import type { AuthResponse, LoginInput, RegisterInput } from "./schema";

async function registerRequest(payload: RegisterInput): Promise<AuthResponse> {
    const body = RegisterSchema.parse(payload);
    const json = await httpPost<typeof body, unknown>("/user/create", body);

    return AuthResponseSchema.parse(json);
}

async function loginRequest(payload: LoginInput): Promise<AuthResponse> {
    const body = LoginSchema.parse(payload);
    const json = await httpPost<typeof body, unknown>("/user/login", body);

    return AuthResponseSchema.parse(json);
}

export function useRegisterMutation() {
    return useMutation({
        mutationFn: registerRequest,
    });
}

export function useLoginMutation() {
    return useMutation({
        mutationFn: loginRequest,
    });
}

