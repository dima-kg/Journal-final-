import React from 'react';
import { X, Clock, MapPin, Settings, User, Tag } from 'lucide-react';
import { JournalEntry } from '../types';
import CategoryIcon from './CategoryIcon';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface EntryDetailModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, onClose }) => {
  const getCategoryLabel = () => {
    if (entry.categoryData) {
      return entry.categoryData.name;
    }
    
    // Fallback для старых записей
    const labels = {
      equipment_work: 'Работы на оборудовании',
      relay_protection: 'РЗА и телемеханика',
      team_permits: 'Допуски бригад',
      emergency: 'Аварийные сообщения',
      network_outages: 'Отключения в сети',
      other: 'Прочие события'
    };
    return labels[entry.category as keyof typeof labels] || entry.category;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              entry.status === 'cancelled' ? 'bg-red-100' :
              entry.status === 'draft' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <CategoryIcon 
                category={entry.category} 
                className={`w-6 h-6 ${
                  entry.status === 'cancelled' ? 'text-red-600' :
                  entry.status === 'draft' ? 'text-amber-600' : 'text-blue-600'
                }`}
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Детали записи</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Основная информация */}
          <div>
            <h3 className={`text-2xl font-bold mb-2 ${
              entry.status === 'cancelled' ? 'text-gray-600 line-through' : 'text-gray-900'
            }`}>
              {entry.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <StatusBadge status={entry.status} />
              <PriorityBadge priority={entry.priority} />
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Tag className="w-4 h-4" />
              <span>{getCategoryLabel()}</span>
            </div>
          </div>

          {/* Описание */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Описание</h4>
            <p className={`text-gray-700 whitespace-pre-wrap ${
              entry.status === 'cancelled' ? 'text-gray-500' : ''
            }`}>
              {entry.description}
            </p>
          </div>

          {/* Метаданные */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Время создания</p>
                  <p className="font-medium">{formatDateTime(entry.timestamp)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Автор</p>
                  <p className="font-medium">{entry.author}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {entry.equipment && (
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Оборудование</p>
                    <p className="font-medium">{entry.equipment.name}</p>
                    {entry.equipment.description && (
                      <p className="text-sm text-gray-500">{entry.equipment.description}</p>
                    )}
                  </div>
                </div>
              )}

              {entry.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Местоположение</p>
                    <p className="font-medium">{entry.location.name}</p>
                    {entry.location.description && (
                      <p className="text-sm text-gray-500">{entry.location.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Информация об отмене */}
          {entry.status === 'cancelled' && entry.cancelledAt && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-red-800 mb-2">Информация об отмене</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-red-700">Дата отмены:</span>
                  <span className="ml-2 text-red-800">{formatDateTime(entry.cancelledAt)}</span>
                </div>
                <div>
                  <span className="font-medium text-red-700">Отменил:</span>
                  <span className="ml-2 text-red-800">{entry.cancelledBy}</span>
                </div>
                {entry.cancelReason && (
                  <div>
                    <span className="font-medium text-red-700">Причина отмены:</span>
                    <p className="mt-1 text-red-800">{entry.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ID записи */}
          <div className="text-xs text-gray-400 border-t pt-4">
            ID записи: {entry.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailModal;
