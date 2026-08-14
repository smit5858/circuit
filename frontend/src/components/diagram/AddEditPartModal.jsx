import React from "react";

const AddEditPartModal = ({ draft, onChange, pendingCoords, error, isSaving, onCancel, onSubmit }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="text-lg">{draft.id ? "✏️" : "📍"}</span>
          {draft.id ? "Edit Part" : "Add New Part"}
        </h3>
        <p className="text-xs text-blue-100 mt-0.5">
          {draft.id ? "Update this component's details" : "Fill in the component's details"}
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 p-6">
        <input
          type="text"
          placeholder="Part name"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
        <input
          type="text"
          placeholder="Part number"
          value={draft.value}
          onChange={(e) => onChange({ ...draft, value: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
        <input
          type="text"
          placeholder="Voltage"
          value={draft.voltage}
          onChange={(e) => onChange({ ...draft, voltage: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          rows={3}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-gray-400 -mt-1">
          📍 Position: {Math.round(pendingCoords?.x ?? 50)}%, {Math.round(pendingCoords?.y ?? 50)}%
          &nbsp;•&nbsp; Size: {Math.round(pendingCoords?.width ?? 6)}% × {Math.round(pendingCoords?.height ?? 6)}%
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-full text-sm font-medium bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : draft.id ? "Update" : "Continue →"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default AddEditPartModal;