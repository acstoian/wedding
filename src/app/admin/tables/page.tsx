"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import RoundTable from "@/components/admin/RoundTable";

interface Guest {
  id: number;
  name: string;
  attending: string;
  tableId: number | null;
  seatNumber: number | null;
  parentGuestId: number | null;
}

type UnassignedGroup = { primary: Guest; extras: Guest[] };

function groupUnassigned(unassigned: Guest[]): UnassignedGroup[] {
  // The unassigned list contains both primaries (parentGuestId == null) and
  // any plus-ones who haven't been seated yet. Keep each "party" together so
  // it's clear who came with whom while choosing seats.
  const groups = new Map<number, UnassignedGroup>();
  const orphans: Guest[] = [];

  unassigned
    .filter((g) => g.parentGuestId == null)
    .forEach((primary) => groups.set(primary.id, { primary, extras: [] }));

  unassigned
    .filter((g) => g.parentGuestId != null)
    .forEach((extra) => {
      const group = groups.get(extra.parentGuestId!);
      if (group) group.extras.push(extra);
      else orphans.push(extra);
    });

  // Orphans (plus-ones whose primary is already seated) get their own pseudo-group.
  orphans.forEach((o) => groups.set(o.id, { primary: o, extras: [] }));
  return Array.from(groups.values());
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  guests: Guest[];
}

