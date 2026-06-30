import React from 'react';

const ARTICLES_DATA = [
  {
    id: 501,
    img: '/images/uhod_osveshenie 1.png',
    date: 'Добавлено 18.05.2026'
  },
  {
    id: 502,
    img: '/images/uhod_podbor 1.png',
    date: 'Добавлено 21.05.2026'
  },
  {
    id: 503,
    img: '/images/uhod_kak_polivat 1.png',
    date: 'Добавлено 27.05.2026'
  }
];

function CareArticles({ onOpenArticle }) {
  return (
    <div className="articles-page-container font-montserrat">
      <div className="articles-grid-vertical">
        {ARTICLES_DATA.map((article) => (
          <div key={article.id} className="article-card-row">
            <div className="article-banner-wrapper" onClick={() => onOpenArticle(article)}>
              <img src={article.img} alt="Статья" className="article-banner-img" />
            </div>

            <div className="article-action-bar">
              <span className="article-date-text">{article.date}</span>
              <button 
                className="read-article-btn font-montserrat"
                onClick={() => onOpenArticle(article)}
              >
                ЧИТАТЬ СТАТЬЮ
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="read-more-wrapper">
        <span className="read-more-link font-cormorant">читать ещё</span>
      </div>
    </div>
  );
}

export default CareArticles;
export { ARTICLES_DATA };