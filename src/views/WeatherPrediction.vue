<script setup>
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { detailsInfo } from '@/assets/details'
import { getPredictionWeather } from '@/api/test'

const predictionWeatherInfo = ref([])
const activePredictionArea = ref(['湖南省', '长沙市', '天心区'])
let predictionEchart

const props = {
  expandTrigger: 'hover'
}

const getMinValue = (data) => {
  let min = Math.min(...data)
  return Math.floor(min / 5) * 5 - 1
}
const getMaxValue = (data) => {
  let max = Math.max(...data)
  return Math.ceil(max / 5) * 5 + 1
}

const changePredictionEchart = () => {
  let temperatureHigh = predictionWeatherInfo.value.map((item) => {
    return parseFloat(item.temperatureHigh.replace('℃', ''))
  })

  let temperatureLow = predictionWeatherInfo.value.map((item) => {
    return parseFloat(item.temperatureLow.replace('℃', ''))
  })

  // let date = predictionWeatherInfo.value.map((item) => {
  //   // 使用正则表达式提取日期中的月和日
  //   return item.date.match(/\d{4}-(\d{2}-\d{2})/)[1]
  // })

  let date = ['07-01','07-02','07-03','07-04','07-05','07-06','07-07']

  let highestTemperature = getMaxValue(temperatureHigh)
  let lowestTemperature = getMinValue(temperatureLow)

  console.log(temperatureHigh, temperatureLow, date)
  predictionEchart = echarts.init(document.getElementById('prediction-echart'))
  predictionEchart.setOption({
    title: {},
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: date,
      axisLabel: {
        color: '#fff'
      }
    },
    yAxis: {
      type: 'value',
      max: highestTemperature,
      min: lowestTemperature,
      axisLabel: {
        color: '#fff'
      }
    },
    series: [
      {
        name: '最高气温',
        data: temperatureHigh,
        type: 'line',
        symbol:
          'path://M512 704a192 192 0 1 0 0-384 192 192 0 0 0 0 384m0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512m0-704a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32m0 768a32 32 0 0 1 32 32v64a32 32 0 1 1-64 0v-64a32 32 0 0 1 32-32M195.2 195.2a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 1 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm543.104 543.104a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 0 1-45.248 45.248l-45.248-45.248a32 32 0 0 1 0-45.248M64 512a32 32 0 0 1 32-32h64a32 32 0 0 1 0 64H96a32 32 0 0 1-32-32m768 0a32 32 0 0 1 32-32h64a32 32 0 1 1 0 64h-64a32 32 0 0 1-32-32M195.2 828.8a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248L240.448 828.8a32 32 0 0 1-45.248 0zm543.104-543.104a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248l-45.248 45.248a32 32 0 0 1-45.248 0',
        symbolSize: 60,
        lineStyle: {
          color: '#0084d0',
          width: 4,
          type: 'dashed'
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#0084d0',
          color: '#0084d0'
        }
      },
      {
        name: '最低气温',
        data: temperatureLow,
        type: 'line',
        symbol:
          'path://M240.448 240.448a384 384 0 1 0 559.424 525.696 448 448 0 0 1-542.016-542.08 390.592 390.592 0 0 0-17.408 16.384zm181.056 362.048a384 384 0 0 0 525.632 16.384A448 448 0 1 1 405.056 76.8a384 384 0 0 0 16.448 525.696',
        symbolSize: 40,
        lineStyle: {
          color: 'white',
          width: 4,
          type: 'dashed'
        },
        itemStyle: {
          borderWidth: 3,
          borderColor: 'white',
          color: 'white'
        }
      }
    ]
  })
}

const getPredictionWeatherInfo = async () => {
  let response = await getPredictionWeather(
    activePredictionArea.value[0],
    activePredictionArea.value[1],
    activePredictionArea.value[2]
  )
  predictionWeatherInfo.value = response.data.slice(1)
  console.log(predictionWeatherInfo.value)
  changePredictionEchart()
}

onMounted(() => {
  getPredictionWeatherInfo()
})

watch(activePredictionArea, () => {
  getPredictionWeatherInfo()
})
</script>

<template>
  <div class="prediction-container">
    <div class="select-prediction">
      <el-cascader
        v-model="activePredictionArea"
        :options="detailsInfo"
        :props="props"
        filterable
        @change="getPredictionWeatherInfo"
      />
    </div>
    <div class="prediction-echart" id="prediction-echart"></div>
  </div>
</template>

<style>
.prediction-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.select-prediction {
  height: 5%;
}
.prediction-echart {
  width: 100%;
  height: 95%;
  margin: auto;
}
</style>
