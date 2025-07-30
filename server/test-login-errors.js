// 测试登录错误处理的脚本
const testLoginErrors = async () => {
  console.log('🧪 开始测试登录错误处理...\n');

  const testCases = [
    {
      name: '测试错误的邮箱',
      email: 'wrong@email.com',
      password: 'wrongpassword',
      expected: '登录失败'
    },
    {
      name: '测试空密码',
      email: 'test001@cici.com',
      password: '',
      expected: '验证失败'
    },
    {
      name: '测试正确的凭据',
      email: 'test001@cici.com',
      password: 'test123456',
      expected: '登录成功'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}:`);
    console.log(`   邮箱: ${testCase.email}`);
    console.log(`   密码: ${testCase.password || '(空)'}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: testCase.email,
          password: testCase.password
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ 结果: 登录成功`);
        console.log(`   📄 响应: ${result.message}`);
      } else {
        console.log(`   ❌ 结果: 登录失败`);
        console.log(`   📄 错误: ${result.error}`);
        console.log(`   🔧 错误码: ${result.code}`);
      }
    } catch (error) {
      console.log(`   💥 网络错误: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('✨ 测试完成！');
};

// 运行测试
testLoginErrors().catch(console.error);
