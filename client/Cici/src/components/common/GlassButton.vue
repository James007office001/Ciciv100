<!--
  毛玻璃按钮组件
  iOS 26 无色毛玻璃风格的按钮
-->
<template>
  <view 
    class="glass-button"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      {
        'btn-disabled': disabled,
        'btn-loading': loading,
        'btn-dark': isDark,
        'btn-block': block,
        'btn-round': round
      }
    ]"
    :style="buttonStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 按钮背景 -->
    <view class="btn-background"></view>
    
    <!-- 按钮内容 -->
    <view class="btn-content">
      <!-- 图标 -->
      <view v-if="icon && !loading" class="btn-icon" :class="{ 'icon-right': iconPosition === 'right' }">
        <text class="custom-icon" :class="`icon-${icon}`"></text>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="btn-loading-icon">
        <view class="loading-spinner"></view>
      </view>
      
      <!-- 文字 -->
      <text v-if="text || $slots.default" class="btn-text">
        <slot>{{ text }}</slot>
      </text>
    </view>
    
    <!-- 水波纹效果 -->
    <view class="btn-ripple" ref="ripple"></view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { useAppStore } from '../../store/modules/app.js'

export default {
  name: 'GlassButton',
  props: {
    // 按钮文字
    text: {
      type: String,
      default: ''
    },
    // 按钮变体
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'accent', 'ghost', 'outline', 'text'].includes(value)
    },
    // 按钮尺寸
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 图标
    icon: {
      type: String,
      default: ''
    },
    // 图标位置
    iconPosition: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 是否块级元素
    block: {
      type: Boolean,
      default: false
    },
    // 是否圆形
    round: {
      type: Boolean,
      default: false
    },
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
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
    const isPressed = ref(false)
    
    // 是否暗色模式
    const isDark = computed(() => {
      return props.dark || appStore.isDarkMode
    })
    
    // 按钮样式
    const buttonStyle = computed(() => {
      return {
        ...props.customStyle
      }
    })
    
    // 点击事件
    const handleClick = (event) => {
      if (props.disabled || props.loading) return
      
      emit('click', event)
      
      // 添加水波纹效果
      createRipple(event)
      
      // 触觉反馈
      uni.vibrateShort({
        type: 'light'
      })
    }
    
    // 触摸开始
    const handleTouchStart = () => {
      if (props.disabled || props.loading) return
      isPressed.value = true
    }
    
    // 触摸结束
    const handleTouchEnd = () => {
      isPressed.value = false
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
      rippleEl.classList.add('btn-ripple-active')
      
      setTimeout(() => {
        rippleEl.classList.remove('btn-ripple-active')
      }, 600)
    }
    
    return {
      isDark,
      buttonStyle,
      isPressed,
      handleClick,
      handleTouchStart,
      handleTouchEnd,
      ripple
    }
  }
}
</script>

<style lang="scss" scoped>
.glass-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-lg);
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--duration-fast) var(--easing-default);
  
  &:active {
    transform: scale(0.96);
  }
  
  &.btn-block {
    display: flex;
    width: 100%;
  }
  
  &.btn-round {
    border-radius: var(--radius-full);
  }
  
  &.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &.btn-loading {
    cursor: default;
    pointer-events: none;
  }
}

.btn-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  transition: all var(--duration-fast) var(--easing-default);
  
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
    height: 50%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 100%
    );
    border-radius: inherit;
    pointer-events: none;
  }
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.icon-right {
    order: 2;
  }
  
  .custom-icon {
    transition: transform var(--duration-fast) var(--easing-default);
  }
}

.btn-loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

.btn-text {
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  white-space: nowrap;
}

.btn-ripple {
  position: absolute;
  border-radius: var(--radius-full);
  transform: scale(0);
  z-index: 1;
  pointer-events: none;
  
  &.btn-ripple-active {
    animation: ripple 0.6s ease-out;
  }
}

