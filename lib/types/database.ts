export type HackathonFormat = 'online' | 'offline' | 'hybrid'
export type HackathonStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'
export type UserRole = 'user' | 'organizer'
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Organizer {
  id: string
  profile_id: string
  company_name: string
  description: string | null
  website: string | null
  logo_url: string | null
  verified: boolean
  created_at: string
}

export interface Hackathon {
  id: string
  title: string
  description: string
  short_description?: string
  prize_pool?: string
  start_date: string
  end_date: string
  status: string
  format: string
  location?: string
  image_url?: string
  source_url?: string
  min_team_size?: number
  max_team_size?: number
  source?: string
  is_featured?: boolean
  hackathon_tech_stack?: Array<{
    id: number
    name: string
    category: string
  }>
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  hackathon_id: string
  created_at: string
}

export interface Registration {
  id: string
  user_id: string
  hackathon_id: string
  team_name: string | null
  status: RegistrationStatus
  created_at: string
}

export interface HackathonFilters {
  search?: string
  format?: HackathonFormat | ''
  tech_stack?: string[]
  location?: string
  min_prize?: number
  max_prize?: number
  start_date?: string
  end_date?: string
  min_team_size?: number
  max_team_size?: number
  source?: string
  tags?: string[]
}

export interface HackathonWithOrganizer extends Hackathon {
  organizer?: Organizer | null
}
