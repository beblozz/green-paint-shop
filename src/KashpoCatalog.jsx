import React, { useState } from 'react';
import KashpoFiltersModal from './KashpoFiltersModal';
import { KASHPO, applyDiscount } from './data/products';

function KashpoCatalog({ products, onProductClick, onSwitchCategory, onAddToCart, favoriteItems, onToggleFavorite, discounts }) {
  const sourceProducts = products || KASHPO;
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const PRODUCTS_PER_PAGE = 4;
  const [selectedQuickMaterial, setSelectedQuickMaterial] = useState('Все');
  const [sidebarFilters, setSidebarFilters] = useState({
    categories: [], materials: [], sizes: [], priceFrom: 0, priceTo: 10000
  });

  const handleApplySidebar = (newFilters) => {
    setSidebarFilters(newFilters);
    setActivePage(1); 
  };

  const filteredProducts = sourceProducts.filter(item => {
    if (selectedQuickMaterial !== 'Все' && item.material !== selectedQuickMaterial) return false;

    if (item.priceNum < sidebarFilters.priceFrom || item.priceNum > sidebarFilters.priceTo) return false;

    if (sidebarFilters.categories.length > 0 && !sidebarFilters.categories.includes('Все кашпо')) {
      if (!sidebarFilters.categories.includes(item.subCategory)) return false;
    }
    if (sidebarFilters.materials.length > 0 && !sidebarFilters.materials.includes(item.material)) return false;
    if (sidebarFilters.sizes.length > 0 && !sidebarFilters.sizes.includes(item.size)) return false;

    return true;
  });

  const indexOfLast = activePage * PRODUCTS_PER_PAGE;
  const indexOfFirst = indexOfLast - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

  return (
    <div className="catalog-page">
      <section className="categories-section">
        <div className="category-item-circle" onClick={() => onSwitchCategory('РАСТЕНИЯ')} style={{ cursor: 'pointer' }}>
          <div className="circle-bg"><img src="/images/Hydroponics.png" alt="Растения" /></div>
          <span className="circle-label">РАСТЕНИЯ</span>
        </div>
        <div className="category-item-circle active-circle" onClick={() => onSwitchCategory('КАШПО')} style={{ cursor: 'pointer' }}>
          <div className="circle-bg"><img src="/images/kashpo.png" alt="Кашпо" /></div>
          <span className="circle-label">КАШПО</span>
        </div>
        <div className="category-item-circle" onClick={() => onSwitchCategory('ДЛЯ УХОДА')} style={{ cursor: 'pointer' }}>
          <div className="circle-bg"><img src="/images/Honesty.png" alt="Для ухода" /></div>
          <span className="circle-label">ДЛЯ УХОДА</span>
        </div>
        <div className="category-item-circle" onClick={() => onSwitchCategory('УДОБРЕНИЯ')} style={{ cursor: 'pointer' }}>
          <div className="circle-bg"><img src="/images/Digestate.png" alt="Удобрения" /></div>
          <span className="circle-label">УДОБРЕНИЯ</span>
        </div>
      </section>
      <div className="kashpo-filter-bar">
        <button className="filter-btn" onClick={() => setIsFiltersOpen(true)}>
          <img src="/images/Filter.png" alt="Фильтры" className="filter-icon" /> ФИЛЬТРЫ
        </button>
      </div>
      <hr className="catalog-divider" />
      <section className="catalog-main-grid kashpo-grid-layout">
        {currentProducts.length > 0 ? (
          currentProducts.map((kashpo) => {
            const isLiked = favoriteItems.some(fav => fav.id === kashpo.id);
            const basePrice = kashpo.priceNum || 0;
            const discount = parseInt((discounts && discounts[kashpo.id]) || 0) || 0;
            const hasDiscount = discount > 0;
            const finalPrice = applyDiscount(basePrice, discount);

            return (
              <div key={kashpo.id} className="catalog-product-card kashpo-card">
                <div className="catalog-img-wrapper" onClick={() => onProductClick(kashpo)} style={{ cursor: 'pointer' }}>
                  <img src={kashpo.img} alt={kashpo.name} className="catalog-plant-img" />
                  {(kashpo.isSale || hasDiscount) && (
                    <div className="catalog-sale-badge"><span>{hasDiscount ? `-${discount}%` : 'SALE'}</span></div>
                  )}
                  <button 
                    className={`favorite-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onToggleFavorite(kashpo); 
                    }}
                  >
                    <img 
                      src={isLiked ? "/images/Heart_zeleni.png" : "/images/Favorite.png"} 
                      alt="Избранное" 
                      className="heart-icon-img"
                    />
                  </button>
                </div>
                <h2 className="catalog-plant-name font-cormorant" onClick={() => onProductClick(kashpo)} style={{ cursor: 'pointer' }}>
                  {kashpo.name}
                </h2>
                <div className="catalog-card-bottom">
                  <div className="catalog-price-block">
                    {hasDiscount ? (
                      <>
                        <span className="catalog-current-price" style={{ color: '#d9534f' }}>{finalPrice} ₽</span>
                        <span className="catalog-old-price">старая цена: {basePrice} ₽</span>
                      </>
                    ) : (
                      <span className="catalog-current-price">{kashpo.price}</span>
                    )}
                    {!hasDiscount && kashpo.isSale && <span className="catalog-old-price">старая цена: {kashpo.oldPrice}</span>}
                  </div>
                  <button 
                    className="catalog-cart-circle-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onAddToCart) onAddToCart(kashpo); 
                    }}
                  >
                    <img src="/images/Shopping Cart.png" alt="Корзина" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-products-container font-montserrat" style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center' }}>
            <p className="no-products-message">По выбранным фильтрам кашпо не найдено.</p>
          </div>
        )}
      </section>
      {totalPages > 1 && (
        <div className="pagination-container">
          <hr className="pagination-divider" />
          <div className="pagination-controls">
            <button className="page-arrow-btn" onClick={() => setActivePage(prev => Math.max(prev - 1, 1))}>
              <img src="/images/Arrow.png" alt="Назад" className="arrow-left-img" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                className={`page-num-btn ${activePage === i + 1 ? 'active' : ''}`} 
                onClick={() => setActivePage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="page-arrow-btn" onClick={() => setActivePage(prev => Math.min(prev + 1, totalPages))}>
              <img src="/images/Arrow.png" alt="Вперед" className="arrow-right-img" />
            </button>
          </div>
        </div>
      )}
      <KashpoFiltersModal 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
        activeFilters={sidebarFilters} 
        onApply={handleApplySidebar} 
      />
    </div>
  );
}

export default KashpoCatalog;