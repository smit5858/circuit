import React, { useEffect, useRef, useState } from "react";
import { addComponent, updateComponent } from "../services/componentData";
import { useModuleSelection } from "../context/ModuleSelectionContext";
import {
  resolveModule,
  getComponentsByModule,
} from "../services/componentData";
import { getModulePhotoUrl } from "../services/carmodals";

const Diagram = () => {
  const { formData } = useModuleSelection();
  const [moduleId, setModuleId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoError, setPhotoError] = useState(false);
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
  const [isSavingPart, setIsSavingPart] = useState(false);
  const [partError, setPartError] = useState("");
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

  useEffect(() => {
    const { company, model, moduler, mode } = formData || {};
    if (!company || !model || !moduler || !mode) {
      setModuleId(null);
      setParts([]);
      setPhotoUrl(null);
      setPhotoError(false);
      return;
    }

    (async () => {
      try {
        const { module_id } = await resolveModule({
          company,
          model,
          moduler,
          side: mode,
        });
        setModuleId(module_id);
        setPhotoUrl(getModulePhotoUrl(module_id));
        setPhotoError(false);
        const existingParts = await getComponentsByModule(module_id);
        setParts(existingParts);
      } catch (err) {
        console.error("Failed to load module/parts:", err);
        setPhotoUrl(null);
      }
    })();
  }, [formData?.company, formData?.model, formData?.moduler, formData?.mode]);

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

    const newRect = { x, y, width, height };
    const overlapsExisting = parts.some((p) =>
      rectsOverlap(newRect, {
        x: p.x,
        y: p.y,
        width: p.width ?? 6,
        height: p.height ?? 6,
      }),
    );
    if (overlapsExisting) {
      alert(
        "This area overlaps an existing part. Please select an empty area.",
      );
      return;
    }

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

  const rectsOverlap = (a, b) => {
    const ax = Number(a.x);
    const ay = Number(a.y);
    const aw = Number(a.width);
    const ah = Number(a.height);
    const bx = Number(b.x);
    const by = Number(b.y);
    const bw = Number(b.width);
    const bh = Number(b.height);

    return (
      ax < bx + bw &&
      ax + aw > bx &&
      ay < by + bh &&
      ay + ah > by
    );
  };

  const currentSelectionRect =
    isSelecting && selectionBox
      ? {
          x: Math.min(selectionBox.startX, selectionBox.curX),
          y: Math.min(selectionBox.startY, selectionBox.curY),
          width: Math.abs(selectionBox.curX - selectionBox.startX),
          height: Math.abs(selectionBox.curY - selectionBox.startY),
        }
      : null;

  const overlappingPartIds = currentSelectionRect
    ? new Set(
        parts
          .filter((p) =>
            rectsOverlap(currentSelectionRect, {
              x: p.x,
              y: p.y,
              width: p.width ?? 6,
              height: p.height ?? 6,
            }),
          )
          .map((p) => p.id),
      )
    : new Set();

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

    // Don't call the API yet — just move to the customer form.
    // partDraft + pendingCoords stay in state and are used in
    // handleCustomerSubmit once customer info is confirmed.
    setPartError("");
    setShowPartForm(false);
    setShowCustomerForm(true);
  };

  const handleCustomerSubmit = async (e) => {
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

    const coords = pendingCoords || { x: 45, y: 45, width: 8, height: 6 };
    const payload = {
      name: partDraft.name.trim(),
      value: partDraft.value.trim(),
      voltage: partDraft.voltage.trim(),
      description: partDraft.description?.trim() || "",
      x: coords.x,
      y: coords.y,
      width: coords.width,
      height: coords.height,
      published: false, // new/edited parts stay unpublished until reviewed
    };

    setIsSavingPart(true);
    setPartError("");

    try {
      if (!moduleId) {
        setPartError("Please select company, model, moduler and side first.");
        setIsSavingPart(false);
        return;
      }
      if (partDraft.id) {
        const updated = await updateComponent(partDraft.id, payload);
        setParts((prev) =>
          prev.map((p) => (p.id === partDraft.id ? { ...p, ...updated } : p)),
        );
      } else {
        const created = await addComponent(moduleId, payload);
        setParts((prev) => [...prev, created]);
      }
      setShowCustomerForm(false);
      setPendingCoords(null);
    } catch (error) {
      console.error("Failed to save part:", error);
      setPartError("Couldn't save this part. Please try again.");
    } finally {
      setIsSavingPart(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="flex-1">
        {/* Tabs */}
        <div className="inline-flex items-center rounded-full bg-gray-100 p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setMode("test")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "test"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Test Mode
          </button>

          <button
            onClick={() => setMode("dev")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "dev"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
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
            className="h-175 min-w-125 overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white relative select-none"
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
              {!moduleId ? (
                <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm text-center px-4">
                  Please select company, model, moduler and side to view the
                  module.
                </div>
              ) : photoError ? (
                <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm text-center px-4">
                  No circuit board photo uploaded for this module yet.
                </div>
              ) : (
                <img
                  src={photoUrl}
                  alt="Circuit board"
                  onDoubleClick={handleDoubleClick}
                  draggable={false}
                  onError={() => setPhotoError(true)}
                  className={`h-full w-full object-cover ${
                    zoom > 1
                      ? isDragging
                        ? "cursor-grabbing"
                        : "cursor-grab"
                      : "cursor-zoom-in"
                  }`}
                />
              )}

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
                    overlappingPartIds.has(part.id)
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
              ))}

              {isSelecting && selectionBox && (
                <div
                  className={`absolute border-2 border-dashed pointer-events-none ${
                    overlappingPartIds.size > 0
                      ? "border-red-500 bg-red-500/20"
                      : "border-blue-500 bg-blue-500/20"
                  }`}
                  style={{
                    left: `${Math.min(selectionBox.startX, selectionBox.curX)}%`,
                    top: `${Math.min(selectionBox.startY, selectionBox.curY)}%`,
                    width: `${Math.abs(selectionBox.curX - selectionBox.startX)}%`,
                    height: `${Math.abs(selectionBox.curY - selectionBox.startY)}%`,
                  }}
                />
              )}
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white rounded-full shadow-md border border-gray-100 px-2 py-1.5">
              <button
                onClick={() =>
                  setZoom((z) => {
                    const newZoom = Math.max(1, z - 0.25);
                    if (newZoom === 1) setPosition({ x: 0, y: 0 });
                    else setPosition((pos) => clampPosition(pos, newZoom));
                    return newZoom;
                  })
                }
                className="w-7 h-7 rounded-full text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition"
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
                className="w-7 h-7 rounded-full text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* component info */}
      <div className="flex flex-col ml-8 max-w-72 w-full h-fit self-center bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        {selectedPart ? (
          <>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                {selectedPart.name}
              </h3>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Value
              </span>
              <span className="font-medium text-gray-900 font-mono text-xs">
                {selectedPart.value}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Voltage
              </span>
              <span className="font-medium text-gray-900 font-mono text-xs">
                {selectedPart.voltage}
              </span>
            </div>
            {selectedPart.description && (
              <div className="flex flex-col gap-1 text-sm py-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide">
                  Description
                </span>
                <span className="font-medium text-gray-700 leading-relaxed">
                  {selectedPart.description}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-2 py-6">
            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300 text-lg">
              ⓘ
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Click a marker on the image to see part details
            </p>
          </div>
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
              {partError && <p className="text-xs text-red-500">{partError}</p>}
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
                  disabled={isSavingPart}
                  className="px-5 py-2 rounded-full text-sm font-medium bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPart
                    ? "Saving..."
                    : partDraft.id
                      ? "Update"
                      : "Continue →"}
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
              {partError && <p className="text-xs text-red-500">{partError}</p>}
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
                  disabled={isSavingPart}
                  className="px-5 py-2 rounded-full text-sm font-medium bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPart ? "Saving..." : "Save"}
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
