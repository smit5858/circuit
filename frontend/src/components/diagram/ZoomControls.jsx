import React from "react";

const ZoomControls = ({ zoom, onZoomOut, onZoomIn }) => (
  <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white rounded-full shadow-md border border-gray-100 px-2 py-1.5">
    <button
      onClick={onZoomOut}
      className="w-7 h-7 rounded-full text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition"
    >
      −
    </button>
    <span className="text-xs text-gray-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
    <button
      onClick={onZoomIn}
      className="w-7 h-7 rounded-full text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition"
    >
      +
    </button>
  </div>
);

export default ZoomControls;