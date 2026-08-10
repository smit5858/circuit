import React, { useEffect, useRef, useState } from "react";
import BCM from "../assets/bcm.png";

const Diagram = () => {
  const [mode, setMode] = useState("test");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const [parts, setParts] = useState([
    {
      id: 1,
      name: "D70F3634 MCU",
      value: "IA1 1149EEC06",
      voltage: "5V",
      description: "",
      x: 32,
      y: 38,
      width: 8,
      height: 6,
      published: true,
    },
    {
      id: 2,
      name: "Crystal Oscillator",
      value: "4.9152 MHz",
      voltage: "3.3V",
      description: "",
      x: 23,
      y: 63,
      width: 8,
      height: 6,
      published: true,
    },
    {
      id: 3,
      name: "Driver IC 102",
      value: "HC4051",
      voltage: "12V",
      description: "",
      x: 38,
      y: 79,
      width: 8,
      height: 6,
      published: true,
    },
  ]);
  const [selectedPart, setSelectedPart] = useState(null);

  // --- Dev-mode add/edit + customer form ---
  const [showPartForm, setShowPartForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [partDraft, setPartDraft] = useState({
    name: "",
    value: "",
    voltage: "",
    description: "",
  });
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem("bcm_customer_info");
      return saved
        ? JSON.parse(saved)
        : { name: "", phone: "", email: "", business: "" };
    } catch {
      return { name: "", phone: "", email: "", business: "" };
    }
  });
  const [hasSavedCustomer, setHasSavedCustomer] = useState(() => {
    try {
      return !!localStorage.getItem("bcm_customer_info");
    } catch {
      return false;
    }
  });

  const visibleParts =
    mode === "test" ? parts.filter((p) => p.published) : parts;

  const clampPosition = (pos, currentZoom) => {
    if (!containerRef.current) return pos;
    const { clientWidth, clientHeight } = containerRef.current;
    const maxX = ((currentZoom - 1) * clientWidth) / 2;
    const maxY = ((currentZoom - 1) * clientHeight) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, pos.x)),
      y: Math.min(maxY, Math.max(-maxY, pos.y)),
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      setZoom((z) => {
        const newZoom = Math.min(
          4,
          Math.max(1, z + (e.deltaY > 0 ? -0.1 : 0.1)),
        );
        if (newZoom === 1) setPosition({ x: 0, y: 0 });
        else setPosition((pos) => clampPosition(pos, newZoom));
        return newZoom;
      });
    };

    container.addEventListener("wheel", wheelHandler, { passive: false });
    return () => container.removeEventListener("wheel", wheelHandler);
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => {
      const newZoom = Math.min(4, Math.max(1, z + (e.deltaY > 0 ? -0.1 : 0.1)));
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      else setPosition((pos) => clampPosition(pos, newZoom));
      return newZoom;
    });
  };

  const handleMouseDown = (e) => {
    if (mode === "dev" && zoom === 1) {
      handleSelectionStart(e);
      return;
    }
    if (zoom === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isSelecting) {
      const { x, y } = getPercentCoords(e);
      setSelectionBox((prev) => (prev ? { ...prev, curX: x, curY: y } : prev));
      return;
    }
    if (!isDragging) return;
    const newPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    setPosition(clampPosition(newPos, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!isSelecting) return;
    setIsSelecting(false);
    if (!selectionBox) return;
    const x = Math.min(selectionBox.startX, selectionBox.curX);
    const y = Math.min(selectionBox.startY, selectionBox.curY);
    const width = Math.abs(selectionBox.curX - selectionBox.startX);
    const height = Math.abs(selectionBox.curY - selectionBox.startY);
    setSelectionBox(null);
    if (width < 1 || height < 1) return; // too small, ignore accidental click
    setPendingCoords({ x, y, width, height });
    setPartDraft({ name: "", value: "", voltage: "", description: "" });
    setSelectedPart(null);
    setShowPartForm(true);
  };

  const handleDoubleClick = () => {
    setZoom((z) => {
      const newZoom = z === 1 ? 2 : 1;
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const getPercentCoords = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleSelectionStart = (e) => {
    if (mode !== "dev" || zoom > 1) return;
    e.stopPropagation();
    const { x, y } = getPercentCoords(e);
    setIsSelecting(true);
    setSelectionBox({ startX: x, startY: y, curX: x, curY: y });
  };

  const handlePartSubmit = (e) => {
    e.preventDefault();
    if (
      !partDraft.name.trim() ||
      !partDraft.value.trim() ||
      !partDraft.voltage.trim()
    )
      return;
    const coords = pendingCoords || { x: 45, y: 45, width: 8, height: 6 };

    if (partDraft.id) {
      setParts((prev) =>
        prev.map((p) =>
          p.id === partDraft.id
            ? {
                ...p,
                ...partDraft,
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                published: false,
              }
            : p,
        ),
      );
    } else {
      setParts((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...partDraft,
          x: coords.x,
          y: coords.y,
          width: coords.width,
          height: coords.height,
          published: false,
        },
      ]);
    }
    setShowPartForm(false);
    setPendingCoords(null);
    setShowCustomerForm(true);
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.email.trim()
    )
      return;
    try {
      localStorage.setItem("bcm_customer_info", JSON.stringify(customer));
    } catch {
      /* ignore storage errors */
    }
    setHasSavedCustomer(true);
    setShowCustomerForm(false);
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 flex justify-center">
      <div className="flex-1">
        {/* Tabs */}
        <div className="inline-flex items-center rounded-full   bg-gray-100 p-1">
          <button
            onClick={() => setMode("test")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "test"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Test Mode
          </button>

          <button
            onClick={() => setMode("dev")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "dev"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Dev Mode
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 mx-auto">
          <div
            ref={containerRef}
            className="h-175 min-w-125 overflow-hidden rounded-lg border border-gray-200 relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="relative h-full w-full"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={BCM}
                alt="Image"
                onDoubleClick={handleDoubleClick}
                draggable={false}
                className={`h-full w-full object-cover ${
                  zoom > 1
                    ? isDragging
                      ? "cursor-grabbing"
                      : "cursor-grab"
                    : "cursor-zoom-in"
                }`}
              />

              {visibleParts.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPart(part);
                    if (mode === "dev") {
                      setPendingCoords({
                        x: part.x,
                        y: part.y,
                        width: part.width ?? 6,
                        height: part.height ?? 6,
                      });
                      setPartDraft({
                        id: part.id,
                        name: part.name,
                        value: part.value,
                        voltage: part.voltage,
                        description: part.description || "",
                      });
                      setShowPartForm(true);
                    }
                  }}
                  title={part.name}
                  className={`absolute rounded-sm border-2 shadow-md transition-transform hover:scale-105 ${
                    !part.published
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
              ))}

              {isSelecting && selectionBox && (
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 pointer-events-none"
                  style={{
                    left: `${Math.min(selectionBox.startX, selectionBox.curX)}%`,
                    top: `${Math.min(selectionBox.startY, selectionBox.curY)}%`,
                    width: `${Math.abs(selectionBox.curX - selectionBox.startX)}%`,
                    height: `${Math.abs(selectionBox.curY - selectionBox.startY)}%`,
                  }}
                />
              )}
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 rounded-full shadow px-2 py-1">
              <button
                onClick={() =>
                  setZoom((z) => {
                    const newZoom = Math.max(1, z - 0.25);
                    if (newZoom === 1) setPosition({ x: 0, y: 0 });
                    else setPosition((pos) => clampPosition(pos, newZoom));
                    return newZoom;
                  })
                }
                className="w-7 h-7 rounded-full text-gray-700 hover:bg-gray-100"
              >
                −
              </button>
              <span className="text-xs text-gray-600 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() =>
                  setZoom((z) => {
                    const newZoom = Math.min(4, z + 0.25);
                    setPosition((pos) => clampPosition(pos, newZoom));
                    return newZoom;
                  })
                }
                className="w-7 h-7 rounded-full text-gray-700 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* component info */}
      <div className="flex flex-col gap-4 ml-8 max-w-55 w-full justify-center">
        {selectedPart ? (
          <>
            <h3 className="text-base font-semibold text-gray-900">
              {selectedPart.name}
            </h3>
            <div className="flex justify-between text-sm border-b pb-1">
              <span className="text-gray-500">Value</span>
              <span className="font-medium text-gray-900">
                {selectedPart.value}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b pb-1">
              <span className="text-gray-500">Voltage</span>
              <span className="font-medium text-gray-900">
                {selectedPart.voltage}
              </span>
            </div>
            {selectedPart.description && (
              <div className="flex flex-col justify-between text-sm border-b pb-1">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-gray-900">
                  {selectedPart.description}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">
            Click a marker on the image to see part details
          </p>
        )}
      </div>

      {showPartForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">{partDraft.id ? "✏️" : "📍"}</span>
                {partDraft.id ? "Edit Part" : "Add New Part"}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {partDraft.id
                  ? "Update this component's details"
                  : "Fill in the component's details"}
              </p>
            </div>
            <form
              onSubmit={handlePartSubmit}
              className="flex flex-col gap-3 p-6"
            >
              <input
                type="text"
                placeholder="Part name"
                value={partDraft.name}
                onChange={(e) =>
                  setPartDraft({ ...partDraft, name: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              <input
                type="text"
                placeholder="Part number"
                value={partDraft.value}
                onChange={(e) =>
                  setPartDraft({ ...partDraft, value: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              <input
                type="text"
                placeholder="Voltage"
                value={partDraft.voltage}
                onChange={(e) =>
                  setPartDraft({ ...partDraft, voltage: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={partDraft.description}
                onChange={(e) =>
                  setPartDraft({ ...partDraft, description: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                rows={3}
              />
              <p className="text-xs text-gray-400 -mt-1">
                📍 Position: {Math.round(pendingCoords?.x ?? 50)}%,{" "}
                {Math.round(pendingCoords?.y ?? 50)}% &nbsp;•&nbsp; Size:{" "}
                {Math.round(pendingCoords?.width ?? 6)}% ×{" "}
                {Math.round(pendingCoords?.height ?? 6)}%
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPartForm(false);
                    setPendingCoords(null);
                  }}
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-sm font-medium bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
                >
                  {partDraft.id ? "Update" : "Continue →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">👤</span> Customer Info
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Saved once — you won't need to fill this again
              </p>
            </div>
            <form
              onSubmit={handleCustomerSubmit}
              className="flex flex-col gap-3 p-6"
            >
              <input
                type="text"
                placeholder="Customer name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
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
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setCustomer({ ...customer, phone: value });
                }}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
              />
              <input
                type="text"
                placeholder="Business name (optional)"
                value={customer.business}
                onChange={(e) =>
                  setCustomer({ ...customer, business: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-sm font-medium bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagram;
