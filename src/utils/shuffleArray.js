export function shuffleArray(values, random = Math.random) {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  if (copy.length > 1 && copy.every((value, index) => value === values[index])) {
    copy.push(copy.shift())
  }
  return copy
}