const MAX_CAPACITY = 10;

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [unassigned, setUnassigned] = useState<Guest[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(8);
  const [loading, setLoading] = useState(true);
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState(8);
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggingGuestId, setDraggingGuestId] = useState<number | null>(null);
  const tableRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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
    // Initial load; fetchData resolves against the API and then sets state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  function clampCapacity(n: number) {
    if (!Number.isFinite(n)) return 1;
    return Math.min(MAX_CAPACITY, Math.max(1, Math.round(n)));
  }

  async function createTable(e: React.FormEvent) {
    e.preventDefault();
    if (!newTableName.trim()) return;
    await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTableName, capacity: clampCapacity(newTableCapacity) }),
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

  async function assignToSeat(guestId: number, tableId: number, seatNumber: number) {
    // If another guest already sits in this seat, swap them: bump the existing
    // occupant out of the seat so the slot is free, then place the new guest.
    const target = tables.find((t) => t.id === tableId);
    const occupant = target?.guests.find((g) => g.seatNumber === seatNumber && g.id !== guestId);
    if (occupant) {
      await fetch("/api/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: occupant.id, seatNumber: null }),
      });
    }
    await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guestId, tableId, seatNumber }),
    });
    fetchData();
  }

  async function unassignGuest(guestId: number) {
    await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guestId, tableId: null, seatNumber: null }),
    });
    fetchData();
  }

  async function saveTableEdit(id: number) {
    await fetch("/api/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName, capacity: clampCapacity(editCapacity) }),
    });
    setEditingTable(null);
    fetchData();
  }

  function startDrag(e: React.DragEvent, guestId: number) {
    e.dataTransfer.setData("text/plain", String(guestId));
    e.dataTransfer.effectAllowed = "move";
    setIsDragActive(true);
    setDraggingGuestId(guestId);
  }

  function endDrag() {
    setIsDragActive(false);
    setDraggingGuestId(null);
  }

  function onUnassignAreaDrop(e: React.DragEvent) {
    e.preventDefault();
    endDrag();
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const gid = Number(idStr);
    if (Number.isFinite(gid)) unassignGuest(gid);
  }

  async function downloadTableJpg(table: Table) {
    const node = tableRefs.current.get(table.id);
    if (!node) return;
    const canvas = await html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 2, // crisp
      useCORS: true,
    });
    const url = canvas.toDataURL("image/jpeg", 0.92);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${table.name.replace(/[^a-zA-Z0-9._-]+/g, "_")}.jpg`;
    a.click();
  }

  function printAll() {
    window.print();
  }

  if (loading) {
    return <div className="text-gray-400">Se încarcă...</div>;
  }

  return (
    <div>
      {/* Print stylesheet: hides everything except the print-area, lays out tables on paper. */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-page-break { page-break-after: always; }
        }
      `}</style>

      <div className="no-print">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-heading text-burgundy">Aranjament Mese</h1>
          <button
            onClick={printAll}
            disabled={tables.length === 0}
            className="px-5 py-2 rounded-lg border border-burgundy text-burgundy text-sm hover:bg-burgundy hover:text-white transition-colors disabled:opacity-40"
          >
            Print / Salvează PDF
          </button>
        </div>

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
              <label className="block text-sm text-gray-500 mb-1">
                Capacitate <span className="text-gray-400">(max {MAX_CAPACITY})</span>
              </label>
              <input
                type="number"
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                min={1}
                max={MAX_CAPACITY}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unassigned guests (drag source + drop target for unassign) */}
          <div className="lg:col-span-1">
            <div
              className={`bg-white rounded-xl shadow-sm border p-6 sticky top-8 transition-colors ${
                isDragActive ? "border-burgundy border-dashed" : "border-gray-100"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onUnassignAreaDrop}
            >
              <h2 className="font-heading text-lg text-burgundy mb-1">
                Neasignați ({unassigned.length})
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Trage un invitat pe un loc — sau aruncă-l aici ca să-l eliberezi.
              </p>
              {unassigned.length === 0 ? (
                <p className="text-gray-400 text-sm">Toți invitații confirmați au fost asignați</p>
              ) : (
                <div className="space-y-3 max-h-[32rem] overflow-y-auto">
                  {groupUnassigned(unassigned).map((group) => {
                    const members = [group.primary, ...group.extras];
                    const hasGroup = group.extras.length > 0;
                    return (
                      <div
                        key={group.primary.id}
                        className={
                          hasGroup
                            ? "rounded-lg border border-gold/30 bg-gold/5 p-2 space-y-1"
                            : ""
                        }
                      >
                        {hasGroup && (
                          <p className="text-[10px] uppercase tracking-widest text-burgundy/50 px-1 pb-1">
                            Grup ({members.length})
                          </p>
                        )}
                        {members.map((guest, idx) => {
                          const isExtra = idx > 0;
                          return (
                            <div
                              key={guest.id}
                              draggable
                              onDragStart={(e) => startDrag(e, guest.id)}
                              onDragEnd={endDrag}
                              className={`flex items-center bg-white hover:bg-gold/10 rounded px-3 py-2 cursor-grab active:cursor-grabbing text-sm text-gray-700 border border-transparent hover:border-gold/30 transition-colors ${
                                isExtra ? "ml-2" : ""
                              }`}
                            >
                              {isExtra && <span className="text-gold/70 mr-2" aria-hidden>↳</span>}
                              <span>{guest.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tables grid */}
          <div className="lg:col-span-3 space-y-8">
            {tables.map((table) => {
              const seated = table.guests.filter((g) => g.seatNumber).length;
              const isFull = seated >= table.capacity;
              return (
                <div
                  key={table.id}
                  className={`bg-white rounded-xl shadow-sm border p-6 ${
                    isFull ? "border-red-200 bg-red-50/30" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    {editingTable === table.id ? (
                      <div className="flex gap-2 items-center flex-wrap">
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
                          max={MAX_CAPACITY}
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
                            isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                          }`}
                        >
                          {seated}/{table.capacity}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => downloadTableJpg(table)}
                        className="text-burgundy hover:text-burgundy-light text-sm"
                      >
                        Descarcă JPG
                      </button>
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

                  {/* Round table visual (also the JPG export target) */}
                  <div
                    ref={(el) => {
                      if (el) tableRefs.current.set(table.id, el);
                      else tableRefs.current.delete(table.id);
                    }}
                    className="py-4"
                  >
                    <RoundTable
                      name={table.name}
                      capacity={table.capacity}
                      guests={table.guests.map((g) => ({
                        id: g.id,
                        name: g.name,
                        seatNumber: g.seatNumber,
                      }))}
                      isDragActive={isDragActive}
                      draggingGuestId={draggingGuestId}
                      onDropGuest={(guestId, seatNum) => {
                        endDrag();
                        assignToSeat(guestId, table.id, seatNum);
                      }}
                      onRemoveGuest={unassignGuest}
                      onDragGuestFromSeat={(id) => {
                        setIsDragActive(true);
                        setDraggingGuestId(id);
                      }}
                      onDragEnd={endDrag}
                    />
                  </div>

                  {/* Guests seated here but with no specific seat (legacy or just assigned) */}
                  {table.guests.some((g) => !g.seatNumber) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                        La masă, fără loc atribuit
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {table.guests
                          .filter((g) => !g.seatNumber)
                          .map((guest) => (
                            <div
                              key={guest.id}
                              draggable
                              onDragStart={(e) => startDrag(e, guest.id)}
                              onDragEnd={endDrag}
                              className="flex items-center gap-2 bg-cream rounded-lg px-3 py-1.5 cursor-grab active:cursor-grabbing"
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

      {/* Print-only view: each table on its own page, no chrome */}
      <div className="print-area hidden print:block">
        <h1 className="text-2xl font-heading text-burgundy text-center mb-6">
          Aranjament Mese — Cristina &amp; Andrei · 26 Septembrie 2026
        </h1>
        {tables.map((table, idx) => (
          <div key={table.id} className={idx < tables.length - 1 ? "print-page-break mb-12" : "mb-12"}>
            <div className="flex justify-center">
              <RoundTable
                name={table.name}
                capacity={table.capacity}
                guests={table.guests.map((g) => ({
                  id: g.id,
                  name: g.name,
                  seatNumber: g.seatNumber,
                }))}
                onDropGuest={() => {}}
              />
            </div>
            {table.guests.filter((g) => !g.seatNumber).length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-xs uppercase text-gray-500">Fără loc atribuit:</p>
                <p className="text-sm text-burgundy">
                  {table.guests
                    .filter((g) => !g.seatNumber)
                    .map((g) => g.name)
                    .join(", ")}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
