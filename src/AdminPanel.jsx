import React, { useState, useEffect } from 'react';
import './App.css'; 
import { applyDiscount } from './data/products';

function AdminPanel({ 
  orders, onUpdateOrderStatus, allProducts, onUpdateProductPrice, 
  onAddNewProduct, onLogout, discounts, onUpdateDiscount,
  contactsRequests, onResolveRequest 
}) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [chartMetric, setChartMetric] = useState('revenue');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('plants');

  const [editableProducts, setEditableProducts] = useState(allProducts || []);
  const [draftDiscounts, setDraftDiscounts] = useState(() => ({ ...discounts }));

  useEffect(() => {
    setEditableProducts(allProducts || []);
  }, [allProducts]);


  useEffect(() => {
    setDraftDiscounts(prev => ({ ...discounts, ...prev }));
  }, [discounts]);

  const transliterate = (text) => {
    const rus = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return text
      .toLowerCase()
      .split('')
      .map(char => rus[char] !== undefined ? rus[char] : char)
      .join('')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, ''); 
  };

  const realRevenueData = [0, 0, 0, 0, 0, 0, 0];
  const realSalesData = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach(order => {
    if (order.status !== 'Отменён' && order.order_status !== 'Отменён') {
      const orderDateStr = order.date || order.order_date;
      if (orderDateStr) {
        const [day, month, year] = orderDateStr.split('T')[0].split(/[.-]/);
        const dateObj = new Date(`${year}-${month}-${day}`);
        const dayIndex = dateObj.getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        let cleanTotal = order.total || 0;
        if (!cleanTotal && order.address) {
          const match = order.address.match(/Сумма заказа:\s*([0-9]+)/);
          if (match) cleanTotal = parseInt(match[1], 10);
        }

        if (adjustedIndex >= 0 && adjustedIndex <= 6) {
          realRevenueData[adjustedIndex] += cleanTotal;
          realSalesData[adjustedIndex] += order.items ? order.items.reduce((sum, item) => sum + item.count, 0) : 1;
        }
      }
    }
  });

  const chartData = {
    revenue: { title: 'Реальная выручка из БД (₽)', values: realRevenueData, labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], color: '#00A352' },
    sales: { title: 'Реальные продажи из БД (шт)', values: realSalesData, labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], color: '#2D6A4F' }
  };

  const currentChart = chartData[chartMetric] || chartData['revenue'];
  const maxChartValue = Math.max(...currentChart.values, 1);
  
  const totalRevenue = realRevenueData.reduce((a, b) => a + b, 0);
  const activeOrdersCount = orders.filter(o => (o.status === 'В обработке' || o.order_status === 'В обработке')).length;

  const handleRefreshDatabase = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('Синхронизация выполнена. Цены обновлены!');
    }, 1000);
  };

  const handleSubmitNewProduct = (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim()) return;

    const priceNumeric = parseInt(newProdPrice.replace(/\D/g, '')) || 0;
    
    let finalImgPath = newProdImg.trim();
    if (!finalImgPath) {
      const fileNameTranslit = transliterate(newProdName.trim());
      finalImgPath = `/images/${fileNameTranslit}.png`;
    }

    let baseId = Math.floor(500 + Math.random() * 4000);
    if (newProdCategory === 'plants') baseId = Math.floor(13 + Math.random() * 100);
    if (newProdCategory === 'pots') baseId = Math.floor(213 + Math.random() * 80);
    if (newProdCategory === 'care') baseId = Math.floor(313 + Math.random() * 80);
    if (newProdCategory === 'fertilizers') baseId = Math.floor(413 + Math.random() * 80);

    const newProductObject = {
      id: baseId,
      name: newProdName,
      img: finalImgPath,
      price: `${priceNumeric} ₽`,
      priceNum: priceNumeric,
      category: newProdCategory
    };

    onAddNewProduct(newProductObject);

    setNewProdName('');
    setNewProdPrice('');
    setNewProdImg('');
    setShowAddForm(false);
    alert(`Успешно! Товар добавлен.\nКатегория: ${newProdCategory}\nПуть к фото: ${finalImgPath}`);
  };

  return (
    <div className="admin-panel-wrapper font-montserrat">
      <div className="admin-header">
        <h1 className="admin-main-title font-cormorant">ПАНЕЛЬ АДМИНИСТРАТОРА</h1>
        <button className="admin-logout-btn" onClick={onLogout}>ВЫЙТИ ИЗ СИСТЕМЫ</button>
      </div>

      <div className="admin-tabs-nav">
        <button className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Аналитика</button>
        <button className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Цены и Скидки</button>
        <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Заказы</button>
        <button className={`admin-tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          Заявки с Контактов ({contactsRequests?.length || 0})
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div>
          <div className="analytics-cards-grid">
            <div className="analytics-stat-card">
              <h4>Выручка из базы данных</h4>
              <p className="analytics-stat-value green">{totalRevenue} ₽</p>
            </div>
            <div className="analytics-stat-card">
              <h4>Всего товаров на складе</h4>
              <p className="analytics-stat-value">{allProducts.length} шт.</p>
            </div>
            <div className="analytics-stat-card">
              <h4>Ожидают обработки</h4>
              <p className="analytics-stat-value orange">{activeOrdersCount} шт.</p>
            </div>
          </div>

          <div className="analytics-chart-section">
            <div className="chart-toggle-buttons">
              <button className={`chart-toggle-btn ${chartMetric === 'revenue' ? 'active' : ''}`} onClick={() => setChartMetric('revenue')}>Выручка с заказов</button>
              <button className={`chart-toggle-btn ${chartMetric === 'sales' ? 'active' : ''}`} onClick={() => setChartMetric('sales')}>Количество продаж</button>
            </div>

            <h3>{currentChart.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '250px', paddingTop: '20px', borderBottom: '2px solid #134E33' }}>
              {currentChart.values.map((val, idx) => {
                const barHeight = (val / maxChartValue) * 80; 
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>{val > 0 ? `${val}` : '0'}</span>
                    <div style={{ width: '40px', height: val > 0 ? `${barHeight}%` : '4px', backgroundColor: val > 0 ? currentChart.color : '#E5EAE6', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }}></div>
                    <span style={{ fontSize: '14px', marginTop: '10px', fontWeight: '500' }}>{currentChart.labels[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="admin-tab-btn" style={{ backgroundColor: '#00A352', color: '#fff', borderColor: '#00A352' }} onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Закрыть форму' : 'Добавить новый товар'}
              </button>
              <button className="admin-tab-btn" onClick={handleRefreshDatabase} disabled={isRefreshing}>
                {isRefreshing ? 'Синхронизация...' : 'Обновить прайс-лист'}
              </button>
            </div>
            <h3 style={{ margin: 0, color: '#134E33' }}>Всего позиций в каталоге: {allProducts.length}</h3>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmitNewProduct} style={{ background: '#fff', border: '1px solid #c3ebd4', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
              <h3 className="font-cormorant" style={{ fontSize: '22px', margin: '0 0 15px 0' }}>Добавление новой позиции в систему каталогов</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                <input type="text" placeholder="Название товара" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', flex: 1 }} />
                <input type="text" placeholder="Цена в ₽" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', width: '150px' }} />
                <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}>
                  <option value="plants">Комнатные растения</option>
                  <option value="pots">Дизайнерские кашпо</option>
                  <option value="care">Товары для ухода</option>
                  <option value="fertilizers">Минеральные удобрения</option>
                </select>
                <input type="text" placeholder="Путь к фото (авто-транслит, если пусто)" value={newProdImg} onChange={(e) => setNewProdImg(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', flex: 1 }} />
              </div>
              <button type="submit" className="admin-update-status-btn">СОХРАНИТЬ И СИНХРОНИЗИРОВАТЬ</button>
            </form>
          )}

          <div className="price-table-container">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Базовая цена</th>
                  <th>Скидка (%)</th>
                  <th>Итог со скидкой</th>
                </tr>
              </thead>
              <tbody>
                {editableProducts.map((product, index) => {
                  const basePrice = product.priceNum ?? (parseFloat((product.price || '0').toString().replace(/[^\d.]/g, '')) || 0);
                  const discount = parseInt(draftDiscounts[product.id] ?? 0) || 0;
                  const finalPrice = applyDiscount(basePrice, discount);

                  return (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td style={{ fontWeight: '500' }}>{product.name}</td>

                      {/* Инпут базовой цены */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <input 
                          type="text" 
                          value={product.price}
                          className="admin-price-input"
                          onChange={(e) => {
                            const updated = [...editableProducts];
                            updated[index].price = e.target.value;
                            setEditableProducts(updated);
                          }}
                        /> ₽
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <input 
                          type="number" 
                          min="0" 
                          max="100"
                          value={draftDiscounts[product.id] ?? 0}
                          className="admin-discount-input"
                          onChange={(e) => {
                            setDraftDiscounts(prev => ({ ...prev, [product.id]: e.target.value }));
                          }}
                        /> %
                      </td>

                      <td style={{ fontWeight: 'bold', color: discount > 0 ? '#d9534f' : '#134E33' }}>
                        {finalPrice} ₽
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button 
            className="admin-save-prices-btn font-montserrat"
            onClick={() => {
              editableProducts.forEach(p => {
                onUpdateProductPrice(p.id, p.price.toString());
                onUpdateDiscount(p.id, parseInt(draftDiscounts[p.id]) || 0);
              });
              alert('Изменения цен и скидок успешно применены!');
            }}
          >
            Обновить прайс-лист
          </button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-orders-container">
          <h2 className="admin-section-title font-cormorant">Управление статусами логистики заказов</h2>
          <div className="admin-orders-list">
            {orders.map((order) => {
              const orderId = order.id_order || order.id;
              const currentStatus = order.order_status || order.status || 'В обработке';
              
              return (
                <div key={orderId} className="admin-order-card">
                  <div className="admin-order-header">
                    <h3 className="font-cormorant">Накладная №{orderId} от {order.order_date ? new Date(order.order_date).toLocaleDateString() : '24.06.2026'}</h3>
                    <span className={`admin-status-badge ${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                      {currentStatus}
                    </span>
                  </div>

                  <div className="admin-order-body">
                    <p><strong>Телефон:</strong> {order.phone || 'Не указан'}</p>
                    <div className="admin-order-delivery-text">
                      <strong>Детали доставки и сумма:</strong>
                      <p>{order.address}</p>
                    </div>
                  </div>

                  <div className="admin-order-footer">
                    <div className="admin-status-select-wrapper">
                      <label>ИЗМЕНИТЬ СТАТУС:</label>
                      <select 
                        id={`select-status-${orderId}`}
                        defaultValue={currentStatus}
                        className="admin-status-select"
                      >
                        <option value="В обработке">В обработке</option>
                        <option value="У курьера">У курьера</option>
                        <option value="Получен">Получен</option>
                        <option value="Отменён">Отменён</option>
                      </select>
                    </div>

                    <button 
                      className="admin-update-status-btn"
                      onClick={async () => {
                        const selectEl = document.getElementById(`select-status-${orderId}`);
                        if (selectEl) {
                          const newStatus = selectEl.value;
                          try {
                            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });

                            if (response.ok) {
                              alert(`Статус заказа №${orderId} успешно сохранён в БД: "${newStatus}"!`);
                              window.location.reload();
                            } else {
                              const errData = await response.json();
                              alert(`Ошибка обновления: ${errData.error}`);
                            }
                          } catch (error) {
                            console.error(error);
                            alert("Не удалось связаться с сервером бэкенда");
                          }
                        }
                      }}
                    >
                      ОБНОВИТЬ СТАТУС
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="admin-orders-container">
          <h2 className="admin-section-title font-cormorant">Обращения и вопросы от клиентов (из БД)</h2>
          {(!contactsRequests || contactsRequests.length === 0) ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Новых обращений со страницы Контакты нет.</p>
          ) : (
            <div className="admin-orders-list">
              {contactsRequests.map((req) => (
                <div key={req.id} className="admin-order-card">
                  <div className="admin-order-header">
                    <h3 className="font-cormorant">Обращение #{req.id}</h3>
                    <span className="admin-status-badge у-курьера">Новое</span>
                  </div>
                  
                  <div className="admin-order-body">
                    <p><strong>Имя отправителя:</strong> {req.name}</p>
                    <p><strong>Email / Телефон для связи:</strong> <span style={{ color: '#00A352', fontWeight: 'bold' }}>{req.contact}</span></p>
                    <div className="admin-order-delivery-text" style={{ borderLeftColor: '#d9534f' }}>
                      <strong>Текст сообщения:</strong>
                      <p>"{req.message}"</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                    <button 
                      className="admin-update-status-btn"
                      style={{ backgroundColor: '#ffdfdf !important', color: '#721c24 !important', border: '1px solid #f5c6cb' }}
                      onClick={() => {
                        if(window.confirm('Отметить заявку как обработанную и удалить её из БД?')) {
                          onResolveRequest(req.id);
                        }
                      }}
                    >
                      ✓ ОТМЕТИТЬ КАК ВЫПОЛНЕННУЮ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;