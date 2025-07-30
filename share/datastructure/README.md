# CICI数据结构说明

本目录包含CICI社交圈子平台的核心数据结构定义，供前端和后端开发使用。

## 文件结构

### 核心数据结构
- `api-structure.json` - API接口数据结构定义
- `event-structure.json` - 事件/日程数据结构（**支持引用**）
- `event-category-structure.json` - 事件分类数据结构定义
- `ticket-structure.json` - 门票数据结构
- `ui-structure.json` - UI组件数据结构
- `user-profile-structure.json` - 用户配置和设置数据结构

### 扩展JSON解析器
- `extended-json-parser.js` - 完整的扩展JSON解析器（支持引用、关系映射、条件过滤等）
- `uniapp-json-parser.js` - UniApp专用的简化解析器
- `parser-examples.js` - 解析器使用示例
- `user-profile-examples.js` - 用户配置结构使用示例
- `event-category-examples.json` - 事件分类示例数据
- `event-category-utils.ts` - 事件分类工具函数
- `event-category-types.ts` - 事件分类TypeScript类型定义

### 事件分类系统
- `event-category-README.md` - 事件分类系统详细说明文档

## 🆕 新特性：JSON引用系统

### 什么是JSON引用？
传统JSON格式不支持引用其他文件的数据结构。我们扩展了JSON格式，支持通过`reference`字段引用其他JSON文件中的数据结构。

### 引用语法示例
```json
{
  "eventForm": {
    "title": "摄影工作坊",
    "date": "2024-07-25",
    "ticketReference": {
      "type": "reference",
      "referenceFile": "./ticket-structure.json",
      "referenceSchema": "ticketSchema",
      "relationship": "one-to-many",
      "foreignKey": "eventId",
      "conditions": {
        "isActive": true
      }
    }
  }
}
```

### 引用字段说明
- `type`: 必须为`"reference"`，标识这是一个引用字段
- `referenceFile`: 引用的文件路径（相对路径）
- `referenceSchema`: 引用文件中的具体schema名称（可选）
- `relationship`: 数据关系类型（one-to-one, one-to-many, many-to-one, many-to-many）
- `foreignKey`: 外键字段名
- `conditions`: 筛选条件对象
- `transform`: 数据转换函数（字符串形式）

### 支持的关系类型
1. **one-to-one**: 一对一关系
2. **one-to-many**: 一对多关系（如一个事件对应多张门票）
3. **many-to-one**: 多对一关系（如多个事件在同一个场地）
4. **many-to-many**: 多对多关系

## 🔧 使用方法

### 在普通JavaScript项目中
```javascript
const { ExtendedJsonParser } = require('./extended-json-parser');

const parser = new ExtendedJsonParser();
const resolved = await parser.parseWithReferences(jsonData, basePath);
```

### 在UniApp项目中
```javascript
import { UniAppJsonParser } from '@/share/datastructure/uniapp-json-parser.js';

const parser = new UniAppJsonParser();
const resolved = await parser.parseWithReferences(jsonData);
```

### 在Vue组件中
```javascript
import { UniAppEventHandler } from '@/share/datastructure/uniapp-json-parser.js';

export default {
  data() {
    return {
      eventHandler: new UniAppEventHandler()
    };
  },
  
  methods: {
    async processEvent(formData) {
      const processed = await this.eventHandler.processEventForm(formData);
      console.log('处理后的事件数据:', processed);
    }
  }
};
```

## 📋 实际应用场景

### 用户配置结构特性
`user-profile-structure.json` 包含完整的用户管理系统：

#### 核心模块
- **userProfileSchema**: 完整的用户数据结构定义
- **userFormData**: 前端表单数据结构
- **apiEndpoints**: RESTful API接口定义
- **validationRules**: 数据验证规则
- **defaultValues**: 默认值配置
- **errorCodes**: 错误代码定义

#### 使用示例
```javascript
// 前端Vue组件中
import { UserProfileManager } from '@/share/datastructure/user-profile-examples.js';

const profileManager = new UserProfileManager(userProfileStructure);
const defaultConfig = profileManager.getDefaultConfig();
const validation = profileManager.validate(phoneNumber, 'phone');
```

