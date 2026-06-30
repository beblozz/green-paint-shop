import React, { useState } from 'react';
import CareFiltersModal from './CareFiltersModal';
import { CARE_PRODUCTS, applyDiscount } from './data/products';

function CareCatalog({ products, onProductClick, onSwitchCategory, onAddToCart, favoriteItems, onToggleFavorite, discounts }) {
  const sourceProducts = products || CARE_PRODUCTS;
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const PRODUCTS_PER_PAGE = 4;

  const [filters, setFilters] = useState({
    categories: [], purposes: [], materials: [], priceFrom: 0, priceTo: 10000
  });

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setActivePage(1);
  };

  const filteredProducts = sourceProducts.filter(product => {
    if (product.priceNum < filters.priceFrom || product.priceNum > filters.priceTo) return false;
    
    if (filters.categories.length > 0 && !filters.categories.includes('Все товары')) {
      if (!filters.categories.includes(product.subCategory)) return false;
    }
    if (filters.purposes.length > 0 && !filters.purposes.includes(product.purpose)) return false;
    if (filters.materials.length > 0 && !filters.materials.includes(product.material)) return false;

    return true;
  });

  const indexOfLastProduct = activePage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

  return (
    <div className="catalog-page">
      <section className="categories-section">
        {['РАСТЕНИЯ', 'КАШПО', 'ДЛЯ УХОДА', 'УДОБРЕНИЯ'].map((name, idx) => {
          const imgs = ['Hydroponics.png', 'kashpo.png', 'Honesty.png', 'Digestate.png'];
          return (
            <div 
              key={idx} 
              className={`category-item-circle ${name === 'ДЛЯ УХОДА' ? 'active-circle' : ''}`} 
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
            const basePrice = prod.priceNum || 0;
            const discount = parseInt((discounts && discounts[prod.id]) || 0) || 0;
            const hasDiscount = discount > 0;
            const finalPrice = applyDiscount(basePrice, discount);

            return (
              <div key={prod.id} className="catalog-product-card">
                <div className="catalog-img-wrapper" onClick={() => onProductClick(prod)} style={{ cursor: 'pointer' }}>
                  <img src={prod.img} alt={prod.name} className="catalog-plant-img" />
                  {(prod.isSale || hasDiscount) && (
                    <div className="catalog-sale-badge"><span>{hasDiscount ? `-${discount}%` : 'SALE'}</span></div>
                  )}

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
                    {hasDiscount ? (
                      <>
                        <span className="catalog-current-price" style={{ color: '#d9534f' }}>{finalPrice} ₽</span>
                        <span className="catalog-old-price">старая цена: {basePrice} ₽</span>
                      </>
                    ) : (
                      <span className="catalog-current-price">{prod.price}</span>
                    )}
                    {!hasDiscount && prod.isSale && <span className="catalog-old-price">старая цена: {prod.oldPrice}</span>}
                  </div>
                  <button 
                    className="catalog-cart-circle-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onAddToCart) onAddToCart(prod); 
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
            <p className="no-products-message">По выбранным фильтрам товаров не найдено.</p>
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
      <CareFiltersModal 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
        activeFilters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}

export default CareCatalog;