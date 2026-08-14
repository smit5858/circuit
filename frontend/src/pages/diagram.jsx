import React, { useEffect, useRef, useState } from "react";
import {
  addComponent,
  updateComponent,
  getModuleParts,
} from "../services/componentData";
import { useModuleSelection } from "../context/ModuleSelectionContext";
import SelectionOverlay from "../components/diagram/SelectionOverlay";
import PartMarker from "../components/diagram/PartMarker";
import ZoomControls from "../components/diagram/ZoomControls";
import PartDetailsPanel from "../components/diagram/PartDetailsPanel";
import AddEditPartModal from "../components/diagram/AddEditPartModal";
import CustomerInfoModal from "../components/diagram/CustomerInfoModal";

const Diagram = () => {
  const { formData, modulePhoto, moduleId, side } = useModuleSelection();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [mode, setMode] = useState("test");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [parts, setParts] = useState([]);
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
      setParts([]);
      setPhotoUrl(null);
      setPhotoError(false);
    }
  }, [formData?.company, formData?.model, formData?.moduler, formData?.mode]);

  useEffect(() => {
    if (!moduleId) {
      setParts([]);
      return;
    }

    (async () => {
      try {
        const existingParts = await getModuleParts({
          carModelId: moduleId, 
          name: formData.moduler,
          side: formData?.mode,
        });
        setParts(existingParts);
      } catch (err) {
        console.error("Failed to load parts for module:", err);
        setParts([]);
      }
    })();
  }, [moduleId, formData?.mode]);

  useEffect(() => {
    if (modulePhoto) {
      let imageUrl = modulePhoto;

      // Remove duplicate prefix
      if (
        imageUrl.startsWith("data:image/") &&
        imageUrl.indexOf("data:image/", 11) !== -1
      ) {
        imageUrl = imageUrl.replace(
          /^data:image\/[^;]+;base64,data:image\/[^;]+;base64,/,
          "data:image/png;base64,",
        );
      }

      setPhotoUrl(imageUrl);
      setPhotoError(false);
    } else {
      setPhotoUrl(null);
    }
  }, [modulePhoto]);

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

  const handleZoomOut = () =>
    setZoom((z) => {
      const newZoom = Math.max(1, z - 0.25);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      else setPosition((pos) => clampPosition(pos, newZoom));
      return newZoom;
    });

  const handleZoomIn = () =>
    setZoom((z) => {
      const newZoom = Math.min(4, z + 0.25);
      setPosition((pos) => clampPosition(pos, newZoom));
      return newZoom;
    });

  const handleMarkerSelect = (part) => {
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
  };

  const getPercentCoords = (e) => {
    const el = imgRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
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

    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
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

    const coords = pendingCoords;
    const payload = {
      carModuleId: moduleId,
      partName: partDraft.name.trim(),
      partNumber: partDraft.value.trim(),
      partValue: partDraft.voltage.trim(),
      description: partDraft.description?.trim() || "",
      x: coords.x,
      y: coords.y,
      width: coords.width,
      height: coords.height,
      side: formData?.mode,
      published: false,
      addedBy: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerEmail: customer.email.trim(),
      customerBusiness: customer.business?.trim() || "",
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
        const created = await addComponent(payload);
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
   <div className="w-full h-full bg-gray-50 p-4 md:p-8 flex flex-col md:flex-row justify-center">
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
            className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="relative w-full"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: "center center",
              }}
            >
              {!moduleId ? (
                <div className="flex min-h-70 sm:min-h-105 w-full items-center justify-center text-gray-400 text-sm text-center px-4">
                  Please select company, model, moduler and side to view the
                  module.
                </div>
              ) : photoError ? (
                <div className="flex min-h-70 sm:min-h-105 w-full items-center justify-center text-gray-400 text-sm text-center px-4">
                  No circuit board photo uploaded for this module yet.
                </div>
              ) : (
                <img
                  ref={imgRef}
                  src={photoUrl}
                  alt="Circuit board"
                  onDoubleClick={handleDoubleClick}
                  draggable={false}
                  onError={() => setPhotoError(true)}
                  className={`block w-full h-auto select-none ${
                    zoom > 1
                      ? isDragging
                        ? "cursor-grabbing"
                        : "cursor-grab"
                      : "cursor-zoom-in"
                  }`}
                />
              )}

              {visibleParts.map((part) => (
                <PartMarker
                  key={part.id}
                  part={part}
                  isOverlapping={overlappingPartIds.has(part.id)}
                  onSelect={handleMarkerSelect}
                />
              ))}

              <SelectionOverlay
                rect={currentSelectionRect}
                hasOverlap={overlappingPartIds.size > 0}
              />

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

            <ZoomControls
              zoom={zoom}
              onZoomOut={handleZoomOut}
              onZoomIn={handleZoomIn}
            />
          </div>
        </div>
      </div>
      {/* component info */}
      <PartDetailsPanel part={selectedPart} />

      {showPartForm && (
        <AddEditPartModal
          draft={partDraft}
          onChange={setPartDraft}
          pendingCoords={pendingCoords}
          error={partError}
          isSaving={isSavingPart}
          onCancel={() => {
            setShowPartForm(false);
            setPendingCoords(null);
          }}
          onSubmit={handlePartSubmit}
        />
      )}

      {showCustomerForm && (
        <CustomerInfoModal
          customer={customer}
          onChange={setCustomer}
          error={partError}
          isSaving={isSavingPart}
          onSkip={() => setShowCustomerForm(false)}
          onSubmit={handleCustomerSubmit}
        />
      )}
    </div>
  );
};

export default Diagram;
