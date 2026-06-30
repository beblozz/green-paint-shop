import React, { useState } from 'react';

function FiltersModal({ isOpen, onClose, activeFilters, onApply }) {
  const [priceFrom, setPriceFrom] = useState(activeFilters.priceFrom);
  const [priceTo, setPriceTo] = useState(activeFilters.priceTo);
  const [categories, setCategories] = useState(activeFilters.categories);
  const [lighting, setLighting] = useState(activeFilters.lighting);
  const [care, setCare] = useState(activeFilters.care);

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
      lighting,
      care,
      priceFrom,
      priceTo
    });
    onClose();
  };

  const handleReset = () => {
    const resetValues = {
      categories: [],
      lighting: [],
      care: [],
      priceFrom: 0,
      priceTo: 5000
    };
    setCategories([]);
    setLighting([]);
    setCare([]);
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
          {['Все растения', 'Крупные растения', 'Средние растения', 'Маленькие растения', 'Подвесные растения', 'Цветущие растения'].map((cat, i) => (
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
          <h3 className="filter-group-title">Освещение</h3>
          {['Яркий свет', 'Рассеянный свет', 'Тень'].map((light, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={lighting.includes(light)}
                  onChange={() => handleCheckboxChange(lighting, setLighting, light)}
                />
                {lighting.includes(light) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{light}</span>
            </label>
          ))}
        </div>

        <hr className="modal-filter-line" />

        <div className="filter-group">
          <h3 className="filter-group-title">Сложность ухода</h3>
          {['Легкий', 'Средний', 'Сложный'].map((c, i) => (
            <label key={i} className="filter-checkbox-label">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={care.includes(c)}
                  onChange={() => handleCheckboxChange(care, setCare, c)}
                />
                {care.includes(c) && <img src="/images/Done.png" alt="checked" className="done-icon" />}
              </div>
              <span>{c}</span>
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

export default FiltersModal;