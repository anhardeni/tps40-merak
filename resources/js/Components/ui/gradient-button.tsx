import * as React from "react";
import { Download } from "lucide-react";
import clsx from "clsx";

type CommonProps = {
    /** Main text inside the button */
    label?: string;
    /** Optional left icon component (Lucide or any ReactNode). Defaults to Download */
    icon?: React.ReactNode;
    /** Extra classes to extend/override */
    className?: string;
    /** Small helper for accessibility (defaults to "Download <label>") */
    ariaLabel?: string;
    /** Disabled visual and interaction state */
    disabled?: boolean;
    /** Show a loading spinner and disable interaction */
    loading?: boolean;
    /** Compact size override */
    size?: "sm" | "md" | "lg";
};

type ButtonAsButton = CommonProps & {
    href?: undefined;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
};

type ButtonAsLink = CommonProps & {
    href: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    /** Target only applies when href is provided */
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
};

type GradientButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * GradientButton — Uiverse-style layered gradient button, React-ready.
 * - Renders as <a> when `href` is provided, otherwise <button>
 * - Keeps compact dimensions (h-10, px-4) matching your original button
 */
export const GradientButton = React.forwardRef<
    HTMLButtonElement & HTMLAnchorElement,
    GradientButtonProps
>(function GradientButton(props, ref) {
    const {
        label = "Template",
        icon,
        className,
        ariaLabel,
        disabled,
        loading,
        size = "md",
        ...rest
    } = props as GradientButtonProps;

    const isLink = typeof (props as ButtonAsLink).href === "string";
    const IconNode = icon ?? (
        <Download className="w-4 h-4 text-[#C787F6] drop-shadow-[0_0_8px_rgba(199,135,246,0.35)]" />
    );

    const baseSize =
        size === "sm"
            ? "h-9 px-3 text-[10px]"
            : size === "lg"
                ? "h-11 px-5 text-[11px]"
                : "h-10 px-4 text-[10px]";

    const disabledClasses = disabled || loading ? "pointer-events-none opacity-60" : "";

    const rootClasses = clsx(
        "relative rounded-lg overflow-hidden transition-all duration-500 group select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C787F6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0711]",
        baseSize,
        disabledClasses,
        className
    );

    const content = (
        <>
            {/* Layered gradient/border effects */}
            <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]">
                <div className="absolute inset-0 bg-[#170928] rounded-lg opacity-90" />
            </div>
            <div className="absolute inset-[2px] bg-[#170928] rounded-lg opacity-95" />
            <div className="absolute inset-[2px] bg-gradient-to-r from-[#170928] via-[#1d0d33] to-[#170928] rounded-lg opacity-90" />
            <div className="absolute inset-[2px] bg-gradient-to-b from-[#654358]/40 via-[#1d0d33] to-[#2F0D64]/30 rounded-lg opacity-80" />
            <div className="absolute inset-[2px] bg-gradient-to-br from-[#C787F6]/10 via-[#1d0d33] to-[#2A1736]/50 rounded-lg" />
            <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(199,135,246,0.15)] rounded-lg" />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                {/* Loading spinner overrides icon */}
                {loading ? (
                    <span
                        className="inline-block w-4 h-4 border-2 border-[#C787F6]/60 border-t-transparent rounded-full animate-spin"
                        aria-hidden="true"
                    />
                ) : (
                    IconNode
                )}
                <span className="font-black uppercase tracking-wider bg-gradient-to-b from-[#D69DDE] to-[#B873F8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(199,135,246,0.4)]">
                    {label}
                </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg" />
        </>
    );

    const computedAria = ariaLabel ?? `Download ${label}`;

    if (isLink) {
        const { href, onClick, target = "_blank", rel } = rest as ButtonAsLink;
        const safeRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);

        return (
            <a
                ref={ref as unknown as React.Ref<HTMLAnchorElement>}
                href={href}
                target={target}
                rel={safeRel}
                onClick={onClick}
                aria-label={computedAria}
                className={rootClasses}
                // prevent tab focus when disabled
                tabIndex={disabled || loading ? -1 : 0}
            >
                {content}
            </a>
        );
    }

    const { onClick, type = "button" } = rest as ButtonAsButton;

    return (
        <button
            ref={ref as unknown as React.Ref<HTMLButtonElement>}
            type={type}
            onClick={onClick}
            aria-label={computedAria}
            disabled={disabled || loading}
            className={rootClasses}
        >
            {content}
        </button>
    );
});

export default GradientButton;