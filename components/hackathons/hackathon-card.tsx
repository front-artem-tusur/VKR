'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Hackathon } from '@/lib/types/database'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HackathonCardProps {
  hackathon: Hackathon
  onFavoriteToggle?: (id: string) => void
  isFavorite?: boolean
  showFavorite?: boolean
}

const formatLabels: Record<string, string> = {
  online: 'Онлайн',
  offline: 'Офлайн',
  hybrid: 'Гибрид',
}

const formatColors: Record<string, string> = {
  online: 'bg-accent text-accent-foreground',
  offline: 'bg-primary text-primary-foreground',
  hybrid: 'bg-secondary text-secondary-foreground border border-primary/20',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

function getDaysUntil(dateString: string): number {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function HackathonCard({
                                hackathon,
                                onFavoriteToggle,
                                isFavorite = false,
                                showFavorite = true,
                              }: HackathonCardProps) {
  const daysUntil = getDaysUntil(hackathon.start_date)
  const isStartingSoon = daysUntil > 0 && daysUntil <= 7

  return (
      <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {hackathon.image_url ? (
              <Image
                  src={hackathon.image_url}
                  alt={hackathon.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
          ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <svg
                    className="h-16 w-16 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge className={cn('text-xs font-medium', formatColors[hackathon.format])}>
              {formatLabels[hackathon.format]}
            </Badge>
            {hackathon.is_featured && (
                <Badge className="bg-yellow-500 text-white">
                  <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Топ
                </Badge>
            )}
            {isStartingSoon && (
                <Badge className="bg-orange-500 text-white">
                  Скоро старт
                </Badge>
            )}
          </div>

          {/* Favorite button */}
          {showFavorite && onFavoriteToggle && (
              <button
                  onClick={(e) => {
                    e.preventDefault()
                    onFavoriteToggle(hackathon.id)
                  }}
                  className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all hover:bg-white hover:scale-110"
              >
                <svg
                    className={cn('h-5 w-5 transition-colors', isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
          )}

          {/* Source badge */}
          {hackathon.source && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-foreground text-xs">
                  {hackathon.source}
                </Badge>
              </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {hackathon.title}
            </h3>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {hackathon.short_description || hackathon.description}
          </p>

          {/* Tech stack - ИСПРАВЛЕННЫЙ БЛОК */}
          {hackathon.hackathon_tech_stack && hackathon.hackathon_tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {hackathon.hackathon_tech_stack.slice(0, 4).map((tech) => (
                    <Badge key={tech.id} variant="outline" className="text-xs font-normal">
                      {tech.name}
                    </Badge>
                ))}
                {hackathon.hackathon_tech_stack.length > 4 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{hackathon.hackathon_tech_stack.length - 4}
                    </Badge>
                )}
              </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}</span>
            </div>
            {hackathon.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{hackathon.location}</span>
                </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{hackathon.min_team_size}-{hackathon.max_team_size} чел.</span>
            </div>
            {hackathon.prize_pool && (
                <div className="flex items-center gap-2 text-primary font-medium">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{hackathon.prize_pool}</span>
                </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button asChild className="w-full">
            <Link href={`/hackathons/${hackathon.id}`}>
              Подробнее
            </Link>
          </Button>
        </CardFooter>
      </Card>
  )
}