const getMatchingPatterns = (regex, tiles) => {
  const patterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  return patterns.reduce((sets, pattern) => {
    const normalized = pattern
      .map((tileIndex) => {
        return tiles[tileIndex]
      })
      .join('')

    if (regex.test(normalized)) {
      sets.push(pattern)
    }

    return sets
  }, [])
}

const getFutureWinningIndex = (tiles) => {
  let index = -1
  const player = /(ex{2}|x{2}e|xex)/i
  const ai = /(eo{2}|o{2}e|oeo)/i

  const set = [...getMatchingPatterns(player, tiles), ...getMatchingPatterns(ai, tiles)]

  if (set.length) {
    set.pop().forEach((tileIndex) => {
      if (tiles[tileIndex] === 'e') {
        index = tileIndex
      }
    })
  }

  return index
}

export default {
  AI: (tiles) => {
    const mostLogicalIndex = getFutureWinningIndex(tiles)

    if (mostLogicalIndex !== -1) {
      return mostLogicalIndex
    } else {
      const opt = tiles
        .map((element, index) => {
          if (element === 'e') {
            return index
          }
        })
        .filter(Boolean)

      if (!opt.length) {
        return -1
      }

      return opt[~~(Math.random() * opt.length)]
    }
  },
  getWinner: (tiles) => {
    const regex = /(x{3}|o{3})/i
    const set = getMatchingPatterns(regex, tiles)

    if (set) {
      return tiles[set.join('')[0]]
    }

    return false
  },
}
