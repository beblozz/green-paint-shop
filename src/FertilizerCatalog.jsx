import React, { useState } from 'react';
import FertilizerFiltersModal from './FertilizerFiltersModal';
import { FERTILIZERS, applyDiscount } from './data/products';

function FertilizerCatalog({ products, onProductClick, onSwitchCategory, onAddToCart, favoriteItems, onToggleFavorite, discounts }) {
  const sourceProducts = products || FERTILIZERS;
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const PRODUCTS_PER_PAGE = 4;

  const [filters, setFilters] = useState({
    types: [], forms: [], purposes: [], priceFrom: 0, priceTo: 5000
  });

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setActivePage(1);
  };

  const filteredProducts = sourceProducts.filter(product => {
    if (product.priceNum < filters.priceFrom || product.priceNum > filters.priceTo) return false;
    
    if (filters.types.length > 0 && !filters.types.includes(product.type)) return false;
    if (filters.forms.length > 0 && !filters.forms.includes(product.form)) return false;
    if (filters.purposes.length > 0 && !filters.purposes.includes(product.purpose)) return false;

    return true;
  });

  const currentProducts = filteredProducts.filter(item => item.page === activePage);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

  return (
    <div className="catalog-page">
      <section className="categories-section">
        {['РАСТЕНИЯ', 'КАШПО', 'ДЛЯ УХОДА', 'УДОБРЕНИЯ'].map((name, idx) => {
          const imgs = ['Hydroponics.png', 'kashpo.png', 'Honesty.png', 'Digestate.png'];
          return (
            <div 
              key={idx} 
              className={`category-item-circle ${name === 'УДОБРЕНИЯ' ? 'active-circle' : ''}`} 
              onClick={() => onSwitchCategory(name)}
              style={{ cursor: 'pointer' }}
            >
              <div className="circle-bg"><img src={`/images/${imgs[idx]}`} alt={name} /></div>
              <span className="circle-label">{name}</span>
            </div>
          );
        })}
      </section>

      <div className="filter-container">
        <button className="filter-btn" onClick={() => setIsFiltersOpen(true)}>
          <img src="/images/Filter.png" alt="Фильтры" className="filter-icon" />
          ФИЛЬТРЫ
        </button>
      </div>
      <hr className="catalog-divider" />

      <section className="catalog-main-grid">
        {currentProducts.length > 0 ? (
          currentProducts.map((prod) => {
            const isLiked = favoriteItems.some(fav => fav.id === prod.id);

            return (
              <div key={prod.id} className="catalog-product-card">
                <div className="catalog-img-wrapper" onClick={() => onProductClick(prod)} style={{ cursor: 'pointer' }}>
                  <img src={prod.img} alt={prod.name} className="catalog-plant-img" />
                  {prod.isSale && <div className="catalog-sale-badge"><span>SALE</span></div>}

                  <button 
                    className={`favorite-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onToggleFavorite(prod); 
                    }}
                  >
                    <img 
                      src={isLiked ? "/images/Heart_zeleni.png" : "/images/Favorite.png"} 
                      alt="Избранное" 
                      className="heart-icon-img"
                    />
                  </button>
                </div>
                <h2 className="catalog-plant-name font-cormorant" onClick={() => onProductClick(prod)} style={{ cursor: 'pointer' }}>
                  {prod.name}
                </h2>
                <div className="catalog-card-bottom">
                  <div className="catalog-price-block">
                    {(() => {
                      const discountPercent = parseInt(discounts?.[prod.id]) || 0;
                      const cleanPrice = prod.priceNum || parseInt(prod.price?.replace(/\D/g, '')) || 0;

                      if (discountPercent > 0) {
                        const finalPrice = applyDiscount(cleanPrice, discountPercent);
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="catalog-current-price" style={{ color: '#FF4D4D', fontWeight: 'bold' }}>
                              {finalPrice} ₽
                            </span>
                            <span className="catalog-old-price" style={{ textDecoration: 'line-through', color: '#A3B1A8', fontSize: '13px' }}>
                              старая цена: {prod.price}
                            </span>
                            <span style={{ backgroundColor: '#FF4D4D', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', width: 'fit-content', fontWeight: 'bold' }}>
                              -{discountPercent}%
                            </span>
                          </div>
                        );
                      }
                      return <span className="catalog-current-price">{prod.price}</span>;
                    })()}
                  </div>
                  <button 
                    className="catalog-cart-circle-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      
                      const discountPercent = parseInt(discounts?.[prod.id]) || 0;
                      const cleanPrice = prod.priceNum || parseInt(prod.price?.replace(/\D/g, '')) || 0;
                      const discountedPrice = applyDiscount(cleanPrice, discountPercent);
                      const finalProduct = discountPercent > 0
                        ? { ...prod, price: `${discountedPrice} ₽`, priceNum: discountedPrice }
                        : prod;

                      if (onAddToCart) onAddToCart(finalProduct); 
                    }}
                  >
                    <img src="/images/Shopping Cart.png" alt="В корзину" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-products-container font-montserrat">
            <p className="no-products-message">По выбранным фильтрам удобрений не найдено.</p>
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
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button 
                  key={pageNum}
                  className={`page-num-btn ${activePage === pageNum ? 'active' : ''}`} 
                  onClick={() => setActivePage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button className="page-arrow-btn" onClick={() => setActivePage(prev => Math.min(prev + 1, totalPages))}>
              <img src="/images/Arrow.png" alt="Вперед" className="arrow-right-img" />
            </button>
          </div>
        </div>
      )}

      <FertilizerFiltersModal 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
        activeFilters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}

export default FertilizerCatalog;