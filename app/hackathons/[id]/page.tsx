import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hackathon, Profile } from '@/lib/types/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface HackathonPageProps {
  params: Promise<{ id: string }>
}

async function getHackathon(id: string): Promise<Hackathon | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hackathons')
    .select('*')
    .eq('id', id)
    .single()
  return data as Hackathon | null
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

const formatLabels: Record<string, string> = {
  online: 'Онлайн',
  offline: 'Офлайн',
  hybrid: 'Гибридный',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const startFormatted = startDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
  const endFormatted = endDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  
  return `${startFormatted} - ${endFormatted}`
}

export default async function HackathonPage({ params }: HackathonPageProps) {
  const { id } = await params
  const [hackathon, { user, profile }] = await Promise.all([
    getHackathon(id),
    getUser(),
  ])

  if (!hackathon) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Главная
          </Link>
          <span>/</span>
          <Link href="/hackathons" className="hover:text-foreground transition-colors">
            Хакатоны
          </Link>
          <span>/</span>
          <span className="text-foreground">{hackathon.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-muted">
              {hackathon.image_url ? (
                <Image
                  src={hackathon.image_url}
                  alt={hackathon.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <svg
                    className="h-24 w-24 text-muted-foreground/30"
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
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {formatLabels[hackathon.format]}
                </Badge>
                {hackathon.is_featured && (
                  <Badge className="bg-yellow-500 text-white">
                    Топ
                  </Badge>
                )}
              </div>

              {hackathon.source && (
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-foreground">
                    {hackathon.source}
                  </Badge>
                </div>
              )}
            </div>

            {/* Title and description */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {hackathon.title}
              </h1>
              
              {/* Tech stack */}
              {hackathon.tech_stack && hackathon.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {hackathon.tech_stack.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {hackathon.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            {hackathon.tags && hackathon.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Категории</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {hackathon.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                {/* Prize */}
                {hackathon.prize_pool && (
                  <div className="text-center pb-6 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-1">Призовой фонд</p>
                    <p className="text-3xl font-bold text-primary">{hackathon.prize_pool}</p>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Даты проведения</p>
                      <p className="font-medium text-foreground">{formatDateRange(hackathon.start_date, hackathon.end_date)}</p>
                    </div>
                  </div>

                  {hackathon.registration_deadline && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Дедлайн регистрации</p>
                        <p className="font-medium text-foreground">{formatDate(hackathon.registration_deadline)}</p>
                      </div>
                    </div>
                  )}

                  {hackathon.location && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Локация</p>
                        <p className="font-medium text-foreground">{hackathon.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Размер команды</p>
                      <p className="font-medium text-foreground">{hackathon.min_team_size} - {hackathon.max_team_size} участников</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  {hackathon.website_url && (
                    <Button className="w-full" asChild>
                      <a href={hackathon.website_url} target="_blank" rel="noopener noreferrer">
                        Перейти на сайт
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </Button>
                  )}
                  {user ? (
                    <Button variant="outline" className="w-full">
                      Добавить в избранное
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login">
                        Войти для сохранения
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
