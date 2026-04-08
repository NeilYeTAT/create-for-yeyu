# create-for-yeyu

一个用于快速创建项目的脚手架工具。

## 功能特性

- 快速克隆 Git 仓库模板
- 支持 Vite 官方模板
- 支持 Create Next App
- 交互式命令行界面
- 随机小猫欢迎界面，显示用户名和当前日期
- Clone 时显示 Nyan Cat 彩虹猫动画

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

# 使用 Next Web App 模板
npx create-for-yeyu my-project --template next-web-app

# 使用 EVM DApp 模板
npx create-for-yeyu my-project --template evm-dapp

# 使用 Vite 创建项目
npx create-for-yeyu my-project --template vite

# 使用 Create Next App 创建项目
npx create-for-yeyu my-project --template next
```

### 常用选项

```bash
# 查看版本
npx create-for-yeyu -v
npx create-for-yeyu --version

# 查看所有可用模板
npx create-for-yeyu --list-templates

# 使用默认值快速创建
# 默认项目名: my-project
# 默认模板: vite
npx create-for-yeyu --yes

# 目录已存在时直接覆盖
npx create-for-yeyu my-project --template next --force

# 关闭欢迎 Banner
npx create-for-yeyu my-project --template vite --no-banner

# Git 模板跳过 git 初始化
npx create-for-yeyu my-project --template nest --no-git
```

### 更新 CLI

```bash
# 自动检测当前包管理器并更新到最新版本
create-for-yeyu update

# 指定包管理器更新
create-for-yeyu update --manager pnpm
create-for-yeyu update --manager npm
```

## 命令选项

| 选项 | 说明 |
| ---- | ---- |
| `-v, --version` | 显示当前 CLI 版本 |
| `-h, --help` | 显示帮助信息 |
| `-t, --template <template>` | 指定模板 |
| `-f, --force` | 目标目录已存在时直接覆盖 |
| `-y, --yes` | 尽可能使用默认值，跳过交互 |
| `--git` | Git 模板直接初始化仓库 |
| `--no-git` | Git 模板跳过仓库初始化 |
| `--list-templates` | 输出所有可用模板并退出 |
| `--no-banner` | 不显示欢迎 Banner |

## 可用模板

| 模板名称             | 命令参数       | 说明                  |
| -------------------- | -------------- | --------------------- |
| NestJS Starter       | `nest`         | NestJS 应用启动模板   |
| Next Web App Starter | `next-web-app` | Next Web App 启动模板 |
| EVM DApp Starter     | `evm-dapp`     | EVM DApp 启动模板     |
| Vite                 | `vite`         | 使用 Vite 官方模板    |
| Next.js              | `next`         | 使用 Create Next App  |

## 界面预览

启动时会显示随机小猫欢迎界面：

```
 ______________________________
/ Hello, username!             \
\ Today is 2024-12-23 Monday   /
 ------------------------------
                            ╱|、
                          (˚ˎ 。7
                           |、˜〵
                          じしˍ,)ノ
```

Clone 模板时会显示 Nyan Cat 彩虹猫动画。

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

# 查看帮助
pnpm start -- --help
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
│       ├── cats.ts           # 小猫欢迎界面工具
│       └── nyan-cat.ts       # Nyan Cat 动画
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
