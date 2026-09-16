const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const bcrypt = require('bcrypt');

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

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Имя пользователя и пароль обязательны!" });
  }
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE login_user = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Пользователь с таким именем уже существует!" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      "INSERT INTO users (login_user, email, password_user, role) VALUES ($1, $2, $3, 'Клиент') RETURNING id_user as id, login_user as username, email, role",
      [username, email || null, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Ошибка при регистрации в БД: ${err.message}` });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE login_user = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверное имя пользователя или пароль!" });
    }
    
    const user = result.rows[0];
    const storedPassword = user.password_user || '';
    const isBcryptHash = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
    const match = isBcryptHash
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;
    if (!match) {
      return res.status(401).json({ error: "Неверное имя пользователя или пароль!" });
    }

    res.json({ 
      id: user.id_user, 
      username: user.login_user, 
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера при авторизации" });
  }
});

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

  const { id_user, userId, totalSum, total, address, name, email, items } = req.body;

  const rawUserId = id_user || userId;
  let cleanUserId = null;
  if (rawUserId && rawUserId !== "undefined" && rawUserId !== "null") {
    cleanUserId = parseInt(rawUserId, 10) || null;
  }

  const finalSum = totalSum || total || 0;
  const finalAddressText = `Имя: ${name || 'Не указано'}\nEmail: ${email || 'Не указан'}\nАдрес: ${address || 'Не указан'}\nСумма заказа: ${finalSum} ₽`;

  const currentTimestamp = new Date();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO public.orders (id_user, order_status, address, order_date) 
       VALUES ($1, 'В обработке', $2, $3) 
       RETURNING *`,
      [cleanUserId, finalAddressText, currentTimestamp]
    );

    const savedOrder = orderResult.rows[0];

    if (Array.isArray(items)) {
      for (const item of items) {
        const itemId = parseInt(item.id, 10);
        const itemQuantity = parseInt(item.count || item.quantity || 1, 10) || 1;
        const itemPrice = Number(item.priceNum ?? item.price ?? 0) || 0;
        if (!Number.isInteger(itemId)) continue;

        await client.query(
          `INSERT INTO public.order_items (quantity, price_sale, id_order, id_product)
           VALUES ($1, $2, $3, $4)`,
          [itemQuantity, itemPrice, savedOrder.id_order, itemId]
        );
      }
    }

    await client.query('COMMIT');

    console.log("ЗАКАЗ УСПЕШНО СОХРАНЕН В БД! ID:", savedOrder.id_order);

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
    await client.query('ROLLBACK');
    console.log("\nОШИБКА POSTGRESQL ПРИ СОЗДАНИИ ЗАКАЗА:");
    console.log(err.message);
    res.status(400).json({ error: "Ошибка БД: " + err.message });
  } finally {
    client.release();
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
      'UPDATE public.orders SET order_status = $1 WHERE id_order = $2 RETURNING *', 
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
      console.log(`Статус заказа №${orderId} успешно изменен в PostgreSQL на "${status}"`);
      res.json({ message: "Статус успешно обновлен", order: result.rows[0] });
    } else {
      res.status(404).json({ error: "Заказ с таким ID не найден в базе данных" });
    }
  } catch (err) {
    console.error("Ошибка при изменении статуса в БД:", err.message);
    res.status(500).json({ error: "Ошибка сервера при обновлении статуса: " + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id_user, login_user, email, role FROM public.users WHERE login_user = $1 AND password_user = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const clientRole = user.role === 'Администратор' ? 'admin' : 'user';

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