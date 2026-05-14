import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', marginTop: '0.35rem' }}>
      <div 
        className="input"
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          cursor: 'pointer', userSelect: 'none', margin: 0,
          borderColor: isOpen ? 'var(--accent-primary)' : 'var(--surface-border)',
          boxShadow: isOpen ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>

      {isOpen && (
        <div 
          className="glass-panel animate-slide-up"
          style={{ 
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
            marginTop: '0.5rem', maxHeight: '250px', overflowY: 'auto',
            padding: '0.5rem', borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)', background: 'var(--bg-secondary)', border: '1px solid var(--surface-border)'
          }}
        >
          {options.map((option) => (
            <div 
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              style={{
                padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '6px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: value === option.value ? 'var(--surface-glass)' : 'transparent',
                color: value === option.value ? 'var(--accent-primary)' : 'var(--text-primary)',
                transition: 'background 0.2s',
                marginBottom: '2px'
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontWeight: value === option.value ? 600 : 400 }}>{option.label}</span>
              {value === option.value && <Check size={16} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
