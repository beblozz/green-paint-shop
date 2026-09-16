import React, { useState } from "react";
import "./App.css"; 

const AuthModal = ({ isOpen, onClose, onAuthSuccess, onLoginSubmit }) => {
  if (!isOpen) return null;

  const [authMode, setAuthMode] = useState('login'); // 'login' или 'register'
  const [error, setError] = useState('');

  // Поля форм
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Глазики
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (onLoginSubmit) {
      await onLoginSubmit(username, password);
      onClose();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      sessionStorage.setItem('user', JSON.stringify(data));
      if (onAuthSuccess) onAuthSuccess(data);
      alert('Регистрация прошла успешно!');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Главное окно формы */}
      <div className="auth-modal-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Кнопка закрытия */}
        <span className="modal-close" onClick={onClose}>&times;</span>

        {error && <p className="auth-error-text">{error}</p>}

        {/* --- ФОРМА АВТОРИЗАЦИИ --- */}
        {authMode === 'login' ? (
          <div className="auth-container-block">
            <h1 className="font-cormorant">АВТОРИЗАЦИЯ</h1>
            
            <form onSubmit={handleLogin} className="auth-form-element">
              <input 
                type="text" 
                placeholder="ЛОГИН / ТЕЛЕФОН" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="font-cormorant auth-input-plate"
              />
              <input 
                type="password" 
                placeholder="ПАРОЛЬ" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="font-cormorant auth-input-plate"
              />
              
              <button type="submit" className="font-cormorant auth-submit-btn">
                ВОЙТИ В АККАУНТ
              </button>
            </form>

            <div className="auth-links-footer">
              <span onClick={() => { setAuthMode('register'); setError(''); }} className="font-cormorant auth-redirect-link">
                РЕГИСТРАЦИЯ ДЛЯ НОВЫХ ПОЛЬЗОВАТЕЛЕЙ
              </span>
              <span className="font-cormorant auth-redirect-link">
                ЗАБЫЛ ПАРОЛЬ
              </span>
            </div>
          </div>
        ) : (
          /* --- ФОРМА РЕГИСТРАЦИИ --- */
          <div className="auth-container-block">
            <h1 className="font-cormorant">РЕГИСТРАЦИЯ</h1>
            
            <form onSubmit={handleRegister} className="auth-form-element">
              <input 
                type="text" 
                placeholder="ЛОГИН (НА АНГЛИЙСКОМ)" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="font-cormorant auth-input-plate"
              />
              <input 
                type="text" 
                placeholder="НОМЕР ТЕЛЕФОН" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="font-cormorant auth-input-plate"
              />
              <input 
                type="email" 
                placeholder="EMAIL" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="font-cormorant auth-input-plate"
              />

              {/* ПАРОЛЬ С ГЛАЗИКОМ */}
              <div className="auth-password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="ПАРОЛЬ" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="font-cormorant auth-input-plate password-with-eye"
                />
                <img 
                  src={showPassword ? "/images/Eye.png" : "/images/Closed Eye.png"} 
                  alt="Глазик"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-icon"
                />
              </div>

              {/* ПОВТОР ПАРОЛЯ С ГЛАЗИКОМ */}
              <div className="auth-password-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="ПОВТОРИТЬ ПАРОЛЬ" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className="font-cormorant auth-input-plate password-with-eye"
                />
                <img 
                  src={showConfirmPassword ? "/images/Eye.png" : "/images/Closed Eye.png"} 
                  alt="Глазик"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-eye-icon"
                />
              </div>

              <button type="submit" className="font-cormorant auth-submit-btn">
                ЗАРЕГИСТРИРОВАТЬСЯ
              </button>
            </form>

            <div className="auth-links-footer">
              <span onClick={() => { setAuthMode('login'); setError(''); }} className="font-cormorant auth-redirect-link">
                ИМЕЕТСЯ АККАУНТ НА ДАННОЙ ПЛАТФОРМЕ
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;