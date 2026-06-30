import React, { useState } from 'react';

function UserOrdersModal({ isOpen, onClose, orders }) {
  const [viewMode, setViewMode] = useState('current');
  
  if (!isOpen) return null;

  const currentOrders = orders.filter(o => o.status !== 'Получен' && o.status !== 'Отменён');
  const archiveOrders = orders.filter(o => o.status === 'Получен' || o.status === 'Отменён');
  const displayedOrders = viewMode === 'current' ? currentOrders : archiveOrders;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Мои Заказы</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setViewMode('current')} style={{ padding: '10px', flex: 1, backgroundColor: viewMode === 'current' ? '#00A352' : '#f0f0f0', color: viewMode === 'current' ? '#white' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Текущие ({currentOrders.length})
          </button>
          <button onClick={() => setViewMode('archive')} style={{ padding: '10px', flex: 1, backgroundColor: viewMode === 'archive' ? '#00A352' : '#f0f0f0', color: viewMode === 'archive' ? '#white' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Архив ({archiveOrders.length})
          </button>
        </div>

        {displayedOrders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777' }}>Заказов в данной категории не найдено.</p>
        ) : (
          displayedOrders.map(order => (
            <div key={order.id} style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Накладная №{order.id} от {order.date}</span>
                <span style={{ color: order.status === 'Получен' ? '#00A352' : '#3A86FF' }}>{order.status}</span>
              </div>
              <div style={{ margin: '10px 0', fontSize: '14px' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                    <span>{item.name} x {item.count} шт.</span>
                    <span>{item.price * item.count} ₽</span>
                  </div>
                ))}
              </div>
              <hr style={{ border: 'none', borderTop: '1px dashed #e0e0e0' }} />
              <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '5px' }}>
                Итого: {order.total} ₽
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}