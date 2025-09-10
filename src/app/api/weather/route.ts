import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const weatherRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  projectId: z.string().optional()
})

interface OpenWeatherMapResponse {
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  visibility: number
  dt: number
  sys: {
    sunrise: number
    sunset: number
  }
  name: string
}

interface OpenWeatherMapForecastResponse {
  list: Array<{
    dt: number
    main: {
      temp: number
      temp_min: number
      temp_max: number
      humidity: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    clouds: {
      all: number
    }
    wind: {
      speed: number
    }
    dt_txt: string
  }>
}

function calculateSolarIrradiance(cloudCover: number, hour: number): number {
  // Basic solar irradiance calculation based on cloud cover and time of day
  const maxIrradiance = 1000 // W/m² at peak sun
  const timeOfDayFactor = Math.max(0, Math.sin((hour - 6) * Math.PI / 12))
  const cloudFactor = Math.max(0.1, 1 - (cloudCover / 100) * 0.8)
  
  return Math.round(maxIrradiance * timeOfDayFactor * cloudFactor)
}

function estimateEnergyOutput(irradiance: number, systemSize: number = 10): number {
  // Estimate hourly energy output based on irradiance and system size
  const efficiency = 0.18 // 18% panel efficiency
  const performanceRatio = 0.85 // System losses factor
  
  return Math.round(irradiance * systemSize * efficiency * performanceRatio) / 1000
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get('lat')
    const lngStr = searchParams.get('lng')
    const projectId = searchParams.get('projectId')
    
    // Check if required parameters exist
    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lng are required' },
        { status: 400 }
      )
    }
    
    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)
    
    // Check for valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid parameters: lat and lng must be valid numbers' },
        { status: 400 }
      )
    }

    // Validate parameters
    const validatedParams = weatherRequestSchema.parse({ lat, lng, projectId: projectId || undefined })

    if (!process.env.OPENWEATHERMAP_API_KEY) {
      return NextResponse.json(
        { error: 'OpenWeatherMap API key not configured' },
        { status: 500 }
      )
    }

    // Fetch current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
    const currentWeatherResponse = await fetch(currentWeatherUrl)
    
    if (!currentWeatherResponse.ok) {
      throw new Error(`OpenWeatherMap API error: ${currentWeatherResponse.status}`)
    }

    const currentWeather: OpenWeatherMapResponse = await currentWeatherResponse.json()

    // Fetch 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
    const forecastResponse = await fetch(forecastUrl)
    
    if (!forecastResponse.ok) {
      throw new Error(`OpenWeatherMap forecast API error: ${forecastResponse.status}`)
    }

    const forecast: OpenWeatherMapForecastResponse = await forecastResponse.json()

    // Calculate current solar irradiance
    const currentHour = new Date().getHours()
    const currentIrradiance = calculateSolarIrradiance(currentWeather.clouds.all, currentHour)
    
    // Calculate UV Index (simplified)
    const uvIndex = Math.max(0, Math.min(11, Math.round(currentIrradiance / 100)))

    // Process forecast data
    const processedForecast = forecast.list.slice(0, 40).map((item) => {
      const date = new Date(item.dt * 1000)
      const hour = date.getHours()
      const irradiance = calculateSolarIrradiance(item.clouds.all, hour)
      const estimatedOutput = estimateEnergyOutput(irradiance)
      
      return {
        date: date.toISOString().split('T')[0],
        datetime: item.dt_txt,
        temperature: {
          min: Math.round(item.main.temp_min),
          max: Math.round(item.main.temp_max),
          current: Math.round(item.main.temp)
        },
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        },
        cloudCover: item.clouds.all,
        windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
        humidity: item.main.humidity,
        estimatedOutput,
        irradiance
      }
    })

    // Group forecast by day and get daily summaries
    const dailyForecast = processedForecast.reduce((acc, item) => {
      const date = item.date
      if (!acc[date]) {
        acc[date] = {
          date,
          temperature: {
            min: item.temperature.min,
            max: item.temperature.max
          },
          cloudCover: item.cloudCover,
          estimatedOutput: 0,
          avgIrradiance: 0,
          weather: item.weather,
          count: 0
        }
      }
      
      acc[date].temperature.min = Math.min(acc[date].temperature.min, item.temperature.min)
      acc[date].temperature.max = Math.max(acc[date].temperature.max, item.temperature.max)
      acc[date].estimatedOutput += item.estimatedOutput
      acc[date].avgIrradiance += item.irradiance
      acc[date].count += 1
      
      return acc
    }, {} as Record<string, any>)

    const dailyForecastArray = Object.values(dailyForecast).map((day: any) => ({
      date: day.date,
      temperature: day.temperature,
      cloudCover: day.cloudCover,
      estimatedOutput: Math.round(day.estimatedOutput),
      avgIrradiance: Math.round(day.avgIrradiance / day.count),
      weather: day.weather
    }))

    // Prepare response
    const weatherData = {
      location: {
        name: currentWeather.name,
        coordinates: [lng, lat]
      },
      current: {
        temperature: Math.round(currentWeather.main.temp),
        feelsLike: Math.round(currentWeather.main.feels_like),
        humidity: currentWeather.main.humidity,
        pressure: currentWeather.main.pressure,
        windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert to km/h
        windDirection: currentWeather.wind.deg,
        cloudCover: currentWeather.clouds.all,
        visibility: Math.round(currentWeather.visibility / 1000), // Convert to km
        irradiance: currentIrradiance,
        uvIndex,
        weather: {
          main: currentWeather.weather[0].main,
          description: currentWeather.weather[0].description,
          icon: currentWeather.weather[0].icon
        },
        sunrise: new Date(currentWeather.sys.sunrise * 1000).toISOString(),
        sunset: new Date(currentWeather.sys.sunset * 1000).toISOString(),
        lastUpdated: new Date(currentWeather.dt * 1000).toISOString()
      },
      forecast: dailyForecastArray.slice(0, 7), // 7-day forecast
      hourlyForecast: processedForecast.slice(0, 24), // 24-hour forecast
      solarMetrics: {
        currentIrradiance,
        peakSunHours: Math.round(dailyForecastArray[0]?.avgIrradiance / 100 * 8), // Estimated
        estimatedDailyOutput: dailyForecastArray[0]?.estimatedOutput || 0,
        weatherImpact: currentWeather.clouds.all > 70 ? 'high' : 
                      currentWeather.clouds.all > 40 ? 'medium' : 'low'
      }
    }

    return NextResponse.json(weatherData)

  } catch (error) {
    console.error('Weather API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
          details: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lng, projectId } = weatherRequestSchema.parse(body)

    // For POST requests, we can store the location for future reference
    // or provide more detailed analytics
    
    // This could integrate with project data to provide system-specific calculations
    // For now, we'll redirect to the GET method with the same data
    
    const url = new URL(request.url)
    url.searchParams.set('lat', lat.toString())
    url.searchParams.set('lng', lng.toString())
    if (projectId) {
      url.searchParams.set('projectId', projectId)
    }
    
    // Create a new request for the GET method
    const getRequest = new NextRequest(url, { method: 'GET' })
    return await GET(getRequest)

  } catch (error) {
    console.error('Weather POST API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request body', 
          details: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to process weather request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}