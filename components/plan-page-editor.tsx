"use client";

import { useEffect, useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Globe, Lock, Users, Building2 } from "lucide-react";

const planPageSchema = z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().optional(),
    content: z.string().optional(),
    visibility: z.enum(["me", "org", "shared", "public"]).optional(),
});

type PlanPageFormValues = z.infer<typeof planPageSchema>;

interface PlanPageEditorProps {
    initialValues?: Partial<PlanPageFormValues>;
    onSubmit: (values: PlanPageFormValues) => Promise<void>;
    cancelHref: string;
}

export function PlanPageEditor({ initialValues, onSubmit, cancelHref }: PlanPageEditorProps) {
    const { setOpen } = useSidebar();
    const form = useForm<PlanPageFormValues>({
        resolver: zodResolver(planPageSchema),
        defaultValues: {
            name: "",
            url: "",
            content: "",
            ...initialValues,
        },
    });

    useEffect(() => {
        // Collapse sidebar on mount
        setOpen(false);
    }, [setOpen]);

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
    });

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sticky header bar */}
                <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b -mx-4 px-4 py-3 lg:-mx-6 lg:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex-1 space-y-0">
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Overview"
                                            className="text-lg font-semibold h-10 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-2 shrink-0">
                            <Button type="button" variant="outline" size="sm" asChild>
                                <a href={cancelHref}>Cancel</a>
                            </Button>
                            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="border-none shadow-none lg:border lg:shadow-sm">
                            <CardHeader>
                                <CardTitle>Content</CardTitle>
                                <CardDescription>
                                    Write detailed content for this page below.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <RichTextEditor
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    placeholder="Write detailed content for this page..."
                                                    minHeight="calc(100vh - 300px)"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Page Details</CardTitle>
                                <CardDescription>
                                    Basic information and settings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="visibility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Privacy</FormLabel>
                                            <Select
                                                value={field.value || "me"}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select visibility" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="me">
                                                        <span className="flex items-center gap-2">
                                                            <Lock className="h-3.5 w-3.5" />
                                                            Only Me
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="org">
                                                        <span className="flex items-center gap-2">
                                                            <Building2 className="h-3.5 w-3.5" />
                                                            Organisation
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="shared">
                                                        <span className="flex items-center gap-2">
                                                            <Users className="h-3.5 w-3.5" />
                                                            Shared
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="public">
                                                        <span className="flex items-center gap-2">
                                                            <Globe className="h-3.5 w-3.5" />
                                                            Public
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>External URL (optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
