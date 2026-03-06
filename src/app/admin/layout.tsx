"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AdminLogin({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    onLogin(password);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-heading text-burgundy text-center mb-6">
          Admin Panel
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy"
          />
          {error && (
            <p className="text-red-500 text-sm text-center">Parolă incorectă</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-burgundy text-white font-body hover:bg-burgundy-light transition-colors"
          >
            Intră
          </button>
        </form>
      </div>
    </div>
  );
}

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/guests", label: "Invitați" },
  { href: "/admin/tables", label: "Mese" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_auth");
    if (stored === "true") setAuthenticated(true);
    setChecking(false);
  }, []);

  async function handleLogin(password: string) {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      sessionStorage.setItem("admin_auth", "true");
      setAuthenticated(true);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-burgundy/50">Se încarcă...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-burgundy text-cream shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-heading text-xl">
            🎊 Wedding Admin
          </Link>
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body text-sm transition-colors ${
                  pathname === link.href
                    ? "text-gold border-b-2 border-gold pb-1"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_auth");
              setAuthenticated(false);
            }}
            className="text-cream/50 hover:text-cream text-sm"
          >
            Ieși
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
