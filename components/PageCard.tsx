export default function PageCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-amber-700 sm:text-3xl">{title}</h1>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
