import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HackathonFilters, HackathonFormat } from '@/lib/types/database'

interface FiltersState {
  filters: HackathonFilters
  isFiltersOpen: boolean
}

const initialState: FiltersState = {
  filters: {
    search: '',
    format: '',
    tech_stack: [],
    location: '',
    min_prize: undefined,
    max_prize: undefined,
    start_date: '',
    end_date: '',
    min_team_size: undefined,
    max_team_size: undefined,
    source: '',
    tags: [],
  },
  isFiltersOpen: false,
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload
    },
    setFormat: (state, action: PayloadAction<HackathonFormat | ''>) => {
      state.filters.format = action.payload
    },
    setTechStack: (state, action: PayloadAction<string[]>) => {
      state.filters.tech_stack = action.payload
    },
    toggleTechStack: (state, action: PayloadAction<string>) => {
      const tech = action.payload
      const current = state.filters.tech_stack || []
      if (current.includes(tech)) {
        state.filters.tech_stack = current.filter(t => t !== tech)
      } else {
        state.filters.tech_stack = [...current, tech]
      }
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.filters.location = action.payload
    },
    setPrizeRange: (state, action: PayloadAction<{ min?: number; max?: number }>) => {
      state.filters.min_prize = action.payload.min
      state.filters.max_prize = action.payload.max
    },
    setDateRange: (state, action: PayloadAction<{ start?: string; end?: string }>) => {
      state.filters.start_date = action.payload.start || ''
      state.filters.end_date = action.payload.end || ''
    },
    setTeamSize: (state, action: PayloadAction<{ min?: number; max?: number }>) => {
      state.filters.min_team_size = action.payload.min
      state.filters.max_team_size = action.payload.max
    },
    setSource: (state, action: PayloadAction<string>) => {
      state.filters.source = action.payload
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.filters.tags = action.payload
    },
    toggleTag: (state, action: PayloadAction<string>) => {
      const tag = action.payload
      const current = state.filters.tags || []
      if (current.includes(tag)) {
        state.filters.tags = current.filter(t => t !== tag)
      } else {
        state.filters.tags = [...current, tag]
      }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    setFiltersOpen: (state, action: PayloadAction<boolean>) => {
      state.isFiltersOpen = action.payload
    },
    toggleFiltersOpen: (state) => {
      state.isFiltersOpen = !state.isFiltersOpen
    },
  },
})

export const {
  setSearch,
  setFormat,
  setTechStack,
  toggleTechStack,
  setLocation,
  setPrizeRange,
  setDateRange,
  setTeamSize,
  setSource,
  setTags,
  toggleTag,
  clearFilters,
  setFiltersOpen,
  toggleFiltersOpen,
} = filtersSlice.actions

export default filtersSlice.reducer
