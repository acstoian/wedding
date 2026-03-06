"use client";

import { useEffect, useState, useCallback } from "react";

interface Guest {
  id: number;
  name: string;
  attending: string;
  tableId: number | null;
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  guests: Guest[];
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [unassigned, setUnassigned] = useState<Guest[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(8);
  const [loading, setLoading] = useState(true);
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState(8);

  const fetchData = useCallback(async () => {
    const [tablesRes, guestsRes] = await Promise.all([
      fetch("/api/tables").then((r) => r.json()),
      fetch("/api/guests?status=yes").then((r) => r.json()),
    ]);
    setTables(tablesRes);
    setUnassigned(guestsRes.filter((g: Guest) => !g.tableId));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function createTable(e: React.FormEvent) {
    e.preventDefault();
    if (!newTableName.trim()) return;
    await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTableName, capacity: newTableCapacity }),
    });
    setNewTableName("");
    setNewTableCapacity(8);
    fetchData();
  }

  async function deleteTable(id: number) {
    if (!confirm("Sigur vrei să ștergi această masă? Invitații vor fi marcați ca neasignați.")) return;
    await fetch(`/api/tables?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function assignGuest(guestId: number, tableId: number) {
    await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guestId, tableId }),
    });
    fetchData();
  }

  async function unassignGuest(guestId: number) {
    await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guestId, tableId: null }),
    });
    fetchData();
  }

  async function saveTableEdit(id: number) {
    await fetch("/api/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName, capacity: editCapacity }),
    });
    setEditingTable(null);
    fetchData();
  }

  if (loading) {
    return <div className="text-gray-400">Se încarcă...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-heading text-burgundy mb-8">Aranjament Mese</h1>

      {/* Create table form */}
      <form onSubmit={createTable} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="font-heading text-lg text-burgundy mb-4">Adaugă Masă Nouă</h2>
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nume</label>
            <input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="ex: Masa 11"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Capacitate</label>
            <input
              type="number"
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(Number(e.target.value))}
              min={1}
              max={20}
              className="border rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:border-burgundy"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-burgundy text-white text-sm hover:bg-burgundy-light transition-colors"
          >
            Adaugă
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned guests */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="font-heading text-lg text-burgundy mb-4">
              Neasignați ({unassigned.length})
            </h2>
            {unassigned.length === 0 ? (
              <p className="text-gray-400 text-sm">Toți invitații confirmați au fost asignați</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassigned.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-gray-700">{guest.name}</span>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) assignGuest(guest.id, Number(e.target.value));
                      }}
                      className="text-xs border rounded px-2 py-1 text-gray-500"
                    >
                      <option value="">Asignează...</option>
                      {tables
                        .filter((t) => t.guests.length < t.capacity)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.guests.length}/{t.capacity})
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tables grid */}
        <div className="lg:col-span-2 space-y-4">
          {tables.map((table) => {
            const isFull = table.guests.length >= table.capacity;
            return (
              <div
                key={table.id}
                className={`bg-white rounded-xl shadow-sm border p-6 ${
                  isFull ? "border-red-200 bg-red-50/30" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  {editingTable === table.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-32"
                      />
                      <input
                        type="number"
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(Number(e.target.value))}
                        className="border rounded px-2 py-1 text-sm w-16"
                        min={1}
                      />
                      <button onClick={() => saveTableEdit(table.id)} className="text-green-600 text-sm">
                        Salvează
                      </button>
                      <button onClick={() => setEditingTable(null)} className="text-gray-400 text-sm">
                        Anulează
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading text-xl text-burgundy">{table.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isFull
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {table.guests.length}/{table.capacity}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTable(table.id);
                        setEditName(table.name);
                        setEditCapacity(table.capacity);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Editează
                    </button>
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Șterge
                    </button>
                  </div>
                </div>

                {table.guests.length === 0 ? (
                  <p className="text-gray-300 text-sm italic">Niciun invitat asignat</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {table.guests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center gap-2 bg-cream rounded-lg px-3 py-2"
                      >
                        <span className="text-sm text-gray-700">{guest.name}</span>
                        <button
                          onClick={() => unassignGuest(guest.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                          title="Elimină de la masă"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {tables.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-4">🪑</div>
              <p>Nicio masă creată. Adaugă prima masă folosind formularul de mai sus.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
