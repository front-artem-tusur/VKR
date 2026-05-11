import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { RecommendationsClient } from './recommendations-client'
import { Hackathon, Profile } from '@/lib/types/database'

async function getAllHackathons(): Promise<Hackathon[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hackathons')
    .select('*')
    .eq('status', 'upcoming')
    .order('start_date', { ascending: true })
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

export default async function RecommendationsPage() {
  const [hackathons, { user, profile }] = await Promise.all([
    getAllHackathons(),
    getUser(),
  ])

  // Extract unique values for filters
  const techStacks = Array.from(new Set(hackathons.flatMap(h => h.tech_stack || [])))
  const tags = Array.from(new Set(hackathons.flatMap(h => h.tags || [])))
  const sources = Array.from(new Set(hackathons.map(h => h.source).filter(Boolean) as string[]))
  const locations = Array.from(new Set(hackathons.map(h => h.location).filter(Boolean) as string[]))

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} profile={profile} />
      <RecommendationsClient 
        hackathons={hackathons}
        userId={user?.id}
        availableTechStacks={techStacks}
        availableTags={tags}
        availableSources={sources}
        availableLocations={locations}
      />
    </div>
  )
}
