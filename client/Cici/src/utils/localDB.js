/**
 * CICI 本地轻量型数据库
 * 基于 uni.storage 实现的本地数据库系统
 */

class LocalDB {
  constructor() {
    this.dbName = 'CICI_LocalDB'
    this.version = '1.0.0'
    this.tables = new Map()
    this.initialized = false
    this.init()
  }

  /**
   * 初始化数据库
   */
  async init() {
    try {
      // 获取数据库元信息
      const dbInfo = uni.getStorageSync(`${this.dbName}_info`) || {
        version: this.version,
        tables: {},
        createdAt: Date.now(),
        lastModified: Date.now()
      }
      
      // 加载已存在的表结构
      this.loadTables(dbInfo.tables)
      this.initialized = true
      
      console.log('LocalDB 初始化成功', dbInfo)
    } catch (error) {
      console.error('LocalDB 初始化失败:', error)
    }
  }

  /**
   * 加载表结构
   */
  loadTables(tableConfigs) {
    Object.keys(tableConfigs).forEach(tableName => {
      this.tables.set(tableName, tableConfigs[tableName])
    })
  }

  /**
   * 创建表
   * @param {string} tableName 表名
   * @param {object} schema 表结构定义
   */
  createTable(tableName, schema = {}) {
    const tableConfig = {
      name: tableName,
      schema: {
        id: { type: 'string', primary: true, autoIncrement: true },
        createdAt: { type: 'number', default: () => Date.now() },
        updatedAt: { type: 'number', default: () => Date.now() },
        ...schema
      },
      indexes: ['id'],
      createdAt: Date.now()
    }

    this.tables.set(tableName, tableConfig)
    this.saveDBInfo()
    
    // 初始化表数据存储
    const existingData = uni.getStorageSync(`${this.dbName}_${tableName}`) || []
    if (!Array.isArray(existingData)) {
      uni.setStorageSync(`${this.dbName}_${tableName}`, [])
    }

    console.log(`表 ${tableName} 创建成功`)
    return this
  }

