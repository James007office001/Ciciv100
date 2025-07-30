/**
 * 扩展JSON解析器 - 支持引用和非标准JSON结构
 * Extended JSON Parser with Reference Support
 */

class ExtendedJsonParser {
  constructor() {
    this.cache = new Map(); // 缓存已解析的文件
    this.resolvedRefs = new Map(); // 缓存已解析的引用
  }

  /**
   * 解析带引用的JSON结构
   * @param {string|object} jsonData - JSON字符串或对象
   * @param {string} basePath - 基础路径，用于解析相对路径引用
   * @returns {Promise<object>} 解析后的完整对象
   */
  async parseWithReferences(jsonData, basePath = '') {
    try {
      // 如果是字符串，先解析为对象
      let data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // 递归解析所有引用
      const resolved = await this._resolveReferences(data, basePath);
      
      return resolved;
    } catch (error) {
      throw new Error(`解析JSON失败: ${error.message}`);
    }
  }

  /**
   * 递归解析引用
   * @private
   */
  async _resolveReferences(obj, basePath) {
    if (Array.isArray(obj)) {
      // 处理数组
      return Promise.all(obj.map(item => this._resolveReferences(item, basePath)));
    } else if (obj && typeof obj === 'object') {
      // 检查是否是引用对象
      if (this._isReference(obj)) {
        return await this._resolveReference(obj, basePath);
      }
      
      // 递归处理对象的所有属性
      const resolved = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = await this._resolveReferences(value, basePath);
      }
      return resolved;
    }
    
