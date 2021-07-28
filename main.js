//狀態機
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}

//宣告花色陣列
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // [0]黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // [1]愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // [2]方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // [3]梅花
]

////洗牌演算法
const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


//////////////// view 畫面
const view = {
  getCardContent(index){ //用index來決定花色和卡面數字
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    `
  },
  getCardElement(index) { //初始畫面是顯示牌背
    return `
      <div class="card back" data-index="${index}">
      </div>
    `
  },
  transformNumber(number) {
    switch(number) {
      case 1 :
        return 'A'
      case 11 :
        return 'J'
      case 12 :
        return 'Q'
      case 13 :
        return 'K'
      default :
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes
    .map(index => this.getCardElement(index))
    .join('')
  },
  flipCards( ... cards) {
    cards.map(card => {
      //若點擊到的class是背面
    if (card.classList.contains('back')) {
      //移除背面class，顯示花色和數字
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
    //若點擊到的class是正面，翻成背面，不顯示牌花色和數字，清空HTML
    card.classList.add('back')
    card.innerHTML = null
    })
  },
  pairCards( ... cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times.`
  },
  appendWrongAnimation( ... cards) {
    cards.map(card => {
      card.classList.add('wrong')
    card.addEventListener('animationend', event => {
        card.classList.remove('wrong')
      },
      {
        once: true //使監聽器僅一次性出現，降低瀏覽器負擔
      }
    )
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}!</p>
      <p>You have tried: ${model.triedTimes} times.</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

/////////////// model 資料
const model = {
  revealedCards: [],
  isRevealedCardMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
}

/////////////// controller 狀態控制
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray (52))
  },

  //依照遊戲不同狀態，做不同行為
  dispatchCardAction(card) {
    if(!card.classList.contains('back')){
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        if (model.isRevealedCardMatched()) { //如果配對正確
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 260 ) { //配對正確情況下，滿260分
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits
        } else { //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards,1000) //一秒
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits //如果這邊用this取代controller，this會是setTimeout
  }
}

controller.generateCards() //遊戲一開始的初始畫面

//在每張卡片綁定監聽器
document.querySelectorAll('.card') //會取得有52個元素的NodeList
  .forEach(card => {
    card.addEventListener('click', event => {
      //view.appendWrongAnimation(card)
      controller.dispatchCardAction(card)
    })
  })

