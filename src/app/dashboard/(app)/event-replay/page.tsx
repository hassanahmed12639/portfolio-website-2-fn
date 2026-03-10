export const dynamic = 'force-dynamic'

import { FeatureGate } from '@/components/FeatureGate'
import EventReplayClient from './EventReplayClient'

export default function EventReplayPage() {
  return (
    <FeatureGate feature="event_replay" requiredPlan="pro">
      <EventReplayClient />
    </FeatureGate>
  )
}




