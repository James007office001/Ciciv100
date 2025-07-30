/**
 * CICI 数据库初始化和种子数据
 */

import { initializeModels, UserModel, CircleModel, PostModel } from './models.js'

/**
 * 初始化数据库
 */
export async function initializeDatabase() {
  console.log('开始初始化数据库...')
  
  // 初始化所有数据模型
  initializeModels()
  
  // 检查是否需要创建种子数据
  const users = UserModel.getAll()
  if (users.length === 0) {
    await createSeedData()
  }
  
  console.log('数据库初始化完成')
}

/**
 * 创建种子数据
 */
async function createSeedData() {
  console.log('创建种子数据...')
  
  // 创建示例用户
  const users = [
    {
      phone: '13800138000',
      name: '张小明',
      avatar: '/static/c1.png',
      bio: '热爱生活，喜欢分享',
      location: '北京市',
      gender: 'male'
    },
    {
      phone: '13912345678',
      name: '李小红',
      avatar: '/static/c2.png',
      bio: '摄影爱好者',
      location: '上海市',
      gender: 'female'
    },
    {
      phone: '15800000000',
      name: '王大力',
      avatar: '/static/c3.png',
      bio: '健身达人',
      location: '广州市',
      gender: 'male'
    },
    {
      phone: '18600000000',
      name: '刘美丽',
      avatar: '/static/c4.png',
      bio: '美食博主',
      location: '深圳市',
      gender: 'female'
    },
    {
      phone: '17700000000',
      name: '陈小智',
      avatar: '/static/c5.png',
      bio: '科技发烧友',
      location: '杭州市',
      gender: 'male'
    }
  ]
  
  const createdUsers = users.map(user => UserModel.create(user))
  console.log(`创建了 ${createdUsers.length} 个用户`)
  
  // 创建示例圈子
  const circles = [
    {
      name: '摄影爱好者',
      description: '分享摄影技巧，交流摄影心得',
      avatar: '/static/c6.png',
      ownerId: createdUsers[1].id,
      category: '兴趣爱好',
      tags: ['摄影', '艺术', '创作'],
      isPrivate: false
    },
    {
      name: '健身打卡',
      description: '一起健身，一起进步',
      avatar: '/static/c7.png',
      ownerId: createdUsers[2].id,
      category: '运动健康',
      tags: ['健身', '运动', '健康'],
      isPrivate: false
    },
    {
      name: '美食分享',
      description: '发现美食，分享美味',
      avatar: '/static/c8.png',
      ownerId: createdUsers[3].id,
      category: '美食',
      tags: ['美食', '烹饪', '餐厅'],
      isPrivate: false
    },
    {
      name: '科技前沿',
      description: '关注科技动态，讨论技术趋势',
      avatar: '/static/c9.png',
      ownerId: createdUsers[4].id,
      category: '科技',
      tags: ['科技', '数码', '互联网'],
      isPrivate: false
    },
    {
      name: '生活随笔',
      description: '记录生活点滴，分享生活感悟',
      avatar: '/static/c1.png',
      ownerId: createdUsers[0].id,
      category: '生活',
      tags: ['生活', '随笔', '感悟'],
      isPrivate: false
    }
  ]
  
  const createdCircles = circles.map(circle => CircleModel.create(circle))
  console.log(`创建了 ${createdCircles.length} 个圈子`)
  
  // 让用户加入一些圈子
  createdUsers.forEach((user, index) => {
    createdCircles.forEach((circle, circleIndex) => {
      // 不是圈主的用户有50%概率加入这个圈子
      if (circle.ownerId !== user.id && Math.random() > 0.5) {
        CircleModel.joinCircle(circle.id, user.id)
      }
    })
  })
  
  // 创建示例帖子
  const posts = [
    {
      title: '今日拍摄小技巧',
      content: '分享一个拍摄人像的小技巧：利用自然光和反光板，可以让人物更加立体生动。大家有什么拍摄心得吗？',
      authorId: createdUsers[1].id,
      circleId: createdCircles[0].id,
      images: ['/static/c2.png'],
      tags: ['摄影技巧', '人像摄影']
    },
    {
      title: '健身打卡第30天',
      content: '坚持健身一个月了！感觉身体状态越来越好，精神也更饱满。分享一下今天的训练内容：\n1. 热身 10分钟\n2. 力量训练 40分钟\n3. 有氧运动 20分钟\n4. 拉伸放松 10分钟',
      authorId: createdUsers[2].id,
      circleId: createdCircles[1].id,
      tags: ['健身打卡', '力量训练']
    },
    {
      title: '周末美食探店',
      content: '今天去了一家新开的川菜馆，味道真的很赞！特别推荐他们家的麻婆豆腐和水煮鱼，麻辣鲜香，回味无穷。已经决定下次还要再去！',
      authorId: createdUsers[3].id,
      circleId: createdCircles[2].id,
      images: ['/static/c4.png'],
      tags: ['美食探店', '川菜'],
      location: { name: '蜀香小厨', address: '深圳市南山区' }
    },
    {
      title: 'AI技术发展趋势讨论',
      content: '最近AI技术发展得真快，ChatGPT、文生图、代码生成等等，感觉我们正在见证一个新时代的到来。大家觉得AI会在哪些领域产生最大的影响？',
      authorId: createdUsers[4].id,
      circleId: createdCircles[3].id,
      tags: ['人工智能', '技术趋势']
    },
    {
      title: '春天的感悟',
      content: '春天来了，万物复苏。走在路上，看到路边的花开了，心情也跟着明朗起来。生活就像四季轮回，总有阴霾过去、阳光到来的时候。',
      authorId: createdUsers[0].id,
      circleId: createdCircles[4].id,
      tags: ['生活感悟', '春天']
    },
    {
      title: '新手入门摄影器材推荐',
      content: '很多朋友问我新手应该买什么相机，今天统一回复一下：\n\n入门级推荐：\n1. 佳能EOS M50 Mark II\n2. 索尼A6000系列\n3. 富士X-T30\n\n这几款都很适合新手，性价比也不错。记住，器材不是最重要的，多练习才是王道！',
      authorId: createdUsers[1].id,
      circleId: createdCircles[0].id,
      tags: ['摄影器材', '新手入门'],
      isTop: true
    }
  ]
  
  const createdPosts = posts.map(post => PostModel.create(post))
  console.log(`创建了 ${createdPosts.length} 个帖子`)
  
  // 模拟一些点赞
  createdPosts.forEach(post => {
    createdUsers.forEach(user => {
      if (user.id !== post.authorId && Math.random() > 0.6) {
        PostModel.like(post.id, user.id)
      }
    })
  })
  
  console.log('种子数据创建完成')
}

/**
 * 重置数据库（仅开发环境使用）
 */
export async function resetDatabase() {
  console.log('重置数据库...')
  
  // 清空所有数据
  const localDB = (await import('./localDB.js')).default
  localDB.clear()
  
  // 重新初始化
  await initializeDatabase()
  
  console.log('数据库重置完成')
}

export default {
  initializeDatabase,
  resetDatabase
}
