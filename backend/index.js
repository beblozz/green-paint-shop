const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',         
  host: 'localhost',
  database: 'plant_shop',   
  password: '123', 
  port: 5432,
});

app.post('/api/contacts-requests', async (req, res) => {
  const { name, contact, message } = req.body;
  if (!name || !contact || !message) {
    return res.status(400).json({ error: "Заполните все поля обратной связи!" });
  }

  try {
    const queryText = `
      INSERT INTO contacts_requests (name, contact, message) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, contact, message, to_char(created_at, 'DD.MM.YYYY') as date
    `;
    const result = await pool.query(queryText, [name, contact, message]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка БД при сохранении заявки" });
  }
});

app.get('/api/contacts-requests', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, contact, message, to_char(created_at, 'DD.MM.YYYY') as date 
      FROM contacts_requests 
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка БД при загрузке заявок" });
  }
});

app.delete('/api/contacts-requests/:id', async (req, res) => {
  const requestId = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM contacts_requests WHERE id = $1', [requestId]);
    res.json({ success: true, message: "Заявка удалена из базы данных!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка БД при удалении заявки" });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO public.users (login_user, email, phone, password_user, role) 
       VALUES ($1, $2, $3, $4, 'Клиент') 
       RETURNING id_user, login_user, email, phone, role`,
      [username, email, phone || null, password]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: "Пользователь успешно создан",
      user: {
        id: newUser.id_user,
        id_user: newUser.id_user,
        username: newUser.login_user,
        email: newUser.email,
        phone: newUser.phone,
        role: 'user'
      }
    });
  } catch (err) {
    console.error("Ошибка при регистрации в БД:", err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: "Пользователь с таким логином или почтой уже существует" });
    }
    res.status(500).json({ error: "Ошибка сервера при регистрации" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id_user, login_user, email, id_role, phone, address FROM public.users WHERE login_user = $1 AND password_user = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const clientRole = user.id_role === 2 ? 'admin' : 'user';

      res.json({
        id: user.id_user,
        id_user: user.id_user,
        username: user.login_user,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: clientRole
      });
    } else {
      res.status(401).json({ error: 'Неверный логин или пароль' });
    }
  } catch (err) {
    console.error("Критическая ошибка при авторизации:", err.message);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
  }
});

// Карточки товаров (название, картинка, категория и т.д.) хранятся локально на
// фронтенде в файле src/data/products.js. А вот ЦЕНА и СКИДКА, которые может
// менять администратор в панели, сохраняются в БД в таблице product_settings,
// чтобы изменения не терялись при перезагрузке страницы и были видны всем
// пользователям сайта, а не только в браузере администратора.

app.get('/api/products/prices', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_product, price, discount_percent FROM public.product_settings'
    );
    res.json(result.rows.map(row => ({
      id: row.id_product,
      price: Number(row.price),
      discountPercent: row.discount_percent
    })));
  } catch (err) {
    console.error("Ошибка при получении цен товаров:", err.message);
    res.status(500).json({ error: "Ошибка БД при загрузке цен товаров" });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { price, discountPercent } = req.body;

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Некорректный ID товара" });
  }

  const priceValue = (price === undefined || price === null || price === '') ? null : Number(price);
  const discountValue = (discountPercent === undefined || discountPercent === null || discountPercent === '')
    ? null
    : parseInt(discountPercent, 10);

  if (priceValue === null && discountValue === null) {
    return res.status(400).json({ error: "Нужно передать price и/или discountPercent" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.product_settings (id_product, price, discount_percent, updated_at)
       VALUES ($1, COALESCE($2, 0), COALESCE($3, 0), NOW())
       ON CONFLICT (id_product) DO UPDATE SET
         price = COALESCE($2, public.product_settings.price),
         discount_percent = COALESCE($3, public.product_settings.discount_percent),
         updated_at = NOW()
       RETURNING id_product, price, discount_percent`,
      [productId, priceValue, discountValue]
    );

    const row = result.rows[0];
    res.json({
      id: row.id_product,
      price: Number(row.price),
      discountPercent: row.discount_percent
    });
  } catch (err) {
    console.error("Ошибка при сохранении цены товара:", err.message);
    res.status(500).json({ error: "Ошибка БД при сохранении цены товара" });
  }
});

