"use client";

import { useEffect, useState } from "react";

interface Guest {
  id: number;
  name: string;
  attending: string;
  plusOne: boolean;
}

interface Stats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  plusOnes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, confirmed: 0, declined: 0, pending: 0, plusOnes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guests")
      .then((r) => r.json())
      .then((guests: Guest[]) => {
        setStats({
          total: guests.length,
          confirmed: guests.filter((g) => g.attending === "yes").length,
          declined: guests.filter((g) => g.attending === "no").length,
          pending: guests.filter((g) => g.attending === "pending").length,
          plusOnes: guests.filter((g) => g.plusOne).length,
        });
        setLoading(false);
      });
  }, []);

  const cards = [
    { label: "Total Invitați", value: stats.total, color: "bg-burgundy", icon: "👥" },
    { label: "Confirmați", value: stats.confirmed, color: "bg-sage-dark", icon: "✅" },
    { label: "Refuzați", value: stats.declined, color: "bg-burnt-orange", icon: "❌" },
    { label: "În așteptare", value: stats.pending, color: "bg-gold", icon: "⏳" },
    { label: "Plus One", value: stats.plusOnes, color: "bg-burgundy-light", icon: "💑" },
    { label: "Total Persoane", value: stats.confirmed + stats.plusOnes, color: "bg-sage", icon: "🎉" },
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
