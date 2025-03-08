'use client';

import { LLM, LLM_NAMES } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

type ApiKeys = {
  [K in LLM]?: string;
};

export function SettingsDialog() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});

  // Load saved API keys on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('llm-api-keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  // Save API keys when they change
  const updateApiKey = (llm: LLM, key: string) => {
    const newKeys = { ...apiKeys, [llm]: key };
    setApiKeys(newKeys);
    localStorage.setItem('llm-api-keys', JSON.stringify(newKeys));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <Settings className="h-5 w-5 text-white/70 hover:text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-blue-950/90 border-blue-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">API Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {Object.values(LLM).map((llm) => (
            <div key={llm} className="space-y-2">
              <label htmlFor={llm} className="text-sm font-medium text-white/90">
                {LLM_NAMES[llm]} API Key
              </label>
              <input
                type="password"
                id={llm}
                value={apiKeys[llm] || ''}
                onChange={(e) => updateApiKey(llm, e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-blue-900/30 border border-blue-500/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder={`Enter your ${LLM_NAMES[llm]} API key`}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 