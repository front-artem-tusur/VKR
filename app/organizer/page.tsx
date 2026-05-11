import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hackathon, Profile, Organizer } from '@/lib/types/database'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getOrganizerData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { user: null, profile: null, organizer: null, hackathons: [] }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user is an organizer
  if (profile?.role !== 'organizer') {
    return { user, profile: profile as Profile | null, organizer: null, hackathons: [] }
  }

  // Get organizer record
  const { data: organizer } = await supabase
    .from('organizers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  // Get hackathons created by this organizer
  let hackathons: Hackathon[] = []
  if (organizer) {
    const { data } = await supabase
      .from('hackathons')
      .select('*')
      .eq('organizer_id', organizer.id)
      .order('created_at', { ascending: false })
    hackathons = (data as Hackathon[]) || []
  }
  
  return { 
    user, 
    profile: profile as Profile | null, 
    organizer: organizer as Organizer | null, 
    hackathons 
  }
}

const statusLabels: Record<string, string> = {
  upcoming: 'Ожидается',
  active: 'Активен',
  completed: 'Завершен',
  cancelled: 'Отменен',
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500',
  active: 'bg-green-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function OrganizerDashboard() {
  const { user, profile, organizer, hackathons } = await getOrganizerData()

  if (!user) {
    redirect('/auth/login')
  }

  if (profile?.role !== 'organizer') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Панель организатора
          </h1>
          <p className="text-muted-foreground">
            Управляйте своими хакатонами и просматривайте статистику
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{hackathons.length}</div>
              <p className="text-sm text-muted-foreground">Всего хакатонов</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {hackathons.filter(h => h.status === 'upcoming').length}
              </div>
              <p className="text-sm text-muted-foreground">Предстоящих</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">
                {hackathons.filter(h => h.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Активных</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-muted-foreground">
                {hackathons.filter(h => h.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Завершенных</p>
            </CardContent>
          </Card>
        </div>

        {/* Company info or setup */}
        {!organizer ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Настройте профиль организатора</CardTitle>
              <CardDescription>
                Для создания хакатонов необходимо заполнить информацию о вашей компании
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/organizer/setup">
                  Заполнить профиль
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{organizer.company_name}</CardTitle>
                <CardDescription>{organizer.description || 'Описание не указано'}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/organizer/settings">Редактировать</Link>
              </Button>
            </CardHeader>
          </Card>
        )}

        {/* Hackathons list */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Ваши хакатоны</h2>
          {organizer && (
            <Button asChild>
              <Link href="/organizer/create">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Создать хакатон
              </Link>
            </Button>
          )}
        </div>

        {hackathons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                У вас пока нет хакатонов
              </h3>
              <p className="text-muted-foreground mb-4">
                Создайте свой первый хакатон и привлеките талантливых разработчиков
              </p>
              {organizer && (
                <Button asChild>
                  <Link href="/organizer/create">Создать хакатон</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {hackathons.map(hackathon => (
              <Card key={hackathon.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {hackathon.title}
                        </h3>
                        <Badge className={statusColors[hackathon.status]}>
                          {statusLabels[hackathon.status]}
                        </Badge>
                        {hackathon.is_featured && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            Топ
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {hackathon.short_description || hackathon.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {hackathon.min_team_size}-{hackathon.max_team_size} чел.
                        </span>
                        {hackathon.prize_pool && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {hackathon.prize_pool}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/hackathons/${hackathon.id}`}>
                          Просмотр
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/organizer/edit/${hackathon.id}`}>
                          Редактировать
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
