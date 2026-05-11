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
  organizer_id: string | null
  title: string
  description: string
  short_description: string | null
  image_url: string | null
  format: HackathonFormat
  location: string | null
  start_date: string
  end_date: string
  registration_deadline: string | null
  min_team_size: number
  max_team_size: number
  prize_pool: string | null
  prize_amount: number | null
  tech_stack: string[]
  tags: string[]
  website_url: string | null
  status: HackathonStatus
  source: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
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
