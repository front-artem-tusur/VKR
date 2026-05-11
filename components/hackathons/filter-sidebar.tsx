'use client'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import {
  setSearch,
  setFormat,
  toggleTechStack,
  setLocation,
  setPrizeRange,
  setSource,
  toggleTag,
  clearFilters,
  setFiltersOpen,
} from '@/lib/store/slices/filtersSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { HackathonFormat } from '@/lib/types/database'

const TECH_STACKS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Go', 'Kotlin', 'Java', 'C++', 'Rust', 'Swift',
  'TensorFlow', 'PyTorch', 'ML', 'AI', 'IoT',
]

const TAGS = [
  'FinTech', 'AI', 'ML', 'CyberSecurity', 'EdTech',
  'GreenTech', 'IoT', 'Blockchain', 'Data Science', 'MusicTech',
]

const SOURCES = ['Сбер', 'MTS', 'VK', 'T-Bank', 'Лаборатория Касперского']

const LOCATIONS = ['Москва', 'Санкт-Петербург', 'Онлайн']

const PRIZE_RANGES = [
  { label: 'Любой', min: undefined, max: undefined },
  { label: 'До 500 000 ₽', min: undefined, max: 500000 },
  { label: '500 000 - 1 000 000 ₽', min: 500000, max: 1000000 },
  { label: '1 000 000 - 2 000 000 ₽', min: 1000000, max: 2000000 },
  { label: 'Более 2 000 000 ₽', min: 2000000, max: undefined },
]

interface FilterSidebarProps {
  onFiltersChange?: () => void
}

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const dispatch = useAppDispatch()
  const { filters, isFiltersOpen } = useAppSelector((state) => state.filters)

  const handleSearchChange = (value: string) => {
    dispatch(setSearch(value))
    onFiltersChange?.()
  }

  const handleFormatChange = (value: string) => {
    dispatch(setFormat(value as HackathonFormat | ''))
    onFiltersChange?.()
  }

  const handleTechToggle = (tech: string) => {
    dispatch(toggleTechStack(tech))
    onFiltersChange?.()
  }

  const handleTagToggle = (tag: string) => {
    dispatch(toggleTag(tag))
    onFiltersChange?.()
  }

  const handleSourceChange = (value: string) => {
    dispatch(setSource(value === 'all' ? '' : value))
    onFiltersChange?.()
  }

  const handleLocationChange = (value: string) => {
    dispatch(setLocation(value === 'all' ? '' : value))
    onFiltersChange?.()
  }

  const handlePrizeChange = (value: string) => {
    const range = PRIZE_RANGES[parseInt(value)]
    dispatch(setPrizeRange({ min: range.min, max: range.max }))
    onFiltersChange?.()
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    onFiltersChange?.()
  }

  const hasActiveFilters =
    filters.search ||
    filters.format ||
    (filters.tech_stack && filters.tech_stack.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    filters.source ||
    filters.location ||
    filters.min_prize ||
    filters.max_prize

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => dispatch(setFiltersOpen(!isFiltersOpen))}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Фильтры
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Активны
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter sidebar */}
      <div className={cn(
        'space-y-6',
        'lg:block',
        isFiltersOpen ? 'block' : 'hidden lg:block'
      )}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Фильтры</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Сбросить
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Поиск</label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Название или технология..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Формат</label>
              <Select value={filters.format || 'all'} onValueChange={handleFormatChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Любой формат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любой формат</SelectItem>
                  <SelectItem value="online">Онлайн</SelectItem>
                  <SelectItem value="offline">Офлайн</SelectItem>
                  <SelectItem value="hybrid">Гибрид</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Организатор</label>
              <Select value={filters.source || 'all'} onValueChange={handleSourceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Любой организатор" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любой организатор</SelectItem>
                  {SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Локация</label>
              <Select value={filters.location || 'all'} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Любая локация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любая локация</SelectItem>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prize range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Призовой фонд</label>
              <Select
                value={
                  PRIZE_RANGES.findIndex(
                    (r) => r.min === filters.min_prize && r.max === filters.max_prize
                  ).toString()
                }
                onValueChange={handlePrizeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Любой призовой фонд" />
                </SelectTrigger>
                <SelectContent>
                  {PRIZE_RANGES.map((range, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tech stack */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Технологии</label>
              <div className="flex flex-wrap gap-2">
                {TECH_STACKS.map((tech) => (
                  <Badge
                    key={tech}
                    variant={filters.tech_stack?.includes(tech) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      filters.tech_stack?.includes(tech)
                        ? 'bg-primary hover:bg-primary/90'
                        : 'hover:bg-secondary'
                    )}
                    onClick={() => handleTechToggle(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Категории</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      filters.tags?.includes(tag)
                        ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                        : 'hover:bg-secondary'
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
