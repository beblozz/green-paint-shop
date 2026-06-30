import React, { useState, useEffect } from 'react';

function FertilizerFiltersModal({ isOpen, onClose, activeFilters, onApply }) {
  const [priceFrom, setPriceFrom] = useState(activeFilters.priceFrom ?? 0);
  const [priceTo, setPriceTo] = useState(activeFilters.priceTo ?? 5000);

  const [types, setTypes] = useState(activeFilters.types || []);
  const [forms, setForms] = useState(activeFilters.forms || []);
  const [purposes, setPurposes] = useState(activeFilters.purposes || []);

  useEffect(() => {
    if (activeFilters) {
      setTypes(activeFilters.types || []);
      setForms(activeFilters.forms || []);
      setPurposes(activeFilters.purposes || []);
      setPriceFrom(activeFilters.priceFrom ?? 0);
      setPriceTo(activeFilters.priceTo ?? 5000);
    }
  }, [activeFilters, isOpen]);

  if (!isOpen) return null;

  const handleCheckboxChange = (state, setState, value) => {
    if (state.includes(value)) {
      setState(state.filter(item => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const handleSubmit = () => {
    onApply({ types, forms, purposes, priceFrom, priceTo });
    onClose();
  };

  const handleReset = () => {
    setTypes([]);
    setForms([]);
    setPurposes([]);
    setPriceFrom(0);
    setPriceTo(5000);
    onApply({ types: [], forms: [], purposes: [], priceFrom: 0, priceTo: 5000 });
    onClose();
  };

  const minPercent = (priceFrom / 5000) * 100;
  const maxPercent = (priceTo / 5000) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-sidebar" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <div className="filter-group">
          <h3 className="filter-group-title">Тип удобрения</h3>
          {['Органические', 'Минеральные', 'Биостимуляторы'].map((t, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={types.includes(t)}
                  onChange={() => handleCheckboxChange(types, setTypes, t)}
                />
                {types.includes(t) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{t}</span>
            </label>
          ))}
        </div>

        <hr className="modal-filter-line" />

        <div className="filter-group">
          <h3 className="filter-group-title">Форма выпуска</h3>
          {['Жидкие концентрат', 'Сухие / Гранулы', 'Палочки', 'Спреи'].map((f, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={forms.includes(f)}
                  onChange={() => handleCheckboxChange(forms, setForms, f)}
                />
                {forms.includes(f) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{f}</span>
            </label>
          ))}
        </div>

        <hr className="modal-filter-line" />

        <div className="filter-group">
          <h3 className="filter-group-title">Назначение</h3>
          {['Для декоративно-лиственных', 'Для цветущих', 'Для кактусов и суккулентов', 'Универсальное'].map((p, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={purposes.includes(p)}
                  onChange={() => handleCheckboxChange(purposes, setPurposes, p)}
                />
                {purposes.includes(p) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{p}</span>
            </label>
          ))}
        </div>

        <hr className="modal-filter-line" />

        <div className="filter-group">
          <h3 className="filter-group-title">Цена</h3>
          <div className="price-inputs-row">
            <span>от</span>
            <input 
              type="text" 
              className="price-num-input" 
              value={priceFrom} 
              onChange={(e) => setPriceFrom(Number(e.target.value.replace(/\D/g, '')))}
            />
            <span>₽</span>
            <span>до</span>
            <input 
              type="text" 
              className="price-num-input" 
              value={priceTo} 
              onChange={(e) => setPriceTo(Number(e.target.value.replace(/\D/g, '')))}
            />
            <span>₽</span>
          </div>
          
          <div className="price-slider-container">
            <div className="price-slider-track-base"></div>
            <div 
              className="price-slider-track-highlight" 
              style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            ></div>
            
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="10"
              value={priceFrom} 
              className="range-input"
              onChange={(e) => setPriceFrom(Math.min(Number(e.target.value), priceTo - 10))}
            />
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="10"
              value={priceTo} 
              className="range-input"
              onChange={(e) => setPriceTo(Math.max(Number(e.target.value), priceFrom + 10))}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="filter-apply-btn" onClick={handleSubmit}>ПРИМЕНИТЬ</button>
          <button className="filter-reset-btn" onClick={handleReset}>Сбросить все фильтры</button>
        </div>
      </div>
    </div>
  );
}

export default FertilizerFiltersModal;