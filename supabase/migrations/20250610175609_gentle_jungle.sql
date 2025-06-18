/*
  # Создание справочных таблиц оборудования и местоположений

  1. Новые таблицы
    - `equipment`
      - `id` (uuid, primary key)
      - `name` (text, unique) - название оборудования
      - `description` (text, optional) - описание оборудования
      - `is_active` (boolean) - активно ли оборудование
      - `created_at` (timestamptz) - время создания
      - `updated_at` (timestamptz) - время обновления

    - `locations`
      - `id` (uuid, primary key)
      - `name` (text, unique) - название местоположения
      - `description` (text, optional) - описание местоположения
      - `is_active` (boolean) - активно ли местоположение
      - `created_at` (timestamptz) - время создания
      - `updated_at` (timestamptz) - время обновления

  2. Изменения в journal_entries
    - Заменить equipment (text) на equipment_id (uuid, foreign key)
    - Заменить location (text) на location_id (uuid, foreign key)

  3. Безопасность
    - Включить RLS для новых таблиц
    - Политики для чтения всех записей аутентифицированными пользователями
    - Политики для создания/обновления записей аутентифицированными пользователями

  4. Индексы
    - Индексы по названиям для быстрого поиска
    - Индексы по активности для фильтрации
*/

-- Создание таблицы оборудования
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы местоположений
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включение RLS для таблиц
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Политики для equipment
CREATE POLICY "Authenticated users can read equipment"
  ON equipment
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create equipment"
  ON equipment
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update equipment"
  ON equipment
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Политики для locations
CREATE POLICY "Authenticated users can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_equipment_name ON equipment(name);
CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Добавление новых колонок в journal_entries
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS equipment_id uuid REFERENCES equipment(id),
ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id);

-- Создание индексов для внешних ключей
CREATE INDEX IF NOT EXISTS idx_journal_entries_equipment_id ON journal_entries(equipment_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_location_id ON journal_entries(location_id);

-- Вставка базовых данных
INSERT INTO equipment (name, description) VALUES
  ('Трансформатор Т1', 'Главный силовой трансформатор'),
  ('Выключатель В1', 'Высоковольтный выключатель 110кВ'),
  ('Разъединитель Р1', 'Разъединитель 110кВ'),
  ('Реле защиты РЗ-1', 'Микропроцессорное реле защиты')
ON CONFLICT (name) DO NOTHING;

INSERT INTO locations (name, description) VALUES
  ('ОРУ 110кВ', 'Открытое распределительное устройство 110кВ'),
  ('ЗРУ 10кВ', 'Закрытое распределительное устройство 10кВ'),
  ('Щит управления', 'Главный щит управления'),
  ('Релейный зал', 'Помещение релейной защиты и автоматики')
ON CONFLICT (name) DO NOTHING;