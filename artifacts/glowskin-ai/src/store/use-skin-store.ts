import { create } from 'zustand';
import type { AnalyzeSkinResponse, AnalyzeSkinRequestSkinType } from '@workspace/api-client-react';

interface SkinStore {
  analysisResult: AnalyzeSkinResponse | null;
  skinType: AnalyzeSkinRequestSkinType | null;
  imageBase64: string | null;
  setScanData: (result: AnalyzeSkinResponse, type: AnalyzeSkinRequestSkinType | null, image: string) => void;
  clearScanData: () => void;
}

export const useSkinStore = create<SkinStore>((set) => ({
  analysisResult: null,
  skinType: null,
  imageBase64: null,
  setScanData: (result, type, image) => set({ 
    analysisResult: result, 
    skinType: type, 
    imageBase64: image 
  }),
  clearScanData: () => set({ analysisResult: null, skinType: null, imageBase64: null }),
}));
