import React, { useState } from 'react';

function Contacts() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      contact: formData.email,
      message: formData.message
    };

    try {
      const response = await fetch('http://localhost:5000/api/contacts-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Ваше обращение успешно отправлено! Админы свяжутся с вами.');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      console.error("Ошибка отправки заявки на сервер:", err);
    }
  };

  return (
    <div className="contacts-page-container font-montserrat">
      <section className="contacts-main-section">
        <div className="contacts-info-side">
          <h1 className="contacts-page-title font-cormorant">Контакты</h1>
          <p className="contacts-page-subtitle">
            Мы всегда на связи и готовы помочь с выбором растений и уходом за ними
          </p>

          <div className="contacts-details-list">
            <div className="contact-detail-item">
              <div className="contact-icon-circle">
                <img src="/images/Location.png" alt="Адрес" />
              </div>
              <div className="contact-item-text">
                <span className="contact-item-label">Адрес</span>
                <span className="contact-item-value">г. Москва, ул. Зелёная, 36</span>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-icon-circle">
                <img src="/images/Phone.png" alt="Телефон" />
              </div>
              <div className="contact-item-text">
                <span className="contact-item-value-large">+7 (900) 000-00-00</span>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-icon-circle">
                <img src="/images/Mail.png" alt="Email" />
              </div>
              <div className="contact-item-text">
                <span className="contact-item-value-large">greenpainting@mail.ru</span>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-icon-circle">
                <img src="/images/Clock.png" alt="Часы работы" />
              </div>
              <div className="contact-item-text">
                <span className="contact-item-label">Часы работы</span>
                <span className="contact-item-value">ПН-ПТ: 10:00 - 20:00</span>
                <span className="contact-item-value">СБ-ВС: 11:00 - 19:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contacts-image-side">
          <div className="office-img-wrapper">
            <img src="/images/office_zelenaya_jivopis 1.png" alt="Офис Зелёная Живопись" className="office-main-img" />
          </div>
        </div>
      </section>

      <section className="feedback-form-section">
        <h2 className="feedback-form-title font-cormorant">ФОРМА ОБРАТНОЙ СВЯЗИ</h2>
        
        <form className="feedback-custom-form" onSubmit={handleSubmit}>
          <div className="form-input-group">
            <label className="form-custom-label">Имя</label>
            <input 
              type="text" 
              className="form-underline-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-input-group">
            <label className="form-custom-label">Email</label>
            <input 
              type="email" 
              className="form-underline-input"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-input-group">
            <label className="form-custom-label">Сообщение</label>
            <textarea 
              className="form-textarea-box"
              placeholder="Введите ваше сообщение"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="form-submit-green-btn font-montserrat">
            ОТПРАВИТЬ
          </button>
        </form>
      </section>
    </div>
  );
}

export default Contacts;