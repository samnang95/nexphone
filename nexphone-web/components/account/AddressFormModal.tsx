"use client";

import React, { useState } from "react";
import type { AddressInput, AddressType, SavedAddress } from "@/types/profile";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Ireland",
  "Japan",
  "Singapore",
  "Australia",
  "Cambodia",
  "Thailand",
];

const TYPES: { id: AddressType; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "other", label: "Other" },
];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors";
const labelClass = "text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider";

interface AddressFormModalProps {
  address: SavedAddress | null;
  defaultRecipient: string;
  defaultPhone: string;
  onClose: () => void;
  onSave: (input: AddressInput) => void;
}

type FormState = AddressInput & { isDefault: boolean };

/**
 * Mount this component only while open (parent conditionally renders it, keyed by address id)
 * so form state initialises from props without needing an effect.
 */
export function AddressFormModal({
  address,
  defaultRecipient,
  defaultPhone,
  onClose,
  onSave,
}: AddressFormModalProps) {
  const [form, setForm] = useState<FormState>({
    type: address?.type ?? "home",
    label: address?.label ?? "",
    recipient: address?.recipient ?? defaultRecipient,
    phone: address?.phone ?? defaultPhone,
    street: address?.street ?? "",
    apartment: address?.apartment ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    zipCode: address?.zipCode ?? "",
    country: address?.country ?? COUNTRIES[0]!,
    instructions: address?.instructions ?? "",
    isDefault: address?.isDefault ?? false,
  });
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: [string, string][] = [
      [form.recipient, "Recipient name"],
      [form.phone, "Phone"],
      [form.street, "Street address"],
      [form.city, "City"],
      [form.state, "State / region"],
      [form.zipCode, "ZIP / postal code"],
    ];
    const missing = required.find(([v]) => !v.trim());
    if (missing) {
      setError(`${missing[1]} is required.`);
      return;
    }
    const label = form.label.trim() || TYPES.find((t) => t.id === form.type)!.label;
    onSave({
      ...form,
      label,
      recipient: form.recipient.trim(),
      phone: form.phone.trim(),
      street: form.street.trim(),
      apartment: form.apartment?.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
      instructions: form.instructions?.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl rounded-3xl bg-[#0c121e] border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 z-10 space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="address-modal-title" className="text-xl font-black text-white tracking-tight">
              {address ? "Edit Address" : "Add New Address"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Used for faster checkout and delivery.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <span className={labelClass}>Address type</span>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("type", t.id)}
                  aria-pressed={form.type === t.id}
                  className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                    form.type === t.id
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="addr-label" className={labelClass}>
                Label <span className="text-slate-600">(optional)</span>
              </label>
              <input
                id="addr-label"
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="e.g. Parents' house"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-recipient" className={labelClass}>
                Recipient *
              </label>
              <input
                id="addr-recipient"
                value={form.recipient}
                onChange={(e) => set("recipient", e.target.value)}
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="addr-phone" className={labelClass}>
                Phone *
              </label>
              <input
                id="addr-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                autoComplete="tel"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="addr-street" className={labelClass}>
                Street address *
              </label>
              <input
                id="addr-street"
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
                autoComplete="address-line1"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="addr-apt" className={labelClass}>
                Apartment / suite <span className="text-slate-600">(optional)</span>
              </label>
              <input
                id="addr-apt"
                value={form.apartment ?? ""}
                onChange={(e) => set("apartment", e.target.value)}
                autoComplete="address-line2"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-city" className={labelClass}>
                City *
              </label>
              <input
                id="addr-city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                autoComplete="address-level2"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-state" className={labelClass}>
                State / region *
              </label>
              <input
                id="addr-state"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                autoComplete="address-level1"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-zip" className={labelClass}>
                ZIP / postal code *
              </label>
              <input
                id="addr-zip"
                value={form.zipCode}
                onChange={(e) => set("zipCode", e.target.value)}
                autoComplete="postal-code"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-country" className={labelClass}>
                Country
              </label>
              <select
                id="addr-country"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                autoComplete="country-name"
                className={inputClass}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="addr-notes" className={labelClass}>
                Delivery instructions <span className="text-slate-600">(optional)</span>
              </label>
              <textarea
                id="addr-notes"
                rows={2}
                value={form.instructions ?? ""}
                onChange={(e) => set("instructions", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="accent-cyan-500"
            />
            Set as default shipping address
          </label>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono"
            >
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              {address ? "Save Changes" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddressFormModal;
