'use client'

import { useState, useMemo } from 'react'
import { Hackathon, HackathonFormat } from '@/lib/types/database'
import { HackathonFeed } from '@/components/hackathons/hackathon-feed'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface RecommendationsClientProps {
  hackathons: Hackathon[]
  userId?: string
  availableTechStacks: string[]
  availableTags: string[]
  availableSources: string[]
  availableLocations: string[]
}

interface Preferences {
  techStacks: string[]
  format: HackathonFormat | ''
  location: string
  minTeamSize: number
  maxTeamSize: number
  minPrize: number
  tags: string[]
  source: string
  dateFrom: string
  dateTo: string
}

function calculateRelevanceScore(hackathon: Hackathon, prefs: Preferences): number {
  let score = 0
  let maxScore = 0

  // Tech stack matching (weight: 30)
  if (prefs.techStacks.length > 0) {
    maxScore += 30
    const matchingTech = prefs.techStacks.filter(t => hackathon.tech_stack?.includes(t)).length
    score += (matchingTech / prefs.techStacks.length) * 30
  }

  // Format matching (weight: 15)
  if (prefs.format) {
    maxScore += 15
    if (hackathon.format === prefs.format) score += 15
    else if (hackathon.format === 'hybrid') score += 10
  }

  // Location matching (weight: 15)
  if (prefs.location) {
    maxScore += 15
    if (hackathon.location === prefs.location) score += 15
    else if (hackathon.format === 'online') score += 10
  }

  // Team size matching (weight: 10)
  maxScore += 10
  if (hackathon.min_team_size >= prefs.minTeamSize && hackathon.max_team_size <= prefs.maxTeamSize) {
    score += 10
  } else if (hackathon.min_team_size <= prefs.maxTeamSize && hackathon.max_team_size >= prefs.minTeamSize) {
    score += 5
  }

  // Prize matching (weight: 15)
  if (prefs.minPrize > 0) {
    maxScore += 15
    if (hackathon.prize_amount && hackathon.prize_amount >= prefs.minPrize) {
      score += 15
    } else if (hackathon.prize_amount && hackathon.prize_amount >= prefs.minPrize * 0.5) {
      score += 8
    }
  }

  // Tags matching (weight: 10)
  if (prefs.tags.length > 0) {
    maxScore += 10
    const matchingTags = prefs.tags.filter(t => hackathon.tags?.includes(t)).length
    score += (matchingTags / prefs.tags.length) * 10
  }

  // Source preference (weight: 5)
  if (prefs.source) {
    maxScore += 5
    if (hackathon.source === prefs.source) score += 5
  }

  // Featured bonus
  if (hackathon.is_featured) score += 3

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50
}

