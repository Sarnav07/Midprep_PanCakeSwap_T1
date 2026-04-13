const fs = require('fs');

const files = [
  'packages/core/tsconfig.json',
  'packages/dashboard/tsconfig.json',
  'packages/agents/execution/tsconfig.json',
  'packages/agents/liquidity/tsconfig.json',
  'packages/agents/market-intelligence/tsconfig.json',
  'packages/agents/portfolio/tsconfig.json',
  'packages/agents/risk/tsconfig.json',
  'packages/agents/strategy/tsconfig.json'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(raw);
    
    // Fix inheritance levels for non-agent packages
    if (file === 'packages/core/tsconfig.json' || file === 'packages/dashboard/tsconfig.json') {
        data.extends = "../../tsconfig.json"; // This is actually correct for packages/core vs root
    }

    if (data.compilerOptions) {
      delete data.compilerOptions.rootDir;
      data.compilerOptions.baseUrl = ".";
      
      const depth = file.split('/').length - 1;
      let pathAlias = "../../*/src";
      if (depth === 2) {
          pathAlias = "../*/src"; 
      }
      
      data.compilerOptions.paths = {
         "@pancakeswap-agent/*": [pathAlias]
      };
      
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
    }
  } catch (e) {
    console.error(`Error processing ${file}: ${e.message}`);
  }
}
