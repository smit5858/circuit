import React from "react";

const PartDetailsPanel = ({ part }) => (
  <div className="flex flex-col mt-6 md:mt-0 md:ml-8 w-full md:max-w-72 h-fit self-stretch md:self-center bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
    {part ? (
      <>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{part.name}</h3>
        </div>
        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
          <span className="text-gray-400 text-xs uppercase tracking-wide">Value</span>
          <span className="font-medium text-gray-900 font-mono text-xs">{part.value}</span>
        </div>
        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
          <span className="text-gray-400 text-xs uppercase tracking-wide">Voltage</span>
          <span className="font-medium text-gray-900 font-mono text-xs">{part.voltage}</span>
        </div>
        {part.description && (
          <div className="flex flex-col gap-1 text-sm py-2">
            <span className="text-gray-400 text-xs uppercase tracking-wide">Description</span>
            <span className="font-medium text-gray-700 leading-relaxed">{part.description}</span>
          </div>
        )}
      </>
    ) : (
      <div className="flex flex-col items-center text-center gap-2 py-6">
        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300 text-lg">
          ⓘ
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">Click a marker on the image to see part details</p>
      </div>
    )}
  </div>
);

export default PartDetailsPanel;