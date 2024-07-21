<script setup>
import { ref, onMounted } from 'vue'
import { cityMap, provinces, mapCityPost } from '@/assets/citymap'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getOneDayWeather } from '@/api/test'
import axios from 'axios'
import chroma from 'chroma-js'
import { changeTemperature } from '@/utils/temperature'

const oneDayWeather = ref({})
const nowProvince = ref('')
let minTemperature = Number.MAX_VALUE
let maxTemperature = Number.MIN_VALUE
const getWeather = async () => {
  console.log('start get one day weather')
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

const router = useRouter()
const goCity = (province, city,area) => {
  router.push({
    name: 'city',
    params: {
      province: province,
      city: city,
      area:area
    }
  })
}

// 地图容器
const dmapContainer = ref(null)
let Dmapchart = null

// 直辖市和特别行政区-只有二级地图，没有三级地图
const special = ['北京', '天津', '上海', '重庆', '香港', '澳门']
let mapdata = []

// 初始化地图
const initMap = async () => {
  try {
    const { data } = await axios.get('/src/assets/map/china.json')
    const d = data.features.map((feature) => ({ name: feature.properties.name }))
    mapdata = d
    echarts.registerMap('china', data)
    renderMap('china', d)
  } catch (error) {
    console.error('Error loading map data:', error)
  }
}

// 根据温度值获取颜色
const getColorByTemperature = (minTemperature, maxTemperature, temperature) => {
  return chroma.scale('Viridis').domain([minTemperature, maxTemperature])(temperature).hex()
}

// 获取省的颜色数据
const getProvinceData = (provinces) => {
  return provinces.map((province) => {
    const provinceName = province.name
    const avgHighTemperature = oneDayWeather.value[provinceName]?.avgHighTemperature || 28
    return {
      name: provinceName,
      itemStyle: {
        areaColor: getColorByTemperature(minTemperature, maxTemperature, avgHighTemperature)
      }
    }
  })
}

// 获取城市的颜色数据
const getCityData = (provinceName, cities) => {
  return cities.map((city) => {
    const cityName = city.name
    const temperatureHigh =
      oneDayWeather.value[provinceName]?.cities[mapCityPost[cityName]]?.temperatureHigh ||
      changeTemperature(
        oneDayWeather.value[nowProvince.value]?.cities[mapCityPost[provinceName]]?.temperatureHigh,
        cityName
      )
    return {
      name: cityName,
      itemStyle: {
        areaColor: getColorByTemperature(minTemperature, maxTemperature, temperatureHigh)
      }
    }
  })
}

// 渲染地图
const renderMap = (map, data) => {
  const option = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    title: {
      text: '中国地图',
      subtext: map,
      left: 'center',
      textStyle: {
        color: '#282a36',
        fontSize: 25,
        fontWeight: 'normal',
        fontFamily: 'Microsoft YaHei'
      },
      subtextStyle: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'normal',
        fontFamily: 'Microsoft YaHei'
      }
    },
    //提示文字
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        console.log(params.name, params.seriesName)
        let provinceName
        let cityName
        let temperatureHigh
        if (params.seriesName === 'china') {
          provinceName = params.name
          nowProvince.value = provinceName
          // cityName = Object.keys(oneDayWeather.value[provinceName] || {})[0]
          temperatureHigh =
            oneDayWeather.value[provinceName]?.avgHighTemperature.toFixed(2) || '无数据'
        } else {
          provinceName = params.seriesName
          cityName = params.name
          temperatureHigh =
            oneDayWeather.value[provinceName]?.cities[mapCityPost[cityName]]?.temperatureHigh ||
            changeTemperature(
              oneDayWeather.value[nowProvince.value]?.cities[mapCityPost[provinceName]]
                ?.temperatureHigh,
              cityName
            )
        }
        return `${provinceName}<br/>${cityName ? '城市: ' + cityName + '<br/>' : ''}气温: ${temperatureHigh}°C`
      }
    },
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 10000,
    series: [
      {
        name: map,
        type: 'map',
        map: map,
        roam: false,
        nameMap: {
          china: '中国'
        },
        label: {
          show: true,
          color: '#f1f4ed',
          fontSize: 13,
          emphasis: {
            show: true,
            color: '#fff',
            fontSize: 13
          }
        },
        itemStyle: {
          borderColor: 'dodgerblue',
          emphasis: {
            areaColor: 'darkorange'
          }
        },
        data: map === 'china' ? getProvinceData(data) : getCityData(map, data)
      }
    ]
  }
  Dmapchart.setOption(option)
}

// 地图点击事件
const handleMapClick = async (params) => {
  if (params.name in provinces) {
    try {
      const { data } = await axios.get(`/src/assets/map/province/${provinces[params.name]}.json`)
      echarts.registerMap(params.name, data)
      const d = data.features.map((feature) => ({ name: feature.properties.name }))
      renderMap(params.name, d)
    } catch (error) {
      console.error('Error loading province map data:', error)
    }
  } else if (params.seriesName in provinces) {
    if (special.includes(params.seriesName)) {
      renderMap('china', mapdata)
    } else {
      try {
        const { data } = await axios.get(`/src/assets/map/city/${cityMap[params.name]}.json`)
        echarts.registerMap(params.name, data)
        const d = data.features.map((feature) => ({ name: feature.properties.name }))
        renderMap(params.name, d)
      } catch (error) {
        console.error('Error loading city map data:', error)
      }
    }
  } else {
    console.log(params.seriesName, params.name)
    goCity(nowProvince.value, mapCityPost[params.seriesName], params.name)
    // renderMap('china', mapdata)
  }
}

// 挂载时初始化
onMounted(async () => {
  await getWeather()
  Dmapchart = echarts.init(dmapContainer.value)
  initMap()
  Dmapchart.on('click', handleMapClick)
  console.log('DayWeather:', oneDayWeather.value, minTemperature, maxTemperature)
})
</script>

<template>
  <div class="dynamic-map">
    <el-button class="map-button" @click="renderMap('china', mapdata)"> back </el-button>
    <div class="dmap-container" ref="dmapContainer"></div>
  </div>
</template>

<style>
.dynamic-map {
  width: 100%;
  height: 100%;
}
.map-button {
  width: 5%;
  margin: 5px;
}
.dmap-container {
  width: 95%;
  height: 90%;
}
</style>
