'use client'

import { useEffect } from 'react'

const FACEBOOK_DOMAIN_VERIFICATION = 'hjjlnqfq3tnxbx9ojdbpp27hfh1r0d'

export default function MetaDomainVerification() {
  useEffect(() => {
    const hostname = window.location.hostname
    if (
      hostname.includes('track.itshassanhamed.com') ||
      hostname.includes('localhost') // remove this line after testing
    ) {
      const meta = document.createElement('meta')
      meta.name = 'facebook-domain-verification'
      meta.content = FACEBOOK_DOMAIN_VERIFICATION
      document.head.appendChild(meta)
      return () => {
        if (meta.parentNode === document.head) {
          document.head.removeChild(meta)
        }
      }
    }
  }, [])

  return null
}