/* 尺寸变体 */
.btn-small {
  height: 32px;
  padding: 0 var(--spacing-sm);
  min-width: 64px;
  
  .btn-text {
    font-size: var(--font-size-footnote);
  }
  
  .btn-icon .custom-icon {
    font-size: 14px;
  }
  
  .loading-spinner {
    width: 12px;
    height: 12px;
  }
}

.btn-medium {
  height: 44px;
  padding: 0 var(--spacing-md);
  min-width: 88px;
  
  .btn-text {
    font-size: var(--font-size-callout);
  }
  
  .btn-icon .custom-icon {
    font-size: 18px;
  }
}

.btn-large {
  height: 52px;
  padding: 0 var(--spacing-lg);
  min-width: 104px;
  
  .btn-text {
    font-size: var(--font-size-headline);
  }
  
  .btn-icon .custom-icon {
    font-size: 20px;
  }
  
  .loading-spinner {
    width: 20px;
    height: 20px;
  }
}

/* 变体样式 */
.btn-primary {
  .btn-background {
    background: var(--glass-primary);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
  }
  
  .btn-text {
    color: white;
  }
  
  .btn-icon .custom-icon {
    color: white;
  }
  
  .btn-ripple {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:hover .btn-background {
    background: var(--glass-primary-hover);
  }
}

.btn-secondary {
  .btn-background {
    background: var(--glass-secondary);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
  }
  
  .btn-text {
    color: var(--color-text-primary);
  }
  
  .btn-icon .custom-icon {
    color: var(--color-text-primary);
  }
  
  .btn-ripple {
    background: rgba(var(--color-text-primary), 0.2);
  }
}

.btn-accent {
  .btn-background {
    background: var(--glass-accent);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
  }
  
  .btn-text {
    color: white;
  }
  
  .btn-icon .custom-icon {
    color: white;
  }
  
  .btn-ripple {
    background: rgba(255, 255, 255, 0.3);
  }
}

.btn-ghost {
  .btn-background {
    background: transparent;
  }
  
  .btn-text {
    color: var(--color-primary);
  }
  
  .btn-icon .custom-icon {
    color: var(--color-primary);
  }
  
  .btn-ripple {
    background: rgba(var(--color-primary), 0.2);
  }
  
  &:hover .btn-background {
    background: rgba(var(--color-primary), 0.1);
  }
}

.btn-outline {
  .btn-background {
    background: transparent;
    border: 2px solid var(--color-primary);
  }
  
  .btn-text {
    color: var(--color-primary);
  }
  
  .btn-icon .custom-icon {
    color: var(--color-primary);
  }
  
  .btn-ripple {
    background: rgba(var(--color-primary), 0.2);
  }
  
  &:hover .btn-background {
    background: rgba(var(--color-primary), 0.1);
  }
}

.btn-text {
  .btn-background {
    background: transparent;
  }
  
  .btn-text {
    color: var(--color-primary);
  }
  
  .btn-icon .custom-icon {
    color: var(--color-primary);
  }
  
  .btn-ripple {
    background: rgba(var(--color-primary), 0.2);
  }
  
  &:hover .btn-background {
    background: rgba(var(--color-primary), 0.05);
  }
}

/* 暗色模式 */
.btn-dark {
  &.btn-secondary {
    .btn-text {
      color: rgba(255, 255, 255, 0.9);
    }
    
    .btn-icon .custom-icon {
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .btn-background::after {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 100%
    );
  }
}

/* 动画定义 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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

/* 响应式适配 */
@media (max-width: 375px) {
  .btn-medium {
    height: 40px;
    min-width: 80px;
  }
  
  .btn-large {
    height: 48px;
    min-width: 96px;
  }
}

/* 特殊效果 */
.glass-button:hover .btn-icon .custom-icon {
  transform: scale(1.1);
}

.glass-button:active .btn-background::after {
  opacity: 0.5;
}
</style>
