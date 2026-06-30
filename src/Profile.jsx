import React, { useState, useEffect } from 'react';

function FavoritesSection({ favoriteItems, onProductClick, onToggleFavorite, onAddToCart }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!favoriteItems || favoriteItems.length === 0) {
    return (
      <div className="favorites-empty-state font-montserrat">
        <h2 className="favorites-main-title font-cormorant">ИЗБРАННОЕ</h2>
        <p className="empty-favorites-text">В избранном пока ничего нет. Лайкните товары в каталоге!</p>
      </div>
    );
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < favoriteItems.length - 2) setCurrentIndex(prev => prev + 1);
  };
  const visibleItems = favoriteItems.slice(currentIndex, currentIndex + 2);

  return (
    <div className="favorites-wrapper-global">
      <h2 className="favorites-main-title font-cormorant">ИЗБРАННОЕ</h2>
      
      <div className="favorites-carousel-container">
        <button 
          className={`carousel-arrow arrow-left ${currentIndex === 0 ? 'disabled' : ''}`}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <img src="/images/Arrow.png" alt="Назад" />
        </button>
        <div className="favorites-green-plate">
          <div className="favorites-cards-grid">
            {visibleItems.map((item) => (
              <div key={item.id} className="favorite-card-item font-montserrat">
                <button className="favorite-heart-active-btn" onClick={() => onToggleFavorite(item)}>
                  <img src="/images/Heart_zeleni.png" alt="Удалить" style={{ width: '22px' }} />
                </button>
                
                <div className="favorite-card-img-box" onClick={() => onProductClick(item)} style={{ cursor: 'pointer' }}>
                  <img src={item.img} alt={item.name} />
                </div>
                
                <div className="favorite-card-info-row">
                  <div className="favorite-card-text" onClick={() => onProductClick(item)} style={{ cursor: 'pointer' }}>
                    <span className="favorite-item-name">{item.name}</span>
                    <span className="favorite-item-price">{item.price}</span>
                  </div>
                  
                  <button className="favorite-add-to-cart-btn" onClick={() => onAddToCart(item)}>
                    <img src="/images/Shopping Cart.png" alt="В корзину" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button 
          className={`carousel-arrow arrow-right ${currentIndex >= favoriteItems.length - 2 ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentIndex >= favoriteItems.length - 2}
        >
          <img src="/images/Arrow.png" alt="Вперед" />
        </button>
      </div>
    </div>
  );
}

function Profile({ user, favoriteItems = [], onProductClick, onLogout, onUpdateAvatar, onToggleCart, onToggleFavorite, onAddToCart }) {
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (!savedUser) {
      setLoading(false);
      return;
    }

    const currentUser = JSON.parse(savedUser);
    const userId = currentUser.id || currentUser.id_user;

    if (!userId || userId === "undefined") {
      console.error("ID не найден в sessionStorage!");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`http://localhost:5000/api/users/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error('Пользователь не найден в БД');
          return res.json();
        })
        .then(data => {
          if (data) {
            setProfileData(data);
            setEditName(data.full_name || data.login_user || '');
            setEditPhone(data.phone || '');
            setEditAddress(data.address || '');
          }
        })
        .catch(err => {
          console.error("Ошибка загрузки профиля, подтягиваем инфо из сессии:", err);
          setEditName(currentUser.username || '');
          setEditPhone(currentUser.phone || '');
          setEditAddress(currentUser.address || '');
        }),
      fetch(`http://localhost:5000/api/orders/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(err => console.error("Ошибка загрузки заказов:", err))
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const savedUser = sessionStorage.getItem('user');
    if (!savedUser) {
      alert('Пользователь не найден');
      return;
    }
    const currentUser = JSON.parse(savedUser);
    const userId = currentUser.id || currentUser.id_user;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProfileData(data.user);
        const updatedSessionUser = {
          ...currentUser,
          username: data.user.login_user, 
          email: data.user.email,
          phone: data.user.phone,
          address: data.user.address
        };
        sessionStorage.setItem('user', JSON.stringify(updatedSessionUser));

        setActiveModal(null);
        alert('Данные успешно сохранены в БД и обновлены в сессии!');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="profile-loading">Загрузка данных личного кабинета...</div>;
  }
  const savedUser = sessionStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : {};

  return (
    <div className="profile-container-wrapper">
      <div className="profile-page font-montserrat">
        
        <aside className="profile-sidebar">
          <div className="avatar-block">
            <label className="avatar-upload-label-circle">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <div className="avatar-circle">
                {user && user.avatar ? (
                  <img src={user.avatar} alt="Аватар" className="user-custom-avatar" />
                ) : (
                  <span className="avatar-placeholder-label">ФОТО ПРOФИЛЯ</span>
                )}
              </div>
            </label>

            <div className="user-profile-card">
              <div className="profile-sidebar-card">
                <h2>{profileData?.login_user || currentUser.username || "Загрузка..."}</h2>
                <p>{profileData?.email || currentUser.email || "Email не указан"}</p>
                <p><strong>Тел:</strong> {profileData?.phone || "Не указан"}</p>
                <p><strong>Адрес:</strong> {profileData?.address || "Адрес не указан"}</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button className="menu-item-btn" onClick={() => setActiveModal('orders')}>
              <img src="/images/Purchase Order_zeleni.png" alt="Заказы" />
              МОИ ЗАКАЗЫ
            </button>
            <button className="menu-item-btn" onClick={() => setActiveModal('personal')}>
              <img src="/images/User Male_zeleni.png" alt="Данные" />
              ЛИЧНЫЕ ДАННЫЕ
            </button>
            <button className="menu-item-btn" onClick={() => setActiveModal('address')}>
              <img src="/images/In Transit_zeleni.png" alt="Доставка" />
              АДРЕС ДОСТАВКИ
            </button>
            <button className="menu-item-btn" onClick={() => setActiveModal('bonuses')}>
              <img src="/images/Hydroponics_zeleni.png" alt="Бонусы" />
              БОНУСЫ
            </button>
          </nav>

          <button className="logout-btn" onClick={onLogout}>ВЫЙТИ</button>
        </aside>

        <main className="profile-main-content">
          <img src="/images/paporotnik.png" alt="Декор" className="paporotnik-bg-decor" />

          <div className="profile-info-grid">
            <div className="info-stat-card">
              <div className="stat-icon-circle"><img src="/images/Purchase Order_zeleni.png" alt="Заказы" /></div>
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">АКТИВНЫЕ ЗАКАЗЫ</span>
              <button className="stat-link-btn" onClick={() => setActiveModal('orders')}>СМОТРЕТЬ ЗАКАЗЫ &gt;</button>
            </div>

            <div className="info-stat-card">
              <div className="stat-icon-circle"><img src="/images/Heart_zeleni.png" alt="Избранное" /></div>
              <span className="stat-number">{favoriteItems.length}</span>
              <span className="stat-label">ТОВАРОВ В ИЗБРАННОМ</span>
              <button className="stat-link-btn">ПЕРЕЙТИ &gt;</button>
            </div>

            <div className="info-stat-card">
              <div className="stat-icon-circle"><img src="/images/Hydroponics_zeleni.png" alt="Покупки" /></div>
              <span className="stat-number">0</span>
              <span className="stat-label">ПОКУПОК ВСЕГО</span>
              <button className="stat-link-btn">ИСТОРИЯ ПОКУПОК &gt;</button>
            </div>

            <div className="info-stat-card">
              <div className="stat-icon-circle"><img src="/images/In Transit_zeleni.png" alt="Доставка" /></div>
              <span className="stat-number">{profileData?.address ? 1 : 0}</span>
              <span className="stat-label">АДРЕСА ДОСТАВКИ</span>
              <button className="stat-link-btn" onClick={() => setActiveModal('address')}>МОИ АДРЕСА &gt;</button>
            </div>
          </div>
        </main>
      </div>

      <section className="profile-favorites-section">
        <FavoritesSection 
          favoriteItems={favoriteItems} 
          onProductClick={onProductClick}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
        />
      </section>

      {activeModal === 'orders' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setActiveModal(null)}>&times;</span>
            <h2>История ваших заказов</h2>
            <div className="modal-body scrollable">
              {orders.length === 0 ? (
                <p>Вы еще не совершали заказов.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id_order || order.id} className="order-item-block">
                    <div className="order-info-header">
                      <strong>Заказ #{order.id_order || order.id}</strong>
                      <span className={`status-badge ${order.order_status || order.status}`}>{order.order_status || order.status}</span>
                    </div>
                    <p className="order-date">Дата: {order.order_date ? new Date(order.order_date).toLocaleDateString() : order.date}</p>
                    <p className="order-address">Адрес доставки: {order.address}</p>
                    {order.items && (
                      <div className="order-products-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-sub-product">
                            <span>{item.name} x {item.count}</span>
                            <span>{item.price * (item.count || 1)} ₽</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeModal === 'personal' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setActiveModal(null)}>&times;</span>
            <h2>Редактировать личные данные</h2>
            <form onSubmit={handleSaveChanges} className="modal-form">
              <label>Ваше Имя / ФИО:</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />

              <label>Номер телефона:</label>
              <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+7 (999) 000-00-00" />

              <button type="submit" className="save-btn">Сохранить изменения</button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'address' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setActiveModal(null)}>&times;</span>
            <h2>Адрес доставки по умолчанию</h2>
            <form onSubmit={handleSaveChanges} className="modal-form">
              <label>Укажите ваш полный адрес (город, улица, дом, кв):</label>
              <textarea rows="4" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Москва, ул. Пушкина, д. 10, кв. 45" required></textarea>
              <button type="submit" className="save-btn">Сохранить адрес</button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'bonuses' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setActiveModal(null)}>&times;</span>
            <h2>Бонусная система GreenShop</h2>
            <div className="bonus-info-body">
              <div className="bonus-score-big">
                <span>{profileData?.bonus_points || 0}</span>
                <p>Доступных баллов</p>
              </div>
              <div className="bonus-perks">
                <p>Ваша персональная скидка: <strong>{profileData?.discount || 0}%</strong></p>
                <p>1 балл = 1 рубль. Вы можете оплачивать баллами до 30% от стоимости любого заказа при оформлении корзины.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;