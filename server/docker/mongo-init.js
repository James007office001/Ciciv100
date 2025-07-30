// MongoDB 数据库初始化脚本
print('开始初始化 CICI 数据库...');

// 切换到 cici_database 数据库
db = db.getSiblingDB('cici_database');

// 创建应用用户
db.createUser({
  user: 'cici_user',
  pwd: 'cici_password_2025',
  roles: [
    {
      role: 'readWrite',
      db: 'cici_database'
    }
  ]
});

print('✅ 用户创建完成');

// 创建基础集合
db.createCollection('users');
db.createCollection('posts');
db.createCollection('activities');
db.createCollection('circles');
db.createCollection('messages');
db.createCollection('files');

print('✅ 集合创建完成');

// 创建索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.posts.createIndex({ "createTime": -1 });
db.activities.createIndex({ "startTime": 1 });
db.messages.createIndex({ "timestamp": -1 });
db.files.createIndex({ "uploadTime": -1 });

print('✅ 索引创建完成');

// 插入测试数据
db.users.insertOne({
  username: 'admin',
  email: 'admin@cici.com',
  password: 'hashed_password_here',
  role: 'admin',
  created: new Date(),
  status: 'active'
});

db.posts.insertOne({
  title: '欢迎使用CICI平台',
  content: '这是第一条测试帖子，欢迎大家使用CICI综合社交活动平台！',
  author: 'admin',
  createTime: new Date(),
  tags: ['欢迎', '测试'],
  status: 'published'
});

print('✅ 测试数据插入完成');

print('🎉 CICI 数据库初始化完成！');