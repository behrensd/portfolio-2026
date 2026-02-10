'use client';

import { create } from 'zustand';

interface ExploreStore {
  isActive: boolean;
  isTransitioning: boolean;
  nearestPlanet: string | null;
  selectedPlanet: string | null;
  pointerLocked: boolean;
  savedScrollY: number;
  // Actions
  enterExplore: () => void;
  exitExplore: () => void;
  setTransitioning: (val: boolean) => void;
  setNearestPlanet: (id: string | null) => void;
  setSelectedPlanet: (id: string | null) => void;
  setPointerLocked: (val: boolean) => void;
  setSavedScrollY: (val: number) => void;
}

export const useExploreStore = create<ExploreStore>((set) => ({
  isActive: false,
  isTransitioning: false,
  nearestPlanet: null,
  selectedPlanet: null,
  pointerLocked: false,
  savedScrollY: 0,

  enterExplore: () => set({ isActive: true, isTransitioning: false }),
  exitExplore: () => set({
    isActive: false,
    isTransitioning: false,
    nearestPlanet: null,
    selectedPlanet: null,
    pointerLocked: false,
  }),
  setTransitioning: (val) => set({ isTransitioning: val }),
  setNearestPlanet: (id) => set({ nearestPlanet: id }),
  setSelectedPlanet: (id) => set({ selectedPlanet: id }),
  setPointerLocked: (val) => set({ pointerLocked: val }),
  setSavedScrollY: (val) => set({ savedScrollY: val }),
}));
