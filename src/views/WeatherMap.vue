<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  init()
})

// 初始化地图
const init = () => {
  let Bmap = window.BMap // 注意要带window，不然会报错（注意官方api,会有改动，之前是Bmap,后面3.0版本改为了BMap,最好查文档或者打印一下window）
  var map = new Bmap.Map("weather-container")// allmap必须和dom上的id一直
  map.centerAndZoom(
    new Bmap.Point(104.04263635868074, 30.556100647961866),
    11
  )// 初始化地图,设置中心点坐标和地图级别
  // map.setCurrentCity("成都")
  map.enableScrollWheelZoom(true)
}


</script>

<template>
  <div class="weather-container" id="weather-container"></div>
</template>

<style>
.weather-container {
  width: 100%;
  height: 100%;
  background-color: pink;
}
</style>
