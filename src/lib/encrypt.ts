const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32c'

export async function encrypt(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'))
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    )
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    return Buffer.from(combined).toString('base64')
  } catch {
    return text
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'))
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    const combined = Buffer.from(encryptedText, 'base64')
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return encryptedText
  }
}