    // 原始值直接返回
    return obj;
  }

  /**
   * 判断是否为引用对象
   * @private
   */
  _isReference(obj) {
    return obj && 
           typeof obj === 'object' && 
           obj.type === 'reference' && 
           obj.referenceFile;
  }

  /**
   * 解析单个引用
   * @private
   */
  async _resolveReference(refObj, basePath) {
    const {
      referenceFile,
      referenceSchema,
      relationship = 'one-to-one',
      foreignKey,
      conditions = {},
      transform
    } = refObj;

    // 生成缓存键
    const cacheKey = `${basePath}/${referenceFile}#${referenceSchema}`;
    
    // 检查缓存
    if (this.resolvedRefs.has(cacheKey)) {
      return this._applyRelationship(
        this.resolvedRefs.get(cacheKey), 
        relationship, 
        foreignKey, 
        conditions,
        transform
      );
    }

    try {
      // 加载引用的文件
      const referencedData = await this._loadFile(referenceFile, basePath);
      
      // 提取指定的schema
      let targetSchema = referencedData;
      if (referenceSchema) {
        targetSchema = this._getNestedProperty(referencedData, referenceSchema);
      }

      if (!targetSchema) {
        throw new Error(`引用的schema "${referenceSchema}" 在文件 "${referenceFile}" 中不存在`);
      }

      // 递归解析引用的内容
      const resolvedSchema = await this._resolveReferences(targetSchema, this._getBasePath(referenceFile, basePath));
      
      // 缓存结果
      this.resolvedRefs.set(cacheKey, resolvedSchema);
      
      // 应用关系和条件
      return this._applyRelationship(resolvedSchema, relationship, foreignKey, conditions, transform);
      
    } catch (error) {
      throw new Error(`解析引用失败 "${referenceFile}": ${error.message}`);
    }
  }

  /**
   * 应用关系映射
   * @private
   */
  _applyRelationship(data, relationship, foreignKey, conditions, transform) {
    let result = data;

    // 应用条件过滤
    if (conditions && Object.keys(conditions).length > 0) {
      result = this._applyConditions(result, conditions);
    }

    // 应用数据转换
    if (transform && typeof transform === 'function') {
      result = transform(result);
    }

    // 根据关系类型处理数据
    switch (relationship) {
      case 'one-to-one':
        return result;
      
      case 'one-to-many':
        // 如果是一对多关系，包装为数组形式
        return {
          ...result,
          _relationship: 'one-to-many',
          _foreignKey: foreignKey,
          _queryMethod: `get${this._capitalize(foreignKey)}List`
        };
      
      case 'many-to-one':
        return {
          ...result,
          _relationship: 'many-to-one',
          _foreignKey: foreignKey,
          _queryMethod: `get${this._capitalize(foreignKey)}Detail`
        };
      
      case 'many-to-many':
        return {
          ...result,
          _relationship: 'many-to-many',
          _foreignKey: foreignKey,
          _queryMethod: `get${this._capitalize(foreignKey)}Relations`
        };
      
      default:
        return result;
    }
  }

  /**
   * 应用条件过滤
   * @private
   */
  _applyConditions(data, conditions) {
    // 这里可以实现复杂的条件过滤逻辑
    // 目前只是简单的属性匹配
    if (Array.isArray(data)) {
      return data.filter(item => {
        return Object.entries(conditions).every(([key, value]) => {
          return this._getNestedProperty(item, key) === value;
        });
      });
    }
    
    return data;
  }

  /**
   * 加载文件内容
   * @private
   */
  async _loadFile(filePath, basePath) {
    const fullPath = this._resolvePath(filePath, basePath);
    
    // 检查缓存
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath);
    }

    try {
      // 在实际环境中，这里应该是文件系统或网络请求
      // 这里模拟文件加载
      const content = await this._simulateFileLoad(fullPath);
      const parsed = JSON.parse(content);
      
      // 缓存结果
      this.cache.set(fullPath, parsed);
      
      return parsed;
    } catch (error) {
      throw new Error(`加载文件失败 "${fullPath}": ${error.message}`);
    }
  }

  /**
   * 模拟文件加载 (在实际应用中应替换为真实的文件读取)
   * @private
   */
  async _simulateFileLoad(filePath) {
    // 这里应该实现真实的文件加载逻辑
    // 例如: fs.readFile, fetch, 或其他文件系统API
    
    // 模拟常见的引用文件
    const mockFiles = {
      './ticket-structure.json': JSON.stringify({
        ticketSchema: {
          basicInfo: {
            ticketId: { type: "string", required: true },
            eventId: { type: "string", required: true },
            ticketType: { type: "string", enum: ["standard", "vip", "early_bird"] },
            price: { type: "number", minimum: 0 }
          },
          availability: {
            totalQuantity: { type: "number", minimum: 1 },
            soldQuantity: { type: "number", minimum: 0, default: 0 },
            saleStartTime: { type: "string", format: "datetime" },
            saleEndTime: { type: "string", format: "datetime" }
          }
        }
      })
    };
    
    if (mockFiles[filePath]) {
      return mockFiles[filePath];
    }
    
    throw new Error(`文件不存在: ${filePath}`);
  }

  /**
   * 解析路径
   * @private
   */
  _resolvePath(filePath, basePath) {
    if (filePath.startsWith('./') || filePath.startsWith('../')) {
      return `${basePath}/${filePath}`;
    }
    return filePath;
  }

  /**
   * 获取基础路径
   * @private
   */
  _getBasePath(filePath, currentBasePath) {
    if (filePath.includes('/')) {
      const parts = filePath.split('/');
      parts.pop(); // 移除文件名
      return `${currentBasePath}/${parts.join('/')}`;
    }
    return currentBasePath;
  }

  /**
   * 获取嵌套属性
   * @private
   */
  _getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key];
    }, obj);
  }

  /**
   * 首字母大写
   * @private
   */
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
    this.resolvedRefs.clear();
  }

  /**
   * 验证引用完整性
   */
  async validateReferences(jsonData, basePath = '') {
    const errors = [];
    
    try {
      await this._validateReferencesRecursive(jsonData, basePath, errors);
    } catch (error) {
      errors.push(`验证失败: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 递归验证引用
   * @private
   */
  async _validateReferencesRecursive(obj, basePath, errors, path = '') {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        await this._validateReferencesRecursive(obj[i], basePath, errors, `${path}[${i}]`);
      }
    } else if (obj && typeof obj === 'object') {
      if (this._isReference(obj)) {
        try {
          await this._resolveReference(obj, basePath);
        } catch (error) {
          errors.push(`${path}: ${error.message}`);
        }
      } else {
        for (const [key, value] of Object.entries(obj)) {
          const newPath = path ? `${path}.${key}` : key;
          await this._validateReferencesRecursive(value, basePath, errors, newPath);
        }
      }
    }
  }
}

/**
 * 工具函数：创建事件-门票关联查询
 */
class EventTicketResolver {
  constructor(parser) {
    this.parser = parser || new ExtendedJsonParser();
  }

  /**
   * 根据事件ID获取相关门票
   */
  async getTicketsByEventId(eventId, ticketData) {
    const resolved = await this.parser.parseWithReferences(ticketData);
    
    // 模拟查询逻辑
    if (resolved.ticketSchema) {
      return {
        eventId,
        tickets: [
          {
            ...resolved.ticketSchema,
            ticketId: `ticket_${eventId}_001`,
            eventId: eventId,
            instantiated: true
          }
        ],
        totalCount: 1,
        availableCount: 1
      };
    }
    
    return { eventId, tickets: [], totalCount: 0, availableCount: 0 };
  }

  /**
   * 验证事件-门票数据完整性
   */
  async validateEventTicketData(eventData) {
    const validation = await this.parser.validateReferences(eventData);
    
    return {
      ...validation,
      recommendations: validation.isValid ? [] : [
        '建议检查门票文件路径是否正确',
        '确认引用的schema名称是否存在',
        '验证文件格式是否为有效JSON'
      ]
    };
  }
}

// 导出类和工具函数
if (typeof module !== 'undefined' && module.exports) {
  // Node.js环境
  module.exports = {
    ExtendedJsonParser,
    EventTicketResolver
  };
} else if (typeof window !== 'undefined') {
  // 浏览器环境
  window.ExtendedJsonParser = ExtendedJsonParser;
  window.EventTicketResolver = EventTicketResolver;
}

// 使用示例：
/*
// 创建解析器实例
const parser = new ExtendedJsonParser();

// 解析带引用的事件数据
const eventData = {
  eventForm: {
    title: "摄影工作坊",
    date: "2024-07-20",
    ticketReference: {
      type: "reference",
      referenceFile: "./ticket-structure.json",
      referenceSchema: "ticketSchema",
      relationship: "one-to-many",
      foreignKey: "eventId"
    }
  }
};

parser.parseWithReferences(eventData, '/share/datastructure')
  .then(resolved => {
    console.log('解析结果:', JSON.stringify(resolved, null, 2));
  })
  .catch(error => {
    console.error('解析失败:', error.message);
  });

// 事件-门票关联查询
const resolver = new EventTicketResolver(parser);
resolver.getTicketsByEventId('event_123', eventData.eventForm.ticketReference)
  .then(tickets => {
    console.log('关联门票:', tickets);
  });
*/
