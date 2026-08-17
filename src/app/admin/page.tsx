"use client";

import { useEffect, useState } from "react";

interface Guest {
  id: number;
  name: string;
  attending: string;
  kidsCount: number | null;
}

interface Stats {
  confirmed: number;
  declined: number;
  kids: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ confirmed: 0, declined: 0, kids: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guests")
      .then((r) => r.json())
      .then((guests: Guest[]) => {
        const attending = guests.filter((g) => g.attending === "yes");
        setStats({
          // Every guest — primary or plus-one — is its own row, so these are
          // people, not households.
          confirmed: attending.length,
          declined: guests.filter((g) => g.attending === "no").length,
          // Kids with their own chair are already rows above; kidsCount only
          // holds the ones seated on a lap.
          kids: attending.reduce((sum, g) => sum + (g.kidsCount ?? 0), 0),
        });
        setLoading(false);
      });
  }, []);

  const cards = [
    { label: "Total Persoane", value: stats.confirmed + stats.kids, icon: "🎉" },
    { label: "Confirmați", value: stats.confirmed, icon: "✅" },
    { label: "Copii fără scaun", value: stats.kids, icon: "🧸" },
    { label: "Refuzați", value: stats.declined, icon: "❌" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-heading text-burgundy mb-8">Dashboard</h1>

      {loading ? (
        <div className="text-gray-400">Se încarcă...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <div className="text-3xl font-heading text-burgundy mb-1">
                {card.value}
              </div>
              <div className="text-sm text-gray-500 font-body">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
