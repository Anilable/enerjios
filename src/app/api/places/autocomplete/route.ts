import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    
    if (!query || query.length < 3) {
      return NextResponse.json([])
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(regions)&components=country:TR&key=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error('Places API request failed')
    }

    const data = await response.json()
    
    if (data.predictions) {
      const suggestions = data.predictions.map((prediction: any) => ({
        description: prediction.description,
        place_id: prediction.place_id
      }))
      
      return NextResponse.json(suggestions.slice(0, 5))
    }
    
    return NextResponse.json([])
    
  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
  }
}