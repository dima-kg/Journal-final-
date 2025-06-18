/*
  # Создание таблицы категорий событий

  1. Новые таблицы
    - `categories`
      - `id` (uuid, primary key)
      - `code` (text, unique) - код категории для системы
      - `name` (text) - название категории для отображения
      - `description` (text, optional) - описание категории
      - `is_active` (boolean) - активна ли категория
      - `sort_order` (integer) - порядок сортировки
      - `created_at` (timestamptz) - время создания
      - `updated_at` (timestamptz) - время обновления

  2. Изменения в journal_entries
    - Заменить category (text) на category_id (uuid, foreign key)

  3. Безопасность
    - Включить RLS для таблицы categories
    - Политики для чтения всех категорий аутентифицированными пользователями
    - Политики для создания/обновления категорий аутентифицированными пользователями

  4. Индексы
    - Индекс по коду для быстрого поиска
    - Индекс по активности для фильтрации
    - Индекс по порядку сортировки
*/

-- Создание таблицы категорий
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включение RLS для таблицы categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Политики для categories
CREATE POLICY "Authenticated users can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Вставка базовых категорий
INSERT INTO categories (code, name, description, sort_order) VALUES
  ('equipment_work', 'Работы на оборудовании', 'Плановые и внеплановые работы на электрооборудовании', 1),
  ('relay_protection', 'РЗА и телемеханика', 'Работы с релейной защитой, автоматикой и телемеханикой', 2),
  ('team_permits', 'Допуски бригад', 'Выдача и закрытие допусков для работающих бригад', 3),
  ('emergency', 'Аварийные сообщения', 'Аварийные ситуации и нештатные события', 4),
  ('network_outages', 'Отключения в сети', 'Плановые и аварийные отключения в электрической сети', 5),
  ('other', 'Прочие события', 'Другие важные события и происшествия', 6)
ON CONFLICT (code) DO NOTHING;

-- Добавление новой колонки в journal_entries
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

-- Создание индекса для внешнего ключа
CREATE INDEX IF NOT EXISTS idx_journal_entries_category_id ON journal_entries(category_id);

-- Миграция существующих данных (если есть)
DO $$
BEGIN
  -- Обновляем category_id на основе существующих значений category
  UPDATE journal_entries 
  SET category_id = (
    SELECT id FROM categories WHERE code = journal_entries.category
  )
  WHERE category_id IS NULL AND category IS NOT NULL;
END $$;