export const stringToNumber = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = hash * 31 + str.charCodeAt(i)
  }
  return hash
}

export const changeTemperature = (temperature, str) => {
  const hash = stringToNumber(str)
  let step

  step = 1 + (hash % 2)



  // 确保温度在合理范围内
  temperature = Math.max(-100, Math.min(100, temperature))

  // 根据哈希值调整温度
  if (hash % 2 === 0) {
    temperature += step
  } else {
    temperature -= step
  }

  // 确保温度在指定范围内
  const upperBound = temperature + 3
  const lowerBound = temperature - 5
  temperature = Math.min(upperBound, Math.max(lowerBound, temperature))

  return temperature
}
