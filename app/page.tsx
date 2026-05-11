import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { HackathonFeed } from '@/components/hackathons/hackathon-feed'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Hackathon, Profile } from '@/lib/types/database'

async function getFeaturedHackathons(): Promise<Hackathon[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hackathons')
    .select('*')
    .eq('status', 'upcoming')
    .eq('is_featured', true)
    .order('start_date', { ascending: true })
    .limit(6)
  return (data as Hackathon[]) || []
}

async function getUpcomingHackathons(): Promise<Hackathon[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hackathons')
    .select('*')
    .eq('status', 'upcoming')
    .order('start_date', { ascending: true })
    .limit(9)
  return (data as Hackathon[]) || []
}

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { user: null, profile: null }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { user, profile: profile as Profile | null }
}

const partners = [
  { name: 'Сбер', color: 'bg-green-500' },
  { name: 'MTS', color: 'bg-red-500' },
  { name: 'VK', color: 'bg-blue-500' },
  { name: 'T-Bank', color: 'bg-yellow-500' },
  { name: 'Kaspersky', color: 'bg-emerald-600' },
]

export default async function HomePage() {
  const [featuredHackathons, upcomingHackathons, { user, profile }] = await Promise.all([
    getFeaturedHackathons(),
    getUpcomingHackathons(),
    getUser(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} profile={profile} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Платформа IT-соревнований
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Найдите идеальный хакатон для вашей команды
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              Собрали лучшие хакатоны от ведущих IT-компаний России в одном месте. 
              Фильтруйте по технологиям, формату и призовому фонду.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/hackathons">
                  Смотреть хакатоны
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/recommendations">
                  Подобрать по параметрам
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Partners Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Хакатоны от ведущих компаний
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${partner.color}`} />
                <span className="font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hackathons */}
      {featuredHackathons.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Топ хакатоны
                </h2>
                <p className="text-muted-foreground">
                  Самые ожидаемые события этого сезона
                </p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/hackathons?featured=true">
                  Все топовые
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            </div>
            <HackathonFeed 
              initialHackathons={featuredHackathons} 
              userId={user?.id}
            />
          </div>
        </section>
      )}

      {/* All Upcoming */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Ближайшие хакатоны
              </h2>
              <p className="text-muted-foreground">
                Успейте зарегистрироваться на интересные события
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/hackathons">
                Все хакатоны
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
          <HackathonFeed 
            initialHackathons={upcomingHackathons} 
            userId={user?.id}
          />
          <div className="mt-8 text-center sm:hidden">
            <Button asChild>
              <Link href="/hackathons">Все хакатоны</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Вы организатор хакатонов?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Разместите информацию о вашем мероприятии на нашей платформе и привлеките талантливых разработчиков.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/sign-up?role=organizer">
                  Стать организатором
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/about">
                  Узнать больше
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg
                  className="h-5 w-5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-bold text-foreground">HackHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Выпускной квалификационный проект. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
