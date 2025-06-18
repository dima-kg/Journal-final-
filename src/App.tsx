import React, { useState } from 'react';
import { Plus, BookOpen, BarChart3, LogOut, User, Settings, MapPin, Tag, FileText, Clock } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useJournalEntries } from './hooks/useJournalEntries';
import { useShiftHandovers } from './hooks/useShiftHandovers';
import AuthForm from './components/AuthForm';
import JournalFilters from './components/JournalFilters';
import JournalEntry from './components/JournalEntry';
import AddEntryForm from './components/AddEntryForm';
import EquipmentManager from './components/EquipmentManager';
import LocationManager from './components/LocationManager';
import CategoryManager from './components/CategoryManager';
import ReportModal from './components/ReportModal';
import ShiftHandoverForm from './components/ShiftHandoverForm';
import ShiftHandoverCard from './components/ShiftHandoverCard';
import ShiftHandoverFilters from './components/ShiftHandoverFilters';

type ActiveTab = 'journal' | 'handovers';

function App() {
  const { user, loading: authLoading, signOut, getUserDisplayName } = useAuth();
  const { entries, loading, filters, setFilters, addEntry, cancelEntry } = useJournalEntries();
  const { 
    handovers, 
    loading: handoversLoading, 
    filters: handoverFilters, 
    setFilters: setHandoverFilters,
    createHandover,
    acceptHandover,
    completeHandover,
    cancelHandover
  } = useShiftHandovers();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('journal');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [showEquipmentManager, setShowEquipmentManager] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Показываем загрузку пока проверяется аутентификация
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Показываем форму аутентификации если пользователь не авторизован
  if (!user) {
    return <AuthForm />;
  }

  const handleAddEntry = async (entryData: Parameters<typeof addEntry>[0]) => {
    await addEntry(entryData);
    setShowAddForm(false);
  };

  const handleCancelEntry = async (id: string, reason: string, cancelledBy: string) => {
    await cancelEntry(id, reason, cancelledBy);
  };

  const handleCreateHandover = async (data: Parameters<typeof createHandover>[0]) => {
    await createHandover(data);
    setShowHandoverForm(false);
  };

  const handleAcceptHandover = async (id: string, notes?: string) => {
    await acceptHandover(id, notes);
  };

  const handleCompleteHandover = async (id: string) => {
    await completeHandover(id);
  };

  const handleCancelHandover = async (id: string) => {
    await cancelHandover(id);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getJournalStatsData = () => {
    const total = entries.length;
    const active = entries.filter(e => e.status === 'active').length;
    const drafts = entries.filter(e => e.status === 'draft').length;
    const cancelled = entries.filter(e => e.status === 'cancelled').length;
    const critical = entries.filter(e => e.priority === 'critical' && e.status === 'active').length;

    return { total, active, drafts, cancelled, critical };
  };

  const getHandoverStatsData = () => {
    const total = handovers.length;
    const pending = handovers.filter(h => h.status === 'pending').length;
    const completed = handovers.filter(h => h.status === 'completed').length;
    const cancelled = handovers.filter(h => h.status === 'cancelled').length;
    const dayShifts = handovers.filter(h => h.shift_type === 'day').length;

    return { total, pending, completed, cancelled, dayShifts };
  };

  const journalStats = getJournalStatsData();
  const handoverStats = getHandoverStatsData();

  const currentLoading = activeTab === 'journal' ? loading : handoversLoading;

  if (currentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {activeTab === 'journal' ? 'Загрузка журнала...' : 'Загрузка смен...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Оперативный журнал</h1>
                <p className="text-sm text-gray-600">Ведение записей о событиях во время смены</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Информация о пользователе */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{getUserDisplayName()}</span>
              </div>

              {/* Управление справочниками */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCategoryManager(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors"
                  title="Управление категориями"
                >
                  <Tag className="w-5 h-5" />
                  <span className="hidden sm:inline">Категории</span>
                </button>
                
                <button
                  onClick={() => setShowEquipmentManager(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Управление оборудованием"
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Оборудование</span>
                </button>
                
                <button
                  onClick={() => setShowLocationManager(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-600 transition-colors"
                  title="Управление местоположениями"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="hidden sm:inline">Местоположения</span>
                </button>
              </div>

              {/* Кнопка отчетов */}
              {activeTab === 'journal' && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Сформировать отчет"
                >
                  <FileText className="w-5 h-5" />
                  <span className="hidden sm:inline">Отчеты</span>
                </button>
              )}
              
              {/* Кнопка добавления */}
              <button
                onClick={() => activeTab === 'journal' ? setShowAddForm(true) : setShowHandoverForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {activeTab === 'journal' ? 'Новая запись' : 'Сдача смены'}
                </span>
              </button>
              
              {/* Кнопка выхода */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Навигационные вкладки */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('journal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'journal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Журнал событий
              </div>
            </button>
            <button
              onClick={() => setActiveTab('handovers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'handovers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Прием-сдача смены
              </div>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'journal' ? (
          <>
            {/* Статистика журнала */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{journalStats.total}</p>
                    <p className="text-sm text-gray-600">Всего записей</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{journalStats.active}</p>
                    <p className="text-sm text-gray-600">Активные</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{journalStats.drafts}</p>
                    <p className="text-sm text-gray-600">Черновики</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{journalStats.cancelled}</p>
                    <p className="text-sm text-gray-600">Отмененные</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{journalStats.critical}</p>
                    <p className="text-sm text-gray-600">Критические</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Фильтры журнала */}
            <JournalFilters filters={filters} onFiltersChange={setFilters} />

            {/* Список записей */}
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Записи не найдены</h3>
                  <p className="text-gray-600 mb-4">
                    {Object.keys(filters).length > 0 
                      ? "Попробуйте изменить параметры фильтрации"
                      : "Создайте первую запись в оперативном журнале"
                    }
                  </p>
                  {Object.keys(filters).length === 0 && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Создать запись
                    </button>
                  )}
                </div>
              ) : (
                entries.map(entry => (
                  <JournalEntry
                    key={entry.id}
                    entry={entry}
                    onCancel={handleCancelEntry}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Статистика смен */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{handoverStats.total}</p>
                    <p className="text-sm text-gray-600">Всего смен</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{handoverStats.pending}</p>
                    <p className="text-sm text-gray-600">Ожидают</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{handoverStats.completed}</p>
                    <p className="text-sm text-gray-600">Завершены</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{handoverStats.cancelled}</p>
                    <p className="text-sm text-gray-600">Отменены</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{handoverStats.dayShifts}</p>
                    <p className="text-sm text-gray-600">Дневные</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Фильтры смен */}
            <ShiftHandoverFilters filters={handoverFilters} onFiltersChange={setHandoverFilters} />

            {/* Список смен */}
            <div className="space-y-4">
              {handovers.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Смены не найдены</h3>
                  <p className="text-gray-600 mb-4">
                    {Object.keys(handoverFilters).length > 0 
                      ? "Попробуйте изменить параметры фильтрации"
                      : "Создайте первую сдачу смены"
                    }
                  </p>
                  {Object.keys(handoverFilters).length === 0 && (
                    <button
                      onClick={() => setShowHandoverForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Создать сдачу смены
                    </button>
                  )}
                </div>
              ) : (
                handovers.map(handover => (
                  <ShiftHandoverCard
                    key={handover.id}
                    handover={handover}
                    onAccept={handleAcceptHandover}
                    onComplete={handleCompleteHandover}
                    onCancel={handleCancelHandover}
                    currentUserId={user.id}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Модальные окна */}
      {showAddForm && (
        <AddEntryForm
          onSubmit={handleAddEntry}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showHandoverForm && (
        <ShiftHandoverForm
          onSubmit={handleCreateHandover}
          onClose={() => setShowHandoverForm(false)}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {showEquipmentManager && (
        <EquipmentManager
          onClose={() => setShowEquipmentManager(false)}
        />
      )}

      {showLocationManager && (
        <LocationManager
          onClose={() => setShowLocationManager(false)}
        />
      )}

      {showReportModal && (
        <ReportModal
          entries={entries}
          filters={filters}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

export default App;