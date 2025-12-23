# create-for-yeyu

一个用于快速创建项目的脚手架工具。

## 功能特性

- 快速克隆 Git 仓库模板
- 支持 Vite 官方模板
- 支持 Create Next App
- 交互式命令行界面
- Cowsay 风格的欢迎界面，显示用户名和当前日期
- Clone 时显示 ASCII 火车动画

## 安装

```bash
npm install -g create-for-yeyu
```

或者直接使用 npx：

```bash
npx create-for-yeyu
```

## 使用方法

### 交互式创建

```bash
npx create-for-yeyu
```

### 指定项目名称

```bash
npx create-for-yeyu my-project
```

### 指定模板

```bash
# 使用 NestJS 模板
npx create-for-yeyu my-project --template nest

# 使用 EVM DApp 模板
npx create-for-yeyu my-project --template evm-dapp

# 使用 Vite 创建项目
npx create-for-yeyu my-project --template vite

# 使用 Create Next App 创建项目
npx create-for-yeyu my-project --template next
```

## 可用模板

| 模板名称         | 命令参数   | 说明                 |
| ---------------- | ---------- | -------------------- |
| NestJS Starter   | `nest`     | NestJS 应用启动模板  |
| EVM DApp Starter | `evm-dapp` | EVM DApp 启动模板    |
| Vite             | `vite`     | 使用 Vite 官方模板   |
| Next.js          | `next`     | 使用 Create Next App |

## 界面预览

启动时会显示 Cowsay 风格的欢迎界面：

```
 ______________________________
/ Hello, username!             \
\ Today is 2024-12-23 Monday   /
 ------------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/ \
                ||----w |
                ||     ||
```

Clone 模板时会显示 ASCII 火车动画，灵感来自经典的 sl 命令。

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 本地测试运行
pnpm start
```

## 项目结构

```
create-for-yeyu/
├── src/
│   ├── index.ts              # CLI 入口
│   ├── cli.ts                # 命令行解析
│   ├── prompts.ts            # 交互式问答
│   ├── templates.ts          # 模板配置
│   ├── actions/
│   │   ├── clone-repo.ts     # Clone Git 仓库
│   │   ├── create-vite.ts    # 调用 Vite
│   │   └── create-next.ts    # 调用 Create Next App
│   └── utils/
│       ├── logger.ts         # 日志工具
│       ├── spinner.ts        # 加载动画
│       ├── cowsay.ts         # Cowsay 工具
│       └── train-animation.ts # 火车动画
├── package.json
├── tsconfig.json
└── README.md
```

## 添加新模板

在 `src/templates.ts` 文件中添加新的模板配置：

```typescript
{
  name: '模板名称',
  value: 'template-value',
  description: '模板描述',
  type: 'git',
  repo: 'username/repo-name',
}
```

## 技术栈

- Node.js >= 18
- TypeScript
- Commander - 命令行参数解析
- Inquirer - 交互式命令行界面
- Chalk - 终端颜色输出
- Degit - 快速 clone Git 仓库

## License

MIT
