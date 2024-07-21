<script setup>
import { detailsInfo } from '@/assets/details'
import { ref, nextTick, onMounted } from 'vue'
import { mapCityPost } from '@/assets/citymap'
import * as echarts from 'echarts'
import { getCityWeather } from '@/api/test'
import { changeTemperature } from '@/utils/temperature'

const leftCityInfo = ref([])
const rightCityInfo = ref([])
const temperatureCtl = ref(1)
const activeLeft = ref(['湖南省', '长沙市', '天心区'])
const activeRight = ref(['山东省', '聊城市', '高唐县'])
let contrastEchart
const ctlOptions = [
  {
    value: 1,
    label: '最高温度'
  },
  {
    value: 0,
    label: '最低温度'
  }
]

const getLeftCityInfo = async () => {
  let response = await getCityWeather(
    activeLeft.value[0].slice(0, 2),
    mapCityPost[activeLeft.value[1]]
  )
  leftCityInfo.value = response.data
  console.log('leftCityInfo: ', leftCityInfo.value)
}
const getRightCityInfo = async () => {
  let response = await getCityWeather(
    activeRight.value[0].slice(0, 2),
    mapCityPost[activeRight.value[1]]
  )
  rightCityInfo.value = response.data
  console.log('rightCityInfo: ', rightCityInfo.value)
}

const getMaxValue = (data) => {
  let max = Math.max(...data)
  return Math.ceil(max / 5) * 5
}

const getMinValue = (data) => {
  let min = Math.min(...data)
  return Math.floor(min / 5) * 5 - 1
}

const changeContrastEchart = (ctl) => {
  let reversedLeftInfo = [...leftCityInfo.value].reverse()
  let reversedRightInfo = [...rightCityInfo.value].reverse()
  let areaData = [
    activeLeft.value[1] + activeLeft.value[2],
    activeRight.value[1] + activeRight.value[2]
  ]
  let dateData = reversedLeftInfo.map((item) => {
    // 使用正则表达式提取日期中的月和日
    return item.date.match(/\d{4}-(\d{2}-\d{2})/)[1]
  })

  let leftTemperatureHigh = reversedLeftInfo.map((item) => {
    // 提取温度字符串，去掉℃并转换为整数
    return changeTemperature(
      parseInt(item.temperatureHigh.replace('℃', '')),
      activeLeft.value[2] + item.date
    )
  })

  let rightTemperatureHigh = reversedRightInfo.map((item) => {
    // 提取温度字符串，去掉℃并转换为整数
    return changeTemperature(
      parseInt(item.temperatureHigh.replace('℃', '')),
      activeRight.value[2] + item.date
    )
  })

  let leftTemperatureLow = reversedLeftInfo.map((item) => {
    // 提取温度字符串，去掉℃并转换为整数
    return changeTemperature(
      parseInt(item.temperatureLow.replace('℃', '')),
      activeLeft.value[2] + item.date
    )
  })

  let rightTemperatureLow = reversedRightInfo.map((item) => {
    // 提取温度字符串，去掉℃并转换为整数
    return changeTemperature(
      parseInt(item.temperatureLow.replace('℃', '')),
      activeRight.value[2] + item.date
    )
  })

  let highestTemperature = getMaxValue([...leftTemperatureHigh, ...rightTemperatureHigh])

  let lyData = ctl === 1 ? leftTemperatureHigh : leftTemperatureLow
  let ryData = ctl === 1 ? rightTemperatureHigh : rightTemperatureLow

  console.log('leftTemperatureHigh:  ', leftTemperatureHigh)

  // Dispose existing ECharts instance
  if (contrastEchart) {
    contrastEchart.dispose()
  }

  nextTick(() => {
    contrastEchart = echarts.init(document.getElementById('contrast-echart'))
    contrastEchart.setOption({
      title: {},
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: areaData
      },
      // toolbox: {
      //   feature: {
      //     saveAsImage: {}
      //   }
      // },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: dateData,
          axisLabel: {
            color: '#fff'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            color: '#fff'
          },
          max: highestTemperature
        }
      ],
      series: [
        {
          name: activeLeft.value[1] + activeLeft.value[2],
          type: 'line',
          stack: 'Left',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: lyData
        },
        {
          name: activeRight.value[1] + activeRight.value[2],
          type: 'line',
          stack: 'Right',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: ryData
        }
      ]
    })

    // 监听鼠标移入事件
    contrastEchart.on('mouseover', function (params) {
      // cityInfo.value = contrastWeather.value[params.dataIndex]
      console.log('横坐标值:', params.name)
    })

    // 监听鼠标点击事件
    // contrastEchart.on('click', function (params) {
    //   console.log('鼠标点击事件发生:', params.name)
    //   goCity(params.name)
    // })
  })
}

const leftProps = {
  expandTrigger: 'hover',
  expandDirection: 'right'
}
const rightProps = {
  expandTrigger: 'hover',
  expandDirection: 'left'
}
const handleLeftChange = () => {
  getLeftCityInfo()
  changeContrastEchart(temperatureCtl.value)
}
const handleRightChange = () => {
  getRightCityInfo()
  changeContrastEchart(temperatureCtl.value)
}
const handleCtlChange = (val) => {
  temperatureCtl.value = val
  changeContrastEchart(val)
}

onMounted(async () => {
  await getLeftCityInfo()
  await getRightCityInfo()
  changeContrastEchart(temperatureCtl.value)
})
</script>

<template>
  <div class="contrast-container">
    <div class="top-selector">
      <div class="m-left">
        <el-cascader
          v-model="activeLeft"
          :options="detailsInfo"
          :props="leftProps"
          filterable
          @change="handleLeftChange"
        />
      </div>
      <div class="m-right">
        <el-cascader
          v-model="activeRight"
          :options="detailsInfo"
          :props="rightProps"
          filterable
          @change="handleRightChange"
        />
      </div>
      <el-select
            v-model="temperatureCtl"
            placeholder="Select"
            style="width: 100px"
            @change="handleCtlChange"
          >
            <el-option
              v-for="item in ctlOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
    </div>
    <div class="contrast-echart" id="contrast-echart"></div>
  </div>
</template>

<style>
.contrast-container {
  widows: 100%;
  height: 100%;
  /* background-color: #fff; */
}
.top-selector {
  height: 10%;
  display: flex;
}
.contrast-echart {
  width: 100%;
  height: 90%;
  /* background-color: purple; */
}
</style>
