export default function Section({
  title,
  children,
  classes = "bg-white dark:bg-zinc-900 p-6 rounded-lg shadow",
}: {
  title: string;
  children: React.ReactNode;
  classes?: string;
}) {
  return (
    <section className={classes}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}
