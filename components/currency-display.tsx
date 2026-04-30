"use client";

import { usePrivacy } from "./privacy-context";

interface CurrencyDisplayProps {
    value: number;
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n);
}

export function CurrencyDisplay({ value }: CurrencyDisplayProps) {
    const { isPrivacyMode } = usePrivacy();

    return (
        <span
            className={`inline-block transition-all duration-200 ${isPrivacyMode ? "blur-[8px] select-none" : ""
                }`}
            style={isPrivacyMode ? { userSelect: "none" } : undefined}
        >
            {formatCurrency(value)}
        </span>
    );
}
