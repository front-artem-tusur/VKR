import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { HackathonsPageClient } from './hackathons-client'
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
