import React, { useState } from 'react';
import { X, FileText, Download, BarChart3, Filter, Calendar } from 'lucide-react';
import { JournalEntry, FilterOptions } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  exportToWord, 
  exportToExcel, 
  exportToCSV, 
  exportToJSON,
  ReportOptions,
  ReportData 
} from '../utils/reportGenerator';

interface ReportModalProps {
  entries: JournalEntry[];
  filters: FilterOptions;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ entries, filters, onClose }) => {
  const { getUserDisplayName } = useAuth();
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    title: 'Отчет по событиям оперативного журнала',
    includeStats: true,
    includeFilters: true,
    groupBy: 'none'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportData: ReportData = {
    entries,
    filters,
    generatedAt: new Date(),
    generatedBy: getUserDisplayName()
  };

  const handleExport = async (format: 'word' | 'excel' | 'csv' | 'json') => {
    setIsGenerating(true);
    
    try {
      switch (format) {
        case 'word':
          exportToWord(reportData, reportOptions);
          break;
        case 'excel':
          exportToExcel(reportData, reportOptions);
          break;
        case 'csv':
          exportToCSV(reportData);
          break;
        case 'json':
          exportToJSON(reportData, reportOptions);
          break;
      }
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Произошла ошибка при создании отчета');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatsData = () => {
    const total = entries.length;
    const active = entries.filter(e => e.status === 'active').length;
    const drafts = entries.filter(e => e.status === 'draft').length;
    const cancelled = entries.filter(e => e.status === 'cancelled').length;
    const critical = entries.filter(e => e.priority === 'critical' && e.status === 'active').length;

    return { total, active, drafts, cancelled, critical };
  };

  const stats = getStatsData();

  const formatFilters = () => {
    const activeFilters = [];
    if (filters.searchText) activeFilters.push(`Поиск: "${filters.searchText}"`);
    if (filters.dateFrom) activeFilters.push(`От: ${filters.dateFrom.toLocaleDateString('ru-RU')}`);
    if (filters.dateTo) activeFilters.push(`До: ${filters.dateTo.toLocaleDateString('ru-RU')}`);
    if (filters.status) activeFilters.push(`Статус: ${filters.status}`);
    if (filters.priority) activeFilters.push(`Приоритет: ${filters.priority}`);
    
    return activeFilters.length > 0 ? activeFilters : ['Фильтры не применены'];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Формирование отчета</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Предварительный просмотр данных */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Данные для отчета
            </h3>
            
            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Всего записей</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-gray-600">Активные</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.drafts}</p>
                <p className="text-sm text-gray-600">Черновики</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                <p className="text-sm text-gray-600">Отмененные</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
                <p className="text-sm text-gray-600">Критические</p>
              </div>
            </div>

            {/* Активные фильтры */}
            <div className="bg-white p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Примененные фильтры
              </h4>
              <div className="flex flex-wrap gap-2">
                {formatFilters().map((filter, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Настройки отчета */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Настройки отчета</h3>
            
            {/* Заголовок отчета */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок отчета
              </label>
              <input
                type="text"
                value={reportOptions.title}
                onChange={(e) => setReportOptions(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Группировка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Группировка записей
              </label>
              <select
                value={reportOptions.groupBy}
                onChange={(e) => setReportOptions(prev => ({ 
                  ...prev, 
                  groupBy: e.target.value as any 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">Без группировки</option>
                <option value="category">По категориям</option>
                <option value="status">По статусу</option>
                <option value="priority">По приоритету</option>
                <option value="date">По дате</option>
              </select>
            </div>

            {/* Дополнительные опции */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportOptions.includeStats}
                  onChange={(e) => setReportOptions(prev => ({ 
                    ...prev, 
                    includeStats: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Включить статистику</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportOptions.includeFilters}
                  onChange={(e) => setReportOptions(prev => ({ 
                    ...prev, 
                    includeFilters: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Включить информацию о фильтрах</span>
              </label>
            </div>
          </div>

          {/* Форматы экспорта */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите формат экспорта</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleExport('word')}
                disabled={isGenerating}
                className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="font-medium">Word</span>
                <span className="text-xs text-gray-600">Документ с форматированием</span>
              </button>

              <button
                onClick={() => handleExport('excel')}
                disabled={isGenerating}
                className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FileText className="w-8 h-8 text-green-600" />
                <span className="font-medium">Excel</span>
                <span className="text-xs text-gray-600">Таблица с листами</span>
              </button>

              <button
                onClick={() => handleExport('csv')}
                disabled={isGenerating}
                className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FileText className="w-8 h-8 text-orange-600" />
                <span className="font-medium">CSV</span>
                <span className="text-xs text-gray-600">Простая таблица</span>
              </button>

              <button
                onClick={() => handleExport('json')}
                disabled={isGenerating}
                className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FileText className="w-8 h-8 text-purple-600" />
                <span className="font-medium">JSON</span>
                <span className="text-xs text-gray-600">Данные для API</span>
              </button>
            </div>
          </div>

          {/* Информация о форматах */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Описание форматов:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Word:</strong> Профессиональный документ с полным форматированием и русским языком</li>
              <li><strong>Excel:</strong> Многолистовая книга с данными, статистикой и группировкой</li>
              <li><strong>CSV:</strong> Простая таблица для импорта в другие системы</li>
              <li><strong>JSON:</strong> Структурированные данные для программной обработки</li>
            </ul>
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Формирование отчета...</span>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
