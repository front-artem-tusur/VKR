'use client'

import { useMemo } from 'react'
import { useAppSelector } from '@/lib/store/hooks'
import { FilterSidebar } from '@/components/hackathons/filter-sidebar'
import { HackathonFeed } from '@/components/hackathons/hackathon-feed'
import { Hackathon } from '@/lib/types/database'

interface HackathonsPageClientProps {
  initialHackathons: Hackathon[]
  userId?: string
}

export function HackathonsPageClient({ initialHackathons, userId }: HackathonsPageClientProps) {
  const { filters } = useAppSelector((state) => state.filters)

  const filteredHackathons = useMemo(() => {
    return initialHackathons.filter((hackathon) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = hackathon.title.toLowerCase().includes(searchLower)
        const matchesDescription = hackathon.description?.toLowerCase().includes(searchLower) || false
        // Ищем в технологиях (новое поле)
        const matchesTech = hackathon.hackathon_tech_stack?.some(t =>
            t.name.toLowerCase().includes(searchLower)
        ) || false
        if (!matchesTitle && !matchesDescription && !matchesTech) return false
      }

      // Format filter
      if (filters.format && hackathon.format !== filters.format) return false

      // Tech stack filter (исправлено)
      if (filters.tech_stack && filters.tech_stack.length > 0) {
        const hasMatchingTech = filters.tech_stack.some(tech =>
            hackathon.hackathon_tech_stack?.some(t => t.name === tech)
        )
        if (!hasMatchingTech) return false
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag =>
            hackathon.tags?.includes(tag)
        )
        if (!hasMatchingTag) return false
      }

      // Source filter
      if (filters.source && hackathon.source !== filters.source) return false

      // Location filter
      if (filters.location) {
        if (filters.location === 'Онлайн' && hackathon.format !== 'online') return false
        if (filters.location !== 'Онлайн' && hackathon.location !== filters.location) return false
      }

      // Prize range filter
      if (filters.min_prize && (!hackathon.prize_amount || hackathon.prize_amount < filters.min_prize)) {
        return false
      }
      if (filters.max_prize && (!hackathon.prize_amount || hackathon.prize_amount > filters.max_prize)) {
        return false
      }

      return true
    })
  }, [initialHackathons, filters])

  return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Все хакатоны</h1>
          <p className="text-muted-foreground">
            Найдено {filteredHackathons.length} из {initialHackathons.length} хакатонов
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 flex-shrink-0">
            <FilterSidebar />
          </aside>
          <div className="flex-1">
            <HackathonFeed
                initialHackathons={filteredHackathons}
                userId={userId}
            />
          </div>
        </div>
      </main>
  )
}