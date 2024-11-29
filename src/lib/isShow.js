import { create } from "zustand";

export const useShowStore = create((set) => ({
  isShown: false,
  toggleShow: () => set((state) => ({ isShown: !state.isShown })),
  closeShow: () => set({ isShown: false }),
}));
