import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  
  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude parameters required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error('Reverse geocoding API request failed')
    }

    const data = await response.json()
    
    if (data.results && data.results[0]) {
      return NextResponse.json({
        formatted_address: data.results[0].formatted_address,
        address_components: data.results[0].address_components
      })
    }
    
    return NextResponse.json({ formatted_address: `${lat}, ${lng}` })
    
  } catch (error) {
    console.error('Reverse geocoding API error:', error)
    return NextResponse.json({ formatted_address: `${lat}, ${lng}` })
  }
}