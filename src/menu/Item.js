import { Lightning } from '@lightningjs/sdk'

export default class Item extends Lightning.Component {
  static _template() {
    return {
      text: { text: '', fontFace: 'pixel', fontSize: 50 },
    }
  }

  set label(l) {
    this.text.text = l
  }

  set action(a) {
    this._action = a
  }

  get action() {
    return this._action
  }
}