  /**
   * 插入数据
   * @param {string} tableName 表名
   * @param {object|array} data 要插入的数据
   */
  insert(tableName, data) {
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`)
    }

    const tableData = this.getTableData(tableName)
    const isArray = Array.isArray(data)
    const records = isArray ? data : [data]
    
    const insertedRecords = records.map(record => {
      const processedRecord = this.processRecord(tableName, record)
      tableData.push(processedRecord)
      return processedRecord
    })

    this.saveTableData(tableName, tableData)
    
    return isArray ? insertedRecords : insertedRecords[0]
  }

  /**
   * 查询数据
   * @param {string} tableName 表名
   * @param {object} conditions 查询条件
   * @param {object} options 查询选项
   */
  find(tableName, conditions = {}, options = {}) {
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`)
    }

    let data = this.getTableData(tableName)
    
    // 应用查询条件
    if (Object.keys(conditions).length > 0) {
      data = data.filter(record => this.matchConditions(record, conditions))
    }

    // 应用排序
    if (options.orderBy) {
      data = this.applySorting(data, options.orderBy)
    }

    // 应用分页
    if (options.limit || options.offset) {
      const offset = options.offset || 0
      const limit = options.limit || data.length
      data = data.slice(offset, offset + limit)
    }

    return data
  }

  /**
   * 查询单条数据
   * @param {string} tableName 表名
   * @param {object} conditions 查询条件
   */
  findOne(tableName, conditions = {}) {
    const results = this.find(tableName, conditions, { limit: 1 })
    return results.length > 0 ? results[0] : null
  }

  /**
   * 根据ID查询
   * @param {string} tableName 表名
   * @param {string} id 记录ID
   */
  findById(tableName, id) {
    return this.findOne(tableName, { id })
  }

  /**
   * 更新数据
   * @param {string} tableName 表名
   * @param {object} conditions 更新条件
   * @param {object} updates 更新数据
   */
  update(tableName, conditions, updates) {
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`)
    }

    const tableData = this.getTableData(tableName)
    let updatedCount = 0

    tableData.forEach(record => {
      if (this.matchConditions(record, conditions)) {
        Object.assign(record, updates, { updatedAt: Date.now() })
        updatedCount++
      }
    })

    if (updatedCount > 0) {
      this.saveTableData(tableName, tableData)
    }

    return updatedCount
  }

  /**
   * 根据ID更新
   * @param {string} tableName 表名
   * @param {string} id 记录ID
   * @param {object} updates 更新数据
   */
  updateById(tableName, id, updates) {
    return this.update(tableName, { id }, updates)
  }

  /**
   * 删除数据
   * @param {string} tableName 表名
   * @param {object} conditions 删除条件
   */
  delete(tableName, conditions) {
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`)
    }

    const tableData = this.getTableData(tableName)
    const originalLength = tableData.length
    
    const filteredData = tableData.filter(record => !this.matchConditions(record, conditions))
    
    if (filteredData.length !== originalLength) {
      this.saveTableData(tableName, filteredData)
    }

    return originalLength - filteredData.length
  }

  /**
   * 根据ID删除
   * @param {string} tableName 表名
   * @param {string} id 记录ID
   */
  deleteById(tableName, id) {
    return this.delete(tableName, { id })
  }

  /**
   * 清空表
   * @param {string} tableName 表名
   */
  truncate(tableName) {
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`)
    }

    this.saveTableData(tableName, [])
    return this
  }

  /**
   * 删除表
   * @param {string} tableName 表名
   */
  dropTable(tableName) {
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`)
    }

    this.tables.delete(tableName)
    uni.removeStorageSync(`${this.dbName}_${tableName}`)
    this.saveDBInfo()
    
    console.log(`表 ${tableName} 删除成功`)
    return this
  }

  /**
   * 获取表数据
   * @param {string} tableName 表名
   */
  getTableData(tableName) {
    return uni.getStorageSync(`${this.dbName}_${tableName}`) || []
  }

  /**
   * 保存表数据
   * @param {string} tableName 表名
   * @param {array} data 表数据
   */
  saveTableData(tableName, data) {
    uni.setStorageSync(`${this.dbName}_${tableName}`, data)
    this.updateDBInfo()
  }

  /**
   * 处理记录数据
   * @param {string} tableName 表名
   * @param {object} record 记录数据
   */
  processRecord(tableName, record) {
    const table = this.tables.get(tableName)
    const processedRecord = { ...record }
    
    // 生成ID
    if (!processedRecord.id) {
      processedRecord.id = this.generateId(tableName)
    }
    
    // 设置默认值
    Object.keys(table.schema).forEach(field => {
      const fieldConfig = table.schema[field]
      if (processedRecord[field] === undefined && fieldConfig.default !== undefined) {
        processedRecord[field] = typeof fieldConfig.default === 'function' 
          ? fieldConfig.default() 
          : fieldConfig.default
      }
    })

    return processedRecord
  }

  /**
   * 生成唯一ID
   * @param {string} tableName 表名
   */
  generateId(tableName) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `${tableName}_${timestamp}_${random}`
  }

  /**
   * 匹配查询条件
   * @param {object} record 记录
   * @param {object} conditions 条件
   */
  matchConditions(record, conditions) {
    return Object.keys(conditions).every(key => {
      const condition = conditions[key]
      const value = record[key]
      
      if (typeof condition === 'object' && condition !== null) {
        // 高级查询条件
        if (condition.$eq !== undefined) return value === condition.$eq
        if (condition.$ne !== undefined) return value !== condition.$ne
        if (condition.$gt !== undefined) return value > condition.$gt
        if (condition.$gte !== undefined) return value >= condition.$gte
        if (condition.$lt !== undefined) return value < condition.$lt
        if (condition.$lte !== undefined) return value <= condition.$lte
        if (condition.$in !== undefined) return condition.$in.includes(value)
        if (condition.$nin !== undefined) return !condition.$nin.includes(value)
        if (condition.$regex !== undefined) {
          const regex = new RegExp(condition.$regex, condition.$options || '')
          return regex.test(value)
        }
      }
      
      return value === condition
    })
  }

  /**
   * 应用排序
   * @param {array} data 数据
   * @param {object} orderBy 排序配置
   */
  applySorting(data, orderBy) {
    return data.sort((a, b) => {
      for (const [field, direction] of Object.entries(orderBy)) {
        const aVal = a[field]
        const bVal = b[field]
        
        if (aVal < bVal) return direction === 'desc' ? 1 : -1
        if (aVal > bVal) return direction === 'desc' ? -1 : 1
      }
      return 0
    })
  }

  /**
   * 保存数据库信息
   */
  saveDBInfo() {
    const dbInfo = {
      version: this.version,
      tables: Object.fromEntries(this.tables),
      lastModified: Date.now()
    }
    uni.setStorageSync(`${this.dbName}_info`, dbInfo)
  }

  /**
   * 更新数据库信息
   */
  updateDBInfo() {
    const dbInfo = uni.getStorageSync(`${this.dbName}_info`) || {}
    dbInfo.lastModified = Date.now()
    uni.setStorageSync(`${this.dbName}_info`, dbInfo)
  }

  /**
   * 获取数据库统计信息
   */
  getStats() {
    const stats = {
      tables: {},
      totalRecords: 0,
      dbSize: 0
    }

    this.tables.forEach((config, tableName) => {
      const data = this.getTableData(tableName)
      stats.tables[tableName] = {
        recordCount: data.length,
        schema: config.schema,
        createdAt: config.createdAt
      }
      stats.totalRecords += data.length
    })

    return stats
  }

  /**
   * 导出数据
   * @param {string} tableName 表名（可选，不传则导出所有表）
   */
  export(tableName = null) {
    if (tableName) {
      return {
        table: tableName,
        data: this.getTableData(tableName),
        schema: this.tables.get(tableName)
      }
    }

    const exportData = {
      version: this.version,
      exportTime: Date.now(),
      tables: {}
    }

    this.tables.forEach((config, name) => {
      exportData.tables[name] = {
        schema: config,
        data: this.getTableData(name)
      }
    })

    return exportData
  }

  /**
   * 导入数据
   * @param {object} importData 导入的数据
   */
  import(importData) {
    if (importData.tables) {
      Object.keys(importData.tables).forEach(tableName => {
        const tableInfo = importData.tables[tableName]
        
        // 创建表
        this.createTable(tableName, tableInfo.schema.schema)
        
        // 导入数据
        if (tableInfo.data && tableInfo.data.length > 0) {
          this.truncate(tableName)
          this.insert(tableName, tableInfo.data)
        }
      })
    }
    
    console.log('数据导入完成')
  }

  /**
   * 清空所有数据
   */
  clear() {
    this.tables.forEach((config, tableName) => {
      uni.removeStorageSync(`${this.dbName}_${tableName}`)
    })
    uni.removeStorageSync(`${this.dbName}_info`)
    this.tables.clear()
    console.log('数据库已清空')
  }
}

// 创建全局数据库实例
const localDB = new LocalDB()

export default localDB
