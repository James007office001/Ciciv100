/**
 * 全局常量配置
 * 定义整个应用的常量值，包括颜色、尺寸、API端点等
 */

// 应用基础配置
export const APP_CONFIG = {
  // 应用信息
  APP_NAME: 'CICI',
  VERSION: '1.0.0',
  
  // API配置
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.cici.app' 
    : 'http://localhost:3000',
  API_TIMEOUT: 10000,
  
  // 分页配置
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
}

// iOS 26 无色毛玻璃视觉语言设计系统
export const DESIGN_SYSTEM = {
  // 毛玻璃效果配置
  GLASS_EFFECTS: {
    // 主要毛玻璃效果
    PRIMARY: {
      backdrop: 'blur(20px)',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    // 次要毛玻璃效果
    SECONDARY: {
      backdrop: 'blur(12px)',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
    },
    // 卡片毛玻璃效果
    CARD: {
      backdrop: 'blur(16px)',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)'
    },
    // 导航栏毛玻璃效果
    NAVIGATION: {
      backdrop: 'blur(24px)',
      background: 'rgba(255, 255, 255, 0.12)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)'
    }
  },

  // 颜色系统
  COLORS: {
    // 主色调 - 水晶球渐变色
    PRIMARY: {
      DEFAULT: '#FFD700',
      GRADIENT: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      LIGHT: '#FFED4E',
      DARK: '#E6C200'
    },
    
    // 语义颜色
    SEMANTIC: {
      SUCCESS: '#34C759',
      WARNING: '#FF9500',
      ERROR: '#FF3B30',
      INFO: '#007AFF'
    },
    
    // 文本颜色
    TEXT: {
      PRIMARY: 'rgba(0, 0, 0, 0.9)',
      SECONDARY: 'rgba(0, 0, 0, 0.6)',
      TERTIARY: 'rgba(0, 0, 0, 0.4)',
      PLACEHOLDER: 'rgba(0, 0, 0, 0.3)',
      INVERSE: 'rgba(255, 255, 255, 0.9)'
    },
    
    // 背景颜色
    BACKGROUND: {
      PRIMARY: '#F2F2F7',
      SECONDARY: '#FFFFFF',
      TERTIARY: '#F9F9FB',
      OVERLAY: 'rgba(0, 0, 0, 0.4)'
    }
  },

  // 字体系统
  TYPOGRAPHY: {
    FONT_FAMILY: {
      PRIMARY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      MONO: 'SF Mono, Monaco, monospace'
    },
    
    FONT_SIZES: {
      TITLE_LARGE: '34px',
      TITLE: '28px',
      HEADLINE: '22px',
      SUBHEADLINE: '20px',
      BODY: '17px',
      CALLOUT: '16px',
      FOOTNOTE: '13px',
      CAPTION: '12px'
    },
    
    FONT_WEIGHTS: {
      LIGHT: 300,
      REGULAR: 400,
      MEDIUM: 500,
      SEMIBOLD: 600,
      BOLD: 700
    },
    
    LINE_HEIGHTS: {
      TIGHT: 1.2,
      NORMAL: 1.4,
      RELAXED: 1.6
    }
  },

  // 间距系统
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px',
    XXL: '48px'
  },

  // 圆角系统
  RADIUS: {
    XS: '4px',
    SM: '8px',
    MD: '12px',
    LG: '16px',
    XL: '20px',
    FULL: '50%'
  },

  // 阴影系统
  SHADOWS: {
    SM: '0 1px 2px rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 4px 12px rgba(0, 0, 0, 0.1)',
    MD: '0 8px 24px rgba(0, 0, 0, 0.12)',
    LG: '0 16px 48px rgba(0, 0, 0, 0.15)',
    XL: '0 24px 64px rgba(0, 0, 0, 0.2)'
  }
}

// 动画配置
export const ANIMATIONS = {
  // 动画持续时间
  DURATION: {
    FAST: '0.2s',
    DEFAULT: '0.3s',
    SLOW: '0.5s'
  },
  
  // 缓动函数
  EASING: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    SMOOTH: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
  },
  
  // 水晶球动画
  CRYSTAL_BALL: {
    BREATHING: 'crystalBreathing 1.5s ease-in-out infinite alternate',
    GLOW: 'crystalGlow 2s ease-in-out infinite',
    RIPPLE: 'crystalRipple 0.6s ease-out'
  }
}

// 尺寸配置
export const DIMENSIONS = {
  // 导航栏高度
  HEADER_HEIGHT: '44px',
  HEADER_HEIGHT_ANDROID: '48px',
  
  // 底部导航高度
  TAB_BAR_HEIGHT: '49px',
  TAB_BAR_HEIGHT_ANDROID: '56px',
  
  // 水晶球尺寸
  CRYSTAL_BALL_SIZE: '56px',
  
  // 安全区域
  SAFE_AREA_TOP: 'env(safe-area-inset-top)',
  SAFE_AREA_BOTTOM: 'env(safe-area-inset-bottom)',
  SAFE_AREA_LEFT: 'env(safe-area-inset-left)',
  SAFE_AREA_RIGHT: 'env(safe-area-inset-right)'
}

// 功能模块配置
export const MODULES = {
  // Tab配置
  TABS: [
    {
      id: 'schedule',
      name: '日程',
      icon: 'calendar',
      route: '/schedule'
    },
    {
      id: 'discover',
      name: '发现',
      icon: 'search',
      route: '/discover'
    },
    {
      id: 'message',
      name: '消息',
      icon: 'message',
      route: '/message'
    },
    {
      id: 'profile',
      name: '我的',
      icon: 'person',
      route: '/profile'
    }
  ],
  
  // 快速输入功能
  QUICK_INPUT: {
    ACTIONS: [
      { id: 'text', name: '文字', icon: 'text', color: '#007AFF' },
      { id: 'voice', name: '语音', icon: 'mic', color: '#34C759' },
      { id: 'photo', name: '拍照', icon: 'camera', color: '#FF9500' },
      { id: 'video', name: '视频', icon: 'videocam', color: '#FF3B30' },
      { id: 'activity', name: '活动', icon: 'calendar-add', color: '#5856D6' },
      { id: 'location', name: '签到', icon: 'location', color: '#AF52DE' }
    ]
  }
}

// 用户角色配置
export const USER_ROLES = {
  USER: 'user',           // 普通用户
  BLOGGER: 'blogger',     // 博主
  ADMIN: 'admin'          // 管理员
}

// 权限配置
export const PERMISSIONS = {
  // 内容权限
  CONTENT: {
    CREATE_POST: 'content:create_post',
    CREATE_ACTIVITY: 'content:create_activity',
    MODERATE_CONTENT: 'content:moderate'
  },
  
  // 用户权限
  USER: {
    MANAGE_PROFILE: 'user:manage_profile',
    MANAGE_USERS: 'user:manage_users'
  },
  
  // 订单权限
  ORDER: {
    CREATE_ORDER: 'order:create',
    MANAGE_ORDERS: 'order:manage'
  }
}

// 默认导出所有配置
export default {
  APP_CONFIG,
  DESIGN_SYSTEM,
  ANIMATIONS,
  DIMENSIONS,
  MODULES,
  USER_ROLES,
  PERMISSIONS
}
