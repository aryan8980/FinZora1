import { Transaction } from './dummyData';

export const convertArrayToCSV = (data: Transaction[]): string => {
    if (!data || data.length === 0) return '';

    const headers = ['Date', 'Title', 'Amount', 'Type', 'Category', 'Description'];
    const rows = data.map((t) => [
        t.date,
        `"${t.title.replace(/"/g, '""')}"`, // Escape quotes
        t.amount,
        t.type,
        t.category || '',
        `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.join(','))
    ].join('\n');

    return csvContent;
};

export const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
