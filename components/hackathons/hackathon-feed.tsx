'use client'

import { Hackathon } from '@/lib/types/database'
import { HackathonCard } from './hackathon-card'
import { createClient } from '@/lib/supabase/client'
import useSWR from 'swr'

interface HackathonFeedProps {
  initialHackathons: Hackathon[]
  userId?: string
}

async function fetchFavorites(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('favorites')
    .select('hackathon_id')
    .eq('user_id', userId)
  return data?.map((f) => f.hackathon_id) || []
}

export function HackathonFeed({ initialHackathons, userId }: HackathonFeedProps) {
  const { data: favoriteIds = [], mutate } = useSWR(
    userId ? `favorites-${userId}` : null,
    () => fetchFavorites(userId!),
    { fallbackData: [] }
  )

  const handleFavoriteToggle = async (hackathonId: string) => {
    if (!userId) return

    const supabase = createClient()
    const isFavorite = favoriteIds.includes(hackathonId)

    // Optimistic update
    const newFavorites = isFavorite
      ? favoriteIds.filter((id) => id !== hackathonId)
      : [...favoriteIds, hackathonId]
    mutate(newFavorites, false)

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('hackathon_id', hackathonId)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: userId, hackathon_id: hackathonId })
      }
    } catch {
      // Revert on error
      mutate(favoriteIds, false)
    }
  }

  if (initialHackathons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Хакатоны не найдены
        </h3>
        <p className="text-muted-foreground max-w-md">
          Попробуйте изменить параметры поиска или загляните позже — мы постоянно добавляем новые события.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialHackathons.map((hackathon) => (
        <HackathonCard
          key={hackathon.id}
          hackathon={hackathon}
          isFavorite={favoriteIds.includes(hackathon.id)}
          onFavoriteToggle={userId ? handleFavoriteToggle : undefined}
          showFavorite={!!userId}
        />
      ))}
    </div>
  )
}
