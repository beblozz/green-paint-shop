import React from 'react';

function ArticleDetail({ article, onBack }) {
  if (!article) return null;

  const getArticleContent = () => {
    if (article.id === 501) {
      return (
        <div className="article-text-wrapper">
          <p className="article-lead-p">
            Свет — это главный источник энергии для растений, необходимый для процесса фотосинтеза. 
            Без правильного уровня освещения даже самый тщательный полив и дорогие удобрения не дадут желаемого результата.
          </p>
          
          <h3 className="article-section-title font-cormorant">Южные и северные окна</h3>
          <p className="article-regular-p">
            Южные окна идеально подходят для светолюбивых суккулентов, кактусов и цитрусовых. 
            Однако весной и летом нежные листья могут получить ожоги, поэтому растения стоит притенять лёгкой занавеской. 
            Северные окна, напротив, получают минимум прямых лучей — здесь будут чувствовать себя комфортно теневыносливые 
            папоротники, калатеи и сансевиерии.
          </p>
          
          <h3 className="article-section-title font-cormorant">Симптомы нехватки света</h3>
          <p className="article-regular-p">
            Если стебли вашего любимца сильно вытягиваются, листья бледнеют, теряют пёстрый окрас или начинают опадать — 
            это верный признак того, что растение срочно нужно переставить ближе к источнику света или организовать 
            искусственную досветку специальными фитолампами.
          </p>
        </div>
      );
    }
    
    if (article.id === 502) {
      return (
        <div className="article-text-wrapper">
          <p className="article-lead-p">
            Для поддержания здоровья и декоративного вида комнатным растениям в ограниченном объёме горшка 
            необходима регулярная подкормка. Главное правило — понимать, какие элементы требуются растению в разные периоды жизни.
          </p>
          
          <h3 className="article-section-title font-cormorant">Азот, фосфор и калий (NPK)</h3>
          <p className="article-regular-p">
            Азот (N) отвечает за активный рост зелёной массы и насыщенный цвет листьев — он необходим декоративно-лиственным 
            видам (монстерам, фикусам). Фосфор (P) укрепляет корневую систему, а Калий (K) стимулирует закладку бутонов и обильное цветение.
          </p>
          
          <h3 className="article-section-title font-cormorant">Как правильно вносить подкормку</h3>
          <p className="article-regular-p">
            Никогда не удобряйте растения по сухому грунту — это может вызвать ожог корней. Сначала обильно полейте 
            цветок чистой водой, и только затем вносите раствор. В осенне-зимний период подкормки снижают до минимума, 
            давая растению отдохнуть.
          </p>
        </div>
      );
    }

    return (
      <div className="article-text-wrapper">
        <p className="article-lead-p">
          Ошибки в поливе — самая частая причина гибели комнатных цветов. Залив приводит к гниению корней, 
          а сильная пересушка — к увяданию и засыханию надземной части.
        </p>
        
        <h3 className="article-section-title font-cormorant">Правило фаланг пальца</h3>
        <p className="article-regular-p">
          Большинство комнатных растений требуют полива только тогда, когда верхний слой почвы просох на 2-3 сантиметра. 
          Проверить это очень легко пальцем или деревянной шпажкой. Если земля на глубине влажная — поливать ещё рано.
        </p>
        
        <h3 className="article-section-title font-cormorant">Качество воды имеет значение</h3>
        <p className="article-regular-p">
          Вода из-под крана содержит хлор и соли кальция, которые защелачивают почву. Используйте только отстоявшуюся 
          воду комнатной температуры (минимум 24 часа). Полив холодной водой вызывает стресс у корневой системы.
        </p>
      </div>
    );
  };

  return (
    <div className="article-detail-container font-montserrat">
      <div className="article-detail-back-nav">
        <button className="back-to-articles-link" onClick={onBack}>
          <img src="/images/Arrow.png" alt="Назад" className="back-arrow-icon" />
          НАЗАД К СТАТЬЯМ
        </button>
      </div>
      
      <article className="article-detail-main">
        <div className="article-detail-image-box">
          <img src={article.img} alt="Баннер статьи" className="article-detail-img" />
        </div>

        <div className="article-detail-meta-row">
          <span className="article-detail-date">{article.date}</span>
          <hr className="article-detail-divider" />
        </div>

        {getArticleContent()}
      </article>
    </div>
  );
}

export default ArticleDetail;