"use client";
import React, { useState } from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { useAuthContext } from "@/context/auth-provider";
import { changePasswordMutationFn, changeEmailMutationFn } from "@/lib/api"; // Import email mutation
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AccountSettings = () => {
    const { user } = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(user?.email || "");
    
    const { mutate: changeEmail, isPending: isEmailPending } = useMutation({
        mutationFn: changeEmailMutationFn,
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Email updated successfully",
            });
            setIsEditing(false);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSaveEmail = () => {
        if (email === user?.email) {
            toast({
                title: "No changes detected",
                description: "You entered the same email.",
                variant: "destructive",
            });
            return;
        }

        changeEmail(email);
    };

    const passChangeSchema = z.object({
        OldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(1, "New password is required"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "New password and confirm password do not match",
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof passChangeSchema>>({
        resolver: zodResolver(passChangeSchema),
        defaultValues: {
            OldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { mutate: changePassword, isPending: isPasswordPending } = useMutation({
        mutationFn: changePasswordMutationFn,
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password changed successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (values: z.infer<typeof passChangeSchema>) => {
        changePassword(values);
    };

    return (
        <main className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Account settings</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:sticky md:top-6 md:self-start">
                    <Avatar className="w-60 h-60">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback className="text-2xl">CN</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-1">
                    <section className="mb-12">
                        <h2 className="text-xl font-bold mb-4">Email address</h2>
                        <div className="flex items-center gap-4">
                            {isEditing ? (
                                <>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Button onClick={handleSaveEmail} disabled={isEmailPending}>
                                        {isEmailPending ? "Saving..." : "Save"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg">
                                        Your email: <span className="font-semibold">{user?.email}</span>
                                    </p>
                                    <Button variant="link" onClick={() => setIsEditing(true)}>
                                        Change
                                    </Button>
                                </>
                            )}
                        </div>
                    </section>
                    <section className="mb-12">
                        <h2 className="text-xl font-bold mb-4">Change Password</h2>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="OldPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isPasswordPending}>
                                    {isPasswordPending ? "Saving..." : "Save password"}
                                </Button>
                            </form>
                        </Form>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-4">Delete account</h2>
                        <p className="mb-2">Would you like to delete your account?</p>
                        <button className="text-red-500 hover:underline">I want to delete my account</button>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default AccountSettings;
