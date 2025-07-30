const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 连接到MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://admin:admin123@localhost:27017/cici_database?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB连接成功');
    return true;
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error.message);
    return false;
  }
};

// 用户Schema（简化版）
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isEmailVerified: { type: Boolean, default: true },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String
  },
  settings: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'zh-CN' },
    notifications: { type: Boolean, default: true }
  },
  created: { type: Date, default: Date.now },
  lastLogin: Date,
  lastActivity: Date,
  status: { type: String, default: 'active' }
});

const User = mongoose.model('User', userSchema);

const createTestUsers = async () => {
  try {
    // 删除现有的测试用户
    await User.deleteMany({
      email: { $in: ['test001@cici.com', 'admin@cici.com', 'user@example.com'] }
    });
    
    // 创建测试用户
    const testUsers = [
      {
        username: 'test001',
        email: 'test001@cici.com',
        password: await bcrypt.hash('test123456', 10),
        role: 'user',
        isEmailVerified: true,
        profile: {
          firstName: '测试',
          lastName: '用户001',
          avatar: '/static/default-avatar.png'
        },
        status: 'active'
      },
      {
        username: 'admin',
        email: 'admin@cici.com', 
        password: await bcrypt.hash('admin123456', 10),
        role: 'admin',
        isEmailVerified: true,
        profile: {
          firstName: '管理',
          lastName: '员',
          avatar: '/static/admin-avatar.png'
        },
        status: 'active'
      },
      {
        username: 'testuser',
        email: 'user@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'user',
        isEmailVerified: true,
        profile: {
          firstName: '示例',
          lastName: '用户',
          avatar: '/static/default-avatar.png'
        },
        status: 'active'
      }
    ];

    // 插入用户
    const users = await User.insertMany(testUsers);
    console.log('✅ 测试用户创建成功:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
  }
};

const main = async () => {
  console.log('🔄 开始创建测试用户...');
  
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ 数据库连接失败，退出程序');
    process.exit(1);
  }
  
  await createTestUsers();
  console.log('\n🎉 测试用户创建完成！');
  console.log('\n可以使用以下账号测试登录:');
  console.log('📧 test001@cici.com / test123456');
  console.log('📧 admin@cici.com / admin123456');
  console.log('📧 user@example.com / 123456');
  console.log('');
  
  // 关闭数据库连接
  await mongoose.connection.close();
  console.log('✅ 数据库连接已关闭');
  process.exit(0);
};

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('主程序执行错误:', error);
  process.exit(1);
});
