import React, { useState } from 'react';
import FiltersModal from './FiltersModal';
import { PLANTS, applyDiscount } from './data/products';

function Catalog({ products, onProductClick, onSwitchCategory, onAddToCart, favoriteItems, onToggleFavorite, discounts }) {
  const sourceProducts = products || PLANTS;

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const PRODUCTS_PER_PAGE = 4;
  const [selectedCircleCategory, setSelectedCircleCategory] = useState('РАСТЕНИЯ');

  const [filters, setFilters] = useState({
    categories: [],
    lighting: [],
    care: [],
    priceFrom: 0,
    priceTo: 10000
  });

  const handleCircleCategoryClick = (categoryName) => {
    if (categoryName === 'КАШПО' && onSwitchCategory) {
      onSwitchCategory('КАШПО');
    } else if (categoryName === 'ДЛЯ УХОДА' && onSwitchCategory) {
      onSwitchCategory('ДЛЯ УХОДА');
    } else if (categoryName === 'УДОБРЕНИЯ' && onSwitchCategory) {
      onSwitchCategory('УДОБРЕНИЯ');
    } else {
      setSelectedCircleCategory(categoryName);
      setActivePage(1); 
    }
  };

  const filteredProducts = sourceProducts.filter(product => {
    if (product.generalCategory !== selectedCircleCategory) return false;

    const priceVal = product.priceNum || 0;
    if (priceVal < filters.priceFrom || priceVal > filters.priceTo) return false;
    
    if (filters.categories.length > 0 && !filters.categories.includes('Все растения')) {
      if (!filters.categories.includes(product.category)) return false;
    }
    if (filters.lighting.length > 0 && !filters.lighting.includes(product.lighting)) return false;
    if (filters.care.length > 0 && !filters.care.includes(product.care)) return false;
    
    return true;
  });

  const indexOfLastProduct = activePage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setActivePage(1);
  };

  return (
    <div className="catalog-page">
      <section className="categories-section">
        <div 
          className={`category-item-circle ${selectedCircleCategory === 'РАСТЕНИЯ' ? 'active-circle' : ''}`}
          onClick={() => handleCircleCategoryClick('РАСТЕНИЯ')}
          style={{ cursor: 'pointer' }}
        >
          <div className="circle-bg"><img src="/images/Hydroponics.png" alt="Растения" /></div>
          <span className="circle-label">РАСТЕНИЯ</span>
        </div>

        <div 
          className={`category-item-circle ${selectedCircleCategory === 'КАШПО' ? 'active-circle' : ''}`}
          onClick={() => handleCircleCategoryClick('КАШПО')}
          style={{ cursor: 'pointer' }}
        >
          <div className="circle-bg"><img src="/images/kashpo.png" alt="Кашпо" /></div>
          <span className="circle-label">КАШПО</span>
        </div>

        <div 
          className={`category-item-circle ${selectedCircleCategory === 'ДЛЯ УХОДА' ? 'active-circle' : ''}`}
          onClick={() => handleCircleCategoryClick('ДЛЯ УХОДА')}
          style={{ cursor: 'pointer' }}
        >
          <div className="circle-bg"><img src="/images/Honesty.png" alt="Для ухода" /></div>
          <span className="circle-label">ДЛЯ УХОДА</span>
        </div>

        <div 
          className={`category-item-circle ${selectedCircleCategory === 'УДОБРЕНИЯ' ? 'active-circle' : ''}`}
          onClick={() => handleCircleCategoryClick('УДОБРЕНИЯ')}
          style={{ cursor: 'pointer' }}
        >
          <div className="circle-bg"><img src="/images/Digestate.png" alt="Удобрения" /></div>
          <span className="circle-label">УДОБРЕНИЯ</span>
        </div>
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
          currentProducts.map((plant) => {
            const isLiked = (favoriteItems || []).some(fav => fav.id === plant.id);
            const basePrice = plant.priceNum || 0;
            const discount = parseInt((discounts && discounts[plant.id]) || 0) || 0;
            const hasDiscount = discount > 0;
            const finalPrice = applyDiscount(basePrice, discount);

            return (
              <div key={plant.id} className="catalog-product-card">
                <div className="catalog-img-wrapper" onClick={() => onProductClick(plant)} style={{ cursor: 'pointer' }}>
                  <img src={plant.img} alt={plant.name} className="catalog-plant-img" />
                  
                  {(plant.isSale || hasDiscount) && (
                    <div className="catalog-sale-badge">
                      <span>{hasDiscount ? `-${discount}%` : 'SALE'}</span>
                    </div>
                  )}

                  <button 
                    className={`favorite-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onToggleFavorite(plant); 
                    }}
                  >
                    <img 
                      src={isLiked ? "/images/Heart_zeleni.png" : "/images/Favorite.png"} 
                      alt="Избранное" 
                      className="heart-icon-img"
                    />
                  </button>
                </div>

                <h2 className="catalog-plant-name font-cormorant" onClick={() => onProductClick(plant)} style={{ cursor: 'pointer' }}>
                  {plant.name}
                </h2>
                
                <div className="catalog-card-bottom">
                  <div className="catalog-price-block">
                    {hasDiscount ? (
                      <>
                        <span className="catalog-current-price" style={{ color: '#d9534f' }}>{finalPrice} ₽</span>
                        <span className="catalog-old-price">старая цена: {basePrice} ₽</span>
                      </>
                    ) : plant.isSale ? (
                      <>
                        <span className="catalog-current-price" style={{ color: '#d9534f' }}>{plant.price}</span>
                        <span className="catalog-old-price">старая цена: {plant.oldPrice}</span>
                      </>
                    ) : (
                      <span className="catalog-current-price">{basePrice} ₽</span>
                    )}
                  </div>
                  
                  <button 
                    className="catalog-cart-circle-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onAddToCart) onAddToCart(plant);
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
            <p className="no-products-message">В категории «{selectedCircleCategory}» пока нет доступных товаров.</p>
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

      <FiltersModal 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
        activeFilters={filters}
        onApply={(newFilters) => handleApplyFilters(newFilters)}
      />
    </div>
  );
}

export default Catalog;