export function RecommendationsClient({
  hackathons,
  userId,
  availableTechStacks,
  availableTags,
  availableSources,
  availableLocations,
}: RecommendationsClientProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    techStacks: [],
    format: '',
    location: '',
    minTeamSize: 1,
    maxTeamSize: 6,
    minPrize: 0,
    tags: [],
    source: '',
    dateFrom: '',
    dateTo: '',
  })

  const [showResults, setShowResults] = useState(false)

  const recommendedHackathons = useMemo(() => {
    if (!showResults) return []

    return hackathons
      .map(h => ({
        hackathon: h,
        score: calculateRelevanceScore(h, preferences),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .filter(({ hackathon }) => {
        // Apply hard filters
        if (preferences.dateFrom && new Date(hackathon.start_date) < new Date(preferences.dateFrom)) {
          return false
        }
        if (preferences.dateTo && new Date(hackathon.start_date) > new Date(preferences.dateTo)) {
          return false
        }
        return true
      })
  }, [hackathons, preferences, showResults])

  const toggleTech = (tech: string) => {
    setPreferences(prev => ({
      ...prev,
      techStacks: prev.techStacks.includes(tech)
        ? prev.techStacks.filter(t => t !== tech)
        : [...prev.techStacks, tech],
    }))
  }

  const toggleTag = (tag: string) => {
    setPreferences(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(true)
  }

  const handleReset = () => {
    setPreferences({
      techStacks: [],
      format: '',
      location: '',
      minTeamSize: 1,
      maxTeamSize: 6,
      minPrize: 0,
      tags: [],
      source: '',
      dateFrom: '',
      dateTo: '',
    })
    setShowResults(false)
  }

  const hasPreferences = 
    preferences.techStacks.length > 0 ||
    preferences.format ||
    preferences.location ||
    preferences.tags.length > 0 ||
    preferences.source ||
    preferences.minPrize > 0

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Подбор хакатонов
          </h1>
          <p className="text-muted-foreground">
            Укажите ваши предпочтения, и мы подберем наиболее подходящие хакатоны
          </p>
        </div>

        {!showResults ? (
          <Card>
            <CardHeader>
              <CardTitle>Ваши предпочтения</CardTitle>
              <CardDescription>
                Заполните параметры для персонализированных рекомендаций
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Tech Stack */}
                <div className="space-y-3">
                  <Label className="text-base">Технологии, которыми владеете</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTechStacks.slice(0, 20).map(tech => (
                      <Badge
                        key={tech}
                        variant={preferences.techStacks.includes(tech) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all',
                          preferences.techStacks.includes(tech)
                            ? 'bg-primary hover:bg-primary/90'
                            : 'hover:bg-secondary'
                        )}
                        onClick={() => toggleTech(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Format and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Предпочтительный формат</Label>
                    <Select 
                      value={preferences.format || 'any'} 
                      onValueChange={(v) => setPreferences(prev => ({ ...prev, format: v === 'any' ? '' : v as HackathonFormat }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Любой формат" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Любой формат</SelectItem>
                        <SelectItem value="online">Онлайн</SelectItem>
                        <SelectItem value="offline">Офлайн</SelectItem>
                        <SelectItem value="hybrid">Гибридный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Локация</Label>
                    <Select 
                      value={preferences.location || 'any'} 
                      onValueChange={(v) => setPreferences(prev => ({ ...prev, location: v === 'any' ? '' : v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Любая локация" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Любая локация</SelectItem>
                        {availableLocations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Team Size */}
                <div className="space-y-4">
                  <Label className="text-base">Размер команды: {preferences.minTeamSize} - {preferences.maxTeamSize} человек</Label>
                  <div className="px-2">
                    <Slider
                      value={[preferences.minTeamSize, preferences.maxTeamSize]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([min, max]) => setPreferences(prev => ({ 
                        ...prev, 
                        minTeamSize: min, 
                        maxTeamSize: max 
                      }))}
                    />
                  </div>
                </div>

                {/* Prize */}
                <div className="space-y-3">
                  <Label className="text-base">Минимальный призовой фонд</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[0, 500000, 1000000, 2000000].map(amount => (
                      <Button
                        key={amount}
                        type="button"
                        variant={preferences.minPrize === amount ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreferences(prev => ({ ...prev, minPrize: amount }))}
                      >
                        {amount === 0 ? 'Любой' : `${(amount / 1000000).toFixed(1)} млн+`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-base">Интересующие категории</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={preferences.tags.includes(tag) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all',
                          preferences.tags.includes(tag)
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                            : 'hover:bg-secondary'
                        )}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label>Предпочтительный организатор</Label>
                  <Select 
                    value={preferences.source || 'any'} 
                    onValueChange={(v) => setPreferences(prev => ({ ...prev, source: v === 'any' ? '' : v }))}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Любой организатор" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Любой организатор</SelectItem>
                      {availableSources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">Дата начала (от)</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={preferences.dateFrom}
                      onChange={(e) => setPreferences(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">Дата начала (до)</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={preferences.dateTo}
                      onChange={(e) => setPreferences(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" size="lg" disabled={!hasPreferences}>
                    Найти хакатоны
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={handleReset}>
                    Сбросить
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Найдено {recommendedHackathons.length} хакатонов
                </h2>
                <p className="text-muted-foreground text-sm">
                  Отсортировано по релевантности
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Изменить параметры
              </Button>
            </div>

            {/* Selected preferences summary */}
            <div className="flex flex-wrap gap-2">
              {preferences.techStacks.map(tech => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
              {preferences.format && (
                <Badge variant="secondary">
                  {preferences.format === 'online' ? 'Онлайн' : preferences.format === 'offline' ? 'Офлайн' : 'Гибрид'}
                </Badge>
              )}
              {preferences.location && (
                <Badge variant="secondary">{preferences.location}</Badge>
              )}
              {preferences.minPrize > 0 && (
                <Badge variant="secondary">от {preferences.minPrize / 1000000} млн ₽</Badge>
              )}
              {preferences.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            {/* Results */}
            {recommendedHackathons.length > 0 ? (
              <div className="space-y-4">
                {recommendedHackathons.map(({ hackathon, score }) => (
                  <div key={hackathon.id} className="relative">
                    <div className="absolute -left-2 top-4 z-10">
                      <Badge 
                        className={cn(
                          'text-xs font-bold',
                          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                        )}
                      >
                        {score}%
                      </Badge>
                    </div>
                    <HackathonFeed 
                      initialHackathons={[hackathon]} 
                      userId={userId}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    К сожалению, по вашим параметрам хакатоны не найдены. Попробуйте изменить критерии поиска.
                  </p>
                  <Button className="mt-4" onClick={handleReset}>
                    Изменить параметры
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
