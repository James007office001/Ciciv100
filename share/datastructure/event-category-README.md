# 事件分类数据结构说明

## 概述

本文档定义了事件分类系统的完整数据结构，用于前后端共同使用。该结构支持复杂的事件分类管理，包括地域、群组、成员、权限等多维度信息。

## 文件说明

- `event-category-structure.json`: 完整的JSON Schema定义
- `event-category-examples.json`: 示例数据，展示如何使用该数据结构
- `event-category-README.md`: 本说明文档

## 核心字段说明

### 基本信息
- **id**: 事件分类唯一标识符
- **name**: 事件分类名称
- **icon**: 事件分类图标（emoji或图标代码）
- **color**: 主题色（十六进制色值）

### 时间信息
- **startTime**: 事件分类开始时间
- **endTime**: 事件分类结束时间

### 地域信息 (region)
支持多级地域划分：
- 国家 → 省份/州 → 城市 → 区/县 → 详细地址
- 包含地理坐标信息

### 群组信息 (group)
- **id**: 群组唯一标识符
- **name**: 群组名称
- **type**: 群组类型（部门、项目、团队、组织、个人、公共）
- **permissions**: 群组权限设置

### 成员信息 (members)
每个成员包含：
- 基本信息（姓名、邮箱、电话、头像）
- 角色和状态
- 详细权限设置

### 设置信息 (settings)
- 基础设置（是否启用、是否公开、是否允许加入等）
- 成员管理设置
- 提醒设置

### 元数据 (metadata)
- 创建和更新信息
- 版本控制
- 标签和描述

## 使用示例

### 前端使用
```javascript
// 导入事件分类数据
import eventCategoryStructure from '@/share/datastructure/event-category-structure.json'
import eventCategoryExamples from '@/share/datastructure/event-category-examples.json'

// 创建新的事件分类
const createEventCategory = (categoryData) => {
  // 验证数据结构
  if (validateEventCategory(categoryData)) {
    return {
      success: true,
      data: categoryData
    }
  }
  return {
    success: false,
    error: 'Invalid category data'
  }
}

// 获取事件分类列表
const getEventCategories = () => {
  return eventCategoryExamples.eventCategories
}
```

### 后端使用
```javascript
// Node.js 示例
const fs = require('fs')
const path = require('path')

// 加载数据结构
const structurePath = path.join(__dirname, '../share/datastructure/event-category-structure.json')
const examplesPath = path.join(__dirname, '../share/datastructure/event-category-examples.json')

const eventCategoryStructure = JSON.parse(fs.readFileSync(structurePath, 'utf8'))
const eventCategoryExamples = JSON.parse(fs.readFileSync(examplesPath, 'utf8'))

// API接口示例
app.get('/api/event-categories', (req, res) => {
  res.json(eventCategoryExamples.eventCategories)
})

app.post('/api/event-categories', (req, res) => {
  const categoryData = req.body
  // 验证数据结构
  if (validateEventCategory(categoryData)) {
    // 保存到数据库
    res.json({ success: true, data: categoryData })
  } else {
    res.status(400).json({ success: false, error: 'Invalid category data' })
  }
})
```

## 数据验证

推荐使用JSON Schema验证库进行数据验证：

```javascript
// 使用ajv进行验证
const Ajv = require('ajv')
const ajv = new Ajv()

const validate = ajv.compile(eventCategoryStructure)

const validateEventCategory = (data) => {
  const valid = validate(data)
  if (!valid) {
    console.log(validate.errors)
    return false
  }
  return true
}
```

## 扩展性

该数据结构设计为可扩展的，可以根据软件功能需求进行以下扩展：

1. **字段扩展**: 在现有对象中添加新字段
2. **类型扩展**: 在枚举类型中添加新值
3. **嵌套扩展**: 在现有对象中添加新的嵌套对象
4. **权限扩展**: 在permissions对象中添加新的权限项

## 版本控制

- 当前版本: 1.0.0
- 版本规则: 遵循语义化版本控制
- 兼容性: 向后兼容，新版本不会破坏现有功能

## 注意事项

1. **必填字段**: 所有`required`数组中的字段都必须提供
2. **数据格式**: 严格按照JSON Schema定义的格式
3. **时间格式**: 统一使用ISO 8601格式
4. **权限控制**: 严格按照权限设置进行操作验证
5. **数据同步**: 前后端使用相同的数据结构确保一致性

## 联系方式

如有问题或建议，请联系开发团队。
