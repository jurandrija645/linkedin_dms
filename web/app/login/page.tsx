export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-xl font-semibold">Mindaptive Outreach</h1>
      <p className="mb-6 text-sm text-slate-500">Unesi lozinku.</p>

      <form action="/api/auth" method="POST" className="space-y-3">
        <input type="hidden" name="next" value={sp.next ?? '/'} />
        <input
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-teal-600"
          placeholder="Lozinka"
        />
        {sp.error && <p className="text-sm text-red-600">Kriva lozinka.</p>}
        <button className="w-full rounded-xl bg-teal-700 px-3 py-2.5 font-medium text-white hover:bg-teal-800">
          Uđi
        </button>
      </form>
    </div>
  );
}
