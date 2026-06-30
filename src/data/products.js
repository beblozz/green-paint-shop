// Единый локальный каталог товаров магазина "Зелёная Живопись".
// Здесь хранятся ВСЕ товары всех 4 категорий с уникальными на весь магазин ID.
// Это намеренно НЕ берётся из базы данных — товары хранятся локально на фронтенде,
// а в БД остаются только пользователи и заказы (как и было решено).
//
// Диапазоны ID по категориям (чтобы они никогда не пересекались):
//   1   - 199  -> растения        (generalCategory: 'РАСТЕНИЯ')
//   201 - 299  -> кашпо           (generalCategory: 'КАШПО')
//   301 - 399  -> товары для уход (generalCategory: 'ДЛЯ УХОДА')
//   401 - 499  -> удобрения       (generalCategory: 'УДОБРЕНИЯ')

export const PLANTS = [
  {
    id: 1,
    name: 'Филодендрон Глориозум',
    img: '/images/filodendron-katalog.png',
    price: '1 090 ₽',
    priceNum: 1090,
    category: 'Средние растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Рассеянный свет',
    care: 'Средний',
    isSale: false
  },
  {
    id: 2,
    name: 'Монстера Адансона',
    img: '/images/monstera_katalog.png',
    price: '1 020 ₽',
    priceNum: 1020,
    category: 'Подвесные растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Яркий свет',
    care: 'Легкий',
    isSale: false
  },
  {
    id: 3,
    name: 'Калатея Орбифолия',
    img: '/images/kalatea_katalog.png',
    price: '1 490 ₽',
    oldPrice: '1 890 ₽',
    priceNum: 1490,
    category: 'Средние растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Тень',
    care: 'Сложный',
    isSale: true
  },
  {
    id: 4,
    name: 'Алоказия Полли',
    img: '/images/alokazia_katalog.png',
    price: '1 690 ₽',
    oldPrice: '2 190 ₽',
    priceNum: 1690,
    category: 'Крупные растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Яркий свет',
    care: 'Средний',
    isSale: true
  },
  {
    id: 5,
    name: 'Эпипремнум Ауреум',
    img: '/images/Epipremnum.png',
    price: '850 ₽',
    priceNum: 850,
    category: 'Подвесные растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Тень',
    care: 'Легкий',
    isSale: false
  },
  {
    id: 6,
    name: 'Фикус Бенджамина',
    img: '/images/Ficus of Benjamin.png',
    price: '1 900 ₽',
    oldPrice: '2 400 ₽',
    priceNum: 1900,
    category: 'Крупные растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Рассеянный свет',
    care: 'Средний',
    isSale: true
  },
  {
    id: 7,
    name: 'Пятнистая Бегония',
    img: '/images/Spotted begonia.png',
    price: '1 150 ₽',
    oldPrice: '1 550 ₽',
    priceNum: 1150,
    category: 'Средние растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Рассеянный свет',
    care: 'Сложный',
    isSale: true
  },
  {
    id: 8,
    name: 'Хлорофитум Хохлатый',
    img: '/images/Crested Chlorophytum.png',
    price: '690 ₽',
    priceNum: 690,
    category: 'Маленькие растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Яркий свет',
    care: 'Легкий',
    isSale: false
  },
  {
    id: 9,
    name: 'Спатифиллум',
    img: '/images/Сpathi.png',
    price: '990 ₽',
    oldPrice: '1 350 ₽',
    priceNum: 990,
    category: 'Средние растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Тень',
    care: 'Легкий',
    isSale: true
  },
  {
    id: 10,
    name: 'Сансевьерия Лауренти',
    img: '/images/Sansevieria.png',
    price: '1 950 ₽',
    priceNum: 1950,
    category: 'Средние растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Яркий свет',
    care: 'Легкий',
    isSale: false
  },
  {
    id: 11,
    name: 'Сингониум Подофиллум',
    img: '/images/singonium.png',
    price: '920 ₽',
    priceNum: 920,
    category: 'Подвесные растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Рассеянный свет',
    care: 'Средний',
    isSale: false
  },
  {
    id: 12,
    name: 'Денежное Дерево',
    img: '/images/denejnoe_derevo.png',
    price: '1 200 ₽',
    oldPrice: '1 700 ₽',
    priceNum: 1200,
    category: 'Маленькие растения',
    generalCategory: 'РАСТЕНИЯ',
    lighting: 'Яркий свет',
    care: 'Легкий',
    isSale: true
  }
];

