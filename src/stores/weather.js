import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getOneDayWeather } from '@/api/test'
import { judgeStorage } from '@/utils/judge'
export const WeatherStore = defineStore(
  'weather',
  () => {
    const oneDayWeather = ref({})
    const minTemperature = Number.MAX_VALUE
    const maxTemperature = Number.MIN_VALUE
    const setDefaultList = async () => {
      if (judgeStorage('weather')) {
        const getWeather = async () => {
          const response = await getOneDayWeather()
          const transformedData = response.data.reduce((accumulator, current) => {
            if (!accumulator[current.province]) {
              accumulator[current.province] = {
                cities: {},
                avgHighTemperature: 0,
                avgLowTemperature: 0,
                cityCount: 0
              }
            }
            accumulator[current.province].cities[current.city] = {
              temperatureHigh: current.temperatureHigh,
              temperatureLow: current.temperatureLow
            }
            accumulator[current.province].avgHighTemperature += current.temperatureHigh
            accumulator[current.province].avgLowTemperature += current.temperatureLow
            accumulator[current.province].cityCount += 1

            // 计算最小和最大温度
            if (current.temperatureHigh > maxTemperature) {
              maxTemperature = current.temperatureHigh
            }
            if (current.temperatureHigh < minTemperature) {
              minTemperature = current.temperatureHigh
            }

            return accumulator
          }, {})

          // 计算每个省份的平均最高气温和最低气温
          for (const province in transformedData) {
            transformedData[province].avgHighTemperature /= transformedData[province].cityCount
            transformedData[province].avgLowTemperature /= transformedData[province].cityCount
          }

          oneDayWeather.value = transformedData
        }
        await getWeather()
      }
    }
    return {
      oneDayWeather,
      minTemperature,
      maxTemperature,
      setDefaultList
    }
  },
  {
    persist: true
  }
)
