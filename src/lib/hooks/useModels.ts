'use client';

import { useState, useEffect, useCallback } from 'react';
import { AIModel } from '@/types';

export function useModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('openmind:latest');

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data.models || []);
      setAvailable(data.available || false);

      if (data.models?.length > 0 && !data.models.find((m: AIModel) => m.id === selectedModel)) {
        setSelectedModel(data.models[0].id);
      }
    } catch {
      setAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    available,
    selectedModel,
    setSelectedModel,
    fetchModels,
  };
}
