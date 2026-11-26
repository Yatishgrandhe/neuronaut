/**
 * Section header with three layouts so sections don't all look alike:
 * left (headline then lead), center, and split (headline left, lead + action right).
 */
export function SectionHeader({
  id,
  title,
  lead,
  align = "left",
  action,
  annotation,
  className = "",
  dark,
}: {
  id: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center" | "split";
  action?: React.ReactNode;
  annotation?: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <header className={`sh sh-${align}${dark ? " sh-dark" : ""} ${className}`}>
      <h2 id={id} className="t-h2 sh-title">
        {title}
        {annotation}
      </h2>
      {(lead || action) && (
        <div className="sh-side">
          {lead && <p className="t-lead">{lead}</p>}
          {action}
        </div>
      )}
    </header>
  );
}
