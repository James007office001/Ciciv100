# 🐳 Docker Hub 用户名获取指南

## 📍 **查找现有Docker Hub用户名**

### 方法1: Docker Hub网站查看 (推荐)
1. 打开浏览器访问: **https://hub.docker.com**
2. 点击右上角 **"Sign In"** 登录
3. 登录成功后，用户名会显示在右上角头像旁边
4. 点击头像下拉菜单也可以看到完整的用户名

### 方法2: 本地Docker CLI检查
```bash
# 如果您之前已经登录过Docker Hub
docker info | grep Username

# 或者查看Docker配置文件
cat ~/.docker/config.json  # Linux/Mac
type %USERPROFILE%\.docker\config.json  # Windows
```

### 方法3: GitHub或其他平台
如果您曾经在GitHub或其他平台使用过Docker Hub，可以查看：
- GitHub仓库的Actions或README中的Docker Hub链接
- 邮箱中来自Docker Hub的邮件

## 🆕 **创建新的Docker Hub账户**

### 免费注册步骤
1. **访问注册页**: https://hub.docker.com/signup
   
2. **填写注册信息**:
   - **用户名**: 选择一个唯一的用户名 (建议规则如下)
   - **邮箱地址**: 您的有效邮箱
   - **密码**: 安全的密码

3. **用户名选择建议**:
   - ✅ 使用英文字母、数字和连字符 (-)
   - ✅ 长度: 4-30个字符
   - ✅ 示例: `james2025`, `mycompany-dev`, `project-ci`
   - ❌ 避免使用特殊符号或空格
   - ❌ 不能以连字符开头或结尾

4. **验证邮箱**: 注册后检查邮箱并点击验证链接

5. **完成设置**: 验证后即可使用

## 🎯 **用户名推荐格式**

### 个人用户建议
- `yourname2025`
- `yourname-dev`  
- `firstname-lastname`

### 公司/项目建议
- `companyname-ci`
- `projectname-docker`
- `teamname-images`

### C2项目建议
- `c2-project-dev`
- `cici-platform`
- `yourname-c2`

## 🔐 **登录Docker Hub**

### 在命令行登录
```bash
# 使用用户名登录
docker login --username YOUR_USERNAME

# 或者直接登录 (会提示输入用户名)
docker login
```

### 登录信息
- **Registry**: docker.io (默认)
- **用户名**: 您的Docker Hub用户名
- **密码**: 您的Docker Hub密码

## 📊 **验证登录状态**

### 检查登录
```bash
# 查看登录信息
docker info | grep Username

# 测试推送权限 (推送一个测试镜像)
docker tag hello-world YOUR_USERNAME/test:latest
docker push YOUR_USERNAME/test:latest
```

## 🌐 **Docker Hub镜像仓库地址格式**

登录后，您的镜像地址格式为：
```
docker.io/YOUR_USERNAME/IMAGE_NAME:TAG
```

### C2项目示例
如果您的用户名是 `james2025`，那么镜像地址为：
```
james2025/c2-project-app:latest
james2025/c2-project-server:latest
```

## 🚀 **完成后的推送命令**

获得用户名后，您可以使用以下命令推送C2项目：

```bash
# 替换 YOUR_USERNAME 为您的实际用户名
docker login --username YOUR_USERNAME

# 标记并推送主应用镜像
docker tag c2-backend:latest YOUR_USERNAME/c2-project-app:latest
docker push YOUR_USERNAME/c2-project-app:latest

# 标记并推送服务器镜像
docker tag server-app:latest YOUR_USERNAME/c2-project-server:latest
docker push YOUR_USERNAME/c2-project-server:latest
```

## ❓ **常见问题**

### Q: 忘记了用户名怎么办？
A: 使用注册时的邮箱在登录页面点击"Forgot username"

### Q: 用户名已被占用怎么办？
A: 尝试添加数字、连字符或项目名称，如 `username2025` 或 `username-docker`

### Q: 免费账户有什么限制？
A: 
- 无限制的公开仓库
- 1个免费私有仓库
- 每6个月拉取镜像有速率限制

### Q: 如何更改用户名？
A: Docker Hub不支持更改用户名，需要创建新账户

---

**下一步**: 获得用户名后，返回到推送脚本中替换 `YOUR_USERNAME` 并执行推送命令！