app.post('/api/orders', async (req, res) => {
  console.log("Получены данные для заказа:", req.body);

  const { id_user, userId, totalSum, total, address, name, email } = req.body;

  const rawUserId = id_user || userId;
  let cleanUserId = null;
  if (rawUserId && rawUserId !== "undefined" && rawUserId !== "null") {
    cleanUserId = parseInt(rawUserId, 10) || null;
  }

  const finalSum = totalSum || total || 0;
  const finalAddressText = `Имя: ${name || 'Не указано'}\nEmail: ${email || 'Не указан'}\nАдрес: ${address || 'Не указан'}\nСумма заказа: ${finalSum} ₽`;

  const currentTimestamp = new Date();

  try {
    const orderResult = await pool.query(
      `INSERT INTO public.orders (id_user, order_status, address, order_date) 
       VALUES ($1, 'В обработке', $2, $3) 
       RETURNING *`,
      [cleanUserId, finalAddressText, currentTimestamp]
    );

    const savedOrder = orderResult.rows[0];

    console.log("✅ ЗАКАЗ УСПЕШНО СОХРАНЕН В БД! ID:", savedOrder.id_order);

    res.status(201).json({
      message: "Заказ успешно создан",
      id: savedOrder.id_order,
      id_order: savedOrder.id_order,
      status: savedOrder.order_status,
      total: finalSum,
      address: finalAddressText,
      date: savedOrder.order_date
    });

  } catch (err) {
    console.log("\n❌ ОШИБКА POSTGRESQL ПРИ СОЗДАНИИ ЗАКАЗА:");
    console.log(err.message);
    console.log("===============================================\n");
    res.status(400).json({ error: "Ошибка БД: " + err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const ordersResult = await pool.query(`
      SELECT id_order, order_date, order_status, id_user, address, phone
      FROM orders 
      ORDER BY id_order DESC
    `);

    const allOrders = ordersResult.rows;

    for (let order of allOrders) {
      const itemsResult = await pool.query(`
        SELECT id_product, quantity, price_sale
        FROM order_items
        WHERE id_order = $1
      `, [order.id_order]);

      order.items = itemsResult.rows.map(item => ({
        id: item.id_product, 
        name: `Товар #${item.id_product}`,
        img: '/images/placeholder.png',
        count: item.quantity,
        price: Number(item.price_sale)
      }));
      order.id = order.id_order;
      order.date = new Date(order.order_date).toLocaleDateString('ru-RU');
      order.status = order.order_status;
      order.total = order.items.reduce((sum, i) => sum + (i.price * (i.count || 1)), 0);
      order.delivery = { 
        address: order.address || "Адрес не указан", 
        phone: order.phone || "Телефон не указан" 
      };
    }

    res.json(allOrders);

  } catch (err) {
    console.error("Ошибка при получении заказов:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:userId/orders', async (req, res) => {
  const { userId } = req.params;

  try {
    const ordersResult = await pool.query(`
      SELECT id_order, order_date, order_status, id_user, address, phone
      FROM orders 
      WHERE id_user = $1
      ORDER BY id_order DESC
    `, [userId]);

    const userOrders = ordersResult.rows;

    for (let order of userOrders) {
      const itemsResult = await pool.query(`
        SELECT id_product, quantity, price_sale
        FROM order_items
        WHERE id_order = $1
      `, [order.id_order]);
      
      order.items = itemsResult.rows.map(item => ({
        id: item.id_product,
        name: `Товар #${item.id_product}`,
        count: item.quantity,
        price: Number(item.price_sale)
      }));
      order.id = order.id_order;
      order.date = new Date(order.order_date).toLocaleDateString('ru-RU');
      order.status = order.order_status;
      order.total = order.items.reduce((sum, i) => sum + (i.price * (i.count || 1)), 0);
    }

    res.json(userOrders);

  } catch (err) {
    console.error(`КРИТИЧЕСКАЯ ОШИБКА ДЛЯ ЮЗЕРА ${userId}:`, err.message);
    res.status(500).json({ error: `Ошибка получения заказов: ${err.message}` });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT id_order, order_date, order_status, address FROM public.orders WHERE id_user = $1 ORDER BY order_date DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении заказов пользователя:", err.message);
    res.status(500).json({ error: 'Ошибка сервера при получении заказов' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', 
      [status, orderId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Заказ не найден в PostgreSQL" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка БД при обновлении статуса" });
  }
});

app.get('/api/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_user, login_user, email, full_name, phone, address FROM users WHERE id_user = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id_user,
      username: user.login_user,
      email: user.email,
      name: user.full_name || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  } catch (err) {
    console.error("Ошибка GET /profile:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  const { name, phone, address } = req.body;

  try {
    const updateResult = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           phone = COALESCE($2, phone), 
           address = COALESCE($3, address) 
       WHERE id_user = $4 
       RETURNING id_user, login_user, email, full_name, phone, address`,
      [name, phone, address, userId]
    );

    const user = updateResult.rows[0];
    res.json({ 
      message: 'Успешно', 
      user: {
        id: user.id_user,
        username: user.login_user,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        address: user.address
      } 
    });
  } catch (err) {
    console.error("Ошибка PUT /profile:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  console.log(`Запрос на смену статуса заказа №${orderId} на значение: "${status}"`);

  try {
    const result = await pool.query(
      `UPDATE public.orders 
       SET order_status = $1 
       WHERE id_order = $2 
       RETURNING *`,
      [status, parseInt(orderId, 10)]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Статус заказа №${orderId} успешно изменен в PostgreSQL на "${status}"`);
      res.json({ message: "Статус успешно обновлен", order: result.rows[0] });
    } else {
      res.status(404).json({ error: "Заказ с таким ID не найден в базе данных" });
    }
  } catch (err) {
    console.error("❌ Ошибка при изменении статуса в БД:", err.message);
    res.status(500).json({ error: "Ошибка сервера при обновлении статуса: " + err.message });
  }
});

// Роут обновления скидки товара удалён — скидки управляются на фронтенде
// в локальном React state (см. App.jsx -> globalDiscounts).

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id_user, login_user, email, id_role FROM public.users WHERE login_user = $1 AND password_user = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const clientRole = user.id_role === 2 ? 'admin' : 'user';

      res.json({
        id: user.id_user,
        id_user: user.id_user,
        username: user.login_user,
        email: user.email,
        role: clientRole
      });
    } else {
      res.status(401).json({ error: 'Неверный логин или пароль' });
    }
  } catch (err) {
    console.error("Ошибка при авторизации:", err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id_order, 
        o.order_date, 
        o.order_status,
        o.address,
        u.login_user AS client_name,  
        u.email AS client_email      
      FROM public.orders o
      JOIN public.users u ON o.id_user = u.id_user
      ORDER BY o.order_date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении заказов для админки:", err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_user, login_user, email, phone, address, bonus_points, discount FROM public.users WHERE id_user = $1',
      [userId]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Пользователь не найден' });
    }
  } catch (err) {
    console.error("Ошибка при получении профиля:", err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const revenueData = [0, 0, 0, 0, 0, 0, 0];
    const salesData = [0, 0, 0, 0, 0, 0, 0];

    const result = await pool.query(`
      SELECT 
        EXTRACT(ISODOW FROM order_date) as day_of_week,
        COUNT(id_order) as sales_count,
        SUM(COALESCE(CAST(substring(address from 'Сумма заказа: ([0-9]+)') AS INTEGER), 0)) as total_revenue
      FROM public.orders
      WHERE order_date >= NOW() - INTERVAL '7 days'
        AND order_status != 'Отменён'
      GROUP BY day_of_week
      ORDER BY day_of_week;
    `);

    result.rows.forEach(row => {
      const dayIndex = parseInt(row.day_of_week, 10) - 1;
      if (dayIndex >= 0 && dayIndex < 7) {
        revenueData[dayIndex] = parseInt(row.total_revenue, 10) || 0;
        salesData[dayIndex] = parseInt(row.sales_count, 10) || 0;
      }
    });

    res.json({
      revenue: revenueData,
      sales: salesData
    });

  } catch (err) {
    console.error("Ошибка при получении аналитики:", err.message);
    res.status(500).json({ error: "Ошибка сервера при расчете аналитики" });
  }
});

// Роут массового обновления цен в БД удалён — цены и скидки товаров
// теперь редактируются и хранятся локально на фронтенде (AdminPanel.jsx).

const PORT = 5000;

async function ensureProductSettingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.product_settings (
        id_product INTEGER PRIMARY KEY,
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        discount_percent INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Таблица product_settings готова (цены и скидки товаров).");
  } catch (err) {
    console.error("Не удалось создать таблицу product_settings:", err.message);
  }
}

ensureProductSettingsTable().finally(() => {
  app.listen(PORT, () => console.log(`бэкенд запущен ${PORT}`));
});