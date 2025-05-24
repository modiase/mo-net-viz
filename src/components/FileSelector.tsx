import { FileIcon, XIcon } from '@phosphor-icons/react';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import React, { useRef } from 'react';

interface FileSelectorProps {
  onFileSelect?: (file: File | null) => void;
  selectedFile?: File | null;
  accept?: string;
  className?: string;
  placeholder?: string;
  [key: string]: any;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  onFileSelect,
  selectedFile = null,
  accept = '*/*',
  className = '',
  placeholder = 'Select a file',
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    pipe(
      O.fromNullable(event.target.files),
      O.chain((files) => O.fromNullable(files[0])),
      O.fold(
        () => onFileSelect?.(null),
        (file) => onFileSelect?.(file)
      )
    );
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    pipe(
      O.fromNullable(fileInputRef.current),
      O.map((input) => {
        input.value = '';
        return input;
      })
    );
    onFileSelect?.(null);
  };

  return pipe(
    O.fromNullable(selectedFile),
    O.fold(
      () => (
        <div
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 cursor-pointer min-w-[200px] ${className}`}
          onClick={handleFileClick}
          {...props}
        >
          <FileIcon className="text-gray-500" size={18} />
          <span className="text-gray-500">{placeholder}</span>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </div>
      ),
      (file) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 min-w-[200px] ${className}`}
        >
          <FileIcon className="text-blue-500" size={18} />
          <span
            className="flex-1 truncate cursor-pointer hover:text-blue-600 transition-colors duration-200"
            title={file.name}
            onClick={handleFileClick}
          >
            {file.name}
          </span>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 text-lg font-bold leading-none"
            title="Clear selection"
          >
            <XIcon className="text-gray-400 hover:text-red-500" size={18} />
          </button>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </div>
      )
    )
  );
};

export default FileSelector;