export const KASHPO = [
  { id: 201, name: 'Кашпо «Грибной малыш»', img: '/images/kaphpo-1.png', price: '1 690 ₽', priceNum: 1690, generalCategory: 'КАШПО', material: 'Керамика', subCategory: 'Декоративные кашпо', size: 'Средние', isSale: false },
  { id: 202, name: 'Кашпо «Лицо Музы»', img: '/images/kaphpo-2.png', price: '1 490 ₽', priceNum: 1490, generalCategory: 'КАШПО', material: 'Керамика', subCategory: 'Настольные кашпо', size: 'Маленькие', isSale: false },
  { id: 203, name: 'Кашпо «Французский бульдог»', img: '/images/kaphpo-3.png', price: '1 890 ₽', oldPrice: '2 290 ₽', priceNum: 1890, generalCategory: 'КАШПО', material: 'Гипс', subCategory: 'Необычные кашпо', size: 'Средние', isSale: true },
  { id: 204, name: 'Кашпо «Морская раковина»', img: '/images/kaphpo-4.png', price: '1 390 ₽', oldPrice: '1 690 ₽', priceNum: 1390, generalCategory: 'КАШПО', material: 'Керамика', subCategory: 'Необычные кашпо', size: 'Маленькие', isSale: true },
  { id: 205, name: 'Кашпо «Брутализм»', img: '/images/kaphpo-5.png', price: '2 100 ₽', priceNum: 2100, generalCategory: 'КАШПО', material: 'Гипс', subCategory: 'Настольные кашпо', size: 'Средние', isSale: false },
  { id: 206, name: 'Кашпо «Ретро-TV»', img: '/images/kaphpo-6.png', price: '4 500 ₽', priceNum: 4500, generalCategory: 'КАШПО', material: 'Полистоун', subCategory: 'Необычные кашпо', size: 'Средние', isSale: false },
  { id: 207, name: 'Кашпо «Шлем космонавта»', img: '/images/kaphpo-7.png', price: '3 200 ₽', oldPrice: '3 900 ₽', priceNum: 3200, generalCategory: 'КАШПО', material: 'Пластик', subCategory: 'Необычные кашпо', size: 'Большие', isSale: true },
  { id: 208, name: 'Кашпо «Левитирующий кристалл»', img: '/images/kaphpo-8.png', price: '2 490 ₽', priceNum: 2490, generalCategory: 'КАШПО', material: 'Пластик', subCategory: 'Декоративные кашпо', size: 'Средние', isSale: false },
  { id: 209, name: 'Кашпо «Бережные руки»', img: '/images/kashpo-ruki.png', price: '2 900 ₽', priceNum: 2900, generalCategory: 'КАШПО', material: 'Бетон', subCategory: 'Напольные кашпо', size: 'Большие', isSale: false },
  { id: 210, name: 'Кашпо «Киберпанк»', img: '/images/kashpo-kiberpank.png', price: '3 800 ₽', oldPrice: '4 500 ₽', priceNum: 3800, generalCategory: 'КАШПО', material: 'Полистоун', subCategory: 'Необычные кашпо', size: 'Большие', isSale: true },
  { id: 211, name: 'Кашпо «Крафт-пакет»', img: '/images/kashpo-paket.png', price: '1 100 ₽', priceNum: 1100, generalCategory: 'КАШПО', material: 'Керамика', subCategory: 'Настольные кашпо', size: 'Маленькие', isSale: false },
  { id: 212, name: 'Кашпо «Терракотовый каньон»', img: '/images/kashpo-terract.png', price: '1 950 ₽', priceNum: 1950, generalCategory: 'КАШПО', material: 'Глина', subCategory: 'Напольные кашпо', size: 'Большие', isSale: false }
];

