# Shark 产品线

Shark 产品卡片目录，按品类与平台合集展示已核实型号、官方价格、上市时间、销售市场和关键参数。

正式站点：[https://shark.uwant.cc/](https://shark.uwant.cc/)

## 自动更新

默认分支中的 GitHub Actions 每天北京时间 11:25 自动执行：

1. 调用公开产品数据服务检查美国、英国和日本来源。
2. 更新已知 SKU 的市场信息、官方价格和欧洲央行参考汇率。
3. 将未知 SKU 写入 `data/pending-products.json`，不自动加入正式目录或平台合集。
4. 运行 TypeScript 检查并生成 Next.js 静态导出目录 `out/`。
5. 将静态文件上传至阿里云 OSS，并检查正式域名是否可访问。
6. 上线成功后，把数据快照提交回 `main`。

工作流也支持从 GitHub Actions 页面手动运行。

仓库需要配置以下 GitHub Actions Secrets：

- `ALIYUN_OSS_ACCESS_KEY_ID`
- `ALIYUN_OSS_ACCESS_KEY_SECRET`

AccessKey 应来自只允许维护 `shark-product-portfolio` Bucket 的 RAM 用户，不应写入代码、日志或提交历史。

## 新品审核

自动扫描发现的新型号只进入 `data/pending-products.json`。审核品类、上市信息和平台归属后，再将对应产品加入 `data/catalog-snapshot.json`；平台合集规则继续在 `lib/platform-groups.ts` 中维护。

## 本地运行

需要 Node.js 22 或更新版本、pnpm 和 Python 3.12。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

只读取远端现有快照、不触发完整来源扫描的本地数据检查：

```bash
python3 scripts/refresh_data.py --skip-source-refresh
```

生成静态站点：

```bash
pnpm build
```

构建完成后，静态文件位于 `out/`。商品照片取自对应官方或零售商品页；外部图片源失效时，卡片会回退显示型号文字。
