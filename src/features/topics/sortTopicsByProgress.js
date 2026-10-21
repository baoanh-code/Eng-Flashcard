function progressRank(progress) {
  if (progress.total > 0 && progress.learned === progress.total) return 2
  if (progress.learned > 0 || progress.review > 0) return 1
  return 0
}

export function sortTopicsByProgress(topics, getProgress) {
  return topics
    .map((topic, index) => ({ index, progress: getProgress(topic), topic }))
    .sort((left, right) => progressRank(left.progress) - progressRank(right.progress) || left.index - right.index)
    .map(({ topic }) => topic)
}
