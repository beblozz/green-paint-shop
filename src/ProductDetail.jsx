import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findProductById, ALL_PRODUCTS, applyDiscount } from './data/products';

function ProductDetail({ allProducts, onBackToCatalog, favoriteItems, onToggleFavorite, onAddToCart, discounts }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const numericId = parseInt(id, 10);
  const product = (allProducts || ALL_PRODUCTS).find(p => p.id === numericId) || findProductById(id);

  if (!product) {
    return (
      <div className="product-detail-page font-montserrat" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Товар не найден</h2>
        <button className="details-btn" style={{ marginTop: '20px' }} onClick={onBackToCatalog}>Вернуться в каталог</button>
      </div>
    );
  }

  const isKashpo = product.generalCategory === 'КАШПО';
  const isCare = product.generalCategory === 'ДЛЯ УХОДА';
  const isLiked = (favoriteItems || []).some(fav => fav.id === product.id);

  const relatedProducts = [
    { id: 101, name: 'Увлажнитель для растений', img: '/images/uvlajnitel.png', price: '690 ₽' },
    { id: 102, name: 'Грунт для декоративно-лиственных', img: '/images/grunt.png', price: '390 ₽' }
  ];

  const basePrice = product.priceNum || 0;
  const discount = parseInt((discounts && discounts[product.id]) || 0) || 0;
  const hasDiscount = discount > 0;
  const currentPrice = hasDiscount ? applyDiscount(basePrice, discount) : basePrice;

  return (
    <div className="product-detail-page">
      <div className="breadcrumbs font-montserrat">
        <span onClick={onBackToCatalog} style={{ cursor: 'pointer' }}>Главная</span> &gt; 
        <span onClick={onBackToCatalog} style={{ cursor: 'pointer' }}> Каталог</span> &gt; 
        <span> {isKashpo ? 'Кашпо' : isCare ? 'Для ухода' : 'Растения'}</span> &gt; 
        <span className="current-crumb"> {product.name}</span>
      </div>
      <section className="product-main-container">
        <div className="product-image-block">
          <div className="detail-img-wrapper">
            <img src={product.img} alt={product.name} className="detail-main-img" />
            <button 
              className={`detail-fav-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => onToggleFavorite(product)}
            >
              <img src={isLiked ? "/images/Heart_zeleni.png" : "/images/Favorite.png"} alt="Избранное" />
            </button>
          </div>
        </div>
        <div className="product-info-block">
          <div className="hit-badge font-montserrat">{product.isSale || hasDiscount ? 'SALE' : 'ХИТ'}</div>
          <h1 className="product-detail-title font-cormorant">{product.name}</h1>
          
          <p className="product-short-desc font-montserrat">
            {isKashpo 
              ? 'Дизайнерское интерьерное кашпо ручной работы. Идеально подчёркивает геометрию растений и создаёт стильный акцент в любом современном пространстве.'
              : isCare
              ? 'Качественный товар для ухода за комнатными растениями. Помогает поддерживать здоровье и красоту вашего зелёного уголка.'
              : 'Декоративное растение с крупными округлыми листьями и выразительными серебристо-зелёными рисунком.'
            }
          </p>
          <div className="rating-row font-montserrat">
            {[...Array(5)].map((_, i) => (
              <img key={i} src="/images/Star.png" alt="Стар" className="star-icon" />
            ))}
            <span className="rating-text">4,9 (59 отзывов)</span>
          </div>
          <div className="detail-price-row font-montserrat">
            <span className="detail-current-price">{currentPrice} ₽</span>
            {hasDiscount ? (
              <>
                <span className="detail-old-price">{basePrice} ₽</span>
                <span className="detail-discount-tag">
                  -{discount}%
                </span>
              </>
            ) : product.isSale && product.oldPrice && (
              <span className="detail-old-price">старая цена: {product.oldPrice}</span>
            )}
          </div>

          <div className="stock-status font-montserrat">
            <span className="stock-circle"></span> В наличии
          </div>
          <div className="purchase-controls-row">
            <div className="quantity-counter font-montserrat">
              <button onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}>–</button>
              <input type="text" value={quantity} readOnly />
              <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
            </div>

            <button 
              className="add-to-cart-large-btn font-montserrat"
              onClick={() => {
                onAddToCart(product, quantity);
              }}
            >
              ДОБАВИТЬ В КОРЗИНУ
              <img src="/images/Shopping Cart.png" alt="Корзина" style={{ width: '24px' }} />
            </button>
          </div>
          {!isCare ? (
            <div className="care-icons-plate font-montserrat">
              <div className="care-plate-item">
                <img src={isKashpo ? "/images/Filter.png" : "/images/Sun.png"} alt="Иконка 1" style={{ width: '20px', height: '20px' }} />
                <div>
                  <span className="care-label">{isKashpo ? 'Материал -' : 'Освещение -'}</span>
                  <span className="care-value">
                    {isKashpo ? ` ${(product.material || 'Гипс').toLowerCase()}` : ` ${(product.lighting || 'рассеянный свет').toLowerCase()}`}
                  </span>
                </div>
              </div>
              <div className="care-plate-item">
                <img src={isKashpo ? "/images/Done.png" : "/images/Water.png"} alt="Иконка 2" style={{ width: '20px', height: '20px' }} />
                <div>
                  <span className="care-label">{isKashpo ? 'Дренаж -' : 'Полив -'}</span>
                  <span className="care-value">{isKashpo ? ' возможен' : ' умеренный'}</span>
                </div>
              </div>
              <div className="care-plate-item">
                <img src={isKashpo ? "/images/kashpo.png" : "/images/Ruler.png"} alt="Иконка 3" style={{ width: '20px', height: '20px' }} />
                <div>
                  <span className="care-label">{isKashpo ? 'Размер -' : 'Высота -'}</span>
                  <span className="care-value">{isKashpo ? ` ${product.size || 'Среднее'}` : ' 30 см'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="care-icons-plate font-montserrat">
              <div className="care-plate-item">
                <img src="/images/Done.png" alt="Качество" style={{ width: '20px', height: '20px' }} />
                <div>
                  <span className="care-label">Применение -</span>
                  <span className="care-value"> многоразовое</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="product-tabs-container font-montserrat">
        <div className="tabs-grid">
          <div className="tab-block">
            <h3>Описание</h3>
            <p>
              {isKashpo ? (
                `Кашпо «${product.name.replace(/Кашпо\s«?|»?/g, '')}» — это уникальное дизайнерское решение для вашего дома. Форма кашпо спроектирована так, чтобы подчеркнуть природную красоту посаженного в него растения, создавая гармоничную композицию.`
              ) : isCare ? (
                `${product.name} — профессиональный товар для ухода за растениями. Обеспечивает правильный уход и создаёт комфортные условия для роста и развития ваших зелёных питомцев.`
              ) : (
                `${product.name} — эффектное комнатное растение с широкими округлыми листьями, украшенными мягкими серебристо-зелёными полосами. Идеально подходит для создания уютного зелёного акцента.`
              )}
            </p>
          </div>

          <div className="tab-block vertical-lines">
            <h3>Характеристики</h3>
            <div className="product-features font-montserrat">
              {!isKashpo && !isCare && product.lighting && (
                <div className="feature-item">
                  <strong>Освещение:</strong> <span>{product.lighting}</span>
                </div>
              )}
              {!isKashpo && !isCare && product.care && (
                <div className="feature-item">
                  <strong>Сложность ухода:</strong> <span>{product.care}</span>
                </div>
              )}
              {isKashpo && (
                <div className="feature-item">
                  <strong>Материал:</strong> <span>{product.material || 'Высококачественный состав'}</span>
                </div>
              )}
              {isCare && (
                <>
                  <div className="feature-item">
                    <strong>Тип товара:</strong> <span>{product.type || 'Инвентарь'}</span>
                  </div>
                  <div className="feature-item">
                    <strong>Назначение:</strong> <span>{product.placement || 'Универсальное'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="tab-block">
            <h3>{isKashpo ? 'Размещение' : isCare ? 'Применение' : 'Уход'}</h3>
            <p>
              {isKashpo ? (
                'Подходит для использования внутри жилых и офисных помещений. Рекомендуется использовать внутренний пластиковый горшок-вкладыш во избежание заиления стенок при поливе.'
              ) : isCare ? (
                'Рекомендуется использовать согласно инструкции на упаковке. Подходит для всех видов комнатных растений. Хранить в сухом месте, защищённом от прямых солнечных лучей.'
              ) : (
                `Предпочитает ${(product.lighting || 'рассеянный свет').toLowerCase()} без прямых солнечных лучей. Поливайте умеренно, поддерживая лёгкую влажность почвы.`
              )}
            </p>
          </div>
        </div>
      </section>
      <section className="related-products-section font-montserrat">
        <h2 className="related-title">С этим товаром покупают</h2>
        <div className="related-grid">
          {relatedProducts.map(item => (
            <div key={item.id} className="related-card">
              <img src={item.img} alt={item.name} className="related-img" />
              <div className="related-info">
                <span className="related-name">{item.name}</span>
                <div className="related-footer-row">
                  <span className="related-price">{item.price}</span>
                  <button className="related-cart-btn" onClick={() => onAddToCart(item, 1)}>
                    <img src="/images/Shopping Cart.png" alt="Купить" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductDetail;