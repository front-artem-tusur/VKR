import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { HackathonFeed } from '@/components/hackathons/hackathon-feed'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Hackathon, Profile } from '@/lib/types/database'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getFavoritesData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { user: null, profile: null, hackathons: [] }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get favorite hackathons
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      hackathon:hackathons(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const hackathons = favorites?.map(f => f.hackathon).filter(Boolean) as Hackathon[] || []
  
  return { 
    user, 
    profile: profile as Profile | null,
    hackathons
  }
}

export default async function FavoritesPage() {
  const { user, profile, hackathons } = await getFavoritesData()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} profile={profile} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Избранное</h1>
          <p className="text-muted-foreground">
            {hackathons.length > 0 
              ? `${hackathons.length} сохраненных хакатонов`
              : 'Сохраняйте интересные хакатоны для быстрого доступа'}
          </p>
        </div>

        {hackathons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                У вас пока нет избранных хакатонов
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Нажмите на сердечко на карточке хакатона, чтобы добавить его в избранное
              </p>
              <Button asChild>
                <Link href="/hackathons">Найти хакатоны</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <HackathonFeed 
            initialHackathons={hackathons} 
            userId={user.id}
          />
        )}
      </main>
    </div>
  )
}
