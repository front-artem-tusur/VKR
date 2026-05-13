import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { HackathonsPageClient } from './hackathons-client'
import { Hackathon, Profile } from '@/lib/types/database'

async function getAllHackathons(): Promise<Hackathon[]> {
  const supabase = await createClient()
  const { data } = await supabase
      .from('hackathons')
      .select(`
      *,
      hackathon_tech_stack (
        tech_categories (
          id,
          name,
          category
        )
      )
    `)
      .order('start_date', { ascending: true })

  if (!data) return []

  // Преобразуем данные в удобный формат
  return data.map((item: any) => ({
    ...item,
    hackathon_tech_stack: item.hackathon_tech_stack?.map((hts: any) => ({
      id: hts.tech_categories.id,
      name: hts.tech_categories.name,
      category: hts.tech_categories.category
    })) || []
  })) as Hackathon[]
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

export default async function HackathonsPage() {
  const [hackathons, { user, profile }] = await Promise.all([
    getAllHackathons(),
    getUser(),
  ])

  return (
      <div className="min-h-screen bg-background">
        <Header user={user} profile={profile} />
        <HackathonsPageClient
            initialHackathons={hackathons}
            userId={user?.id}
        />
      </div>
  )
}