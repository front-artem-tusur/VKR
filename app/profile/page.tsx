import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { ProfileClient } from './profile-client'
import { Profile, Registration, Hackathon } from '@/lib/types/database'
import { redirect } from 'next/navigation'

interface RegistrationWithHackathon extends Registration {
  hackathon: Hackathon
}

async function getProfileData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { user: null, profile: null, registrations: [] }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user registrations with hackathon data
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      *,
      hackathon:hackathons(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return { 
    user, 
    profile: profile as Profile | null,
    registrations: (registrations as RegistrationWithHackathon[]) || []
  }
}

export default async function ProfilePage() {
  const { user, profile, registrations } = await getProfileData()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} profile={profile} />
      <ProfileClient 
        user={user} 
        profile={profile} 
        registrations={registrations}
      />
    </div>
  )
}
