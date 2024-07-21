<script setup>
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCityWeather } from '@/api/test'
import { changeTemperature } from '@/utils/temperature'

const cityWeatherInfo = ref([])
const route = useRoute()
const province = ref(route.params.province)
const city = ref(route.params.city)
const area = ref(route.params.area)
let cityEchart

const getMinValue = (data) => {
  let min = Math.min(...data)
  return Math.floor(min / 5) * 5
}
const getMaxValue = (data) => {
  let max = Math.max(...data)
  return Math.ceil(max / 5) * 5
}

const changeCityEchart = () => {
  // 反转数组顺序
  let reversedCityWeatherInfo = [...cityWeatherInfo.value].reverse()

  let temperatureHigh = reversedCityWeatherInfo.map((item) => {
    // 提取温度字符串，去掉℃并转换为整数
    return changeTemperature(parseInt(item.temperatureHigh.replace('℃', '')),area.value + item.date)
  })

  let temperatureLow = reversedCityWeatherInfo.map((item) => {
    // 提取温度字符串，去掉℃并转换为整数
    return changeTemperature(parseInt(item.temperatureLow.replace('℃', '')),area.value + item.date)
  })

  let date = reversedCityWeatherInfo.map((item) => {
    // 使用正则表达式提取日期中的月和日
    return item.date.match(/\d{4}-(\d{2}-\d{2})/)[1]
  })

  let highestTemperature = Math.max(...temperatureHigh)
  let lowestTemperature = Math.min(...temperatureLow)

  console.log(temperatureHigh, temperatureLow, date)
  let titleName = area.value + '气温图'
  cityEchart = echarts.init(document.getElementById('city-echart'))
  cityEchart.setOption({
    title: {
      text: titleName
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {},
    toolbox: {
      show: true,
      feature: {
        magicType: { type: ['line', 'bar'] }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: date
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} °C'
      },
      min: getMinValue([...temperatureHigh, ...temperatureLow]),
      max: getMaxValue([...temperatureHigh, ...temperatureLow])
    },
    series: [
      {
        name: '最高气温',
        type: 'line',
        data: temperatureHigh,
        markPoint: {
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: 'Avg' },
            { yAxis: highestTemperature, name: 'Highest Temperature' } // 辅助线
          ]
        }
      },
      {
        name: '最低气温',
        type: 'line',
        data: temperatureLow,
        markPoint: {
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: 'Avg' },
            { yAxis: lowestTemperature, name: 'Lowest Temperature' } // 辅助线
          ]
        }
      }
    ]
  })
}

const getCityWeatherInfo = async () => {
  let response = await getCityWeather(province.value, city.value)
  cityWeatherInfo.value = response.data
  console.log(cityWeatherInfo.value)
  changeCityEchart()
}

onMounted(() => {
  console.log('province:', province.value, 'city:', city.value)
  getCityWeatherInfo()
})

watch(
  () => route.params.city,
  async (newCity) => {
    city.value = newCity
    await getCityWeatherInfo()
  }
)
</script>

<template>
  <div class="city-echart" id="city-echart"></div>
</template>

<style>
.city-echart {
  width: 1000px;
  height: 600px;
  margin: auto;
}
</style>
