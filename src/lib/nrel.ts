interface PVWattsParams {
  lat: number
  lon: number
  system_capacity: number
  tilt: number
  azimuth: number
  array_type?: number // 0=Fixed Open Rack, 1=Fixed Roof Mounted, 2=1-Axis, 3=1-Axis Backtracking, 4=2-Axis
  module_type?: number // 0=Standard, 1=Premium, 2=Thin film
  losses?: number // System losses percentage (default 14.08%)
  dc_ac_ratio?: number // DC to AC size ratio (default 1.2)
  inv_eff?: number // Inverter efficiency percentage (default 96%)
  radius?: number // Radius to search for stations (km)
  dataset?: string // 'nsrdb' or 'intl'
}

interface PVWattsResponse {
  errors: string[]
  inputs: {
    lat: number
    lon: number
    system_capacity: number
    tilt: number
    azimuth: number
    array_type: number
    module_type: number
    losses: number
    dc_ac_ratio: number
    inv_eff: number
    radius: number
    dataset: string
  }
  outputs: {
    ac_monthly: number[]
    poa_monthly: number[]
    solrad_monthly: number[]
    dc_monthly: number[]
    ac_annual: number
    solrad_annual: number
    capacity_factor: number
  }
  station_info: {
    lat: number
    lon: number
    elev: number
    tz: number
    location: string
    city: string
    state: string
    solar_resource_file: string
    distance: number
  }
  version: string
}

interface SolarCalculationResult {
  success: boolean
  data?: {
    annualProduction: number // kWh/year
    monthlyProduction: number[] // kWh for each month
    solarIrradiance: number // kWh/m²/day average
    capacityFactor: number // percentage
    stationInfo: {
      location: string
      city: string
      state: string
      distance: number // km from requested location
    }
    peakSunHours: number // hours/day
    co2Offset: number // kg CO2/year
  }
  error?: string
}

class NRELService {
  private readonly baseUrl = 'https://developer.nrel.gov/api/pvwatts/v6.json'
  private readonly apiKey: string

  constructor() {
    this.apiKey = process.env.NREL_API_KEY || 'DEMO_KEY'
  }

  private async makeRequest(params: PVWattsParams): Promise<PVWattsResponse> {
    const url = new URL(this.baseUrl)

    // Add API key
    url.searchParams.append('api_key', this.apiKey)

    // Add all parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'TrakySolar/1.0',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status} ${response.statusText}`)
    }

    const data: PVWattsResponse = await response.json()

    if (data.errors && data.errors.length > 0) {
      throw new Error(`NREL API errors: ${data.errors.join(', ')}`)
    }

    return data
  }

  async calculateSolarProduction(params: {
    lat: number
    lon: number
    systemCapacity: number // kW
    tilt: number // degrees
    azimuth: number // degrees (180 = south)
    arrayType?: 'fixed_open_rack' | 'fixed_roof_mounted' | 'one_axis' | 'one_axis_backtracking' | 'two_axis'
    moduleType?: 'standard' | 'premium' | 'thin_film'
    systemLosses?: number // percentage
  }): Promise<SolarCalculationResult> {
    try {
      // Convert array type to NREL format
      const arrayTypeMap = {
        'fixed_open_rack': 0,
        'fixed_roof_mounted': 1,
        'one_axis': 2,
        'one_axis_backtracking': 3,
        'two_axis': 4
      }

      // Convert module type to NREL format
      const moduleTypeMap = {
        'standard': 0,
        'premium': 1,
        'thin_film': 2
      }

      const pvwattsParams: PVWattsParams = {
        lat: params.lat,
        lon: params.lon,
        system_capacity: params.systemCapacity,
        tilt: params.tilt,
        azimuth: params.azimuth,
        array_type: arrayTypeMap[params.arrayType || 'fixed_roof_mounted'],
        module_type: moduleTypeMap[params.moduleType || 'standard'],
        losses: params.systemLosses || 14.08, // Default system losses
        dc_ac_ratio: 1.2,
        inv_eff: 96,
        radius: 100, // 100km radius for weather station search
        dataset: 'nsrdb' // Use NSRDB dataset for best accuracy
      }

      const response = await this.makeRequest(pvwattsParams)

      // Calculate additional metrics
      const annualProduction = response.outputs.ac_annual
      const solarIrradiance = response.outputs.solrad_annual / 365 // Convert to daily average
      const peakSunHours = response.outputs.solrad_annual / 365 // Approximately equal to daily irradiance

      // CO2 offset calculation (EPA factor: 0.8537 lbs CO2/kWh = 0.387 kg CO2/kWh)
      const co2Offset = annualProduction * 0.387

      return {
        success: true,
        data: {
          annualProduction,
          monthlyProduction: response.outputs.ac_monthly,
          solarIrradiance,
          capacityFactor: response.outputs.capacity_factor,
          stationInfo: {
            location: response.station_info.location,
            city: response.station_info.city,
            state: response.station_info.state,
            distance: response.station_info.distance
          },
          peakSunHours,
          co2Offset
        }
      }
    } catch (error) {
      console.error('NREL API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async getSolarResourceData(lat: number, lon: number): Promise<{
    irradiance: number
    location: string
    distance: number
  }> {
    try {
      // Use a minimal system capacity for resource data only
      const response = await this.makeRequest({
        lat,
        lon,
        system_capacity: 1,
        tilt: 30,
        azimuth: 180,
        array_type: 1,
        module_type: 0,
        losses: 14.08
      })

      return {
        irradiance: response.outputs.solrad_annual / 365, // Daily average
        location: response.station_info.location,
        distance: response.station_info.distance
      }
    } catch (error) {
      console.error('Error fetching solar resource data:', error)
      throw error
    }
  }
}

export const nrelService = new NRELService()
export type { SolarCalculationResult, PVWattsParams }