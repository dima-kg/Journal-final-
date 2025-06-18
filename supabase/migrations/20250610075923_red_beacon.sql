/*
  # Создание таблицы записей оперативного журнала

  1. Новые таблицы
    - `journal_entries`
      - `id` (uuid, primary key)
      - `category` (text) - категория события
      - `title` (text) - заголовок записи
      - `description` (text) - подробное описание
      - `author_id` (uuid, foreign key) - ID автора записи
      - `author_name` (text) - имя автора для отображения
      - `status` (text) - статус записи (draft, active, cancelled)
      - `equipment` (text, optional) - оборудование
      - `location` (text, optional) - местоположение
      - `priority` (text) - приоритет (low, medium, high, critical)
      - `cancelled_at` (timestamptz, optional) - время отмены
      - `cancelled_by` (text, optional) - кто отменил
      - `cancel_reason` (text, optional) - причина отмены
      - `created_at` (timestamptz) - время создания
      - `updated_at` (timestamptz) - время последнего обновления

  2. Безопасность
    - Включить RLS для таблицы `journal_entries`
    - Политики для чтения всех записей аутентифицированными пользователями
    - Политики для создания записей только аутентифицированными пользователями
    - Политики для обновления записей только их авторами (только для отмены)

  3. Индексы
    - Индекс по времени создания для быстрой сортировки
    - Индекс по категории для фильтрации
    - Индекс по статусу для фильтрации
*/

-- Создание таблицы записей журнала
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('equipment_work', 'relay_protection', 'team_permits', 'emergency', 'network_outages', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  author_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'cancelled')),
  equipment text,
  location text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  cancelled_at timestamptz,
  cancelled_by text,
  cancel_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Политика для чтения всех записей аутентифицированными пользователями
CREATE POLICY "Authenticated users can read all journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Политика для создания записей аутентифицированными пользователями
CREATE POLICY "Authenticated users can create journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Политика для обновления записей (только для отмены)
CREATE POLICY "Authors can update their own entries for cancellation"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (
    auth.uid() = author_id AND 
    status = 'cancelled' AND 
    cancelled_at IS NOT NULL AND 
    cancelled_by IS NOT NULL AND 
    cancel_reason IS NOT NULL
  );

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_priority ON journal_entries(priority);
CREATE INDEX IF NOT EXISTS idx_journal_entries_author ON journal_entries(author_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();