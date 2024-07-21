<script setup>
import { testWeatherInfo, getProvinceWeather, getAllProvinces } from '@/api/test'
import { chinaDetails } from '@/assets/china'
import { simpleInfo } from '@/assets/simple'
import { mapCityPost } from '@/assets/citymap'
import { changeTemperature } from '@/utils/temperature'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { onBeforeMount, onMounted, ref, watch, nextTick } from 'vue'

const weatherList = ref([])
const provincesList = ref([])
const provinceWeather = ref([])
const cityInfo = ref([])
const weatherCtl = ref(1)
const activeProvince = ref(['湖北省', '武汉市'])
let provinceEchart

const props = {
  expandTrigger: 'hover'
}

const router = useRouter()
const goCity = (value) => {
  router.push({
    name: 'city',
    params: {
      province: activeProvince.value[0].slice(0, 2),
      city: mapCityPost[activeProvince.value[1]],
      area: value
    }
  })
}

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

const getCityTarget = (list, name) => {
  return list.find(function (item) {
    return item.city === mapCityPost[name]
  })
}

const changeProvinceEchart = (ctl) => {
  let areaData = chinaDetails[activeProvince.value[0]][activeProvince.value[1]]
  let targetCity = getCityTarget(provinceWeather.value, activeProvince.value[1])
  console.log('targetCity: ', targetCity)
  let temperatureHigh = areaData.map((item) =>
    changeTemperature(targetCity.temperatureHigh, item + 'day')
  )
  let temperatureLow = areaData.map((item) =>
    changeTemperature(targetCity.temperatureLow, item + 'day')
  )

  let yData = ctl === 1 ? temperatureHigh : temperatureLow

  let dataShadow = []
  let yMax = 500
  for (let i = 0; i < yData.length; i++) {
    dataShadow.push(yMax)
  }

  // Dispose existing ECharts instance
  if (provinceEchart) {
    provinceEchart.dispose()
  }

  nextTick(() => {
    provinceEchart = echarts.init(document.getElementById('province-echart'))
    provinceEchart.setOption({
      title: {},
      xAxis: {
        data: areaData,
        axisLabel: {
          inside: true,
          color: '#fff'
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        z: 10
      },
      yAxis: {
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#fff'
        }
      },
      dataZoom: [
        {
          type: 'inside'
        }
      ],
      series: [
        {
          type: 'bar',
          showBackground: true,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          },
          data: yData
        }
      ]
    })

    // 监听鼠标移入事件
    provinceEchart.on('mouseover', function (params) {
      // cityInfo.value = provinceWeather.value[params.dataIndex]
      console.log('横坐标值:', params.name)
    })

    // 监听鼠标点击事件
    provinceEchart.on('click', function (params) {
      console.log('鼠标点击事件发生:', params.name)
      goCity(params.name)
    })
  })
}

const getInfo = async () => {
  // let response1 = await testWeatherInfo()
  // weatherList.value = response1.data
  let response2 = await getAllProvinces()
  console.log('responses:', response2.data)
  provincesList.value = response2.data
  console.log('provinces:', provincesList.value)
}

const showProvinceWeather = async () => {
  let response = await getProvinceWeather(activeProvince.value[0].slice(0, 2))
  provinceWeather.value = response.data
  console.log('provinceWeahterInfo: ', provinceWeather.value)
  changeProvinceEchart(weatherCtl.value)
  cityInfo.value = provinceWeather.value[0]
}

onBeforeMount(() => {
  getInfo()
  // console.log("weatherCtl:",weatherCtl.value);
})

onMounted(() => {
  showProvinceWeather()
})

const handleCollapseChange = (val) => {
  if (val) {
    activeProvince.value = val
    console.log('activeProvince: ', activeProvince.value)
    showProvinceWeather()
    cityInfo.value = provinceWeather.value[0]
    console.log('cityInfo: ', cityInfo.value)
  }
}

const handleCtlChange = (val) => {
  weatherCtl.value = val
  changeProvinceEchart(val)
}

watch(weatherCtl, () => {
  changeProvinceEchart(weatherCtl.value)
})
</script>

<template>
  <div class="weather-layout">
    <el-container>
      <el-aside class="weather-aside">
        <div class="province-collapse">
          <div class="m-4">
            <el-cascader
              v-model="activeProvince"
              :options="simpleInfo"
              :props="props"
              filterable
              class="cascader-select"
              @change="handleCollapseChange"
            />
          </div>
          <el-select
            v-model="weatherCtl"
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
          <!-- <el-scrollbar>
            <el-collapse v-model="activeProvince" accordion @change="handleCollapseChange">
              <el-collapse-item
                v-for="item in provincesList"
                :key="item"
                :name="item"
                :class="{ 'selected-title': activeProvince === item }"
              >
                <template #title>
                  <span class="title-style">{{ item }}</span>
                </template>
                <el-card style="max-width: 480px">
                  <template #header>
                    <div class="card-header">
                      <span>{{ cityInfo.city }}</span>
                    </div>
                  </template>
                  <p class="card-item">天气现象: {{ cityInfo.weatherDay }}</p>
                  <p class="card-item">风向:{{ cityInfo.windDirectionDay }}</p>
                  <p class="card-item">风力:{{ cityInfo.windPowerDay }}</p>
                  <p class="card-item">最高温度:{{ cityInfo.temperatureHigh }}</p>
                  <p class="card-item">最低温度:{{ cityInfo.temperatureLow }}</p>
                </el-card>
              </el-collapse-item>
            </el-collapse>
          </el-scrollbar> -->
        </div>
      </el-aside>
      <el-container class="weather-main">
        <el-header class="weather-header"
          >{{ activeProvince[0] }}{{ activeProvince[1] }}气温变化图</el-header
        >
        <el-main class="echart-main">
          <div class="province-echart" id="province-echart"></div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
.weather-layout {
  width: 100%;
  height: 100%;
}
.weather-aside {
  width: 15%;
  height: 100%;
}
.weather-main {
  width: 85%;
  height: 100%;
}
.province-collapse {
  widows: 100%;
  height: 100%;
}
.title-style {
  margin-left: 20px;
  font-size: 20px;
  font-weight: 300;
}
.selected-title .title-style {
  color: rgb(217, 197, 212);
  font-size: 25px;
  font-weight: 500;
}
.card-header {
  font-size: 18px;
  font-weight: 400;
  height: 20px;
}
.card-item {
  font-size: 18px;
  border-bottom: 0.5px dotted;
}
.weather-header {
  height: 8%;
  width: 60%;
  font-size: 35px;
  font-weight: 500;
  color: rgb(68, 67, 67);
  /* background-color: #326984; */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 1;
  transform: translate(100px, 0);
}
.echart-main {
  width: 100%;
  height: 90%;
}
.province-echart {
  width: 100%;
  height: 75vh;
  transform: translate(-100px, 0);
}
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>
