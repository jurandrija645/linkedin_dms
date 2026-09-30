'use client';

import { useEffect, useState } from 'react';

export type Target = { label: string; url: string };

export function OpenAll({ targets }: { targets: Target[] }) {
  const [ready, setReady] = useState(false);
  const [tried, setTried] = useState(false);
  const [patched, setPatched] = useState(false);
  useEffect(() => {
    setReady(true);
    // Ekstenzije (ad blockeri, Opera) znaju zamijeniti window.open funkcijom
    // koja vrati objekt prozora a ne otvori nista. Tad je detekcija blokiranja
    // bezvrijedna, pa se na window.open uopce ne oslanjamo.
    try {
      setPatched(!/\[native code\]/.test(String(window.open)));
    } catch {
      setPatched(true);
    }
  }, []);

  function openAll() {
    // Klik na pravi <a target="_blank"> je za preglednik navigacija koju je
    // pokrenuo korisnik, a ne skocni prozor. Prolazi ondje gdje window.open ne.
    for (const t of targets) {
      const a = document.createElement('a');
      a.href = t.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTried(true);
  }

  if (!targets.length) return null;

  return (
    <div>
      <button
        type="button"
        onClick={openAll}
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Otvori sve tabove ({targets.length})
      </button>

      {!ready ? (
        <p className="mt-1 text-xs font-medium text-red-600">
          JS na ovoj stranici nije aktivan, gumb nece raditi.
        </p>
      ) : (
        <p className="mt-1 text-xs text-slate-400">
          {patched
            ? 'Neka ekstenzija je preuzela window.open, zato gumb otvara tabove preko linkova.'
            : 'Prvi put treba dopustiti pop-upove za ovu stranicu.'}
        </p>
      )}

      {tried && (
        <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
          <p>Ako se i dalje nista nije otvorilo, klikni ovdje redom:</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {targets.map((t) => (
              <a
                key={t.url}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-700 underline underline-offset-2"
              >
                {t.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CopyButton({ text, label = 'Kopiraj' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
    >
      {done ? 'Kopirano' : label}
    </button>
  );
}

/** Textarea + Kopiraj koji uvijek kopira trenutni (editirani) sadržaj. */
export function EditableMessage({
  name,
  defaultValue,
  rows = 6,
  hint,
}: {
  name: string;
  defaultValue: string;
  rows?: number;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* ignore */
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <div>
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-relaxed outline-none focus:border-teal-600"
      />
      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
        >
          {done ? 'Kopirano' : 'Kopiraj'}
        </button>
        <span className="text-xs text-slate-400">
          {value.length} znakova{hint ? ` · ${hint}` : ''}
        </span>
      </div>
    </div>
  );
}
