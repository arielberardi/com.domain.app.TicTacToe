import { Lightning } from '@lightningjs/sdk'
import Utils from './lib/GameUtils'

export default class Game extends Lightning.Component {
  static _template() {
    return {
      Game: {
        PlayerPosition: {
          rect: true,
          w: 250,
          h: 250,
          color: 0x40ffffff,
          x: 425,
          y: 125,
        },
        Field: {
          x: 400,
          y: 100,
          children: [
            { rect: true, w: 1, h: 5, y: 300 },
            { rect: true, w: 1, h: 5, y: 600 },
            { rect: true, w: 5, h: 1, x: 300, y: 0 },
            { rect: true, w: 5, h: 1, x: 600, y: 0 },
          ],
        },
        Markers: {
          x: 400,
          y: 100,
        },
        ScoreBoard: {
          x: 100,
          y: 170,
          Player: { text: { text: 'Player 0', fontSize: 29, fontFace: 'pixel' } },
          Ai: { y: 40, text: { text: 'Computer 0', fontSize: 29, fontFace: 'pixel' } },
        },
      },
      Notification: {
        x: 100,
        y: 170,
        alpha: 0,
        text: { fontSize: 70, fontFace: 'pixel' },
      },
    }
  }

  _construct() {
    this._index = 0
    this._aiScore = 0
    this._playerScore = 0
  }

  _active() {
    this._reset()

    this.tag('Field').children.forEach((element, index) => {
      element.setSmooth(index < 2 ? 'w' : 'h', 900, { duration: 0.7, delay: index * 0.15 })
    })
  }

  _reset() {
    this._tiles = ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e']

    this.render(this._tiles)

    this._setState('')
  }

  render(tiles) {
    this.tag('Markers').children = tiles.map((tile, index) => {
      return {
        x: (index % 3) * 300 + 110,
        y: ~~(index / 3) * 300 + 90,
        text: { text: tile === 'e' ? '' : `${tile}`, fontSize: 100 },
      }
    })
  }

  _handleUp() {
    let index = this._index

    if (index - 3 >= 0) {
      this._setIndex(index - 3)
    }
  }

  _handleDown() {
    let index = this._index

    if (index + 3 <= this._tiles.length - 1) {
      this._setIndex(index + 3)
    }
  }

  _handleLeft() {
    let index = this._index

    if (index % 3) {
      this._setIndex(index - 1)
    }
  }

  _handleRight() {
    const index = this._index + 1

    if (index % 3) {
      this._setIndex(index)
    }
  }

  _handleEnter() {
    if (this._tiles[this._index] === 'e') {
      if (this.place(this._index, 'X')) {
        this._setState('Computer')
      }
    }
  }

  _setIndex(index) {
    this.tag('PlayerPosition').patch({
      smooth: { x: (index % 3) * 300 + 425, y: ~~(index / 3) * 300 + 125 },
    })

    this._index = index
  }

  place(index, marker) {
    this._tiles[index] = marker
    this.render(this._tiles)

    const winner = Utils.getWinner(this._tiles)
    if (winner) {
      this._setState('End.Winner', [{ winner }])
      return false
    }

    return true
  }

  static _states() {
    return [
      class Computer extends this {
        $enter() {
          const position = Utils.AI(this._tiles)

          if (position === -1) {
            this._setState('End.Tie')
            return false
          }

          setTimeout(() => {
            if (this.place(position, 'O')) {
              this._setState('')
            }
          }, ~~(Math.random() * 1200) + 200)

          this.tag('PlayerPosition').setSmooth('alpha', 0)
        }

        _captureKey() {}

        $exit() {
          this.tag('PlayerPosition').setSmooth('alpha', 1)
        }
      },
      class End extends this {
        _handleEnter() {
          this._reset()
        }
        $exit() {
          this.patch({
            Game: {
              smooth: { alpha: 1 },
            },
            Notification: {
              text: { text: '' },
              smooth: { alpha: 0 },
            },
          })
        }
        static _states() {
          return [
            class Winner extends this {
              $enter(args, { winner }) {
                if (winner === 'X') {
                  this._playerScore += 1
                } else {
                  this._aiScore += 1
                }

                this.patch({
                  Game: {
                    smooth: { alpha: 0 },
                    ScoreBoard: {
                      Player: { text: { text: `Player ${this._playerScore}` } },
                      Ai: { text: { text: `Computer ${this._aiScore}` } },
                    },
                  },
                  Notification: {
                    smooth: { alpha: 1 },
                    text: {
                      text: `${
                        winner == 'X' ? 'Player' : 'Computer'
                      } wins (press enter to continue)`,
                    },
                  },
                })
              }
            },
            class Tie extends this {
              $enter() {
                this.patch({
                  Game: {
                    smooth: { alpha: 0 },
                  },
                  Notification: {
                    smooth: { alpha: 1 },
                    text: { text: 'Tie (press enter to try again)' },
                  },
                })
              }
            },
          ]
        }
      },
    ]
  }
}
