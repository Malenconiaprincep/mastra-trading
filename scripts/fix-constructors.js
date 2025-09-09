const fs = require('fs');
const path = require('path');

function fixConstructor(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 匹配 Agent 构造函数调用并添加 apiKey 参数
  const agentConstructorRegex = /new Agent\(\{[\s\S]*?\}\);/g;

  content = content.replace(agentConstructorRegex, (match) => {
    // 检查是否已经有 apiKey 参数
    if (match.includes('openaiApiKey')) {
      return match;
    }

    // 添加 apiKey 参数
    return match.replace(/}\);$/, '}, openaiApiKey);');
  });

  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fixConstructor(filePath);
    }
  });
}

// 从 src 目录开始
walkDir('./src');
