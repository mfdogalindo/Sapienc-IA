import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/16/solid';
import { FileMetadata } from 'server/models';
import { useFetcher } from '@remix-run/react';
import { FileWithMetadata } from 'server/models';

interface FilePreviewProps {
  file: FileMetadata;
  projectId: string;
  onClose: () => void;
}

const FilePreview = ({ file, projectId, onClose }: FilePreviewProps) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const fetcher = useFetcher<{file: FileWithMetadata}>();

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      fetcher.load(`/fileManager/preview?projectId=${projectId}&fileId=${file.id}`);
    }
  }, [file]);

  useEffect(() => {
    if (fetcher.data) {
      setContent(fetcher.data.file.data);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  const getLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'json': 'json',
      'py': 'python',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'csv': 'csv',
      'txt': 'plaintext'
    };
    return languageMap[extension || ''] || 'plaintext';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col relative">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div>
            <h3 className="text-lg font-medium text-white">{file.name}</h3>
            <p className="text-sm text-gray-400">
              {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <pre className={`text-sm font-mono whitespace-pre-wrap break-words text-gray-300 ${
              file.type === 'text/csv' ? 'font-mono' : ''
            }`}>
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;