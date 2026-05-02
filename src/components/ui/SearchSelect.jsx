import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function SearchSelect({
  items = [],
  value,
  onChange,
  placeholder = "Buscar...",
  label,
  required = false,
  disabled = false,
  error = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selected = items.find(it => it.id === value) ?? null;
  const isLocked = !!selected;
  const inputValue = isLocked ? (selected?.label ?? "") : query;

  const filtered = query && !selected
    ? items.filter(it => it.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const openDropdown = () => {
    if (isLocked || disabled) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen(true);
  };

  // Close when clicking outside both the input wrapper and the portal dropdown
  useEffect(() => {
    const handler = (e) => {
      const inWrapper = wrapperRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inWrapper && !inDropdown) {
        setOpen(false);
        if (!value) setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  // Close on any scroll to avoid misalignment with fixed-position dropdown
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (value) onChange(null);
    openDropdown();
  };

  const handleSelect = (item) => {
    onChange(item.id);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={openDropdown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isLocked}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"
          } ${isLocked && !disabled ? "bg-gray-50 pr-8 cursor-default" : error ? "bg-red-50" : ""}`}
        />
        {isLocked && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Limpiar selección"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && !isLocked && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                type="button"
                onMouseDown={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
              >
                {item.label}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
