/*
  # Создание таблицы приема-сдачи смены

  1. Новые таблицы
    - `shift_handovers`
      - `id` (uuid, primary key)
      - `shift_date` (date) - дата смены
      - `shift_type` (text) - тип смены (day, night)
      - `outgoing_operator_id` (uuid) - ID сдающего оператора
      - `outgoing_operator_name` (text) - имя сдающего оператора
      - `incoming_operator_id` (uuid) - ID принимающего оператора
      - `incoming_operator_name` (text) - имя принимающего оператора
      - `equipment_status` (jsonb) - состояние оборудования
      - `ongoing_works` (text) - текущие работы
      - `special_instructions` (text) - особые указания
      - `incidents` (text) - происшествия за смену
      - `handover_notes` (text) - примечания при сдаче
      - `status` (text) - статус (pending, completed, cancelled)
      - `handed_over_at` (timestamptz) - время сдачи
      - `received_at` (timestamptz) - время приема
      - `created_at` (timestamptz) - время создания
      - `updated_at` (timestamptz) - время обновления

  2. Безопасность
    - Включить RLS для таблицы `shift_handovers`
    - Политики для чтения всех записей аутентифицированными пользователями
    - Политики для создания записей аутентифицированными пользователями
    - Политики для обновления записей участниками смены

  3. Индексы
    - Индекс по дате смены
    - Индекс по статусу
    - Индекс по операторам
*/

-- Создание таблицы приема-сдачи смены
CREATE TABLE IF NOT EXISTS shift_handovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_date date NOT NULL,
  shift_type text NOT NULL CHECK (shift_type IN ('day', 'night')),
  outgoing_operator_id uuid REFERENCES auth.users(id) NOT NULL,
  outgoing_operator_name text NOT NULL,
  incoming_operator_id uuid REFERENCES auth.users(id),
  incoming_operator_name text,
  equipment_status jsonb DEFAULT '{}',
  ongoing_works text,
  special_instructions text,
  incidents text,
  handover_notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  handed_over_at timestamptz,
  received_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE shift_handovers ENABLE ROW LEVEL SECURITY;

-- Политики для чтения всех записей аутентифицированными пользователями
CREATE POLICY "Authenticated users can read all shift handovers"
  ON shift_handovers
  FOR SELECT
  TO authenticated
  USING (true);

-- Политики для создания записей аутентифицированными пользователями
CREATE POLICY "Authenticated users can create shift handovers"
  ON shift_handovers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = outgoing_operator_id);

-- Политики для обновления записей участниками смены
CREATE POLICY "Shift participants can update handovers"
  ON shift_handovers
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = outgoing_operator_id OR 
    auth.uid() = incoming_operator_id
  )
  WITH CHECK (
    auth.uid() = outgoing_operator_id OR 
    auth.uid() = incoming_operator_id
  );

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_shift_handovers_date ON shift_handovers(shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_status ON shift_handovers(status);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_outgoing ON shift_handovers(outgoing_operator_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_incoming ON shift_handovers(incoming_operator_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_type ON shift_handovers(shift_type);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_shift_handovers_updated_at
  BEFORE UPDATE ON shift_handovers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Уникальный индекс для предотвращения дублирования смен
CREATE UNIQUE INDEX IF NOT EXISTS idx_shift_handovers_unique_shift 
  ON shift_handovers(shift_date, shift_type, outgoing_operator_id)
  WHERE status != 'cancelled';