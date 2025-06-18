import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { JournalEntry } from '../types';

interface CancelEntryModalProps {
  entry: JournalEntry;
  onCancel: (reason: string, cancelledBy: string) => void;
  onClose: () => void;
}

const CancelEntryModal: React.FC<CancelEntryModalProps> = ({ entry, onCancel, onClose }) => {
  const [reason, setReason] = useState('');
  const [cancelledBy, setCancelledBy] = useState('Текущий пользователь');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onCancel(reason.trim(), cancelledBy.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Отмена записи</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Вы собираетесь отменить запись:
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-gray-900">{entry.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                от {new Intl.DateTimeFormat('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(entry.timestamp)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Причина отмены *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Укажите причину отмены записи"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Отменил
            </label>
            <input
              type="text"
              value={cancelledBy}
              onChange={(e) => setCancelledBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Внимание:</strong> Отмененная запись не может быть восстановлена. 
              Она останется в журнале с пометкой "Отменена".
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Назад
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Отменить запись
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelEntryModal;