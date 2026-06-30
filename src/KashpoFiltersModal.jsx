import React, { useState, useEffect } from 'react';

function KashpoFiltersModal({ isOpen, onClose, activeFilters, onApply }) {
  const [priceFrom, setPriceFrom] = useState(activeFilters.priceFrom ?? 0);
  const [priceTo, setPriceTo] = useState(activeFilters.priceTo ?? 5000);

  const [categories, setCategories] = useState(activeFilters.categories || []);
  const [materials, setMaterials] = useState(activeFilters.materials || []);
  const [sizes, setSizes] = useState(activeFilters.sizes || []);

  useEffect(() => {
    if (activeFilters) {
      setCategories(activeFilters.categories || []);
      setMaterials(activeFilters.materials || []);
      setSizes(activeFilters.sizes || []);
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
    onApply({
      categories,
      materials,
      sizes,
      priceFrom,
      priceTo
    });
    onClose();
  };

  const handleReset = () => {
    const resetValues = {
      categories: [],
      materials: [],
      sizes: [],
      priceFrom: 0,
      priceTo: 5000
    };
    setCategories([]);
    setMaterials([]);
    setSizes([]);
    setPriceFrom(0);
    setPriceTo(5000);
    onApply(resetValues);
    onClose();
  };

  const minPercent = (priceFrom / 10000) * 100;
  const maxPercent = (priceTo / 10000) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-sidebar" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <div className="filter-group">
          <h3 className="filter-group-title">Категории</h3>
          {['Все кашпо', 'Настольные кашпо', 'Напольные кашпо', 'Подвесные кашпо', 'Декоративные кашпо', 'Необычные кашпо'].map((cat, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={categories.includes(cat)}
                  onChange={() => handleCheckboxChange(categories, setCategories, cat)}
                />
                {categories.includes(cat) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{cat}</span>
            </label>
          ))}
        </div>

        <hr className="modal-filter-line" />

        <div className="filter-group">
          <h3 className="filter-group-title">Материал</h3>
          {['Керамика', 'Бетон', 'Пластик', 'Гипс', 'Полистоун', 'Глина'].map((mat, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={materials.includes(mat)}
                  onChange={() => handleCheckboxChange(materials, setMaterials, mat)}
                />
                {materials.includes(mat) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{mat}</span>
            </label>
          ))}
        </div>

        <hr className="modal-filter-line" />
        <div className="filter-group">
          <h3 className="filter-group-title">Размер</h3>
          {['Маленькие', 'Средние', 'Большие'].map((sz, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={sizes.includes(sz)}
                  onChange={() => handleCheckboxChange(sizes, setSizes, sz)}
                />
                {sizes.includes(sz) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{sz}</span>
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
              max="10000" 
              step="50"
              value={priceFrom} 
              className="range-input"
              onChange={(e) => setPriceFrom(Math.min(Number(e.target.value), priceTo - 50))}
            />
            <input 
              type="range" 
              min="0" 
              max="10000" 
              step="50"
              value={priceTo} 
              className="range-input"
              onChange={(e) => setPriceTo(Math.max(Number(e.target.value), priceFrom + 50))}
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

export default KashpoFiltersModal;