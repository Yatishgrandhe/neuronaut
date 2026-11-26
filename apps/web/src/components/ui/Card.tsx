import Link from "next/link";

type Variant = "plain" | "product" | "dark";

/**
 * The one card: 24px corners (20px on phones), no border.
 * `plain` = paper-2 fill (white on grey sections), `product` = white + --sh-3 for UI mocks, `dark` = night.
 * Pass `href` to make the whole card a link. Hover lift only on fine pointers.
 */
export function Card({
  variant = "plain",
  href,
  className = "",
  children,
  style,
  as: Tag = "div",
  ...rest
}: {
  variant?: Variant;
  href?: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  as?: "div" | "article" | "section" | "li";
} & React.HTMLAttributes<HTMLElement>) {
  const cls = `card card-${variant}${href ? " card-link" : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <Tag className={cls} style={style} {...rest}>
      {children}
    </Tag>
  );
}
