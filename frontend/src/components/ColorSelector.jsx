import React from 'react';
import { Check } from 'lucide-react';
import './ColorSelector.css';

/**
 * ColorSelector – Reusable visual color swatch component
 * Used in product customization for color/variant selection
 */
export default function ColorSelector({ variants = [], selected, onChange, label = 'Choose Your Color' }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="color-selector" role="group" aria-label={label}>
      <div className="color-selector-header">
        <span className="color-selector-label">{label}</span>
        {selected && (
          <span className="color-selected-name">
            <Check size={12} />
            {selected.label}
          </span>
        )}
      </div>

      <div className="color-swatches-grid">
        {variants.map((variant) => {
          const isSelected = selected?.value === variant.value;
          return (
            <button
              key={variant.value}
              type="button"
              className={`color-swatch-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(variant)}
              aria-label={`Select ${variant.label} ${isSelected ? '(selected)' : ''}`}
              aria-pressed={isSelected}
              title={variant.label}
            >
              <span
                className="color-swatch-circle"
                style={{ backgroundColor: variant.hex }}
              />
              <span className="color-swatch-name">{variant.label}</span>
              {isSelected && (
                <span className="color-swatch-check" aria-hidden="true">
                  <Check size={10} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
