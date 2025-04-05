import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui setup
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

const FileUpload = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    // Only take the first file
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'video/mp4': ['.mp4'],
    },
    multiple: false,
  });

  const handleAnalyzeClick = () => {
    if (file && onAnalyze) {
      onAnalyze(file);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation(); // Prevent triggering dropzone click
    setFile(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <div
        {...getRootProps()}
        className={`w-full p-10 border-2 border-dashed rounded-md cursor-pointer text-center transition-colors duration-200 ease-in-out
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        {isDragActive ? (
          <p className="text-gray-600 dark:text-gray-400">Drop the file here ...</p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Drag & drop your meeting file here, or click to select</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Supports: .mp3, .wav, .mp4</p>
      </div>

      {file && (
        <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
          <div className="flex items-center gap-3">
            <FileIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={removeFile} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Button
        onClick={handleAnalyzeClick}
        disabled={!file || isLoading}
        className="w-full hover:cursor-pointer disabled:cursor-not-allowed"
        size="lg"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Meeting'}
      </Button>
    </div>
  );
};

export default FileUpload;