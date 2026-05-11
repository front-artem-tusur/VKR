'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { HackathonFormat } from '@/lib/types/database'

const TECH_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Vue.js', 'Angular',
  'Go', 'Kotlin', 'Java', 'C++', 'C#', 'Rust', 'Swift', 'Ruby',
  'TensorFlow', 'PyTorch', 'ML', 'AI', 'NLP', 'Computer Vision',
  'IoT', 'Blockchain', 'Web3', 'Docker', 'Kubernetes', 'AWS', 'GCP',
]

const TAG_OPTIONS = [
  'FinTech', 'AI', 'ML', 'CyberSecurity', 'EdTech', 'GreenTech', 'HealthTech',
  'IoT', 'Blockchain', 'Data Science', 'MusicTech', 'GameDev', 'AR/VR',
  'Social', 'E-commerce', 'DevTools', 'Mobile', 'Cloud', 'API',
]

export default function CreateHackathonPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizerId, setOrganizerId] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [format, setFormat] = useState<HackathonFormat>('online')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [minTeamSize, setMinTeamSize] = useState(1)
  const [maxTeamSize, setMaxTeamSize] = useState(5)
  const [prizePool, setPrizePool] = useState('')
  const [prizeAmount, setPrizeAmount] = useState<number | undefined>()
  const [techStack, setTechStack] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [websiteUrl, setWebsiteUrl] = useState('')

  useEffect(() => {
    const fetchOrganizer = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: organizer } = await supabase
        .from('organizers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!organizer) {
        router.push('/organizer/setup')
        return
      }

      setOrganizerId(organizer.id)
    }

    fetchOrganizer()
  }, [router])

  const toggleTech = (tech: string) => {
    setTechStack(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    )
  }

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizerId) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: insertError } = await supabase
        .from('hackathons')
        .insert({
          organizer_id: organizerId,
          title,
          description,
          short_description: shortDescription || null,
          image_url: imageUrl || null,
          format,
          location: format === 'online' ? null : location || null,
          start_date: startDate,
          end_date: endDate,
          registration_deadline: registrationDeadline || null,
          min_team_size: minTeamSize,
          max_team_size: maxTeamSize,
          prize_pool: prizePool || null,
          prize_amount: prizeAmount || null,
          tech_stack: techStack,
          tags,
          website_url: websiteUrl || null,
          status: 'upcoming',
        })

      if (insertError) throw insertError

      router.push('/organizer')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceedStep1 = title && description && startDate && endDate
  const canProceedStep2 = format && (format === 'online' || location)
  const canSubmit = canProceedStep1 && canProceedStep2

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/organizer" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к панели
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Создание хакатона</h1>
          <p className="text-muted-foreground mt-2">
            Заполните информацию о вашем хакатоне
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {s}
              </div>
              <span className={cn(
                'text-sm hidden sm:inline',
                step >= s ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {s === 1 && 'Основное'}
                {s === 2 && 'Детали'}
                {s === 3 && 'Технологии'}
              </span>
              {s < 3 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>Название, описание и даты проведения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Название хакатона *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Краткое описание</Label>
                  <Input
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Одно предложение о хакатоне"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">{shortDescription.length}/200</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Полное описание *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Расскажите подробно о хакатоне, задачах, призах и условиях участия"
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL изображения</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Дата начала *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Дата окончания *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline">Дедлайн регистрации</Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)} disabled={!canProceedStep1}>
                    Далее
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Детали проведения</CardTitle>
                <CardDescription>Формат, локация, призы и размер команды</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Формат проведения *</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as HackathonFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Онлайн</SelectItem>
                      <SelectItem value="offline">Офлайн</SelectItem>
                      <SelectItem value="hybrid">Гибридный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {format !== 'online' && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Локация *</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Город проведения"
                      required={format !== 'online'}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minTeamSize">Минимальный размер команды</Label>
                    <Input
                      id="minTeamSize"
                      type="number"
                      min={1}
                      max={10}
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTeamSize">Максимальный размер команды</Label>
                    <Input
                      id="maxTeamSize"
                      type="number"
                      min={1}
                      max={20}
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(parseInt(e.target.value) || 5)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prizePool">Призовой фонд (текст)</Label>
                    <Input
                      id="prizePool"
                      value={prizePool}
                      onChange={(e) => setPrizePool(e.target.value)}
                      placeholder="1 000 000 ₽"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeAmount">Сумма (число)</Label>
                    <Input
                      id="prizeAmount"
                      type="number"
                      value={prizeAmount || ''}
                      onChange={(e) => setPrizeAmount(parseInt(e.target.value) || undefined)}
                      placeholder="1000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Веб-сайт хакатона</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://hackathon.example.com"
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Назад
                  </Button>
                  <Button type="button" onClick={() => setStep(3)} disabled={!canProceedStep2}>
                    Далее
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Technologies and tags */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Технологии и категории</CardTitle>
                <CardDescription>Выберите технологии и тематики хакатона</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Технологии</Label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_OPTIONS.map(tech => (
                      <Badge
                        key={tech}
                        variant={techStack.includes(tech) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all',
                          techStack.includes(tech)
                            ? 'bg-primary hover:bg-primary/90'
                            : 'hover:bg-secondary'
                        )}
                        onClick={() => toggleTech(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  {techStack.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Выбрано: {techStack.join(', ')}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Категории</Label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map(tag => (
                      <Badge
                        key={tag}
                        variant={tags.includes(tag) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all',
                          tags.includes(tag)
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                            : 'hover:bg-secondary'
                        )}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Назад
                  </Button>
                  <Button type="submit" disabled={isLoading || !canSubmit}>
                    {isLoading ? 'Создание...' : 'Создать хакатон'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  )
}
