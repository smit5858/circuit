import React from "react";

const SelectionOverlay = ({ rect, hasOverlap }) => {
  if (!rect) return null;
  return (
    <div
      className={`absolute border-2 border-dashed pointer-events-none ${
        hasOverlap ? "border-red-500 bg-red-500/20" : "border-blue-500 bg-blue-500/20"
      }`}
      style={{
        left: `${rect.x}%`,
        top: `${rect.y}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
      }}
    />
  );
};

export default SelectionOverlay;