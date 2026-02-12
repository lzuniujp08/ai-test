/**
 * 公共工具函数模块
 */

/**
 * 日志输出函数
 * @param {String} message - 日志消息
 * @param {*} data - 附加数据
 */
export function log(message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry, data || '');
}
/**
 * 颜色加深/变浅
 * @param {String} color - 颜色值（HEX格式，如 #1890ff）
 * @param {Number} percent - 变化百分比（正数为加深，负数为变浅）
 * @returns {String} 新的颜色值
 */
export function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

/**
 * 创建控制面板
 * @param {Object} options - 配置选项
 * @param {String} [options.title] - 面板标题
 * @param {String} [options.subtitle] - 副标题
 * @param {Number} [options.width] - 面板宽度
 * @param {Number} [options.maxHeight] - 最大高度
 * @returns {HTMLElement} 面板元素
 */
export function createControlPanel(options = {}) {
  const {
    title = '控制面板',
    subtitle = '',
    width = 240,
    maxHeight = '85vh',
    position = 'left'
  } = options;

  const panel = document.createElement('div');
  panel.className = 'control-panel';
  panel.style.cssText = `
    position: absolute;
    top: 10px;
    ${position}: 10px;
    z-index: 1000;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    width: ${width}px;
    max-height: ${maxHeight};
    overflow-y: auto;
  `;

  if (title || subtitle) {
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.style.cssText = 'margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e8e8e8;';

    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      h3.style.cssText = 'margin: 0 0 4px 0; font-size: 16px; color: #1890ff;';
      header.appendChild(h3);
    }

    if (subtitle) {
      const p = document.createElement('p');
      p.textContent = subtitle;
      p.style.cssText = 'margin: 0; font-size: 12px; color: #999;';
      header.appendChild(p);
    }

    panel.appendChild(header);
  }

  return panel;
}

/**
 * 创建按钮
 * @param {String} text - 按钮文本
 * @param {Function} onClick - 点击事件处理器
 * @param {String} [color='#1890ff'] - 按钮颜色
 * @returns {HTMLButtonElement} 按钮元素
 */
export function createButton(text, onClick, color = '#1890ff') {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    margin: 5px 0;
    background: ${color};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  `;
  btn.addEventListener('click', onClick);
  btn.addEventListener('mouseenter', () => btn.style.background = shadeColor(color, 20));
  btn.addEventListener('mouseleave', () => btn.style.background = color);
  return btn;
}

/**
 * 创建分组容器
 * @param {String} title - 分组标题
 * @returns {HTMLElement} 分组容器元素
 */
export function createSection(title) {
  const div = document.createElement('div');
  div.style.cssText = 'margin-top: 15px; padding-top: 10px; border-top: 1px solid #e8e8e8;';
  const h4 = document.createElement('h4');
  h4.textContent = title;
  h4.style.cssText = 'margin: 0 0 8px 0; font-size: 13px; color: #666; font-weight: 500;';
  div.appendChild(h4);
  return div;
}

/**
 * 创建下拉选择器
 * @param {Array<{value: String, label: String}>} options - 选项数组
 * @param {Function} onChange - 变化事件处理器
 * @returns {HTMLSelectElement} 选择器元素
 */
export function createSelect(options, onChange) {
  const select = document.createElement('select');
  select.style.cssText = `
    width: 100%;
    padding: 6px 10px;
    margin: 5px 0;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 13px;
    background: white;
    cursor: pointer;
  `;
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });
  select.addEventListener('change', onChange);
  return select;
}

/**
 * 创建滑块
 * @param {Number} min - 最小值
 * @param {Number} max - 最大值
 * @param {Number} value - 初始值
 * @param {String} label - 标签文本
 * @param {Function} onChange - 变化事件处理器
 * @returns {HTMLElement} 滑块容器元素
 */
export function createSlider(min, max, value, label, onChange) {
  const container = document.createElement('div');
  container.style.cssText = 'margin: 8px 0;';

  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = 'display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 4px;';
  const nameLabel = document.createElement('span');
  nameLabel.textContent = label;
  const valueLabel = document.createElement('span');
  valueLabel.textContent = value.toFixed(2);
  labelDiv.appendChild(nameLabel);
  labelDiv.appendChild(valueLabel);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.value = value;
  slider.step = (max - min) / 100;
  slider.style.cssText = 'width: 100%; cursor: pointer;';
  slider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valueLabel.textContent = val.toFixed(2);
    onChange(val);
  });

  container.appendChild(labelDiv);
  container.appendChild(slider);
  return container;
}

/**
 * 创建文本输入框
 * @param {String} placeholder - 占位符文本
 * @param {Function} onEnter - 回车事件处理器
 * @returns {HTMLInputElement} 输入框元素
 */
export function createInput(placeholder, onEnter) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.style.cssText = `
    width: 100%;
    padding: 8px 10px;
    margin: 5px 0;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 13px;
  `;
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter(e.target.value.trim(), e);
    }
  });
  return input;
}

/**
 * 创建输出日志面板
 * @returns {HTMLElement} 输出面板元素
 */
export function createOutputPanel() {
  const output = document.createElement('pre');
  output.id = 'output';
  output.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.8);
    color: #0f0;
    padding: 15px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    z-index: 1000;
  `;
  output.innerHTML = '<div style="color: #888;">等待操作...</div>';
  return output;
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}

/**
 * 深度克隆对象
 * @param {*} obj - 要克隆的对象
 * @returns {*} 克隆后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}
