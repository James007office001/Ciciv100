/**
 * UniApp专用的简化JSON引用解析器
 * Simplified JSON Reference Parser for UniApp
 */

class UniAppJsonParser {
  constructor() {
    this.cache = {};
    this.basePath = '/share/datastructure';
  }

  /**
   * 解析带引用的JSON数据
   * @param {object} data - 包含引用的数据对象
   * @returns {Promise<object>} 解析后的完整对象
   */
  async parseWithReferences(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // 深拷贝避免修改原始数据
    const result = JSON.parse(JSON.stringify(data));
    
    // 递归解析所有引用
    await this._resolveReferencesRecursive(result);
    
    return result;
  }

  /**
   * 递归解析引用
   * @private
   */
  async _resolveReferencesRecursive(obj) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        await this._resolveReferencesRecursive(obj[i]);
      }
    } else if (obj && typeof obj === 'object') {
      // 检查是否是引用对象
      if (obj.type === 'reference' && obj.referenceFile) {
        // 解析引用并替换当前对象
        const resolved = await this._resolveReference(obj);
        Object.keys(obj).forEach(key => delete obj[key]);
        Object.assign(obj, resolved);
      } else {
        // 递归处理对象的所有属性
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            await this._resolveReferencesRecursive(obj[key]);
          }
        }
      }
    }
  }

  /**
   * 解析单个引用
   * @private
   */
  async _resolveReference(refObj) {
    const { referenceFile, referenceSchema, relationship = 'one-to-one' } = refObj;
    
    try {
      // 加载引用文件
      const referencedData = await this._loadReferenceFile(referenceFile);
      
      // 提取指定schema
      let targetData = referencedData;
      if (referenceSchema) {
        targetData = this._getNestedProperty(referencedData, referenceSchema);
      }

      if (!targetData) {
        console.warn(`引用的schema "${referenceSchema}" 不存在于文件 "${referenceFile}"`);
        return { _referenceError: `Schema "${referenceSchema}" not found` };
      }

      // 根据关系类型处理数据
      return this._processRelationship(targetData, relationship, refObj);
      
    } catch (error) {
      console.error(`解析引用失败 "${referenceFile}":`, error);
      return { _referenceError: error.message };
    }
  }

  /**
   * 加载引用文件
   * @private
   */
  async _loadReferenceFile(filePath) {
    // 检查缓存
    if (this.cache[filePath]) {
      return this.cache[filePath];
    }

    try {
      // 根据文件名返回对应的数据结构
      const data = await this._getFileData(filePath);
      
      // 缓存结果
      this.cache[filePath] = data;
      
      return data;
    } catch (error) {
      throw new Error(`无法加载文件 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 获取文件数据（模拟）
   * @private
   */
  async _getFileData(filePath) {
    // 在实际应用中，这里应该从服务器获取数据
    // 这里提供一些模拟数据
    
    const mockData = {
      './ticket-structure.json': {
        ticketSchema: {
          basicInfo: {
            ticketId: { type: "string", required: true, description: "门票ID" },
            eventId: { type: "string", required: true, description: "事件ID" },
            ticketType: { 
              type: "string", 
              enum: ["standard", "vip", "early_bird", "group"], 
              description: "门票类型" 
            },
            ticketName: { type: "string", description: "门票名称" },
            price: { type: "number", minimum: 0, description: "价格" }
          },
          availability: {
            totalQuantity: { type: "number", minimum: 1, description: "总数量" },
            soldQuantity: { type: "number", minimum: 0, default: 0, description: "已售数量" },
            availableQuantity: { type: "number", computed: true, description: "可售数量" },
            saleStartTime: { type: "string", format: "datetime", description: "开售时间" },
            saleEndTime: { type: "string", format: "datetime", description: "停售时间" }
          },
          restrictions: {
            maxPurchasePerUser: { type: "number", default: 5, description: "单人限购" },
            requiresVerification: { type: "boolean", default: false, description: "需要验证" }
          }
        }
      },
      
      './venue-structure.json': {
        venueSchema: {
          basicInfo: {
            venueId: { type: "string", required: true, description: "场地ID" },
            venueName: { type: "string", required: true, description: "场地名称" },
            address: { type: "string", description: "地址" },
            capacity: { type: "number", minimum: 1, description: "容量" }
          },
          facilities: {
            hasParking: { type: "boolean", default: false, description: "停车场" },
            hasWifi: { type: "boolean", default: true, description: "WiFi" },
            hasAirConditioning: { type: "boolean", default: true, description: "空调" }
          }
        }
      },
      
      './organizer-structure.json': {
        organizerSchema: {
          basicInfo: {
            organizerId: { type: "string", required: true, description: "主办方ID" },
            organizerName: { type: "string", required: true, description: "主办方名称" },
            contactEmail: { type: "string", format: "email", description: "联系邮箱" },
            contactPhone: { type: "string", description: "联系电话" }
          },
          reputation: {
            rating: { type: "number", minimum: 0, maximum: 5, description: "评分" },
            eventsHosted: { type: "number", minimum: 0, description: "举办活动数" }
          }
        }
      }
    };

    if (mockData[filePath]) {
      return mockData[filePath];
    }
    
    throw new Error(`文件 ${filePath} 不存在`);
  }

  /**
   * 处理关系类型
   * @private
   */
  _processRelationship(data, relationship, refObj) {
    const { foreignKey, conditions } = refObj;
    
    // 应用条件过滤
    let processedData = data;
    if (conditions) {
      processedData = this._applyConditions(data, conditions);
    }
    
    // 根据关系类型包装数据
    switch (relationship) {
      case 'one-to-many':
        return {
          ...processedData,
          _metadata: {
            relationship: 'one-to-many',
            foreignKey: foreignKey,
            isArray: true
          }
        };
      
      case 'many-to-one':
        return {
          ...processedData,
          _metadata: {
            relationship: 'many-to-one',
            foreignKey: foreignKey,
            isArray: false
          }
        };
      
      default:
        return processedData;
    }
  }

  /**
   * 应用条件过滤
   * @private
   */
  _applyConditions(data, conditions) {
    // 简单的条件匹配
    if (typeof data === 'object' && !Array.isArray(data)) {
      const result = { ...data };
      
      // 为数据添加条件标记
      result._conditions = conditions;
      
      return result;
    }
    
    return data;
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
   * 清除缓存
   */
  clearCache() {
    this.cache = {};
  }

  /**
   * 为事件创建门票实例
   */
  createTicketInstance(eventId, ticketSchema) {
    if (!ticketSchema || !ticketSchema.basicInfo) {
      return null;
    }

    const now = new Date();
    const timestamp = now.getTime();
    
    return {
      ticketId: `ticket_${eventId}_${timestamp}`,
      eventId: eventId,
      ticketType: 'standard',
      ticketName: '标准票',
      price: 99.99,
      currency: 'CNY',
      totalQuantity: 100,
      soldQuantity: 0,
      availableQuantity: 100,
      saleStartTime: now.toISOString(),
      saleEndTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
      maxPurchasePerUser: 5,
      requiresVerification: false,
      isActive: true,
      createdAt: now.toISOString(),
      _instanceType: 'ticket',
      _sourceSchema: 'ticketSchema'
    };
  }
}

/**
 * UniApp事件处理器
 */
class UniAppEventHandler {
  constructor() {
    this.parser = new UniAppJsonParser();
  }

  /**
   * 处理事件表单数据
   */
  async processEventForm(formData) {
    try {
      // 解析引用
      const resolved = await this.parser.parseWithReferences(formData);
      
      // 如果有门票引用，创建门票实例
      if (resolved.ticketReference && resolved.ticketReference._metadata) {
        const eventId = resolved.id || `event_${Date.now()}`;
        resolved.ticketInstance = this.parser.createTicketInstance(
          eventId, 
          resolved.ticketReference
        );
      }
      
      return resolved;
    } catch (error) {
      console.error('处理事件表单失败:', error);
      throw error;
    }
  }

  /**
   * 验证事件数据
   */
  validateEventData(eventData) {
    const errors = [];
    
    // 基础验证
    if (!eventData.title) {
      errors.push('事件标题不能为空');
    }
    
    if (!eventData.date) {
      errors.push('事件日期不能为空');
    }
    
    if (!eventData.startTime || !eventData.endTime) {
      errors.push('开始时间和结束时间不能为空');
    }
    
    // 门票引用验证
    if (eventData.ticketReference) {
      if (eventData.ticketReference._referenceError) {
        errors.push(`门票引用错误: ${eventData.ticketReference._referenceError}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 导出
export { UniAppJsonParser, UniAppEventHandler };

// 默认导出
export default UniAppJsonParser;
