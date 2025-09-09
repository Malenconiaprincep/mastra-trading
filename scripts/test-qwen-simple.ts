#!/usr/bin/env tsx

import { QwenAgent } from '../src/core/QwenAgent';

async function testQwenAgent() {
  try {
    console.log('🧪 测试 Qwen Agent...');

    // 检查 Qwen API 密钥
    const qwenApiKey = process.env.QWEN_API_KEY;
    if (!qwenApiKey) {
      console.log('❌ 未设置 QWEN_API_KEY 环境变量');
      console.log('💡 请设置 QWEN_API_KEY 环境变量来测试 Qwen 功能');
      console.log('📝 示例: export QWEN_API_KEY=your_qwen_api_key_here');
      return;
    }

    // 创建 Qwen Agent
    const agent = new QwenAgent({
      name: 'TestAgent',
      instructions: '你是一位专业的股票分析师。请简洁地回答用户的问题。',
      model: {
        provider: 'qwen',
        name: 'qwen-plus',
        toolChoice: 'auto',
      },
      tools: [],
    }, qwenApiKey);

    // 测试简单对话
    console.log('🤖 测试 Qwen Agent 对话...');
    const response = await agent.generate('请简单介绍一下A股市场的特点。');

    console.log('✅ Qwen Agent 测试成功！');
    console.log('📝 回复内容:');
    console.log(response.text);

    if (response.usage) {
      console.log(`📊 Token 使用情况: ${response.usage.total_tokens} tokens`);
    }

  } catch (error) {
    console.error('❌ Qwen Agent 测试失败:', error);
    if (error.response) {
      console.error('API 响应:', error.response.data);
    }
  }
}

// 运行测试
if (require.main === module) {
  testQwenAgent();
}
