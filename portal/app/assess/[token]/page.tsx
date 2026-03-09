
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import AssessmentForm from './AssessmentForm'

export default async function AssessPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, status')
    .eq('token', token)
    .single()

  if (!assessment) notFound()

  if (assessment.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-6">✓</div>
          <h1 className="text-xl font-light mb-3" style={{ color: 'var(--foreground)' }}>
            Assessment Complete
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            You have already submitted this assessment. Thank you.
          </p>
        </div>
      </div>
    )
  }

  return <AssessmentForm token={token} assessmentId={assessment.id} />
}
