import React from "react";

const CustomerInfoModal = ({ customer, onChange, error, isSaving, onSkip, onSubmit }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="text-lg">👤</span> Customer Info
        </h3>
        <p className="text-xs text-emerald-100 mt-0.5">Saved once — you won't need to fill this again</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 p-6">
        <input
          type="text"
          placeholder="Customer name"
          value={customer.name}
          onChange={(e) => onChange({ ...customer, name: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          required
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={customer.phone}
          minLength={10}
          maxLength={10}
          pattern="[0-9]{10}"
          onChange={(e) => onChange({ ...customer, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={customer.email}
          onChange={(e) => onChange({ ...customer, email: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          required
        />
        <input
          type="text"
          placeholder="Business name (optional)"
          value={customer.business}
          onChange={(e) => onChange({ ...customer, business: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Skip
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-full text-sm font-medium bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default CustomerInfoModal;