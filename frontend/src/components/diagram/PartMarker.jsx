import React from "react";

const PartMarker = ({ part, isOverlapping, onSelect }) => (
  <button
    type="button"
    onMouseDown={(e) => e.stopPropagation()}
    onClick={(e) => {
      e.stopPropagation();
      onSelect(part);
    }}
    title={part.name}
    className={`absolute rounded-sm border-2 shadow-md transition-transform hover:scale-105 ${
      isOverlapping
        ? "bg-red-500/30 border-red-500"
        : !part.published
          ? "bg-amber-400/30 border-amber-400"
          : "bg-blue-500/30 border-blue-500"
    }`}
    style={{
      left: `${part.x}%`,
      top: `${part.y}%`,
      width: `${part.width ?? 6}%`,
      height: `${part.height ?? 6}%`,
    }}
  />
);

export default PartMarker;