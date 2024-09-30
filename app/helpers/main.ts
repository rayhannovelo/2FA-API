import QRCode from 'qrcode'

export function round(value: number, precision: number = 0): number {
  const multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}

export async function generateQRCode(otpauth: string) {
  try {
    const imageUrl = await QRCode.toDataURL(otpauth)
    return imageUrl // Return or store it in a variable
  } catch (err) {
    console.log('Error generating QR code:', err)
    return null
  }
}