```javascript
// 后端Node.js中
const { userProfileStructure } = require('./user-profile-structure.json');

app.put('/api/v1/users/:id/profile', (req, res) => {
  // 使用统一的验证规则和错误代码
  const validation = validateUserData(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      code: userProfileStructure.errorCodes.VALIDATION_ERROR.code,
      message: validation.message
    });
  }
});
```

### 事件-门票关联
当创建一个事件时，可以通过引用系统自动关联门票信息：
```json
{
  "event": {
    "title": "摄影工作坊",
    "ticketsInfo": {
      "type": "reference",
      "referenceFile": "./ticket-structure.json",
      "referenceSchema": "ticketSchema",
      "relationship": "one-to-many"
    }
  }
}
```

解析后会自动包含完整的门票数据结构，无需重复定义。

### 场地信息引用
```json
{
  "venueInfo": {
    "type": "reference",
    "referenceFile": "./venue-structure.json",
    "referenceSchema": "venueSchema",
    "relationship": "many-to-one",
    "foreignKey": "venueId"
  }
}
```

## 🔍 验证和调试

### 引用验证
```javascript
const validation = await parser.validateReferences(jsonData, basePath);
if (!validation.isValid) {
  console.log('发现错误:', validation.errors);
}
```

### 调试模式
解析器会在控制台输出详细的解析过程，便于调试：
```
解析引用: ./ticket-structure.json#ticketSchema
应用条件: { isActive: true }
关系类型: one-to-many
```

## 🎯 优势

1. **模块化**: 数据结构可以分文件管理，提高可维护性
2. **复用性**: 同一个数据结构可以在多个地方引用
3. **关系映射**: 清晰定义不同数据间的关系
4. **条件过滤**: 支持动态数据筛选
5. **缓存机制**: 避免重复加载相同文件
6. **类型安全**: 保持数据结构的完整性

## 📚 更多示例

### 核心数据结构示例
- 查看 `parser-examples.js` 了解引用解析器的使用示例
- 查看 `user-profile-examples.js` 了解用户配置结构的前后端使用示例

### 引用解析器示例
查看 `parser-examples.js` 文件了解更多使用示例，包括：
- 基本引用解析
- 复杂引用结构
- 事件-门票关联查询
- 引用验证
- 数据转换和条件过滤

## ⚠️ 注意事项

1. 避免循环引用，解析器会检测并报错
2. 引用文件路径使用相对路径
3. 大量引用可能影响性能，建议合理使用缓存
4. 在生产环境中，建议预编译引用结构以提高性能
- **validationRules**: 数据验证规则
- **errorMessages**: 错误消息定义

## 使用指南

### 前端使用
```javascript
// 导入数据结构
import eventStructure from './share/datastructure/event-structure.json'
import ticketStructure from './share/datastructure/ticket-structure.json'

// 使用字段定义进行表单验证
const validateEvent = (formData) => {
  // 根据 eventStructure.eventForm 进行验证
}
```

### 后端使用
```javascript
// 导入数据结构作为模型定义
const eventSchema = require('./share/datastructure/event-structure.json')
const ticketSchema = require('./share/datastructure/ticket-structure.json')

// 使用字段定义创建数据库模型
const EventModel = createModel(eventSchema.eventData)
const TicketModel = createModel(ticketSchema.ticketPurchaseData)
```

## 数据流程

### 事件创建流程
1. 前端使用 `eventForm` 结构展示表单
2. 用户填写表单数据
3. 前端根据 `validationRules` 进行验证
4. 转换为 `eventData` 格式发送到后端
5. 后端保存并返回完整的事件数据

### 购票流程
1. 用户点击购票按钮，显示购票弹窗
2. 前端使用 `ticketForm` 结构展示购票表单
3. 用户填写票价和数量信息
4. 前端计算总金额并验证数据
5. 转换为 `ticketPurchaseData` 格式发送到后端
6. 后端处理支付并返回订单结果

## 版本管理
- 当数据结构发生变更时，请同时更新前端和后端代码
- 建议使用版本号管理数据结构的变更
- 重大变更需要考虑向后兼容性

## 注意事项
1. 所有必填字段都需要在前后端进行验证
2. 计算字段（如totalAmount）应该在前端显示，后端重新计算
3. 日期时间格式需要前后端保持一致
4. 枚举值（如优先级、分类）需要保持同步
