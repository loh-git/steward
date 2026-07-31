export default function Section({
  title,
  children,
  classes = "bg-paper-card border border-ink-200 p-6 rounded-lg shadow-sm",
}: {
  title: string;
  children: React.ReactNode;
  classes?: string;
}) {
  return (
    <section className={classes}>
      <h2 className="mb-4 font-display text-xl font-semibold text-ink-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
