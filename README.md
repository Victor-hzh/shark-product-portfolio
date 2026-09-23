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

当前版本使用仓库里的 `data/catalog-snapshot.json` 和 `data/specs-snapshot.json` 作为可用性快照。页面加载与“刷新 Shark 产品”通过同域 API 路由向原站的公开数据服务读取/写入记录，因此原站仍需保持运行。可选环境变量 `SHARK_DATA_ORIGIN` 可更换数据服务根地址。若要完全停用原站，还须迁移 Cloudflare D1 中的持久化数据与刷新服务，单独部署本仓库不足以替代数据后端。

商品照片取自对应官方或零售商品页，部分外部图片源可能失效；卡片会回退显示型号文字。
