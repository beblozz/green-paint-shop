import React, { useState, useEffect } from 'react';

const RECOMMENDATIONS_POOL = [
  { id: 301, name: 'Опрыскиватель для растений', img: '/images/prisk.png', price: '590 ₽', priceNum: 590 },
  { id: 401, name: 'Удобрение для цветущих растений', img: '/images/ugobreniya_chetyshix.png', price: '520 ₽', priceNum: 520 },
  { id: 205, name: 'Кашпо «Морская раковина»', img: '/images/kaphpo-4.png', price: '1690 ₽', priceNum: 1690 }
];

function CartPage({ cartItems, onRemove, onChangeCount, onCheckout, onAddToCart }) {
  const [randomRecs, setRandomRecs] = useState([]);
  const savedUser = sessionStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const [clientName, setClientName] = useState(currentUser?.username || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientAddress, setClientAddress] = useState(currentUser?.address || ''); 
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const shuffled = [...RECOMMENDATIONS_POOL].sort(() => 0.5 - Math.random());
    setRandomRecs(shuffled.slice(0, 3));
  }, [cartItems.length]);

  const handleAutofillFromProfile = () => {
    if (currentUser) {
      setClientName(currentUser.username || '');
      setClientAddress(currentUser.address || '');
      setClientEmail(currentUser.email || '');
      setErrorText('');
    } else {
      setErrorText('Профиль не найден. Пожалуйста, введите данные вручную.');
    }
  };

  const totalSum = cartItems.reduce((acc, el) => {
  const cost = el.priceNum || (el.price ? parseInt(el.price.replace(/\D/g, '')) : 0);
  return acc + (cost * el.count);
    }, 0);

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientAddress.trim() || !clientEmail.trim()) {
      setErrorText('Пожалуйста, заполните все поля!');
      return;
    }
    setErrorText('');
    onCheckout({ name: clientName, address: clientAddress, phone: clientEmail });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!clientName.trim() || !clientAddress.trim() || !clientEmail.trim()) {
      setErrorText('Пожалуйста, заполните все поля!');
      return;
    }
    setErrorText('');

    const orderData = {
      id_user: currentUser?.id || currentUser?.id_user || null, 
      address: clientAddress,
      name: clientName,
      email: clientEmail,
      items: cartItems,
      totalSum: totalSum
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Заказ успешно оформлен!');
        onCheckout({ name: clientName, address: clientAddress, phone: clientEmail });
      } else {
        setErrorText('Ошибка при оформлении заказа. Попробуйте еще раз.');
      }
    } catch (err) {
      console.error("Ошибка при создании заказа:", err);
      setErrorText('Ошибка при оформлении заказа. Попробуйте еще раз.');
    }
  };

  return (
    <div className="cart-page-container font-montserrat">
      <h1 className="cart-page-title font-cormorant">КОРЗИНА</h1>
      
      <div className="cart-main-layout">
        <div className="cart-goods-list">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <img src={item.img} alt={item.name} className="cart-item-img" />
                
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-price">{item.priceNum * item.count} ₽</span>
                </div>
                
                <div className="cart-item-counter-box">
                  <button className="cart-count-arrow" onClick={() => onChangeCount(item.id, -1)}>–</button>
                  <span className="cart-count-number">{item.count} шт.</span>
                  <button className="cart-count-arrow" onClick={() => onChangeCount(item.id, 1)}>+</button>
                </div>
                
                <button className="cart-delete-item-btn" onClick={() => onRemove(item.id)}>&times;</button>
              </div>
            ))
          ) : (
            <p className="cart-empty-msg">Ваша корзина пуста</p>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary-panel">
            <h3>ИТОГО:</h3>
            <div className="summary-row">
              <span>Выбрано товаров:</span>
              <span>{cartItems.reduce((sum, i) => sum + i.count, 0)} шт.</span>
            </div>
            <div className="summary-row total-sum-row">
              <span>Сумма к оплате:</span>
              <span>{totalSum} ₽</span>
            </div>

            {currentUser && (currentUser.address || currentUser.email || currentUser.username) && (
              <button 
                type="button" 
                className="autofill-profile-btn" 
                onClick={handleAutofillFromProfile}
              >
                Использовать данные из профиля
              </button>
            )}

            <form className="cart-checkout-subform" onSubmit={handlePlaceOrder}>
              <input 
                type="text" 
                placeholder="Ваше имя" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                className="cart-input"
                required 
              />
              <input 
                type="email" 
                placeholder="Ваш email" 
                value={clientEmail} 
                onChange={(e) => setClientEmail(e.target.value)} 
                className="cart-input"
                required 
              />
              <input 
                type="text" 
                placeholder="Укажите адрес доставки" 
                value={clientAddress} 
                onChange={(e) => setClientAddress(e.target.value)} 
                className="cart-input"
                required 
              />

              {errorText && <div className="checkout-error-msg">{errorText}</div>}

              <button type="submit" className="checkout-btn order-confirm-btn">
                ПОДТВЕРДИТЬ ЗАКАЗ
              </button>
            </form>
          </div>
        )}
      </div>

      <section className="recommendations-section">
        <h2 className="recommendations-title font-cormorant">С ЭТИМ БЕРУТ</h2>
        <div className="recommendations-grid">
          {randomRecs.map((prod) => (
            <div key={prod.id} className="rec-card">
              <div className="rec-img-wrapper">
                <img src={prod.img} alt={prod.name} className="rec-img" />
              </div>
              <h4 className="rec-name font-cormorant">{prod.name}</h4>
              <div className="rec-footer">
                <span className="rec-price">{prod.price}</span>
                <button className="rec-add-btn" onClick={() => onAddToCart(prod, 1)}>
                  + В КОРЗИНУ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CartPage;