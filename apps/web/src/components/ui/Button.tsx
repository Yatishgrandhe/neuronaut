import Link from "next/link";

type Variant = "primary" | "secondary" | "inverse";

/** Primary (accent pill), secondary (accent text link with ›), inverse (white pill). Min 44px tall. */
export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  size,
  onClick,
  type = "button",
  ...rest
}: {
  variant?: Variant;
  href?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "lg";
  onClick?: () => void;
  type?: "button" | "submit";
} & Omit<React.HTMLAttributes<HTMLElement>, "onClick">) {
  const cls =
    variant === "secondary"
      ? `btn-secondary ${className}`
      : `btn btn-${variant}${size ? ` btn-${size}` : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
