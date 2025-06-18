import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle, PageOrientation } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { JournalEntry } from '../types';

export interface ReportData {
  entries: JournalEntry[];
  filters: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportOptions {
  title?: string;
  includeStats?: boolean;
  includeFilters?: boolean;
  groupBy?: 'category' | 'status' | 'priority' | 'date' | 'none';
}

// Утилиты для форматирования данных
const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Черновик',
    active: 'Активная',
    cancelled: 'Отменена'
  };
  return labels[status as keyof typeof labels] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический'
  };
  return labels[priority as keyof typeof labels] || priority;
};

// Генерация статистики
const generateStats = (entries: JournalEntry[]) => {
  const total = entries.length;
  const byStatus = entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byPriority = entries.reduce((acc, entry) => {
    acc[entry.priority] = (acc[entry.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = entries.reduce((acc, entry) => {
    const categoryName = entry.categoryData?.name || entry.category;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { total, byStatus, byPriority, byCategory };
};

// Группировка записей
const groupEntries = (entries: JournalEntry[], groupBy: string) => {
  if (groupBy === 'none') return { 'Все записи': entries };

  return entries.reduce((groups, entry) => {
    let key: string;
    
    switch (groupBy) {
      case 'category':
        key = entry.categoryData?.name || entry.category;
        break;
      case 'status':
        key = getStatusLabel(entry.status);
        break;
      case 'priority':
        key = getPriorityLabel(entry.priority);
        break;
      case 'date':
        key = entry.timestamp.toLocaleDateString('ru-RU');
        break;
      default:
        key = 'Прочие';
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);
};

// Экспорт в Word с альбомной ориентацией и полной поддержкой русского языка
export const exportToWord = (data: ReportData, options: ReportOptions = {}) => {
  const {
    title = 'Отчет по событиям оперативного журнала',
    includeStats = true,
    includeFilters = true,
    groupBy = 'none'
  } = options;

  const children: (Paragraph | Table)[] = [];

  // Заголовок документа
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );

  // Информация о генерации
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Сформирован: ${formatDateTime(data.generatedAt)}`,
          bold: false
        })
      ],
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Автор: ${data.generatedBy}`,
          bold: false
        })
      ],
      spacing: { after: 400 }
    })
  );

  // Фильтры
  if (includeFilters && Object.keys(data.filters).length > 0) {
    children.push(
      new Paragraph({
        text: 'Примененные фильтры:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 }
      })
    );

    Object.entries(data.filters).forEach(([key, value]) => {
      if (value) {
        let filterText = '';
        switch (key) {
          case 'searchText':
            filterText = `Поиск: ${value}`;
            break;
          case 'dateFrom':
            filterText = `Дата от: ${(value as Date).toLocaleDateString('ru-RU')}`;
            break;
          case 'dateTo':
            filterText = `Дата до: ${(value as Date).toLocaleDateString('ru-RU')}`;
            break;
          default:
            filterText = `${key}: ${value}`;
        }
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${filterText}`,
                bold: false
              })
            ],
            spacing: { after: 100 }
          })
        );
      }
    });

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 400 }
      })
    );
  }

  // Статистика
  if (includeStats) {
    const stats = generateStats(data.entries);
    
    children.push(
      new Paragraph({
        text: 'Статистика:',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 }
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Всего записей: ${stats.total}`,
            bold: true
          })
        ],
        spacing: { after: 200 }
      })
    );

    // Статистика по статусам
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${getStatusLabel(status)}: ${count}`,
              bold: false
            })
          ],
          spacing: { after: 100 }
        })
      );
    });

    // Статистика по приоритетам
    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 }
      })
    );

    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${getPriorityLabel(priority)}: ${count}`,
              bold: false
            })
          ],
          spacing: { after: 100 }
        })
      );
    });

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 400 }
      })
    );
  }

  // Группировка и вывод записей
  const groupedEntries = groupEntries(data.entries, groupBy);
  
  Object.entries(groupedEntries).forEach(([groupName, entries]) => {
    if (groupBy !== 'none') {
      children.push(
        new Paragraph({
          text: `${groupName} (${entries.length})`,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 300 }
        })
      );
    }

    // Создание таблицы с записями (оптимизированная для альбомной ориентации)
    const tableRows: TableRow[] = [];

    // Заголовок таблицы
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Дата/Время', alignment: AlignmentType.CENTER })],
            width: { size: 12, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Категория', alignment: AlignmentType.CENTER })],
            width: { size: 12, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Заголовок', alignment: AlignmentType.CENTER })],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Описание', alignment: AlignmentType.CENTER })],
            width: { size: 25, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Статус', alignment: AlignmentType.CENTER })],
            width: { size: 8, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Приоритет', alignment: AlignmentType.CENTER })],
            width: { size: 8, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Автор', alignment: AlignmentType.CENTER })],
            width: { size: 10, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Оборудование', alignment: AlignmentType.CENTER })],
            width: { size: 5, type: WidthType.PERCENTAGE }
          })
        ],
        tableHeader: true
      })
    );

    // Строки с данными
    entries.forEach(entry => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                text: formatDateTime(entry.timestamp),
                spacing: { after: 0 }
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: entry.categoryData?.name || entry.category,
                spacing: { after: 0 }
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: entry.title,
                spacing: { after: 0 }
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: entry.description.length > 100 
                  ? entry.description.substring(0, 100) + '...' 
                  : entry.description,
                spacing: { after: 0 }
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: getStatusLabel(entry.status),
                spacing: { after: 0 }
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: getPriorityLabel(entry.priority),
                spacing: { after: 0 }
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: entry.author,
                spacing: { after: 0 }
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: entry.equipment?.name || '',
                spacing: { after: 0 }
              })]
            })
          ]
        })
      );
    });

    // Добавление таблицы в документ
    children.push(
      new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 }
        }
      })
    );

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 600 }
      })
    );
  });

  // Создание документа с альбомной ориентацией
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          orientation: PageOrientation.LANDSCAPE,
          margin: {
            top: 1440,    // 1 дюйм
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: children
    }]
  });

  // Сохранение файла
  Packer.toBlob(doc).then(blob => {
    const fileName = `отчет_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
  });
};

// Экспорт в Excel
export const exportToExcel = (data: ReportData, options: ReportOptions = {}) => {
  const {
    title = 'Отчет по событиям',
    includeStats = true,
    groupBy = 'none'
  } = options;

  const workbook = XLSX.utils.book_new();

  // Основные данные
  const mainData = data.entries.map(entry => ({
    'Дата/Время': formatDateTime(entry.timestamp),
    'Категория': entry.categoryData?.name || entry.category,
    'Заголовок': entry.title,
    'Описание': entry.description,
    'Статус': getStatusLabel(entry.status),
    'Приоритет': getPriorityLabel(entry.priority),
    'Автор': entry.author,
    'Оборудование': entry.equipment?.name || '',
    'Местоположение': entry.location?.name || '',
    'Дата отмены': entry.cancelledAt ? formatDateTime(entry.cancelledAt) : '',
    'Отменил': entry.cancelledBy || '',
    'Причина отмены': entry.cancelReason || ''
  }));

  const mainSheet = XLSX.utils.json_to_sheet(mainData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Записи');

  // Статистика
  if (includeStats) {
    const stats = generateStats(data.entries);
    const statsData = [
      { 'Показатель': 'Всего записей', 'Значение': stats.total },
      ...Object.entries(stats.byStatus).map(([status, count]) => ({
        'Показатель': `Статус: ${getStatusLabel(status)}`,
        'Значение': count
      })),
      ...Object.entries(stats.byPriority).map(([priority, count]) => ({
        'Показатель': `Приоритет: ${getPriorityLabel(priority)}`,
        'Значение': count
      })),
      ...Object.entries(stats.byCategory).map(([category, count]) => ({
        'Показатель': `Категория: ${category}`,
        'Значение': count
      }))
    ];

    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика');
  }

  // Группированные данные
  if (groupBy !== 'none') {
    const groupedEntries = groupEntries(data.entries, groupBy);
    Object.entries(groupedEntries).forEach(([groupName, entries]) => {
      const groupData = entries.map(entry => ({
        'Дата/Время': formatDateTime(entry.timestamp),
        'Заголовок': entry.title,
        'Описание': entry.description,
        'Статус': getStatusLabel(entry.status),
        'Приоритет': getPriorityLabel(entry.priority),
        'Автор': entry.author
      }));

      const groupSheet = XLSX.utils.json_to_sheet(groupData);
      const sheetName = groupName.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, groupSheet, sheetName);
    });
  }

  // Сохранение файла
  const fileName = `отчет_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Экспорт в CSV
export const exportToCSV = (data: ReportData) => {
  const csvData = data.entries.map(entry => ({
    'Дата/Время': formatDateTime(entry.timestamp),
    'Категория': entry.categoryData?.name || entry.category,
    'Заголовок': entry.title,
    'Описание': entry.description,
    'Статус': getStatusLabel(entry.status),
    'Приоритет': getPriorityLabel(entry.priority),
    'Автор': entry.author,
    'Оборудование': entry.equipment?.name || '',
    'Местоположение': entry.location?.name || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `отчет_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Экспорт в JSON
export const exportToJSON = (data: ReportData, options: ReportOptions = {}) => {
  const exportData = {
    metadata: {
      title: options.title || 'Отчет по событиям',
      generatedAt: data.generatedAt.toISOString(),
      generatedBy: data.generatedBy,
      filters: data.filters,
      totalEntries: data.entries.length
    },
    statistics: options.includeStats ? generateStats(data.entries) : null,
    entries: data.entries.map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      category: entry.categoryData?.name || entry.category,
      title: entry.title,
      description: entry.description,
      status: entry.status,
      priority: entry.priority,
      author: entry.author,
      equipment: entry.equipment?.name,
      location: entry.location?.name,
      cancelledAt: entry.cancelledAt?.toISOString(),
      cancelledBy: entry.cancelledBy,
      cancelReason: entry.cancelReason
    }))
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `отчет_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};