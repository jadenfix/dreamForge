import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function DatasetUploader({ value, onChange }) {
  const [mode, setMode] = useState('url');

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      toast.error('File too large (max 200 MB)');
      return;
    }
    // For now we just set a pseudo-path; in prod we would upload to storage
    onChange(`upload://${file.name}`);
  };

  return (
    <Tab.Group onChange={(idx) => setMode(idx === 0 ? 'upload' : 'url')}>
      <Tab.List className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {['Upload ZIP', 'Cloud URL'].map((label, idx) => (
          <Tab
            key={label}
            className={({ selected }) =>
              classNames(
                'w-full py-2 text-sm font-medium rounded-lg',
                selected
                  ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300'
              )
            }
          >
            {label}
          </Tab>
        ))}
      </Tab.List>

      <Tab.Panels className="mt-4">
        <Tab.Panel>
          <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <input
              type="file"
              accept=".zip"
              className="hidden"
              id="dataset-zip"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <label htmlFor="dataset-zip" className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gradient-start" />
              <span className="text-sm">Drag & drop or click to upload ZIP</span>
              {value.startsWith('upload://') && <span className="text-xs text-green-500">{value.replace('upload://', '')}</span>}
            </label>
          </div>
        </Tab.Panel>
        <Tab.Panel>
          <input
            type="text"
            className="input-field w-full"
            placeholder="gs://bucket/images/… or https://…"
            value={mode === 'url' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
} 