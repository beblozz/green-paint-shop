import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import Catalog from './Catalog';
import KashpoCatalog from './KashpoCatalog'; 
import ProductDetail from './ProductDetail';
import Profile from './Profile';
import AuthModal from './AuthModal';
import CareCatalog from './CareCatalog';
import FertilizerCatalog from './FertilizerCatalog';
import CareArticles from './CareArticles';
import ArticleDetail from './ArticleDetail';
import Contacts from './Contacts';
import CartPage from './CartPage';
import AdminPanel from './AdminPanel';
import { ALL_PRODUCTS, formatPrice } from './data/products';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('main'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [favItems, setFavItems] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [globalDiscounts, setGlobalDiscounts] = useState({});
  const [allStoreProducts, setAllStoreProducts] = useState(ALL_PRODUCTS);
  const storePlants = allStoreProducts.filter(p => p.generalCategory === 'РАСТЕНИЯ');
  const storeKashpo = allStoreProducts.filter(p => p.generalCategory === 'КАШПО');
  const storeCare = allStoreProducts.filter(p => p.generalCategory === 'ДЛЯ УХОДА');
  const storeFertilizers = allStoreProducts.filter(p => p.generalCategory === 'УДОБРЕНИЯ');
  const plants = storePlants.slice(0, 2);
  const discountProducts = storePlants.filter(p => p.isSale).slice(0, 2);

  const handleAddNewProduct = (newProduct) => {
    setAllStoreProducts(prev => [newProduct, ...prev]);
  };

  const [cartItems, setCartItems] = useState([
    { id: 3, name: 'Калатея Орбифолия', img: '/images/kalatea_katalog.png', price: '1 490 ₽', priceNum: 1490, count: 1 }
  ]);

  const [currentUser, setCurrentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [contactsRequests, setContactsRequests] = useState([]);
  const [userOrders, setUserOrders] = useState([]);

  const handleToggleFavorite = (product) => {
    setFavItems((prevItems) => {
      const isAlreadyFav = prevItems.some(item => item.id === product.id);
      if (isAlreadyFav) {
        return prevItems.filter(item => item.id !== product.id);
      } else {
        return [...prevItems, product];
      }
    });
  };

  const handleUpdateProductDiscount = async (id, percent) => {
    setGlobalDiscounts(prev => ({ ...prev, [id]: percent }));

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercent: percent })
      });
      if (!response.ok) throw new Error('Не удалось сохранить скидку в БД');
    } catch (err) {
      console.error(`Ошибка при сохранении скидки товара #${id}:`, err);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Ошибка БД при загрузке заказов:", err));

    fetch(`${API_BASE_URL}/contacts-requests`)
      .then(res => res.json())
      .then(data => setContactsRequests(data))
      .catch(err => console.error("Ошибка БД при загрузке заявок:", err));

    // Подтягиваем сохранённые в БД цены и скидки товаров (то, что менял
    // администратор в панели), чтобы они были видны всем пользователям
    // сайта и не терялись при перезагрузке страницы.
    fetch(`${API_BASE_URL}/products/prices`)
      .then(res => res.json())
      .then(overrides => {
        if (!Array.isArray(overrides) || overrides.length === 0) return;

        const overrideById = {};
        overrides.forEach(o => { overrideById[o.id] = o; });

        setAllStoreProducts(prev => prev.map(prod => {
          const override = overrideById[prod.id];
          if (!override) return prod;
          return { ...prod, price: formatPrice(override.price), priceNum: override.price };
        }));

        const discountsMap = {};
        overrides.forEach(o => { discountsMap[o.id] = o.discountPercent; });
        setGlobalDiscounts(prev => ({ ...discountsMap, ...prev }));
      })
      .catch(err => console.error("Ошибка БД при загрузке цен товаров:", err));
  }, []);

  useEffect(() => {
    const savedUserStr = sessionStorage.getItem('user');
    if (savedUserStr) {
      const parsedUser = JSON.parse(savedUserStr);
      if (parsedUser.role === 'admin' || parsedUser.username === 'admin' || parsedUser.isAdmin) {
        setAdminUser(parsedUser);
      } else {
        setCurrentUser(parsedUser);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetch(`http://localhost:5000/api/users/${currentUser.id}/orders`)
        .then(res => res.json())
        .then(data => setUserOrders(data))
        .catch(err => console.error("Ошибка загрузки заказов пользователя:", err));
    }
  }, [currentUser]);

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage('detail');
    navigate(`/product/${product.id}`);
  };

  const handleProfileHeaderClick = () => {
    if (currentUser) {
      if (currentUser.isAdmin || currentUser.login === 'admin' || currentUser.username === 'admin') {
        setCurrentPage('admin_panel');
        navigate('/admin');
      } else {
        setCurrentPage('profile');
        navigate('/profile');
      }
    } else if (adminUser) {
      setCurrentPage('admin_panel');
      navigate('/admin');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSubmit = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const userFromDB = await response.json();
        if (userFromDB.role === 'admin' || userFromDB.username === 'admin' || userFromDB.isAdmin) {
          const adminData = { ...userFromDB, isAdmin: true };
          sessionStorage.setItem('user', JSON.stringify(adminData));
          setAdminUser(adminData);
          setCurrentPage('admin_panel');
          navigate('/admin');
        } else {
          sessionStorage.setItem('user', JSON.stringify(userFromDB));
          setCurrentUser(userFromDB);
          setCurrentPage('profile');
          navigate('/profile');
        }
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      console.error("Ошибка авторизации:", error);
    }
  };

  const handleAuthSuccess = (userData) => {
    if (userData.login === 'admin' && userData.password === 'admin') {
      const adminUserData = { ...userData, isAdmin: true, login: 'Администратор' };
      sessionStorage.setItem('user', JSON.stringify(adminUserData));
      setAdminUser(adminUserData);
      setCurrentPage('admin_panel');
      navigate('/admin');
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      setCurrentPage('profile');
      navigate('/profile');
    }
  };

  const handleUpdateAvatar = (base64Img) => {
    setCurrentUser(prev => {
      const updated = { ...prev, avatar: base64Img };
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('user');
    setCurrentPage('main');
    navigate('/');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    sessionStorage.removeItem('user');
    setCurrentPage('main');
    navigate('/');
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (product, customCount = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, count: item.count + customCount } : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        img: product.img || product.image, 
        price: product.price, 
        priceNum: product.priceNum || parseInt(product.price.toString().replace(/\D/g, '')),
        count: customCount 
      }];
    });
  };

  const handleChangeCount = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newCount = item.count + delta;
        return newCount > 0 ? { ...item, count: newCount } : item;
      }
      return item;
    }));
  };

  const handleCreateOrder = async (deliveryData) => {
    if (!currentUser) {
      alert("Для оформления заказа необходимо авторизоваться на сайте!");
      setIsAuthModalOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      alert("Ваша корзина пуста!");
      return;
    }

    const orderTotal = cartItems.reduce((sum, item) => sum + (item.priceNum * item.count), 0);
    const orderPayload = {
      userId: currentUser.id,
      total: orderTotal,
      delivery: deliveryData,
      items: cartItems
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const savedOrder = await response.json();
        setOrders(prev => [savedOrder, ...prev]);
        setCartItems([]);
        alert(`Заказ №${savedOrder.id} успешно оформлен!`);
        setCurrentPage('profile');
        navigate('/profile');
      } else {
        const errData = await response.json();
        alert(`Ошибка: ${errData.error}`);
      }
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Не удалось обновить статус:", err);
    }
  };

  const handleUpdateProductPrice = async (productId, newPriceStr, discountPercent) => {
    const numeric = parseInt(newPriceStr.replace(/\D/g, '')) || 0;
    setAllStoreProducts(prev => prev.map(prod => 
      prod.id === productId ? { ...prod, price: newPriceStr, priceNum: numeric } : prod
    ));

    try {
      const body = { price: numeric };
      if (discountPercent !== undefined) body.discountPercent = discountPercent;

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('Не удалось сохранить цену в БД');
    } catch (err) {
      console.error(`Ошибка при сохранении цены товара #${productId}:`, err);
    }
  };

  const handleResolveContactRequest = async (requestId) => {
    try {
      await fetch(`${API_BASE_URL}/contacts-requests/${requestId}`, { method: 'DELETE' });
      setContactsRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      console.error("Ошибка при удалении заявки:", err);
    }
  };

  const handleSwitchCategory = (cat) => {
    if (cat === 'КАШПО' || cat === 'kashpo') navigate('/kashpo');
    else if (cat === 'ДЛЯ УХОДА' || cat === 'care') navigate('/care-catalog');
    else if (cat === 'УДОБРЕНИЯ' || cat === 'fertilizers') navigate('/fertilizers');
    else if (cat === 'РАСТЕНИЯ' || cat === 'catalog') navigate('/catalog');
    setSelectedProduct(null);
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <header className="site-header">
          <div className="header-content">
            <div className="logo-section" onClick={() => { setCurrentPage('main'); setSelectedProduct(null); navigate('/'); }} style={{ cursor: 'pointer' }}>
              <img src="/images/logo.png" alt="Логотип" className="site-logo" />
            </div>

            <nav className="navigation font-cormorant">
              <Link to="/catalog" style={{ textDecoration: 'none' }}>
                <button className="nav-btn btn-catalog">КАТАЛОГ</button>
              </Link>
              
              <Link to="/care" style={{ textDecoration: 'none' }}>
                <button className="nav-btn btn-care two-lines">
                  УХОД<br/>ЗА РАСТЕНИЯМИ
                </button>
              </Link>
              
              <Link to="/contacts" style={{ textDecoration: 'none' }}>
                <button className="nav-btn btn-contacts">КОНТАКТЫ</button>
              </Link>
            </nav>

            <div className="header-right-tools">
              <div className="cart-plate" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
                <img src="/images/Shopping Cart.png" alt="Корзина" className="cart-icon-header" />
                {cartItems.length > 0 && <span className="cart-badge-count">{cartItems.length}</span>}
              </div>

              <div className="profile-plate" onClick={handleProfileHeaderClick} style={{ cursor: 'pointer' }}>
                <div className="profile-section">
                  <img src="/images/Profile.png" alt="Личный кабинет" className="profile-icon" />
                  <span className="profile-text" style={{ textTransform: 'uppercase' }}>
                    {currentUser ? (currentUser.isAdmin ? 'АДМИН ПАНЕЛЬ' : currentUser.username || currentUser.login) : 
                     adminUser ? 'АДМИН ПАНЕЛЬ' : 'личный кабинет'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <section className="novelties-section">
                  <h1 className="main-title font-cormorant">НОВИНКИ РАСТЕНИЙ</h1>
                  <div className="catalog-grid">
                    {plants.map((plant) => (
                      <div key={plant.id} className="plant-card">
                        <div className="image-wrapper"><img src={plant.img} alt={plant.name} className="plant-img" /></div>
                        <h2 className="plant-name font-cormorant">{plant.name}</h2>
                        <div className="card-footer">
                          <button className="details-btn" onClick={() => handleOpenProduct(plant)}>ПОДРОБНЕЕ</button>
                          <span className="plant-price">{plant.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="popular-section">
                  <h2 className="main-title font-cormorant">ПОПУЛЯРНЫЕ ТОВАРЫ</h2>
                  <div className="popular-grid">
                    <div className="popular-item item-plants" onClick={() => navigate('/catalog')}>
                      <img src="/images/cat-plants.png" alt="Р" className="popular-bg" />
                      <div className="popular-overlay"><span className="popular-name font-cormorant">РАСТЕНИЯ</span></div>
                    </div>
                    <div className="popular-item item-pots" onClick={() => navigate('/kashpo')}>
                      <img src="/images/cat-pots.png" alt="К" className="popular-bg" />
                      <div className="popular-overlay"><span className="popular-name font-cormorant">КАШПО</span></div>
                    </div>
                    <div className="popular-item item-care" onClick={() => navigate('/care-catalog')}>
                      <img src="/images/cat-care.png" alt="Т" className="popular-bg" />
                      <div className="popular-overlay"><span className="popular-name font-cormorant">ТОВАРЫ<br/>ДЛЯ УХОДА</span></div>
                    </div>
                    <div className="popular-item item-fertilizers" onClick={() => navigate('/fertilizers')}>
                      <img src="/images/cat-fertilizers.png" alt="У" className="popular-bg" />
                      <div className="popular-overlay"><span className="popular-name font-cormorant">УДОБРЕНИЯ</span></div>
                    </div>
                  </div>
                </section>

                <section className="about-section">
                  <img src="/images/about-bg.svg" alt="Декоративная волна" className="about-wave-bg" />
                  <div className="about-container font-cormorant">
                    <div className="about-block block-left"><p>«Зелёная Живопись» помогает создавать уютное зелёное пространство дома и в офисе.</p></div>
                    <div className="about-block block-right"><p>В магазине представлены комнатные растения, дизайнерские кашпо, удобрения и товары для ухода.</p></div>
                  </div>
                </section>

                <section className="sales-section">
                  <h2 className="main-title font-cormorant">АКЦИИ И СКИДКИ</h2>
                  <div className="catalog-grid">
                    {discountProducts.map((plant) => (
                      <div key={plant.id} className="plant-card">
                        <div className="image-wrapper"><img src={plant.img} alt={plant.name} className="plant-img" /></div>
                        <h2 className="plant-name font-cormorant">{plant.name}</h2>
                        <div className="sales-footer">
                          <div className="discount-badge"><span className="discount-value">{plant.discount}</span><span className="discount-label">скидка</span></div>
                          <div className="price-block"><span className="sales-current-price">{plant.price}</span><span className="sales-old-price">старая цена: {plant.oldPrice}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            } />

            <Route path="/catalog" element={
              <Catalog 
                products={storePlants}
                onProductClick={handleOpenProduct} 
                onSwitchCategory={handleSwitchCategory}
                onAddToCart={handleAddToCart}
                favoriteItems={favItems}
                onToggleFavorite={handleToggleFavorite}
                discounts={globalDiscounts}
              />
            } />

            <Route path="/kashpo" element={
              <KashpoCatalog 
                products={storeKashpo}
                onProductClick={handleOpenProduct}
                onSwitchCategory={handleSwitchCategory}
                onAddToCart={handleAddToCart}
                favoriteItems={favItems}
                onToggleFavorite={handleToggleFavorite}
                discounts={globalDiscounts}
              />
            } />

            <Route path="/care" element={
              <CareArticles onOpenArticle={(article) => {
                setSelectedArticle(article);
                navigate('/article-detail');
              }} />
            } />

            <Route path="/care-catalog" element={
              <CareCatalog 
                products={storeCare}
                onProductClick={handleOpenProduct}
                onSwitchCategory={handleSwitchCategory}
                onAddToCart={handleAddToCart}
                favoriteItems={favItems}
                onToggleFavorite={handleToggleFavorite}
                discounts={globalDiscounts}
              />
            } />

            <Route path="/fertilizers" element={
              <FertilizerCatalog 
                products={storeFertilizers}
                onProductClick={handleOpenProduct}
                onSwitchCategory={handleSwitchCategory}
                onAddToCart={handleAddToCart}
                favoriteItems={favItems}
                onToggleFavorite={handleToggleFavorite}
                discounts={globalDiscounts}
              />
            } />

            <Route path="/product/:id" element={
              <ProductDetail 
                allProducts={allStoreProducts}
                onBackToCatalog={() => {
                  navigate(-1);
                  setSelectedProduct(null);
                }} 
                favoriteItems={favItems}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                discounts={globalDiscounts}
              />
            } />

            <Route path="/article-detail" element={
              <ArticleDetail article={selectedArticle} onBack={() => navigate('/care')} />
            } />

            <Route path="/contacts" element={<Contacts />} />

            <Route path="/cart" element={
              <CartPage 
                cartItems={cartItems}
                setCartItems={setCartItems}
                currentUser={currentUser}
                onCheckout={handleCreateOrder}
                onRemove={handleRemoveFromCart}
                onChangeCount={handleChangeCount}
                onCreateOrder={handleCreateOrder}
                onAddToCart={handleAddToCart}
                userProfile={currentUser}
              />
            } />

            <Route path="/profile" element={
              <Profile 
                user={currentUser} 
                favoriteItems={favItems} 
                orders={userOrders}
                onProductClick={handleOpenProduct}
                onLogout={handleLogout}
                onUpdateAvatar={handleUpdateAvatar}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
              />
            } />

            <Route path="/admin" element={
              <AdminPanel 
                orders={orders}
                allProducts={allStoreProducts}
                contactsRequests={contactsRequests}
                onResolveRequest={handleResolveContactRequest}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateProductPrice={handleUpdateProductPrice}
                onAddNewProduct={handleAddNewProduct}
                onLogout={handleAdminLogout}
                discounts={globalDiscounts}
                onUpdateDiscount={handleUpdateProductDiscount}
              />
            } />
          </Routes>
        </main>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-left">
            <h2 className="footer-title font-cormorant">Зелёная Живопись</h2>
            <p className="footer-description font-cormorant">Интернет-магазин комнатных растений, необычных кашпо, удобрений и товаров для ухода.</p>
            <div className="footer-contacts">
              <h3 className="contacts-title font-cormorant">Контакты:</h3>
              <div className="contact-item"><img src="/images/Phone.png" alt="Т" className="contact-icon" /><a href="tel:+79000000000" className="contact-link">+7 (900) 000-00-00</a></div>
              <div className="contact-item"><img src="/images/Mail.png" alt="П" className="contact-icon" /><a href="mailto:greenpainting@mail.ru" className="contact-link">greenpainting@mail.ru</a></div>
            </div>
          </div>
          <div className="footer-right">
            <h3 className="social-title">Мы в социальных сетях:</h3>
            <div className="social-icons">
              <a href="https://vk.com" target="_blank" rel="noreferrer" className="social-link-icon"><img src="/images/VKcom.png" alt="В" className="vk-icon" /></a>
              <a href="https://t.me" target="_blank" rel="noreferrer" className="social-link-icon"><img src="/images/Telegram.png" alt="T" className="tg-icon" /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom"><p>© 2026 Зелёная Живопись. Все права защищены.</p></div>
      </footer>

      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuthSuccess={handleAuthSuccess}
          onLoginSubmit={handleLoginSubmit}
        />
      )}
    </div>
  );
}

export default App;