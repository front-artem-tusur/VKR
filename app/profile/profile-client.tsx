'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile, Registration, Hackathon } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface RegistrationWithHackathon extends Registration {
  hackathon: Hackathon
}

interface ProfileClientProps {
  user: User
  profile: Profile | null
  registrations: RegistrationWithHackathon[]
}

const roleLabels: Record<string, string> = {
  user: 'Участник',
  organizer: 'Организатор',
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  cancelled: 'bg-red-500',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Компонент выбора технологий
function TechStackSelector({ userId, onUpdate }: { userId: string; onUpdate?: () => void }) {
  const [allTechs, setAllTechs] = useState<{ id: number; name: string; category: string }[]>([])
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  // Загружаем все технологии и выбранные пользователя
  const loadData = async () => {
    setLoading(true)

    try {
      // Загружаем все доступные технологии
      const { data: techs, error: techsError } = await supabase
          .from('tech_categories')
          .select('*')
          .order('display_order')

      if (techsError) console.error('Ошибка загрузки технологий:', techsError)

      // Загружаем выбранные пользователем
      const { data: userTechs, error: userError } = await supabase
          .from('user_tech_stack')
          .select('tech_id')
          .eq('user_id', userId)

      if (userError) console.error('Ошибка загрузки выбранных технологий:', userError)

      setAllTechs(techs || [])
      setSelectedTechIds(userTechs?.map(t => t.tech_id) || [])
    } catch (err) {
      console.error('Критическая ошибка при загрузке:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const addTech = async (techId: number) => {
    setUpdating(true)
    const { error } = await supabase
        .from('user_tech_stack')
        .insert({ user_id: userId, tech_id: techId })

    if (!error) {
      setSelectedTechIds([...selectedTechIds, techId])
      onUpdate?.()
    }
    setUpdating(false)
  }

  const removeTech = async (techId: number) => {
    setUpdating(true)
    const { error } = await supabase
        .from('user_tech_stack')
        .delete()
        .eq('user_id', userId)
        .eq('tech_id', techId)

    if (!error) {
      setSelectedTechIds(selectedTechIds.filter(id => id !== techId))
      onUpdate?.()
    }
    setUpdating(false)
  }

  const techsByCategory = allTechs.reduce((acc, tech) => {
    if (!acc[tech.category]) acc[tech.category] = []
    acc[tech.category].push(tech)
    return acc
  }, {} as Record<string, { id: number; name: string; category: string }[]>)

  if (loading) {
    return <div className="text-muted-foreground">Загрузка технологий...</div>
  }

  return (
      <div className="space-y-6">
        {/* Выбранные технологии */}
        <div>
          <h4 className="text-sm font-medium mb-3">Мой стек технологий</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTechIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">Не выбрано ни одной технологии</p>
            ) : (
                selectedTechIds.map(id => {
                  const tech = allTechs.find(t => t.id === id)
                  return tech ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {tech.name}
                        <button
                            onClick={() => removeTech(id)}
                            disabled={updating}
                            className="ml-1 hover:text-destructive"
                        >
                          ✕
                        </button>
                      </Badge>
                  ) : null
                })
            )}
          </div>
        </div>

        {/* Доступные технологии по категориям */}
        <div>
          <h4 className="text-sm font-medium mb-3">Добавить технологию</h4>
          <div className="space-y-4">
            {Object.entries(techsByCategory).map(([category, techs]) => (
                <div key={category}>
                  <p className="text-xs text-muted-foreground mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {techs.map(tech => {
                      const isSelected = selectedTechIds.includes(tech.id)
                      return (
                          <Button
                              key={tech.id}
                              variant={isSelected ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => addTech(tech.id)}
                              disabled={isSelected || updating}
                              className="text-xs"
                          >
                            {isSelected ? '✓ ' : '+ '}{tech.name}
                          </Button>
                      )
                    })}
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export function ProfileClient({ user, profile, registrations }: ProfileClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: fullName, updated_at: new Date().toISOString() })
          .eq('id', user.id)

      if (updateError) throw updateError

      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (metaError) {
        console.error('Metadata update error:', metaError)
      }

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Мой профиль</h1>

          {/* Profile info */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {profile?.full_name || 'Имя не указано'}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{roleLabels[profile?.role || 'user']}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Имя и фамилия</Label>
                      <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Введите ваше имя"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
              ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email</span>
                        <p className="font-medium text-foreground">{user.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Роль</span>
                        <p className="font-medium text-foreground">{roleLabels[profile?.role || 'user']}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Дата регистрации</span>
                        <p className="font-medium text-foreground">
                          {profile?.created_at ? formatDate(profile.created_at) : '-'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Редактировать профиль
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <Link href="/favorites" className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Избранное</h3>
                    <p className="text-sm text-muted-foreground">Сохраненные хакатоны</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {profile?.role === 'organizer' && (
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <Link href="/organizer" className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Панель организатора</h3>
                        <p className="text-sm text-muted-foreground">Управление хакатонами</p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
            )}
          </div>

          {/* Tech Stack Section - НОВЫЙ БЛОК */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Технологический стек</CardTitle>
              <CardDescription>
                Выберите технологии, с которыми вы работаете. Это поможет подбирать релевантные хакатоны.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TechStackSelector
                  userId={user.id}
                  onUpdate={() => router.refresh()}
              />
            </CardContent>
          </Card>

          {/* Registrations */}
          <h2 className="text-xl font-semibold text-foreground mb-4">Мои регистрации</h2>
          {registrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Вы пока не зарегистрированы ни на один хакатон
                  </p>
                  <Button asChild>
                    <Link href="/hackathons">Найти хакатоны</Link>
                  </Button>
                </CardContent>
              </Card>
          ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                    <Card key={reg.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">
                                {reg.hackathon.title}
                              </h3>
                              <Badge className={statusColors[reg.status]}>
                                {statusLabels[reg.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {formatDate(reg.hackathon.start_date)} - {formatDate(reg.hackathon.end_date)}
                            </p>
                            {reg.team_name && (
                                <p className="text-sm text-muted-foreground">
                                  Команда: {reg.team_name}
                                </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/hackathons/${reg.hackathon.id}`}>
                              Подробнее
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
          )}
        </div>
      </main>
  )
}