<script>
export default {
	onLaunch: function() {
		console.log('CICI App Launch')
		this.simpleInit()
		this.checkLoginStatus()
	},
	onShow: function() {
		console.log('CICI App Show')
	},
	onHide: function() {
		console.log('CICI App Hide')
	},
	
	methods: {
		simpleInit() {
			try {
				console.log('应用启动成功')
				// 获取系统信息
				const systemInfo = uni.getSystemInfoSync()
				console.log('系统信息:', systemInfo)
			} catch (error) {
				console.error('应用初始化失败:', error)
			}
		},
		
		checkLoginStatus() {
			try {
				// 检查本地存储的登录状态
				const isAuthenticated = uni.getStorageSync('isAuthenticated')
				console.log('登录状态:', isAuthenticated)
				
				if (!isAuthenticated) {
					console.log('用户未登录，将在适当时候跳转到登录页面')
					// 不在这里直接跳转，让用户先看到主页
					// uni.reLaunch({ url: '/pages/auth/login' })
				} else {
					console.log('用户已登录')
				}
			} catch (error) {
				console.error('检查登录状态失败:', error)
			}
		}
	}
}
</script>

<style>
/* 全局样式 */
page {
	background: #f8f9fa;
	font-family: 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 全局文本样式 */
.text-primary {
	color: #667eea;
}

.text-secondary {
	color: #6c757d;
}

.text-success {
	color: #28a745;
}

.text-danger {
	color: #dc3545;
}

.text-warning {
	color: #ffc107;
}

.text-info {
	color: #17a2b8;
}

/* 全局布局样式 */
.container {
	padding: 20px;
}

.row {
	display: flex;
	flex-wrap: wrap;
}

.col {
	flex: 1;
}

/* 全局按钮样式 */
.btn {
	display: inline-block;
	padding: 10px 20px;
	margin: 5px;
	border: none;
	border-radius: 5px;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s ease;
}

.btn-primary {
	background: #667eea;
	color: white;
}

.btn-primary:hover {
	background: #5a67d8;
}

.btn-secondary {
	background: #6c757d;
	color: white;
}

.btn-success {
	background: #28a745;
	color: white;
}

.btn-danger {
	background: #dc3545;
	color: white;
}
</style>
