"use client";

import { useEffect, useState, useCallback } from "react";

interface Table {
  id: number;
  name: string;
}

interface Guest {
  id: number;
  name: string;
  email: string | null;
  attending: string;
  plusOne: boolean;
  plusOneName: string | null;
  menuPreference: string | null;
  plusOneMenu: string | null;
  allergies: string | null;
  kidsCount: number | null;
  dietaryRestrictions: string | null;
  message: string | null;
  tableId: number | null;
  table: Table | null;
  createdAt: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Guest>>({});
  const [loading, setLoading] = useState(true);

  const fetchGuests = useCallback(() => {
    const url = filter === "all" ? "/api/guests" : `/api/guests?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setGuests(data);
        setLoading(false);
      });
  }, [filter]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  async function handleDelete(id: number) {
    if (!confirm("Sigur vrei să ștergi acest invitat?")) return;
    await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
    fetchGuests();
  }

  async function handleSave() {
    if (!editingId) return;
    await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...editData }),
    });
    setEditingId(null);
    setEditData({});
    fetchGuests();
  }

  function startEdit(guest: Guest) {
    setEditingId(guest.id);
    setEditData({
      name: guest.name,
      email: guest.email,
      attending: guest.attending,
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName,
      dietaryRestrictions: guest.dietaryRestrictions,
    });
  }

  function exportCSV() {
    const headers = ["Nume", "Email", "Status", "Meniu", "Plus One", "Nume Plus One", "Meniu Plus One", "Alergii", "Copii", "Mesaj", "Masă", "Data"];
    const rows = guests.map((g) => [
      g.name,
      g.email || "",
      g.attending === "yes" ? "Confirmat" : g.attending === "no" ? "Refuzat" : "În așteptare",
      g.menuPreference || "",
      g.plusOne ? "Da" : "Nu",
      g.plusOneName || "",
      g.plusOneMenu || "",
      g.allergies || "",
      g.kidsCount != null ? String(g.kidsCount) : "",
      g.message || "",
      g.table?.name || "Neasignat",
      new Date(g.createdAt).toLocaleDateString("ro-RO"),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invitati.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const statusBadge = (status: string) => {
    const styles = {
      yes: "bg-green-100 text-green-700",
      no: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    const labels = { yes: "Confirmat", no: "Refuzat", pending: "În așteptare" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || ""}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-heading text-burgundy">Invitați</h1>
        <div className="flex gap-3 flex-wrap">
          {/* Filters */}
          {[
            { value: "all", label: "Toți" },
            { value: "yes", label: "Confirmați" },
            { value: "no", label: "Refuzați" },
            { value: "pending", label: "În așteptare" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${
                filter === f.value
                  ? "bg-burgundy text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg text-sm font-body bg-sage text-white hover:bg-sage-dark transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Se încarcă...</div>
      ) : guests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">📭</div>
          <p>Niciun invitat găsit</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Nume</th>
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Meniu</th>
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Plus One</th>
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Alergii</th>
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Copii</th>
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Masă</th>
                <th className="text-left px-4 py-3 font-body font-medium text-gray-500">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-50 hover:bg-gray-50">
                  {editingId === guest.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={editData.name || ""}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={editData.email || ""}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editData.attending || "pending"}
                          onChange={(e) => setEditData({ ...editData, attending: e.target.value })}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="yes">Confirmat</option>
                          <option value="no">Refuzat</option>
                          <option value="pending">În așteptare</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={editData.plusOne || false}
                          onChange={(e) => setEditData({ ...editData, plusOne: e.target.checked })}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-400">{guest.table?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800 mr-2 text-sm">
                          Salvează
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-sm">
                          Anulează
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {guest.name}
                        {guest.message && (
                          <div className="text-xs text-gray-400 mt-1 italic">
                            &ldquo;{guest.message}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{statusBadge(guest.attending)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {guest.menuPreference || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {guest.plusOne ? (
                          <span>
                            {guest.plusOneName || "Da"}
                            {guest.plusOneMenu && <span className="block text-gray-400">{guest.plusOneMenu}</span>}
                          </span>
                        ) : "Nu"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px]">
                        {guest.allergies ? (
                          <span className="text-orange-600">{guest.allergies}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {guest.kidsCount != null ? guest.kidsCount : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{guest.table?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => startEdit(guest)} className="text-blue-500 hover:text-blue-700 mr-3 text-sm">
                          Editează
                        </button>
                        <button onClick={() => handleDelete(guest.id)} className="text-red-400 hover:text-red-600 text-sm">
                          Șterge
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
