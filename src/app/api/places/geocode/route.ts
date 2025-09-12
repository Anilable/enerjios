import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json({ error: 'Address parameter required' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding API request failed')
    }

    const data = await response.json()
    
    if (data.results && data.results[0]) {
      const result = data.results[0]
      return NextResponse.json({
        formatted_address: result.formatted_address,
        geometry: {
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          }
        }
      })
    }
    
    return NextResponse.json({ error: 'No results found' }, { status: 404 })
    
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 })
  }
}