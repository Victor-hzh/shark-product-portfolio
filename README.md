# Shark 产品线

Shark 产品卡片目录，按品类与平台合集展示已核实型号、官方价格、上市时间、销售市场和关键参数。

正式站点：[https://shark.uwant.cc/](https://shark.uwant.cc/)

## 自动更新

默认分支中的 GitHub Actions 每天北京时间 11:25 自动执行；推送到 `main` 时也会立即运行：

1. 调用公开产品数据服务检查美国、英国和日本来源。
2. 更新已知 SKU 的市场信息、官方价格和欧洲央行参考汇率。
3. 将有官网商品页、型号、品类和市场信息的新 SKU 自动加入正式目录。相同商品页只收录一次；无法核实的记录写入 `data/pending-products.json`。
4. 运行 TypeScript 检查并生成 Next.js 静态导出目录 `out/`。
5. 将静态文件上传至阿里云 OSS，并检查正式域名是否可访问。
6. 上线成功后，把数据快照提交回 `main`。

工作流也支持从 GitHub Actions 页面手动运行。

仓库需要配置以下 GitHub Actions Secrets：

- `ALIYUN_OSS_ACCESS_KEY_ID`
- `ALIYUN_OSS_ACCESS_KEY_SECRET`

AccessKey 应来自只允许维护 `shark-product-portfolio` Bucket 的 RAM 用户，不应写入代码、日志或提交历史。

## 新品收录

自动扫描发现的新型号直接加入 `data/catalog-snapshot.json` 并随当天静态构建发布。默认在官网品类中独立展示；需要合并的平台合集在 `lib/platform-groups.ts` 中调整。`data/pending-products.json` 仅保留缺少可信来源或分类的异常记录。

首次抓取时间不等同上市日期。`NEW RELEASE` 和“最近上新”只依据 `lib/catalog.ts` 中有来源的上市日期展示；新品即使缺少日期也会出现在对应品类。

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
