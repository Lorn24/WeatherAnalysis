self.onmessage = (event) => {
  if (event.data.type === 'updateParticles') {
    const updatedParticles = updateParticles(event.data.particles)
    self.postMessage({ type: 'particlesUpdated', particles: updatedParticles })
  }
}

const updateParticles = (particles) => {
  // 在 Worker 中更新粒子系统的逻辑
  particles.forEach((particle) => {
    // 更新粒子的属性，如位置、速度、颜色等
    particle.x += particle.vx
    particle.y += particle.vy
    particle.alpha -= 0.01
  })

  // 过滤掉已经消失的粒子
  return particles.filter((particle) => particle.alpha > 0)
}