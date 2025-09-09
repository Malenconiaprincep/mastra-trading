# Qwen 集成使用指南

## 🎯 概述

系统现在支持阿里云的 Qwen（通义千问）模型，您无需 OpenAI 密钥即可使用完整的 AI 分析功能。

## 🚀 快速开始

### 1. 获取 Qwen API 密钥

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通 DashScope 服务
4. 创建 API 密钥

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件
nano .env
```

在 `.env` 文件中设置：

```bash
# 设置 AI 提供商为 Qwen
AI_PROVIDER=qwen

# 设置 Qwen API 密钥
QWEN_API_KEY=your_qwen_api_key_here

# 设置 Qwen 模型 (可选，默认为 qwen-plus)
QWEN_MODEL=qwen-plus
```

### 3. 测试 Qwen 集成

```bash
# 测试简单的 Qwen Agent
npm run test:qwen-simple

# 测试完整的股票分析系统
npm run test:qwen

# 分析特定股票
npm run analyze 000001.SZ
```

## 📊 支持的 Qwen 模型

- `qwen-plus` - 推荐，平衡性能和成本
- `qwen-max` - 最强性能，适合复杂分析
- `qwen-turbo` - 快速响应，适合简单任务

## 💰 成本说明

Qwen 模型的定价相对 OpenAI 更优惠：

- **qwen-plus**: 约 ¥0.008/1K tokens
- **qwen-max**: 约 ¥0.02/1K tokens
- **qwen-turbo**: 约 ¥0.003/1K tokens

## 🔧 故障排除

### 常见问题

1. **API 密钥错误**

   ```
   ❌ 未设置 QWEN_API_KEY 环境变量
   ```

   **解决方案**: 确保在 `.env` 文件中正确设置了 `QWEN_API_KEY`

2. **API 调用失败**

   ```
   ❌ Qwen Agent 测试失败: 401 Unauthorized
   ```

   **解决方案**: 检查 API 密钥是否正确，确保 DashScope 服务已开通

3. **模型不存在**
   ```
   ❌ Model not found: qwen-invalid
   ```
   **解决方案**: 使用支持的模型名称，如 `qwen-plus`、`qwen-max`、`qwen-turbo`

### 调试模式

启用详细日志：

```bash
# 设置调试环境变量
export DEBUG=true
export NODE_ENV=development

# 运行测试
npm run test:qwen-simple
```

## 📈 性能对比

| 模型       | 响应速度   | 分析质量   | 成本       | 推荐场景 |
| ---------- | ---------- | ---------- | ---------- | -------- |
| qwen-turbo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | 快速分析 |
| qwen-plus  | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | 日常使用 |
| qwen-max   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | 深度分析 |

## 🎯 使用建议

1. **开发测试**: 使用 `qwen-turbo`，快速且便宜
2. **生产环境**: 使用 `qwen-plus`，平衡性能和成本
3. **深度分析**: 使用 `qwen-max`，获得最佳分析质量

## 📝 示例配置

完整的 `.env` 配置示例：

```bash
# AI 模型配置
AI_PROVIDER=qwen
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QWEN_MODEL=qwen-plus

# A股数据配置 (可选)
TUSHARE_TOKEN=your_tushare_token_here
NEWS_API_KEY=your_news_api_key_here

# 应用配置
USE_MOCK_DATA=false
NODE_ENV=production
```

## 🆚 OpenAI vs Qwen

| 特性       | OpenAI     | Qwen       |
| ---------- | ---------- | ---------- |
| 模型质量   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   |
| 中文支持   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |
| 成本       | ⭐⭐       | ⭐⭐⭐⭐   |
| 访问便利性 | ⭐⭐       | ⭐⭐⭐⭐⭐ |
| 推荐指数   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |

**结论**: 对于中文 A 股分析，Qwen 是更好的选择！
