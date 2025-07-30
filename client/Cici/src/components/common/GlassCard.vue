<!--
  毛玻璃卡片组件
  iOS 26 无色毛玻璃风格的通用卡片
-->
<template>
  <view 
    class="glass-card" 
    :class="[
      `card-${variant}`,
      { 
        'card-elevated': elevated,
        'card-interactive': interactive,
        'card-rounded': rounded,
        'card-dark': isDark 
      }
    ]"
    :style="cardStyle"
    @click="handleClick"
  >
    <!-- 卡片背景层 -->
    <view class="card-background"></view>
    
    <!-- 卡片内容 -->
    <view class="card-content" :style="contentStyle">
      <!-- 头部区域 -->
      <view v-if="$slots.header || title || subtitle" class="card-header">
        <slot name="header">
          <view v-if="title || subtitle" class="header-text">
            <text v-if="title" class="card-title">{{ title }}</text>
            <text v-if="subtitle" class="card-subtitle">{{ subtitle }}</text>
          </view>
        </slot>
      </view>
      
      <!-- 主体区域 -->
      <view class="card-body">
        <slot></slot>
      </view>
      
      <!-- 底部区域 -->
      <view v-if="$slots.footer" class="card-footer">
        <slot name="footer"></slot>
      </view>
    </view>
    
    <!-- 交互反馈 -->
    <view v-if="interactive" class="card-ripple" ref="ripple"></view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { useAppStore } from '../../store/modules/app.js'

export default {
  name: 'GlassCard',
  props: {
    // 卡片变体
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary', 'accent', 'warning', 'error', 'success'].includes(value)
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 副标题
    subtitle: {
      type: String,
      default: ''
    },
    // 是否有阴影
    elevated: {
      type: Boolean,
      default: false
    },
    // 是否可交互
    interactive: {
      type: Boolean,
      default: false
    },
    // 是否圆角
    rounded: {
      type: Boolean,
      default: true
    },
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
    },
    // 内容边距
    padding: {
      type: [String, Number],
      default: 'md'
    },
    // 背景透明度
    opacity: {
      type: Number,
      default: 1
    },
    // 强制暗色模式
    dark: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['click'],
  
  setup(props, { emit }) {
    const appStore = useAppStore()
    const ripple = ref(null)
    
    // 是否暗色模式
    const isDark = computed(() => {
      return props.dark || appStore.isDarkMode
    })
    
    // 卡片样式
    const cardStyle = computed(() => {
      return {
        '--card-opacity': props.opacity,
        ...props.customStyle
      }
    })
    
    // 内容样式
    const contentStyle = computed(() => {
      const paddingMap = {
        'none': '0',
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)'
      }
      
      const paddingValue = typeof props.padding === 'number' 
        ? `${props.padding}px` 
        : paddingMap[props.padding] || paddingMap.md
      
      return {
        padding: paddingValue
      }
    })
    
    // 点击事件
    const handleClick = (event) => {
      if (!props.interactive) return
      
      emit('click', event)
      
      // 添加水波纹效果
      createRipple(event)
      
      // 触觉反馈
      uni.vibrateShort({
        type: 'light'
      })
    }
    
    // 创建水波纹效果
    const createRipple = (event) => {
      if (!ripple.value) return
      
      const rect = event.currentTarget.getBoundingClientRect?.() || {}
      const size = Math.max(rect.width || 0, rect.height || 0)
      const x = (event.touches?.[0]?.clientX || event.clientX || 0) - (rect.left || 0) - size / 2
      const y = (event.touches?.[0]?.clientY || event.clientY || 0) - (rect.top || 0) - size / 2
      
      const rippleEl = ripple.value
      rippleEl.style.width = size + 'px'
      rippleEl.style.height = size + 'px'
      rippleEl.style.left = x + 'px'
      rippleEl.style.top = y + 'px'
      rippleEl.classList.add('card-ripple-active')
      
      setTimeout(() => {
        rippleEl.classList.remove('card-ripple-active')
      }, 600)
    }
    
    return {
      isDark,
      cardStyle,
      contentStyle,
      handleClick,
      ripple
    }
  }
}
</script>

<style lang="scss" scoped>
.glass-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--duration-default) var(--easing-default);
  
  &.card-rounded {
    border-radius: var(--radius-xl);
  }
  
  &.card-elevated {
    box-shadow: var(--shadow-lg);
  }
  
  &.card-interactive {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  opacity: var(--card-opacity);
  z-index: 1;
  
  /* 毛玻璃边框 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid var(--glass-border);
    border-radius: inherit;
    pointer-events: none;
  }
  
  /* 内部高光 */
  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    height: 30%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 100%
    );
    border-radius: inherit;
    pointer-events: none;
  }
}

.card-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.card-header {
  margin-bottom: var(--spacing-sm);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: var(--font-size-headline);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.card-subtitle {
  font-size: var(--font-size-callout);
  color: var(--color-text-secondary);
  margin-top: 2px;
  line-height: var(--line-height-normal);
}

.card-body {
  flex: 1;
}

.card-footer {
  margin-top: var(--spacing-sm);
}

.card-ripple {
  position: absolute;
  border-radius: var(--radius-full);
  background: rgba(var(--color-primary), 0.3);
  transform: scale(0);
  z-index: 0;
  pointer-events: none;
  
  &.card-ripple-active {
    animation: ripple 0.6s ease-out;
  }
}

/* 卡片变体样式 */
.card-primary {
  .card-background {
    background: var(--glass-primary);
  }
  
  .card-title {
    color: var(--color-primary);
  }
}

.card-secondary {
  .card-background {
    background: var(--glass-secondary);
  }
}

.card-accent {
  .card-background {
    background: var(--glass-accent);
  }
  
  .card-title {
    color: var(--color-accent);
  }
}

.card-warning {
  .card-background {
    background: var(--glass-warning);
  }
  
  .card-title {
    color: var(--color-warning);
  }
}

.card-error {
  .card-background {
    background: var(--glass-error);
  }
  
  .card-title {
    color: var(--color-error);
  }
}

.card-success {
  .card-background {
    background: var(--glass-success);
  }
  
  .card-title {
    color: var(--color-success);
  }
}

/* 暗色模式 */
.card-dark {
  .card-background::after {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 100%
    );
  }
  
  .card-title {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .card-subtitle {
    color: rgba(255, 255, 255, 0.6);
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .card-title {
    font-size: var(--font-size-subheadline);
  }
  
  .card-subtitle {
    font-size: var(--font-size-footnote);
  }
}

/* 动画定义 */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* 卡片组合样式 */
.glass-card + .glass-card {
  margin-top: var(--spacing-md);
}

/* 特殊效果 */
.glass-card:hover .card-background::after {
  opacity: 1.5;
}

.glass-card:active .card-background {
  transform: scale(0.99);
}
</style>
