import { create } from 'zustand';

export const useQuickAddStore = create((set) => ({
  isOpen: false,
  product: null,
  preselectedColor: null,
  preselectedSize: null,
  preselectedVariant: null,
  
  openQuickAdd: (product, preselectedColor = null, preselectedSize = null, preselectedVariant = null) => set({ isOpen: true, product, preselectedColor, preselectedSize, preselectedVariant }),
  closeQuickAdd: () => set({ isOpen: false, product: null, preselectedColor: null, preselectedSize: null, preselectedVariant: null }),
}));
