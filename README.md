# Shark 产品线

Shark 产品卡片目录，包含 237 个已核实型号，按品类和型号前缀分组。卡片展示销售市场国旗、产品图片及按品类选取的关键参数。

## 本地运行

需要 Node.js 22 或更新版本和 pnpm。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## 部署到 Vercel

在 Vercel 导入本 GitHub 仓库，框架保持自动识别的 Next.js，根目录为仓库根目录，点击 Deploy 即可。`main` 分支后续提交会自动触发重新部署。

当前版本使用仓库里的 `data/catalog-snapshot.json` 和 `data/specs-snapshot.json`。这是 2026-09-23 核查快照，页面不会自动抓取新商品。原网站的在线刷新依赖 Cloudflare D1；Vercel 版本没有继承该数据库，因此按钮已标注为不可用。要恢复多人共享、持久化在线刷新，需要另外接入数据库和刷新任务，不能只改部署平台。

商品照片取自对应官方或零售商品页，部分外部图片源可能失效；卡片会回退显示型号文字。
