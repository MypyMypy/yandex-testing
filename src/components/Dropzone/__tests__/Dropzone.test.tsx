import { Dropzone } from '@components/Dropzone';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockCSVFile, render } from '../../../test/utils';

vi.mock('@utils/analysis', () => ({
    isCsvFile: vi.fn((file: File) => file.name.endsWith('.csv')),
}));

describe('Dropzone', () => {
    const defaultProps = {
        file: null,
        status: 'idle' as const,
        error: null,
        onFileSelect: vi.fn(),
        onClear: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render upload area when no file is selected', () => {
        render(<Dropzone {...defaultProps} />);

        expect(screen.getByText('Загрузить файл')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /загрузить файл/i })).toHaveLength(2);
    });

    it('should display file when file is selected', () => {
        const file = createMockCSVFile('test.csv');
        render(<Dropzone {...defaultProps} file={file} />);

        expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    it('should show processing state', () => {
        const file = createMockCSVFile('test.csv');
        render(<Dropzone {...defaultProps} file={file} status="processing" />);

        expect(screen.getByText(/парсинг/i)).toBeInTheDocument();
    });

    it('should show error message', () => {
        render(<Dropzone {...defaultProps} error="Ошибка обработки файла" />);

        expect(screen.getByText('Ошибка обработки файла')).toBeInTheDocument();
    });

    describe('File Upload', () => {
        it('should handle file selection via input', async () => {
            const user = userEvent.setup();
            render(<Dropzone {...defaultProps} />);

            const file = createMockCSVFile('test.csv');
            const button = screen.getByRole('button', { name: 'Загрузить файл' });

            await user.click(button);

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            await user.upload(fileInput, file);

            expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
        });
    });

    describe('Drag and Drop', () => {
        it('should handle drag enter and activate drop zone', () => {
            render(<Dropzone {...defaultProps} />);

            const dropzone = screen
                .getAllByRole('button', { name: /загрузить файл/i })[0]
                .closest('div') as HTMLElement;

            fireEvent.dragEnter(dropzone, {
                dataTransfer: {
                    files: [createMockCSVFile('test.csv')],
                },
            });

            expect(dropzone).toBeInTheDocument();
        });

        it('should handle drag leave and deactivate drop zone', () => {
            render(<Dropzone {...defaultProps} />);

            const dropzone = screen
                .getAllByRole('button', { name: /загрузить файл/i })[0]
                .closest('div') as HTMLElement;

            fireEvent.dragEnter(dropzone);
            fireEvent.dragLeave(dropzone);

            expect(dropzone).toBeInTheDocument();
        });

        it('should handle file drop', () => {
            render(<Dropzone {...defaultProps} />);

            const file = createMockCSVFile('dropped.csv');
            const dropzone = screen
                .getAllByRole('button', { name: /загрузить файл/i })[0]
                .closest('div') as HTMLElement;

            fireEvent.drop(dropzone, {
                dataTransfer: {
                    files: [file],
                },
            });

            expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
        });

        it('should validate dropped file extension', () => {
            render(<Dropzone {...defaultProps} />);

            const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
            const dropzone = screen.getByText('Загрузить файл').closest('div');

            fireEvent.drop(dropzone!, {
                dataTransfer: {
                    files: [invalidFile],
                },
            });

            expect(screen.getByText('Можно загружать только *.csv файлы')).toBeInTheDocument();
            expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
        });

        it('should not handle drop when processing', () => {
            render(<Dropzone {...defaultProps} status="processing" />);

            const file = createMockCSVFile('test.csv');
            const dropzone = screen.getByText(/парсинг/i).closest('div');

            fireEvent.drop(dropzone!, {
                dataTransfer: {
                    files: [file],
                },
            });

            expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
        });
    });

    describe('Clear functionality', () => {
        it('should show clear button when file is selected', () => {
            const file = createMockCSVFile('test.csv');
            render(<Dropzone {...defaultProps} file={file} />);

            expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
        });

        it('should call onClear when clear button is clicked', async () => {
            const user = userEvent.setup();
            const file = createMockCSVFile('test.csv');
            render(<Dropzone {...defaultProps} file={file} />);

            const clearButton = screen.getByRole('button', { name: '' });
            await user.click(clearButton);

            expect(defaultProps.onClear).toHaveBeenCalled();
        });
    });
});