export const CARE_PRODUCTS = [
  { id: 301, name: 'Опрыскиватель для растений', img: '/images/prisk.png', price: '590 ₽', priceNum: 590, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Опрыскиватели', purpose: 'Полив', material: 'Стекло', isSale: false },
  { id: 302, name: 'Перчатки для ухода за растениями', img: '/images/perchatki.png', price: '490 ₽', priceNum: 490, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Перчатки', purpose: 'Пересадка', material: 'Ткань', isSale: false },
  { id: 303, name: 'Секатор садовый мини', img: '/images/noshnici.png', price: '550 ₽', oldPrice: '750 ₽', priceNum: 550, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Секаторы', purpose: 'Обрезка', material: 'Металл', isSale: true },
  { id: 304, name: 'Лейка для комнатных растений', img: '/images/leika.png', price: '690 ₽', oldPrice: '890 ₽', priceNum: 690, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Лейки', purpose: 'Полив', material: 'Пластик', isSale: true },
  { id: 305, name: 'Фитолампа кольцевая (Ring Grow Light)', img: '/images/Ring_Grow_Light.png', price: '1 490 ₽', priceNum: 1490, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Инструменты', purpose: 'Пересадка', material: 'Пластик', isSale: false },
  { id: 306, name: 'Измеритель влажности почвы', img: '/images/Soil_Moisture_Meter.png', price: '850 ₽', priceNum: 850, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Инструменты', purpose: 'Полив', material: 'Пластик', isSale: false },
  { id: 307, name: 'Щетка для удаления пыли с листьев', img: '/images/Leaf_Dusting_Brush.png', price: '320 ₽', oldPrice: '450 ₽', priceNum: 320, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Инструменты', purpose: 'Пересадка', material: 'Пластик', isSale: true },
  { id: 308, name: 'Набор мини-инструментов', img: '/images/Succulent_Mini_Tool_Set.png', price: '590 ₽', priceNum: 590, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Инструменты', purpose: 'Пересадка', material: 'Металл', isSale: false },
  { id: 309, name: 'Геометрическая шпалера для вьюнов', img: '/images/Geometric_Plant_Trellis.png', price: '420 ₽', priceNum: 420, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Инструменты', purpose: 'Пересадка', material: 'Пластик', isSale: false },
  { id: 310, name: 'Коврик для пересадки растений', img: '/images/Plant_Repotting_Mat.png', price: '790 ₽', oldPrice: '990 ₽', priceNum: 790, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Инструменты', purpose: 'Пересадка', material: 'Пластик', isSale: true },
  { id: 311, name: 'Стеклянная колба для автополива', img: '/images/Glass_Watering_Globe.png', price: '490 ₽', priceNum: 490, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Лейки', purpose: 'Полив', material: 'Стекло', isSale: false },
  { id: 312, name: 'Станция для проращивания черенков', img: '/images/Propagation_Station.png', price: '1 250 ₽', oldPrice: '1 600 ₽', priceNum: 1250, generalCategory: 'ДЛЯ УХОДА', subCategory: 'Инструменты', purpose: 'Пересадка', material: 'Стекло', isSale: true }
];

export const FERTILIZERS = [
  { id: 401, name: 'Органическое удобрение', img: '/images/ugobreniya_organic.png', price: '450 ₽', priceNum: 450, generalCategory: 'УДОБРЕНИЯ', type: 'Органические', form: 'Жидкие концентрат', purpose: 'Универсальное', isSale: false, page: 1 },
  { id: 402, name: 'Удобрение в чешуйках', img: '/images/ugobreniya_chetyshix.png', price: '380 ₽', priceNum: 380, generalCategory: 'УДОБРЕНИЯ', type: 'Органические', form: 'Сухие / Гранулы', purpose: 'Для декоративно-лиственных', isSale: false, page: 1 },
  { id: 403, name: 'Универсальное удобрение', img: '/images/ugobreniya_universaloe.png', price: '490 ₽', oldPrice: '650 ₽', priceNum: 490, generalCategory: 'УДОБРЕНИЯ', type: 'Минеральные', form: 'Жидкие концентрат', purpose: 'Универсальное', isSale: true, page: 1 },
  { id: 404, name: 'Питательные палочки', img: '/images/ugobreniya_palochki.png', price: '290 ₽', priceNum: 290, generalCategory: 'УДОБРЕНИЯ', type: 'Минеральные', form: 'Палочки', purpose: 'Для цветущих', isSale: false, page: 1 },
  { id: 405, name: 'Шипучие эко-таблетки', img: '/images/Effervescent_Fertilizer_Tablets.png', price: '340 ₽', priceNum: 340, generalCategory: 'УДОБРЕНИЯ', type: 'Минеральные', form: 'Сухие / Гранулы', purpose: 'Универсальное', isSale: false, page: 2 },
  { id: 406, name: 'Питательная сыворотка с пипеткой', img: '/images/Plant_Nutrient_Serum_Dropper.png', price: '690 ₽', oldPrice: '890 ₽', priceNum: 690, generalCategory: 'УДОБРЕНИЯ', type: 'Биостимуляторы', form: 'Жидкие концентрат', purpose: 'Для кактусов и суккулентов', isSale: true, page: 2 },
  { id: 407, name: 'Капсулы для полива', img: '/images/Liquid_Fertilizer_Pods.png', price: '420 ₽', priceNum: 420, generalCategory: 'УДОБРЕНИЯ', type: 'Минеральные', form: 'Палочки', purpose: 'Универсальное', isSale: false, page: 2 },
  { id: 408, name: 'Питательный тоник-спрей', img: '/images/Nutrient_Leaf_Misting_Spray.png', price: '550 ₽', oldPrice: '720 ₽', priceNum: 550, generalCategory: 'УДОБРЕНИЯ', type: 'Биостимуляторы', form: 'Спреи', purpose: 'Для декоративно-лиственных', isSale: true, page: 2 },
  { id: 409, name: 'Гранулы в аптекарской банке', img: '/images/Slow_Release_Fertilizer_Granules.png', price: '850 ₽', priceNum: 850, generalCategory: 'УДОБРЕНИЯ', type: 'Органические', form: 'Сухие / Гранулы', purpose: 'Для декоративно-лиственных', isSale: false, page: 3 },
  { id: 410, name: 'Минеральная паста в тюбике', img: '/images/Mineral_Growth_Paste_Tube.png', price: '480 ₽', priceNum: 480, generalCategory: 'УДОБРЕНИЯ', type: 'Минеральные', form: 'Жидкие концентрат', purpose: 'Для кактусов и суккулентов', isSale: false, page: 3 },
  { id: 411, name: 'Порционные стики с порошком', img: '/images/Single_Serve_Fertilizer_Sticks.png', price: '310 ₽', oldPrice: '450 ₽', priceNum: 310, generalCategory: 'УДОБРЕНИЯ', type: 'Минеральные', form: 'Сухие / Гранулы', purpose: 'Универсальное', isSale: true, page: 3 },
  { id: 412, name: 'Прессованные органические кубики', img: '/images/Pressed_Organic_Fertilizer_Cubes.png', price: '590 ₽', priceNum: 590, generalCategory: 'УДОБРЕНИЯ', type: 'Органические', form: 'Сухие / Гранулы', purpose: 'Универсальное', isSale: false, page: 3 }
];

// Общий массив абсолютно всех товаров магазина — используется для поиска
// товара по ID на странице карточки товара (ProductDetail) и в админке.
export const ALL_PRODUCTS = [...PLANTS, ...KASHPO, ...CARE_PRODUCTS, ...FERTILIZERS];

export function findProductById(id) {
  const numericId = parseInt(id, 10);
  return ALL_PRODUCTS.find((p) => p.id === numericId);
}

// Применяет процентную скидку к базовой цене и округляет итог вниз до десятков
// рублей, чтобы цена выглядела «ровной» (например, 1341 → 1340, а не 1341).
// Используется во всех каталогах и в карточке товара — единая логика расчёта,
// чтобы цена со скидкой совпадала везде.
export function applyDiscount(basePrice, discountPercent) {
  const discount = parseInt(discountPercent, 10) || 0;
  if (discount <= 0) return basePrice;
  const raw = basePrice - (basePrice * (discount / 100));
  return Math.floor(raw / 10) * 10;
}
