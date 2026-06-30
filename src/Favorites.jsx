import React from 'react';

function Favorites({ favoriteItems = [], onProductClick, onBackToProfile }) {
  return (
    <div className="favorites-page font-montserrat">
      <div className="favorites-header-row">
        <button className="back-to-profile-btn" onClick={onBackToProfile}>&lt; В личный кабинет</button>
        <h1 className="favorites-main-title font-cormorant">ИЗБРАННОЕ</h1>
      </div>

      <div className="favorites-container-box">
        {favoriteItems.length > 0 ? (
          <div className="favorites-grid">
            {favoriteItems.map((item) => (
              <div key={item.id} className="fav-product-card" onClick={() => onProductClick(item)}>
                <div className="fav-img-container">
                  <img src={item.img} alt={item.name} className="fav-plant-img" />
                </div>
                <div className="fav-card-footer">
                  <div className="fav-info-text">
                    <span className="fav-product-name">{item.name}</span>
                    <span className="fav-product-price">{item.price}</span>
                  </div>
                  <button className="fav-cart-add-btn" onClick={(e) => e.stopPropagation()}>
                    <img src="/images/Shopping Cart.png" alt="В корзину" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-favorites font-montserrat">
            <p>В вашем избранном пока ничего нет.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;