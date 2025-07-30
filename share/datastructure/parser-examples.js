/**
 * 扩展JSON解析器使用示例
 * Extended JSON Parser Usage Examples
 */

// 导入解析器
const { ExtendedJsonParser, EventTicketResolver } = require('./extended-json-parser');

/**
 * 示例1: 基本引用解析
 */
async function basicReferenceExample() {
  console.log('=== 基本引用解析示例 ===');
  
  const parser = new ExtendedJsonParser();
  
  // 带引用的事件数据
  const eventData = {
    eventForm: {
      title: "摄影技巧分享会",
      date: "2024-07-25",
      startTime: "14:00",
      endTime: "17:00",
      location: "创意园区A座",
      category: "学习",
      
      // 引用门票信息
      ticketReference: {
        type: "reference",
        referenceFile: "./ticket-structure.json",
        referenceSchema: "ticketSchema",
        relationship: "one-to-many",
        foreignKey: "eventId"
      }
    }
  };
  
  try {
    const resolved = await parser.parseWithReferences(eventData, '/share/datastructure');
    console.log('解析结果:', JSON.stringify(resolved, null, 2));
  } catch (error) {
    console.error('解析失败:', error.message);
  }
}

/**
 * 示例2: 复杂引用结构
 */
async function complexReferenceExample() {
  console.log('\n=== 复杂引用结构示例 ===');
  
  const parser = new ExtendedJsonParser();
  
  // 复杂的事件数据结构
  const complexEventData = {
    event: {
      id: "event_photography_workshop_001",
      title: "专业摄影工作坊",
      description: "学习人像摄影技巧",
      
      // 多个引用
      ticketsInfo: {
        type: "reference",
        referenceFile: "./ticket-structure.json",
        referenceSchema: "ticketSchema",
        relationship: "one-to-many",
        foreignKey: "eventId",
        conditions: {
          isActive: true,
          ticketType: "standard"
        }
      },
      
      venueInfo: {
        type: "reference",
        referenceFile: "./venue-structure.json",
        referenceSchema: "venueSchema",
        relationship: "many-to-one",
        foreignKey: "venueId"
      },
      
      organizerInfo: {
        type: "reference",
        referenceFile: "./organizer-structure.json",
        referenceSchema: "organizerSchema",
        relationship: "many-to-one",
        foreignKey: "organizerId"
      }
    }
  };
  
  try {
    const resolved = await parser.parseWithReferences(complexEventData, '/share/datastructure');
    console.log('复杂结构解析结果:', JSON.stringify(resolved, null, 2));
  } catch (error) {
    console.error('复杂结构解析失败:', error.message);
  }
}

/**
 * 示例3: 事件-门票关联查询
 */
async function eventTicketQueryExample() {
  console.log('\n=== 事件-门票关联查询示例 ===');
  
  const resolver = new EventTicketResolver();
  
  const ticketReference = {
    type: "reference",
    referenceFile: "./ticket-structure.json",
    referenceSchema: "ticketSchema",
    relationship: "one-to-many",
    foreignKey: "eventId"
  };
  
  try {
    const ticketInfo = await resolver.getTicketsByEventId('event_001', ticketReference);
    console.log('事件门票信息:', JSON.stringify(ticketInfo, null, 2));
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 示例4: 引用验证
 */
async function referenceValidationExample() {
  console.log('\n=== 引用验证示例 ===');
  
  const parser = new ExtendedJsonParser();
  
  const dataWithInvalidRef = {
    event: {
      title: "测试活动",
      invalidReference: {
        type: "reference",
        referenceFile: "./non-existent-file.json",
        referenceSchema: "nonExistentSchema"
      }
    }
  };
  
  try {
    const validation = await parser.validateReferences(dataWithInvalidRef, '/share/datastructure');
    console.log('验证结果:', validation);
    
    if (!validation.isValid) {
      console.log('发现的错误:');
      validation.errors.forEach(error => console.log('- ' + error));
    }
  } catch (error) {
    console.error('验证过程出错:', error.message);
  }
}

/**
 * 示例5: 数据转换和条件过滤
 */
async function transformAndFilterExample() {
  console.log('\n=== 数据转换和条件过滤示例 ===');
  
  const parser = new ExtendedJsonParser();
  
  const eventWithTransform = {
    event: {
      title: "高级摄影课程",
      ticketInfo: {
        type: "reference",
        referenceFile: "./ticket-structure.json",
        referenceSchema: "ticketSchema",
        relationship: "one-to-many",
        foreignKey: "eventId",
        
        // 条件过滤: 只获取VIP门票
        conditions: {
          ticketType: "vip",
          isActive: true
        },
        
        // 数据转换: 添加自定义字段
        transform: "function(data) { return { ...data, customField: 'processed', timestamp: Date.now() }; }"
      }
    }
  };
  
  try {
    const resolved = await parser.parseWithReferences(eventWithTransform, '/share/datastructure');
    console.log('转换后的数据:', JSON.stringify(resolved, null, 2));
  } catch (error) {
    console.error('转换失败:', error.message);
  }
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  try {
    await basicReferenceExample();
    await complexReferenceExample();
    await eventTicketQueryExample();
    await referenceValidationExample();
    await transformAndFilterExample();
    
    console.log('\n=== 所有示例执行完成 ===');
  } catch (error) {
    console.error('示例执行出错:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  basicReferenceExample,
  complexReferenceExample,
  eventTicketQueryExample,
  referenceValidationExample,
  transformAndFilterExample,
  runAllExamples
};

/**
 * 在Vue.js中的使用示例
 */
/*
// 在Vue组件中使用
import { ExtendedJsonParser } from '@/share/datastructure/extended-json-parser.js';

export default {
  data() {
    return {
      eventData: {},
      parser: new ExtendedJsonParser()
    };
  },
  
  async mounted() {
    await this.loadEventWithReferences();
  },
  
  methods: {
    async loadEventWithReferences() {
      try {
        const rawEventData = {
          // 包含引用的事件数据
          ticketReference: {
            type: "reference",
            referenceFile: "./ticket-structure.json",
            referenceSchema: "ticketSchema"
          }
        };
        
        this.eventData = await this.parser.parseWithReferences(
          rawEventData, 
          '/share/datastructure'
        );
        
        console.log('事件数据加载完成:', this.eventData);
      } catch (error) {
        console.error('加载事件数据失败:', error);
        this.$message.error('加载数据失败');
      }
    }
  }
};
*/

/**
 * 在UniApp中的使用示例
 */
/*
// 在UniApp页面中使用
import { ExtendedJsonParser } from '@/share/datastructure/extended-json-parser.js';

export default {
  data() {
    return {
      eventList: [],
      parser: new ExtendedJsonParser()
    };
  },
  
  onLoad() {
    this.loadEventsWithTickets();
  },
  
  methods: {
    async loadEventsWithTickets() {
      uni.showLoading({ title: '加载中...' });
      
      try {
        // 从API获取事件数据（包含引用）
        const response = await uni.request({
          url: '/api/events',
          method: 'GET'
        });
        
        // 解析引用
        const resolvedEvents = await Promise.all(
          response.data.map(event => 
            this.parser.parseWithReferences(event, '/share/datastructure')
          )
        );
        
        this.eventList = resolvedEvents;
        uni.hideLoading();
        
      } catch (error) {
        console.error('加载失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    }
  }
};
*/
