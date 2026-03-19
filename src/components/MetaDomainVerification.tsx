'use client'

import { useEffect } from 'react'

const FACEBOOK_DOMAIN_VERIFICATION = 'hjjlnqfq3tnxbx9ojdbpp27hfh1r0d'

export default function MetaDomainVerification() {
  useEffect(() => {
    const hostname = window.location.hostname
    if (
      hostname.includes('track.itshassanahmed.com') ||
      hostname.includes('localhost')
    ) {
      const meta = document.createElement('meta')
      meta.name = 'facebook-domain-verification'
      meta.content = FACEBOOK_DOMAIN_VERIFICATION
      if (!document.querySelector('meta[name="facebook-domain-verification"][content="' + FACEBOOK_DOMAIN_VERIFICATION + '"]')) {
        document.head.appendChild(meta)
      }
      // Don't remove on cleanup - third-party DOM removal can trigger React removeChild errors
    }
  }, [])

  return null
}
