import request from '@/utils/request'

export const testWeatherInfo = () => {
  return request.get('/test/show')
}

export const getProvinceWeather = (province) => {
  return request.get('/test/select01', { params: { province } })
}

export const getAllProvinces = () => {
  return request.get('/test/provinces')
}

export const getCityWeather = (province, city) => {
  return request.get('/test/select02', { params: { province, city } })
}

export const getOneDayWeather = () => {
  return request.get('/test/showOneDay')
}

export const getPredictionWeather = (province, city, area) => {
  return request.get('/test/prediction', { params: { province, city, area } })
}
