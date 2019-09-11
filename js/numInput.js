class NumInput {
  constructor() {
    document.addEventListener('touchstart', ev => {//监听屏幕点击事件
      if ([...ev.target.classList].includes('numInput')) {//点击的是输入框
        this.inputWork(ev.target);
        this.cursorPositionLeft(ev.targetTouches[0].clientX);
      } else if (ev.target.className == "keyBox" || ev.target.parentNode.className === 'keyBox' || ev.target.tagName == "svg" || ev.target.tagName == 'path') {//点击键盘数字区域
        return false
      } else { //点击键盘关闭按钮或其他区域
        this._cursor.style.display = 'none';//隐藏光标
        this.showKey(false);
        this._input = null;
      }
    })
  }
  /**
   * 初始化键盘
   */
  init() {
    var fragment = document.createDocumentFragment();
    let style = document.createElement('style');//head中插入style并添加样式
    style.innerHTML = `.keyBoard{position: fixed;bottom: 0;left: 0;width: 100%;background: #d0d3da;display: none;transition: all 0.20s linear;}
      .close{display: flex;justify-content: center;width: 100%;text-align: center;font-size: 10px;color: #000000;line-height: 20px;height: 20px;border-top: 1px solid #f1f1f1;}
      .close::after{content: '';display: block;width: 10px;height: 10px;border-top: 1px solid #999;border-left: 1px solid #999;transform: rotate(-135deg);}.keyBox{display: flex;flex-wrap: wrap;justify-content: space-evenly;}
      .keyBox div{width: calc(100% / 3 - 6px);margin-bottom: 6px;border-radius:6px;box-shadow:0px 1px 0px #878b8e;text-align: center;font-size: 24px;line-height: 44px;height: 47px;background: #fff;}.keyBox div:nth-child(3n+3){border-right: none;}
      .keyCursor{display: none;position: absolute;top:0;left: 0;width: 2px;height: 40px;background: #000000;animation: blink 1s infinite steps(1, start);}.keyBox .gray{background: none;box-shadow: none;}.keyBox div svg{margin-top:7px;}
      @keyframes blink {0%{background-color: white;}50% {background-color: black;}100% {background-color: white;}}.valbox{position:fixed;left:999px;opacity: 0}.occupancy{display: none;height: 234px;}`
    document.getElementsByTagName("head")[0].appendChild(style);
    this._cursor = document.createElement('div');//光标
    this._cursor.setAttribute("class", "keyCursor");
    fragment.appendChild(this._cursor)
    this._valbox = document.createElement('div');//光标截取值的val容器
    this._valbox.setAttribute("class", "valbox");
    fragment.appendChild(this._valbox)
    this._input; //当前输入框
    this._occupancy = document.createElement('div'); //页面底部添加滑动占位
    this._occupancy.setAttribute("class", 'occupancy');
    fragment.appendChild(this._occupancy)
    this._keyBoard = document.createElement("div"); //键盘
    this._keyBoard.setAttribute("class", "keyBoard");
    this._keyBoard.innerHTML = `
      <div><span class="close"></span></div>
      <div class="keyBox">
        <div>1</div><div>2</div><div>3</div>
        <div>4</div><div>5</div><div>6</div>
        <div>7</div><div>8</div><div>9</div>
        <div class="gray numX"></div><div>0</div><div class="gray del">
          <svg t="1559553624096" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="31681" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32"><defs><style type="text/css"></style></defs><path d="M875.593995 186.122001l-484.791311 0c-13.570063 0-26.584472 5.390777-36.178991 14.986319L79.908958 475.821009c-9.595542 9.595542-14.986319 22.60995-14.986319 36.178991s5.390777 26.584472 14.986319 36.178991l274.713712 274.711665c9.595542 9.595542 22.608927 14.986319 36.178991 14.986319l484.791311 0c46.033429 0 83.48439-37.449937 83.48439-83.483366L959.077362 269.606391C959.078385 223.572962 921.627425 186.122001 875.593995 186.122001zM907.913075 754.395656c0 17.84953-14.471596 32.318056-32.31908 32.318056l-484.791311 0L116.088972 512.001023 390.802684 237.287311l484.791311 0c17.848507 0 32.31908 14.46955 32.31908 32.31908L907.913075 754.395656z" p-id="31682" fill="#000000"></path><path d="M753.945401 360.214015 632.515794 481.642598 511.085164 360.214015c0 0-16.061814-8.224312-30.356378 6.072299-14.294564 14.294564-6.072299 30.356378-6.072299 30.356378l121.429607 121.428583L486.800062 627.357308c0 0-8.222265 16.061814 6.072299 30.356378 14.296611 14.296611 30.357402 6.072299 30.357402 6.072299l109.286032-109.285009 109.286032 109.285009c0 0 16.061814 8.224312 30.357402-6.072299 14.294564-14.294564 6.070252-30.356378 6.070252-30.356378L668.944472 518.072299 790.375102 396.642692c0 0 8.220219-16.061814-6.074346-30.356378C770.007215 351.989703 753.945401 360.214015 753.945401 360.214015z" p-id="31683" fill="#000000"></path></svg>
        </div>
      </div>`;
    fragment.appendChild(this._keyBoard)
    document.body.appendChild(fragment, document.body.firstElementChild);
    this._keyBoard.addEventListener('touchstart', ev => { //绑定键盘点击事件
      if ("0123456789x".indexOf(ev.target.innerText) > -1) {
        if (this._input.value.length >= this._maxValLength) return;
        this.setValue(ev.target.innerText);
      } else if(ev.target.className == 'keyBox'){
        return
      } else {//点击删除键
        this.deleteValue();
        this.cursorPositionLeft();
      }
    })
  }
  /**
   * 用户点击input
   * @param {object} el input对象
   */
  inputWork(el) {
    let oldInput = this._input;
    this._input = el;
    if(!oldInput){
      this.nBlur();
    }else if(oldInput != this._input){
      this.nFocus(oldInput);
      this.nBlur();
    }
    let inputStyle = window.getComputedStyle(this._input);// 获取当前输入框所有浏览器计算后的样式
    this._maxValLength = this._input.getAttribute('maxLength') ? this._input.getAttribute('maxLength') : '6'; // 输入框的maxLength
    if (this._input.getAttribute('type') == 'number') { //输入框type为非number时显示x键
      document.querySelector('.numX').innerHTML = ''
    } else {
      document.querySelector('.numX').innerHTML = 'x'
    }
    this._valbox.style.cssText += `font-size:${inputStyle.fontSize};font-weight:${inputStyle.fontWeight};font-family:${inputStyle.fontFamily};letter-spacing:${inputStyle.letterSpacing};`
    this._valbox.innerHTML = '0';
    this._oneWordWidth = window.getComputedStyle(this._valbox).width.replace("px", "");//一个数字的宽度
    this._valbox.innerHTML = '';
    this.showKey(true);
    this._cursor.style.display = 'block'; //显示光标
    this._cursor.style.top = this._input.offsetTop + 'px'; //光标top为输入框距离页面顶端距离
    this._cursor.style.height = this._input.clientHeight + 'px';//光标高度为输入框的高度
    this.domPosition();
  }
  /**
   * 键盘是否显示
   * @param {Number} onlyShow 1:打开键盘；2:关闭键盘；
   */
  showKey(onlyShow) {
    if (onlyShow) {
      this._keyBoard.style.display = 'block';
      this._keyBoard.style.height = '234px';
    } else {
      this._occupancy ? this._occupancy.style.display = 'none' : '';
      this._keyBoard.style.height = '0';
      setTimeout(() => {
        this._keyBoard.style.display = 'none';
      }, 200);
      this.nFocus();
    }
  }
  /**
   * 为input赋值
   * @param {String} val 点击键盘增加的数据
   */
  setValue(val) {
    if (this._input.value.length > this._valbox.innerHTML.length > 0) { //光标位置在文字中央或最前面
      this._input.value = this._valbox.innerHTML + val + this._input.value.substr(this._valbox.innerHTML.length, this._input.value.length)
      this.cursorPositionLeft('', val);
    } else { //光标位置在文字最后边
      this._input.value = this._valbox.innerHTML = this._input.value + val;
      this._valbox.innerHTML = this._input.value;
      this.cursorPositionLeft()
    }
  }
  /**
   * 删除input的值
   */
  deleteValue() {
    if (this._input.value.length > this._valbox.innerHTML.length > 0) { //光标位置在文字中央或最前面
      this._input.value = this._valbox.innerHTML.substr(0, this._valbox.innerHTML.length - 1) + this._input.value.substr(this._valbox.innerHTML.length, this._input.value.length);
      this._valbox.innerHTML = this._valbox.innerHTML.substr(0, this._valbox.innerHTML.length - 1);
      this.cursorPositionLeft();
    } else { //光标位置在文字最后边
      this._input.value = this._input.value.substr(0, this._input.value.length - 1);
      this._valbox.innerHTML = this._input.value;
      this.cursorPositionLeft()
    }
  }
  /**
   * 计算光标的lef值
   * @param {Number} Cleft 点击位置距离屏幕左边距离
   * @param {String} val 点击键盘要输入的值
   */
  cursorPositionLeft(Cleft, val) {
    if (Cleft) {
      let cliLeft = Cleft - this._input.offsetLeft; //点击位置距离左边距离
      let cursorL = parseFloat(cliLeft / this._oneWordWidth); //点击位置前有几个数字
      this._valbox.innerHTML = this._input.value.substr(0, cursorL);
    } else {
      if (val) {
        this._valbox.innerHTML = this._valbox.innerHTML + val;
      }
    }
    this._cursor.style.left = parseInt(window.getComputedStyle(this._valbox).width) + this._input.offsetLeft + 'px';
  }
  /**
   * 当前选中输入框不在可视区域时，上滑页面
   */
  domPosition() {
    let [winPos, domPos, winHeight, domOuterHeight] = [window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop, this._input.offsetTop, window.screen.height, this._input.clientHeight];
    if ((domPos + domOuterHeight) > (winPos + winHeight - 234)) { //输入框在屏幕可视区域减去键盘高度之外
      this._occupancy.style.display = 'block';
      window.scrollTo({ //滑动屏幕，未添加平滑滚动，苹果手机不支持smooth，想知道咋写来找我0.0
        top: domPos - ((winHeight - 234) / 2),
        behavior: "smooth"
      });
    }
  }
  nFocus(fs) {//失去焦点事件
    if (typeof this.inputFocus === 'function') {
      this.inputFocus(fs?fs:this._input);
    }
  }
  nBlur() {//获取焦点事件
    if (typeof this.inputBlur === 'function') {
      this.inputBlur(this._input);
    }
  }
  toBlur(input) {//输入框获取焦点
    this.inputWork(input);
    this.cursorPositionLeft();
  }
  toFocus(input) {//输入框失去焦点
    if(input){
      this.inputWork(input);
    }
    this._cursor.style.display = 'none';//隐藏光标
    this.showKey(false);
  }
}