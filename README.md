# SellerMargin

SellerMargin 是面向电商卖家、小型进口商和跨境卖家的多语言利润规划工具站。V3.3 提供可编辑费用假设、统一货币显示和四个计算器：

- 多平台利润计算器
- 广告回本 ROAS 计算器
- Stripe vs PayPal 手续费计算器
- 到岸成本计算器

项目还包含 About、Contact、隐私政策、服务条款、免责声明、指南、SEO metadata、JSON-LD、sitemap 和 robots。

## 技术栈

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- 基于 JSON messages 的 `en`、`zh`、`es` 本地化
- 浏览器 `localStorage`

当前版本不需要数据库或业务后端。计算和最近输入保存在浏览器端。

## 本地运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
http://localhost:3000/en
http://localhost:3000/zh
http://localhost:3000/es
```

根路径 `/` 固定跳转到 `/en`。语言切换器会保留当前页面，并切换到对应语言路径。

## 检查与构建

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run start
```

`npm run start` 需要先完成 `npm run build`，默认在 `http://localhost:3000` 启动标准 Next.js 生产服务器。

## 多语言结构

公开页面位于：

```text
app/[locale]/
```

文案位于：

```text
messages/en.json
messages/zh.json
messages/es.json
```

英文文案是类型基准和缺失字段 fallback。新增页面时需要同步：

1. 三种语言路由和页面文案。
2. 页面 H1、title 和 meta description。
3. canonical、hreflang 和内部链接。
4. `lib/site.ts` 中的 `sitePaths`。
5. `app/sitemap.ts` 中可生成的语言 URL。

## 货币与本地存储

全局货币选择支持：

```text
USD EUR GBP CAD AUD CNY
```

货币只影响数字格式，不进行汇率换算。最近输入通过 `hooks/useLocalStorage.ts` 在客户端安全读写，主要键名为：

```text
sellerMargin.currency
sellerMargin.locale
sellerMargin.multiPlatform.state
sellerMargin.adBreakEven.inputs
sellerMargin.paymentFees.state
sellerMargin.landedCost.state
sellerMargin.waitlistDemo
```

## 计算逻辑

核心公式和输入输出类型位于：

```text
lib/calculators.ts
lib/calculatorTypes.ts
lib/validators.ts
```

所有计算器返回统一结构：

```ts
{
  result,
  errors,
  warnings
}
```

默认平台、支付和计算器假设位于：

```text
lib/defaultFees.ts
```

默认值是可编辑估算值，不代表长期有效的官方费率。
默认费用组包含 `lastReviewed: "2026-06"`，对应计算器页面会显示假设最后检查月份。

## SEO

- `lib/seo.ts`：metadata helper
- `lib/site.ts`：生产 URL、公开路径和 hreflang helper
- `components/CalculatorStructuredData.tsx`：`WebApplication` 与 `FAQPage` JSON-LD
- `app/sitemap.ts`：多语言 sitemap
- `app/robots.ts`：robots

支持以下环境变量：

```text
NEXT_PUBLIC_SITE_URL=https://你的正式域名
NEXT_PUBLIC_CONTACT_EMAIL=你的真实支持邮箱
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

未设置站点 URL 时使用 `https://sellermargin.com` 占位；未设置联系邮箱时显示
`[replace-with-real-email@yourdomain.com]`。`NEXT_PUBLIC_ANALYTICS_ENABLED` 只有明确设置为
`true` 时才允许渲染 Cookie consent 预留组件。V1 未接入 analytics SDK，也不设置非必要 cookies。

## 部署到 Vercel

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 创建项目并导入仓库。
3. Framework Preset 使用 `Next.js`。
4. Build Command 使用 `npm run build`。
5. 设置 `NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_CONTACT_EMAIL` 和 `NEXT_PUBLIC_ANALYTICS_ENABLED=false`。
6. 部署后检查 `/en`、`/zh`、`/es`、`/sitemap.xml` 和 `/robots.txt`。

也可以使用 CLI：

```bash
npm install -g vercel
vercel
vercel --prod
```

## V3.3 不包含

- 登录或账号系统
- 真实支付
- 数据库
- 真实邮件发送
- 广告平台接入
- 自动 HS 编码或海关费率查询
- 汇率换算
- CSV/PDF 实际导出
- 批量 SKU 实际处理
- AI 内容生成
- 管理后台

Contact 和等候名单仅为前端演示，不发送邮件，也不把个人数据保存到服务器或数据库。

## 上线前 TODO

- 在 `NEXT_PUBLIC_CONTACT_EMAIL` 中配置真实邮箱。
- 将 `NEXT_PUBLIC_SITE_URL` 设置为正式域名。
- 完成西班牙语全文人工校对。
- 安装并接入 V2 指定的 `next-intl` 后替换当前 messages helper。
- 增加公式单元测试和浏览器端端到端测试。
- 由合格专业人士复核法律页和税务、海关提示。
- 如接入 analytics，先更新隐私政策和同意机制。
