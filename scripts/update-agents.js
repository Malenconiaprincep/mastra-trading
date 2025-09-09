const fs = require('fs');
const path = require('path');

function updateAgentFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 更新导入语句
  content = content.replace(
    /import { Agent } from '\.\.\/\.\.\/core\/Agent';/g,
    "import { AgentFactory, UnifiedAgent, UnifiedAgentConfig } from '../../core/AgentFactory';"
  );

  // 更新类属性类型
  content = content.replace(
    /private agent: Agent;/g,
    'private agent: UnifiedAgent;'
  );

  // 更新构造函数
  content = content.replace(
    /constructor\(openaiApiKey: string,/g,
    "constructor(provider: 'openai' | 'qwen', apiKey: string,"
  );

  // 更新构造函数体
  const constructorRegex = /constructor\(provider: 'openai' \| 'qwen', apiKey: string,[\s\S]*?this\.agent = new Agent\([\s\S]*?}, openaiApiKey\);/g;

  content = content.replace(constructorRegex, (match) => {
    // 提取类名
    const className = path.basename(filePath, '.ts');

    // 构建新的构造函数
    return `constructor(provider: 'openai' | 'qwen', apiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;
    
    const config: UnifiedAgentConfig = {
      name: '${className}',
      instructions: \`你是一位专业的分析师。你的职责是：

1. 分析相关数据和信息
2. 提供专业的见解和建议
3. 识别关键因素和趋势
4. 评估风险和机会
5. 制定投资建议

请基于提供的数据进行深入分析，并提供专业的见解和建议。\`,
      model: {
        provider,
        name: provider === 'openai' ? 'gpt-4' : 'qwen-plus',
        toolChoice: 'auto',
      },
      tools: [],
    };
    
    this.agent = AgentFactory.createAgent(config, apiKey);
  }`;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.includes('index.ts')) {
      updateAgentFile(filePath);
    }
  });
}

// 从 src/agents 目录开始
walkDir('./src/agents');
