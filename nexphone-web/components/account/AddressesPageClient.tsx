"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profile.service";
import type { AddressInput, SavedAddress } from "@/types/profile";
import { AccountShell } from "./AccountShell";
import { AddressFormModal } from "./AddressFormModal";

const TYPE_STYLES: Record<SavedAddress["type"], string> = {
  home: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  work: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
  other: "bg-slate-500/10 border-slate-500/30 text-slate-300",
};

type ModalState = { mode: "closed" } | { mode: "add" } | { mode: "edit"; address: SavedAddress };

function AddressesContent() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  // Rendered only after AccountShell resolves auth on the client, so reading storage here is safe.
  const [addresses, setAddresses] = useState<SavedAddress[]>(() =>
    profileService.getAddresses(userId)
  );
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!user) return null;

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = (input: AddressInput) => {
    if (modal.mode === "edit") {
      setAddresses(profileService.updateAddress(userId, modal.address.id, input));
      notify("Address updated.");
    } else {
      setAddresses(profileService.addAddress(userId, input));
      notify("Address added.");
    }
    setModal({ mode: "closed" });
  };

  const handleDelete = (id: string) => {
    setAddresses(profileService.deleteAddress(userId, id));
    setPendingDelete(null);
    notify("Address removed.");
  };

  const handleSetDefault = (id: string) => {
    setAddresses(profileService.setDefaultAddress(userId, id));
    notify("Default address updated.");
  };

  const sorted = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-mono text-slate-400">
          {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
        </p>
        <button
          type="button"
          onClick={() => setModal({ mode: "add" })}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Address
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
        >
          ✓ {toast}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">No saved addresses</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Add a delivery destination to speed up checkout.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((a) => (
            <li
              key={a.id}
              className={`p-5 rounded-3xl bg-slate-900/60 border backdrop-blur-md space-y-3 flex flex-col ${
                a.isDefault ? "border-cyan-500/40 shadow-lg shadow-cyan-500/5" : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${TYPE_STYLES[a.type]}`}
                  >
                    {a.type}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">{a.label}</h3>
                </div>
                {a.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase shrink-0">
                    Default
                  </span>
                )}
              </div>

              <address className="not-italic text-xs text-slate-300 leading-relaxed flex-1 space-y-0.5">
                <p className="font-semibold text-white">{a.recipient}</p>
                <p>{a.street}</p>
                {a.apartment && <p className="text-slate-400">{a.apartment}</p>}
                <p>
                  {a.city}, {a.state} {a.zipCode}
                </p>
                <p>{a.country}</p>
                <p className="font-mono text-slate-400 pt-1">Tel: {a.phone}</p>
                {a.instructions && (
                  <p className="text-[11px] font-mono text-cyan-300 pt-1">
                    Note: &quot;{a.instructions}&quot;
                  </p>
                )}
              </address>

              {pendingDelete === a.id ? (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono text-rose-300 mr-auto">
                    Delete this address?
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono"
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
                  {!a.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(a.id)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Set as default
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", address: a })}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[11px] font-mono transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {modal.mode !== "closed" && (
        <AddressFormModal
          key={modal.mode === "edit" ? modal.address.id : "new"}
          address={modal.mode === "edit" ? modal.address : null}
          defaultRecipient={user.name}
          defaultPhone={user.phone ?? ""}
          onClose={() => setModal({ mode: "closed" })}
          onSave={handleSave}
        />
      )}
    </>
  );
}

export function AddressesPageClient() {
  return (
    <AccountShell
      title="Saved Addresses"
      subtitle="Manage your delivery destinations and choose a default shipping address."
    >
      <AddressesContent />
    </AccountShell>
  );
}

export default AddressesPageClient;
