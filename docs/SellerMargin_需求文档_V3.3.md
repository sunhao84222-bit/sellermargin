# SellerMargin 跨境电商工具站需求文档 V3.3

版本：V3.3 修订版  
适用对象：Cursor / Codex / Claude Code / 其他 AI 编码工具  
项目名称：SellerMargin  
目标：开发一个面向海外跨境电商卖家的多语言利润与费用计算工具站

---

## V3.3 主要修订点

本版本在 V3.2 基础上做最终小幅补丁，不推倒重写，重点消除 Codex 在 Next.js 15 异步 params、next-intl 异步翻译、middleware、SEO JSON-LD、退款公式、工具链和测试执行上的歧义。

本版本在原需求文档基础上补充并修正以下内容：

- V3 新增：锁定推荐技术栈、Node 版本、package manager、核心依赖和测试方案，降低 Codex 自行猜测风险。
- V3 新增：加入 Vitest 单元测试要求，重点覆盖所有计算公式和边界条件。
- V3 新增：加入基础 a11y、404/error 页面、Cookie/GDPR 预留、品牌 design tokens、环境变量和性能检查。
- V3 调整：进一步统一 ROAS / Net revenue ROAS / POAS 的命名，避免广告指标口径混淆。
- V3 调整：到岸成本反推售价公式改为“固定非售价成本 + 固定支付费”的清晰写法，避免双重计入。
- V3.1 新增：明确 V1 采用标准 Vercel 部署，不使用 `output: 'export'`，并曾统一路由入口约定；V3.3 已调整为按 Next.js 官方当前版本选择 `middleware.ts` 或 `proxy.ts`，但不得同时创建两套入口。
- V3.1 新增：锁定 next-intl 配置文件结构、项目初始化命令、工具链配置、zod schema 目录、Vitest 测试目录。
- V3.1 新增：补充 JSON-LD 最小模板、静态 OG image 规范、favicon 规范和 noindex 红线。
- V3.1 调整：Prompt 4 退款/拒付费用公式增加“不重复计算”说明，并将高级费率字段默认放入 Advanced fees 折叠区。
- V3.1 调整：CookieConsentBanner 默认 `return null`，未开启 analytics 时不向 DOM 注入内容。
- V3.1 调整：统一 lint 命令为 `pnpm lint`，并强化 Prompt 8 检查清单。
- V3.2 新增：明确 Next.js 15+ 中 `params` / `searchParams` 为 Promise，必须 `await params`，禁止直接 `params.locale`。
- V3.2 新增：明确 `getTranslations()` 是异步函数，必须 `await getTranslations(...)`，避免渲染 `[object Promise]`。
- V3.2 新增：补充 zod 空字符串预处理建议，避免 `z.coerce.number()` 把空字符串误转为 0。
- V3.3 新增：补充 `NEXT_PUBLIC_ANALYTICS_ENABLED` 环境变量，明确未设置时视为 `false`，只在显式启用 analytics 时渲染 CookieConsentBanner。
- V3.3 新增：明确 Vitest 使用 `environment: 'node'`，计算逻辑测试不依赖浏览器环境。
- V3.3 新增：在项目结构中补充 `app/[locale]/not-found.tsx`，根级 404 作为英文 fallback，locale 级 404 支持多语言。
- V3.3 新增：统一 `defaultFees.lastReviewed` 为对象字段，格式为 `YYYY-MM`，并要求页面展示默认假设最后检查日期。
- V3.3 新增：补充 Prompt 5 中 Refund reserve 的函数命名说明，避免与 Prompt 2 的 Net revenue 口径混淆。
- V3.3 新增：补充 `app/sitemap.ts` 的最小多语言 alternates 模板。
- V3.3 调整：多语言路由入口按 Next.js 版本处理；Next.js 15.x 使用 `middleware.ts`，如当前稳定版官方要求 `proxy.ts/proxy.js`，则按官方约定实现，但不得同时创建两套入口。

- 明确多语言方案：使用 Next.js App Router + `next-intl` + `messages/*.json`。
- 明确 `/[locale]` 路由、根路径跳转、无效 locale、fallback、`generateStaticParams()`。
- 明确静态优先：V1 采用标准 Vercel 部署（非 `output: 'export'`），业务逻辑 static-first，`next-intl` 的路由拦截入口正常启用。
- 增加 `useLocalStorage` SSR 安全封装，禁止在服务端或模块顶层直接访问 `localStorage`。
- 增加 `CurrencySelector` 与 `Intl.NumberFormat`，V1 不做汇率换算，只做币种符号和格式切换。
- 统一百分比输入约定：用户输入 `30` 表示 `30%`，代码内部统一转换为 `0.3`。
- 修正多处公式排版，把所有成本项明确写成 `A + B + C`。
- 修正支付手续费计算器中的 Refund rate / Chargeback rate 死字段。
- 修正到岸成本计算器 Break-even selling price 公式。
- 明确所有计算函数返回 `{ result, errors, warnings }`，便于 UI 统一处理边界情况。
- 明确 Pro / Waitlist 表单为 demo，不接真实后端，不保存真实邮箱到数据库。
- 增加构建、Lint、SEO、移动端和内部链接检查要求。

---

# Prompt 0：全局技术规范与开发约束

请先阅读并严格执行本全局规范。后续 Prompt 1 到 Prompt 8 都必须遵守本规范，不得自行更换技术方案。

## 项目目标

我要开发一个面向海外跨境电商卖家的多语言工具网站。

网站名称：SellerMargin

网站用途：帮助 Shopify、Amazon、Etsy、eBay、TikTok Shop 等平台卖家计算真实利润、平台费用、支付手续费、广告回本点、ROAS、到岸成本和多平台净利润对比。

第一版是公开访问的工具站，不做登录、不做支付、不做数据库、不做真实会员系统。第一版目标是验证需求、获取 SEO 流量、收集 Pro 等候名单，并为后续会员功能预留入口。

## 技术栈锁定

请使用以下技术方案，不要让 Codex 自行更换：

- Next.js App Router：使用当前稳定版本或 Next.js 15+，并在 `package.json` 中锁定版本。
- React：使用与 Next.js 版本匹配的稳定版本。
- Node.js：使用 Node 20 LTS 或 Node 22 LTS，并在 README 中注明。
- Package manager：统一使用 `pnpm`。如果用户环境确实没有 pnpm，可在 README 中补充 npm 替代命令，但项目默认命令以 pnpm 为准。
- TypeScript：使用 TypeScript 5.x，开启 strict mode，并建议启用 `noUncheckedIndexedAccess`、`noImplicitOverride`。
- Tailwind CSS。
- 路径别名：统一使用 `@/*` 指向项目根目录。
- 代码规范：使用 Next.js 自带 ESLint 配置 + Prettier + `.editorconfig`。
- React components。
- `next-intl` 处理多语言：使用与 Next.js 当前稳定版本兼容的稳定主版本，并在 `package.json` 与 `pnpm-lock.yaml` 中锁定；不要在同一项目中混用不同 major 的 API。
- `zod` 做表单和输入数据校验。
- `lucide-react` 做基础图标；不要引入大型 UI/icon 库。
- `vitest` 做计算逻辑单元测试。
- Vercel 友好部署结构。
- 静态优先架构：尽量使用 SSG/static-first；V1 明确不使用 `output: 'export'`。

## 项目初始化命令建议

如果从空目录开始，请优先使用：

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
pnpm add next-intl zod lucide-react
pnpm add -D vitest @vitest/ui prettier
```

说明：

- 如果 create-next-app 交互项与当前版本不同，请选择 App Router、TypeScript、Tailwind、ESLint、`@/*` alias。
- `next-intl` 具体版本以安装时稳定版本为准，但必须锁定在 `package.json` 和 `pnpm-lock.yaml` 中。
- 不要混用 `next-i18next` 或 Pages Router 写法。

不要使用：

- 数据库。
- 登录系统。
- Stripe / Paddle / Lemon Squeezy。
- AdSense。
- 真实邮件营销工具。
- 复杂后端 API。

第一版只允许使用：

- 前端计算。
- 静态页面。
- localStorage 保存 demo 状态。
- 多语言翻译文件。
- 可复用的前端组件。

## 环境变量与配置

必须支持以下环境变量：

- `NEXT_PUBLIC_SITE_URL`：站点基础 URL，用于 canonical、hreflang、Open Graph、sitemap。开发环境可 fallback 到 `https://sellermargin.com` 占位，但 README 必须提醒上线前替换。
- `NEXT_PUBLIC_CONTACT_EMAIL`：Contact 页面展示邮箱。开发环境可 fallback 到 `[replace-with-real-email@yourdomain.com]`，但页面和 README 必须提示上线前替换。
- `NEXT_PUBLIC_ANALYTICS_ENABLED`：控制是否启用 analytics 以及 CookieConsentBanner。V1 默认不启用 analytics；未设置、空值或非 `true` 时一律视为 `false`。只有显式设置为 `true` 时，CookieConsentBanner 才允许向 DOM 注入内容。

不要把正式邮箱、正式域名或第三方密钥硬编码在组件里。

## 静态优先与路由要求

V1 采用标准 Vercel 部署（非 `output: 'export'`）。所谓 static-first 是指页面内容和业务逻辑尽量静态生成、计算在客户端完成，不依赖数据库、服务端动态 API 或 Node.js 业务运行时。

必须实现：

- `app/[locale]/layout.tsx`。
- `app/[locale]/page.tsx`。
- 所有语言页面都通过 `[locale]` 动态段实现。
- 所有 `[locale]` 页面必须支持 `en`、`zh`、`es`。
- 在 `[locale]/layout.tsx` 和需要的 route segment 中实现 `generateStaticParams()`，预生成 `en`、`zh`、`es`。
- 默认使用根目录 `middleware.ts` 配合 `next-intl` 处理根路径 `/` 到 `/en` 的跳转、locale 校验和无效 locale 处理。
- 如果项目实际安装的 Next.js 当前稳定版官方要求使用 `proxy.ts` / `proxy.js` 作为路由拦截入口，则按官方约定实现；不要同时创建 `middleware.ts` 和 `proxy.ts` 两套入口。
- 路由拦截入口必须排除 `_next`、静态资源、图片、favicon、robots、sitemap 等路径。
- 无效 locale，例如 `/fr`、`/de`，应重定向到 `/en` 或显示 404；推荐重定向到 `/en`。

重要说明：V1 不预埋 `output: 'export'` 代码路径，也不要写“纯静态导出”兼容分支。如果未来必须改成纯静态导出，整个多语言路由方案需要重新评估，不是简单切换配置。

Next.js 15+ 路由参数规范：

- 本项目锁定 Next.js 15+ 或当前稳定版本时，`layout.tsx`、`page.tsx`、`generateMetadata()` 中的 `params` / `searchParams` 按 Promise 处理。
- 必须使用 `const { locale } = await params;` 或 `const paramsValue = await params;` 后再读取字段。
- 禁止直接写 `params.locale`、`params.slug` 或 `searchParams.foo`。
- `generateStaticParams()` 可以在 `[locale]/layout.tsx` 或相关 route segment 中导出；对全站 locale 层级，在 `[locale]/layout.tsx` 导出一次即可，不需要每个 page 重复导出。
- 示例：

```ts
type LocaleParams = Promise<{ locale: string }>;

export default async function Page({ params }: { params: LocaleParams }) {
  const { locale } = await params;
  // ...
}

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale } = await params;
  // ...
}
```

## 多语言要求

第一版支持三种语言：

- 英文：`en`
- 简体中文：`zh`
- 西班牙语：`es`

默认语言是英文。

URL 结构：

- `/en`
- `/zh`
- `/es`
- `/en/multi-platform-profit-calculator`
- `/zh/multi-platform-profit-calculator`
- `/es/multi-platform-profit-calculator`

多语言具体要求：

1. 使用 `next-intl`。
   - 使用 `next-intl` 的标准 App Router 架构。
   - Next.js 15.x 默认使用根目录 `middleware.ts` 和 `next-intl` 官方 App Router 标准结构处理 locale 跳转。
   - 如果当前稳定版 Next.js 官方要求使用 `proxy.ts` / `proxy.js`，则按当前官方约定实现。
   - 不要同时创建 `middleware.ts` 和 `proxy.ts` 两套入口。
   - 在 Server Component 中优先使用 `getTranslations` 获取翻译。
   - `getTranslations()` 是异步函数，必须写 `const t = await getTranslations('Namespace');`，不要省略 `await`。
   - `generateMetadata()` 中如需翻译 title / description，同样必须 `await getTranslations(...)`。
2. 所有页面标题、按钮、表单字段、说明文字、FAQ、免责声明都要支持多语言。
3. 翻译文本不要直接硬编码在组件里。
4. 使用以下翻译文件：
   - `messages/en.json`
   - `messages/zh.json`
   - `messages/es.json`
5. `es.json` 必须包含与 `en.json` 完全一致的 key。V1 可部分使用英文占位，但不能缺 key。
6. 如果某个翻译 key 缺失，必须 fallback 到英文，不得显示 key 名、空白或报错。
7. 导航栏右侧需要有语言切换器。
8. 语言切换时应保持当前路径，例如 `/en/landed-cost-calculator` 切换为 `/zh/landed-cost-calculator`。
9. 用户选择语言后，可以通过 `useLocalStorage` 保存偏好。
10. 计算逻辑不能和语言绑定。
11. 货币选择和语言选择必须分开，不要因为用户选择中文就默认人民币。

next-intl 配置文件建议：

```txt
i18n/
  routing.ts
  navigation.ts
  request.ts
middleware.ts
```

- `i18n/routing.ts`：集中定义 locales、defaultLocale、pathnames（如需要）。
- `i18n/navigation.ts`：封装 locale-aware Link、redirect、usePathname、useRouter。
- `i18n/request.ts`：根据 locale 加载 `messages/*.json`，并实现英文 fallback。
- `middleware.ts` 或当前 Next.js 官方要求的 `proxy.ts` / `proxy.js`：使用 next-intl 路由拦截入口处理 locale detection、根路径跳转和无效 locale。


## 货币要求

第一版支持货币显示选择，但不做实时汇率换算。默认货币为 USD。

必须实现：

- `CurrencySelector.tsx`。
- 支持至少：USD、EUR、GBP、CAD、AUD、CNY。
- 用户选择货币后，仅改变金额的显示符号和格式，不改变输入数值。计算器内 Currency 字段默认与全局 CurrencySelector 同步，用户可在当前计算器临时切换显示货币。
- 所有计算函数接收和返回的都是纯数字，不接收汇率，不因 currency 改变计算结果。
- 使用 `Intl.NumberFormat` 封装 `formatCurrency(amount, currency, locale)`。
- 使用 `formatPercent(value, locale)` 统一百分比格式。
- 货币偏好通过 `useLocalStorage` 保存。

页面必须提示：Currency changes only affect display formatting in V1. This tool does not perform exchange-rate conversion.

中文提示：V1 中货币选择只影响显示格式，不做实时汇率换算。

## localStorage 与 SSR 安全规范

所有 `localStorage` 读写必须 SSR 安全。

必须实现：

- `hooks/useLocalStorage.ts`
- 只在客户端执行 `localStorage.getItem()`、`localStorage.setItem()`。
- 禁止在模块顶层、Server Component、`generateMetadata()` 或任何服务端路径中直接访问 `window` 或 `localStorage`。
- 推荐在 `useEffect` 中读取 localStorage，避免 hydration mismatch。
- localStorage 读写必须用 `try/catch` 包裹，避免隐私模式、浏览器策略或存储配额导致报错。
- 初始渲染应使用稳定默认值，客户端 hydrate 后再加载本地保存状态。

localStorage key 必须命名空间化，例如：

- `sellerMargin.v1.locale`
- `sellerMargin.v1.currency`
- `sellerMargin.v1.waitlistDemo`
- `sellerMargin.v1.multiPlatform.inputs`
- `sellerMargin.v1.multiPlatform.selectedPlatforms`
- `sellerMargin.v1.multiPlatform.feeAssumptions`
- `sellerMargin.v1.adBreakEven.inputs`
- `sellerMargin.v1.paymentFees.inputs`
- `sellerMargin.v1.landedCost.inputs`

不要保存敏感信息。不要保存明文邮箱、支付信息、真实身份信息、地址、手机号等；只能保存计算输入、显示偏好、demo 状态等低风险数据。localStorage 保存原始用户输入值，不保存转换后的内部百分比。

## TypeScript 与计算逻辑规范

所有计算逻辑必须和 UI 分离。

必须实现或逐步完善：

- `lib/calculators.ts`
- `lib/calculatorTypes.ts`
- `lib/defaultFees.ts`
- `lib/formatters.ts`
- `lib/validators.ts`
- `lib/locales.ts`
- `lib/seo.ts`

所有计算函数必须：

- 有明确 TypeScript interface/type。
- 禁止滥用 `any`。
- 对输入做归一化。
- 防止除以 0。
- 对负数、空值、NaN、Infinity 做保护。
- 返回统一结构：

```ts
export type CalculationResponse<T> = {
  result: T | null;
  errors: string[];
  warnings: string[];
};
```

百分比输入统一约定：

- 用户输入 `30` 表示 `30%`。
- 计算函数入口统一把原始输入值除以 100，转换为内部比例 `0.3`。
- localStorage 保存原始输入值，例如保存 `30`，不要保存 `0.3`。
- 输入框 label 必须明确显示 `%`。
- 不允许一部分函数使用 `30`，另一部分函数使用 `0.3`。
- 如果用户输入小于 `1` 的百分比值，例如 `0.3`，计算仍按 `0.3%` 处理；但在 blur 时显示 warning：`Did you mean 30%?`，避免擅自篡改用户输入。
- 如果百分比输入过高（例如 >= 1000%），显示 warning 提醒用户检查。

zod 使用规范：

- 每个计算器应有独立 schema，例如 `lib/schemas/multiPlatform.ts`、`lib/schemas/adBreakEven.ts`、`lib/schemas/paymentFees.ts`、`lib/schemas/landedCost.ts`。
- zod schema 用于解析、清洗和校验表单输入，包括类型、最小值、最大值、可选字段默认值。
- 不要直接裸用 `z.coerce.number()` 处理可为空的输入框，因为空字符串 `""` 可能被转换为 `0`。建议先做 preprocess：`z.preprocess((val) => val === "" ? undefined : val, z.coerce.number())`。
- 校验失败时，在字段附近显示错误，不要只在控制台打印。
- 计算函数仍需做防御式校验，不能只依赖 UI 层 zod。

## 测试要求

计算器是本项目核心功能，必须从 V1 开始建立基础测试。

必须实现：

- 使用 `vitest`。
- 测试文件路径建议：`tests/calculators/*.test.ts`。
- 配置文件建议：`vitest.config.ts`。
- `vitest.config.ts` 必须明确设置 `test.environment = 'node'`，计算逻辑测试不需要浏览器环境。
- 为 `lib/calculators.ts` 或各计算 utility 写单元测试。
- 测试覆盖正常输入、0、负数、空值、NaN、Infinity、分母 <= 0、目标利润率过高等边界。
- 每个计算器至少有 2 个基准测试用例和 3 个边界测试用例。
- README 中写明如何运行测试，例如 `pnpm test`。
- `package.json` 必须包含 `test`、`build`、`lint` 脚本。
- 如果本阶段修改计算逻辑，必须先更新计算函数，再更新或新增对应测试。

每个 Prompt 完成后，如果修改了计算逻辑，应运行：

```bash
pnpm test
```

如果没有运行测试，必须说明原因。

## 默认费用假设

默认费用只能作为 editable assumptions，不得写成官方长期准确费率。

建议结构：

```ts
export const defaultFees = {
  multiPlatform: { lastReviewed: '2026-06', /* ... */ },
  paymentProcessors: { lastReviewed: '2026-06', /* ... */ },
  landedCost: { lastReviewed: '2026-06', /* ... */ }
};
```

默认费用必须集中放在 `lib/defaultFees.ts`，每组默认假设必须带 `lastReviewed` 字段，格式为 `YYYY-MM`，例如 `lastReviewed: '2026-06'`。不要只写成注释。计算器页面的 DisclaimerBox 或默认假设说明区应读取并展示：`Fee assumptions last reviewed: 2026-06.`

如果文件过大，后续可以拆分为：

- `lib/defaultFees/multiPlatform.ts`
- `lib/defaultFees/paymentProcessors.ts`
- `lib/defaultFees/landedCost.ts`

但 V1 可先使用一个文件。

每个计算器页面都必须提示：费用假设可编辑，平台费用、支付费用、履约费用、关税、物流费用可能因国家、类目、账号类型、支付方式和政策变化而不同。请始终以官方来源或专业人士意见为准。

## 合规与内容限制

请严格遵守：

1. 不要把平台费率写成绝对准确的官方事实。
2. 不要承诺计算结果绝对准确。
3. 不提供金融、税务、法律、会计建议。
4. 不显示虚假的用户数量、虚假的评价、虚假的收入案例。
5. 不要写 “Used by 500+ sellers” 这类未经验证的社会证明。
6. 不要做登录系统。
7. 不要做支付系统。
8. 不要做数据库。
9. 不要接入真实邮件服务。
10. 不要做真实 CSV / PDF 导出，只做 “Pro 功能即将上线” 的提示。
11. 不要接入 AdSense。
12. 不要添加 AI 内容生成功能。
13. 所有 Pro 功能按钮只打开 `ProFeatureModal`。
14. Waitlist 表单必须明确说明：V1 demo does not send or store emails on a server.
15. V1 默认不使用非必要 cookies，也不接入 analytics；如果未来接入 analytics 或广告追踪，必须先更新 Privacy Policy / Cookie Policy，并加入 Cookie consent。
16. 不要声称已经符合 GDPR、CCPA 或其他法律；只能写明当前数据处理方式，并提醒上线前按目标市场咨询专业人士。

## 设计 Token

为避免 Codex 在不同 Prompt 中生成不一致的视觉风格，请统一使用以下基础设计 token，可映射到 Tailwind theme：

```txt
primary: #0F766E
primaryHover: #115E59
accent: #2563EB
textPrimary: #0F172A
textSecondary: #475569
background: #FFFFFF
backgroundMuted: #F8FAFC
border: #E2E8F0
error: #DC2626
warning: #D97706
success: #059669
```

整体风格：简洁、专业、SaaS 风格、商务感、适合海外卖家，不做卡通风，不使用大量动画。

## 组件设计原则

- 移动端优先。
- 卡片式布局。
- 表单字段 label 清晰。
- 错误提示显示在字段附近或表单顶部。
- 表格在桌面端清晰，在移动端可横向滚动；如实现成本允许，可改成卡片堆叠。
- 所有弹窗支持关闭按钮、点击遮罩关闭、ESC 关闭，并恢复焦点。
- ProFeatureModal 做成复用组件。
- WaitlistForm 有 email 格式校验、loading 状态、防重复提交。
- 所有按钮、输入框、选择器、弹窗都应支持键盘操作。
- 重要交互组件应有合理的 `aria-label` 或关联 label。
- 颜色对比度应尽量满足 WCAG 2.1 AA 的常见要求，但不要在页面中声称已完成正式合规认证。

## 计算器交互原则

- 计算器默认实时响应输入变化，不要求用户点击 Calculate 按钮。
- 计算逻辑必须足够轻量，优先直接实时计算。
- 如果某个表单非常长或输入导致明显卡顿，可以使用 150ms-300ms debounce。
- 不要因为 debounce 导致用户看不到及时反馈。
- 所有使用 `useState`、`useEffect`、localStorage 或浏览器 API 的交互组件必须在文件顶部添加 `'use client'`。

## 每个 Prompt 完成后的固定要求

每完成一个 Prompt，必须输出：

1. 创建或修改了哪些文件。
2. 如何本地运行。
3. 如何测试本阶段功能。
4. 默认费用假设放在哪里。
5. 计算逻辑放在哪里。
6. 有哪些 TODO。
7. 是否运行了 `pnpm build`，如果没有，说明原因。
8. 如果本阶段修改了计算逻辑，是否运行了 `pnpm test`，如果没有，说明原因。

禁止用伪代码代替真实代码。禁止使用 `// ... 其余逻辑省略`、`// keep existing code`、`// TODO implement later` 来跳过核心功能。

文档和代码中不得混入与项目无关的数学公式、Transformer/attention 公式、Gamma 函数、LaTeX 噪音或复制污染内容。

---

# Prompt 1：项目骨架、多语言、首页

请在空项目中创建 SellerMargin 的项目骨架、多语言基础、首页和基础组件。本次不要开发任何计算器逻辑。

## 本次目标

完成：

1. Next.js App Router 项目结构。
2. TypeScript + Tailwind CSS。
3. `next-intl` 多语言基础。
4. `/en`、`/zh`、`/es` 首页。
5. 根路径 `/` 跳转到 `/en`。
6. Header、Footer、LanguageSwitcher、CurrencySelector。
7. ToolCard、WaitlistForm、ProFeatureModal、DisclaimerBox。
8. About / Contact / Privacy / Terms / Disclaimer 空页面骨架。
9. 四个计算器页面空页面骨架，不实现计算逻辑。
10. SSR 安全的 `useLocalStorage` hook。
11. 基础 `not-found.tsx` 和 `error.tsx`。
12. 预留 CookieConsentBanner 组件，但 V1 不使用非必要 cookies 时默认不展示。

## 项目结构建议

请创建类似以下结构：

```txt
app/
  layout.tsx
  page.tsx
  not-found.tsx
  error.tsx
  icon.tsx
  [locale]/
    layout.tsx
    page.tsx
    not-found.tsx
    multi-platform-profit-calculator/page.tsx
    ad-spend-break-even-calculator/page.tsx
    stripe-vs-paypal-fee-calculator/page.tsx
    landed-cost-calculator/page.tsx
    about/page.tsx
    contact/page.tsx
    privacy-policy/page.tsx
    terms/page.tsx
    disclaimer/page.tsx
    guides/page.tsx
    guides/how-to-calculate-ecommerce-profit-after-ads/page.tsx
i18n/
  routing.ts
  navigation.ts
  request.ts
components/
  Header.tsx
  Footer.tsx
  LanguageSwitcher.tsx
  CurrencySelector.tsx
  ToolCard.tsx
  WaitlistForm.tsx
  ProFeatureModal.tsx
  DisclaimerBox.tsx
  CookieConsentBanner.tsx
  LayoutShell.tsx
  MobileMenu.tsx
hooks/
  useLocalStorage.ts
lib/
  locales.ts
  formatters.ts
  seo.ts
  defaultFees.ts
  calculators.ts
  calculatorTypes.ts
  validators.ts
  schemas/
    multiPlatform.ts
    adBreakEven.ts
    paymentFees.ts
    landedCost.ts
tests/
  calculators/
    multiPlatform.test.ts
    adBreakEven.test.ts
    paymentFees.test.ts
    landedCost.test.ts
messages/
  en.json
  zh.json
  es.json
public/
  robots.txt
  og-image.png
middleware.ts
```

说明：

- 根级 `app/not-found.tsx` 作为英文 fallback。
- `app/[locale]/not-found.tsx` 必须支持多语言，并包含返回当前语言首页的链接。
- Prompt 1 不要创建复杂计算器专用组件，如 `NumberInput`、`ResultTable` 的完整 API。可以先创建简单占位组件，等 Prompt 2 根据真实需求扩展。
- Next.js 15.x 统一使用 `middleware.ts`。如果安装的当前稳定版 Next.js 官方要求 `proxy.ts` / `proxy.js`，则使用官方入口。不要同时创建 `middleware.ts` 和 `proxy.ts`。

## 多语言实现要求

- 使用 `next-intl`。
- `messages/en.json`、`messages/zh.json`、`messages/es.json` 必须存在。
- `es.json` 必须包含完整 key，可暂用英文 value 占位。
- 缺失 key 必须 fallback 到英文。
- `[locale]/layout.tsx` 必须校验 locale。
- `[locale]/layout.tsx` 或相关 route segment 必须导出 `generateStaticParams()`。
- 必须创建 `i18n/routing.ts`、`i18n/navigation.ts`、`i18n/request.ts` 和根目录路由拦截入口（Next.js 15.x 为 `middleware.ts`；如当前稳定版官方要求则使用 `proxy.ts` / `proxy.js`）。
- 语言切换器应保持当前页面 slug。

## 首页内容要求

首页包含以下模块。

### Hero 区域

英文标题：Calculate Your Real Ecommerce Profit Before You Scale

英文副标题：Free calculators for ecommerce sellers. Compare platform fees, payment fees, ad spend, landed costs, and true margins across Shopify, Amazon, Etsy, eBay, and TikTok Shop.

中文标题：在扩大投放前，先算清楚你的真实利润

中文副标题：面向跨境卖家的免费计算工具，帮助你对比 Shopify、Amazon、Etsy、eBay、TikTok Shop 的平台费用、支付费用、广告成本、到岸成本和真实利润率。

CTA：

- Start calculating
- Join Pro waitlist

### 工具卡片区域

展示 4 个工具：

1. Multi-platform Profit Calculator
2. Ad Spend Break-even Calculator
3. Stripe vs PayPal Fee Calculator
4. Landed Cost Calculator

每个工具卡片包含：

- 工具名称。
- 一句话说明。
- Open calculator 链接。
- 简洁图标或 SVG/emoji。

### 为什么使用本网站

展示 4 个卖点：

- No signup required
- Editable fee assumptions
- Built for sellers who run ads
- Compare platforms before you launch

### Pro 功能预告

展示未来会员功能：

- Save calculation history
- Export CSV
- Export PDF report
- Batch SKU calculator
- White-label reports for agencies

不要展示 Remove ads，因为 V1 不接入广告，避免逻辑矛盾。

按钮：Join Pro waitlist

### 等候名单表单

字段：

- Email
- Seller type 下拉选项：
  - Shopify seller
  - Amazon seller
  - Etsy seller
  - eBay seller
  - TikTok Shop seller
  - Multi-platform seller
  - Agency
  - Other

要求：

- 第一版不接真实邮件服务。
- 不发送请求到后端。
- 可把 demo 状态保存在 localStorage，但不要保存敏感信息到数据库。
- 加 email 格式校验。
- 加 loading 状态。
- 防止重复提交。
- 表单下方显示：This demo form does not send or store emails on a server in V1.

提交后显示：

英文：Thanks! You are on the early access list.

中文：谢谢！你已加入早期访问名单。

### 首页免责声明

英文：These calculators are for planning and estimation purposes only. Platform fees, payment fees, taxes, customs duties, shipping costs, and advertising costs may change. Always verify important numbers with official sources or a qualified professional.

中文：这些计算器仅用于规划和估算。平台费用、支付费用、税费、关税、物流费用和广告成本都可能变化。重要数据请始终以官方来源或专业人士意见为准。

## Header 要求

导航栏包含：

- Logo / SellerMargin
- Tools
- Guides
- About
- Contact
- Currency selector
- Language switcher
- CTA：Join Pro Waitlist

移动端需要 hamburger menu。

## Footer 要求

页脚包含：

- Tools
- Guides
- About
- Contact
- Privacy Policy
- Terms
- Disclaimer
- 简短免责声明

## 本次不要做

不要开发：

- 多平台利润计算器逻辑。
- 广告回本计算器逻辑。
- 支付手续费计算器逻辑。
- 到岸成本计算器逻辑。
- 登录。
- 支付。
- 数据库。
- 真实邮件提交。
- AdSense。
- 真实 CSV/PDF 导出。

## 验收标准

完成后应满足：

1. 项目可以本地运行。
2. `/en`、`/zh`、`/es` 路由可访问。
3. 根路径 `/` 能跳转到 `/en`。
4. 无效 locale 有合理处理。
5. Header 和 Footer 正常显示。
6. 语言切换器可用并保持当前路径。
7. CurrencySelector 可用，且不与语言绑定。
8. 首页内容完整。
9. WaitlistForm 有校验、成功状态和 demo 说明。
10. ProFeatureModal 可用，支持关闭按钮、遮罩关闭、ESC 关闭。
11. 移动端显示正常。
12. 四个计算器页面有空页面骨架，但没有实现计算逻辑。
13. About、Contact、Privacy、Terms、Disclaimer 页面有空页面骨架。
14. `not-found.tsx` 和 `error.tsx` 可用。
15. CookieConsentBanner 组件存在，但在 `NEXT_PUBLIC_ANALYTICS_ENABLED` 未开启时必须 `return null`，不向 DOM 注入 banner 或隐藏弹窗。
14. `useLocalStorage` SSR 安全。
15. 没有虚假用户数和虚假评价。
16. 没有真实支付、登录、数据库、广告接入。

---

# Prompt 2：多平台利润计算器

请在现有项目基础上开发多平台利润计算器。本次只完成这个计算器，不要开发其他计算器。

## 页面路径

请实现：

- `/en/multi-platform-profit-calculator`
- `/zh/multi-platform-profit-calculator`
- `/es/multi-platform-profit-calculator`

## 页面标题

英文：Multi-platform Profit Calculator for Ecommerce Sellers

中文：跨平台电商利润计算器

## 页面用途

帮助用户比较同一个产品在 Shopify、Etsy、eBay、Amazon、TikTok Shop 上销售时的预估净利润。

## 重要开发原则

1. 不要把平台费率写成绝对准确的官方事实。
2. 所有平台费用、支付费用、履约费用都必须是用户可编辑的默认假设值。
3. 默认费用必须放在 `lib/defaultFees.ts`。
4. 计算逻辑必须放在 `lib/calculators.ts` 或单独 utility 文件里，不要直接写死在页面 UI 里。
5. 表单 UI 可以从本 Prompt 开始创建或完善 `NumberInput`、`ResultCard`、`ResultTable`、`FormulaBlock`、`FAQSection`、`RelatedTools`。
6. 所有输入要校验。
7. 要防止除以 0。
8. 结果需要支持货币格式化和百分比格式化。
9. 支持移动端。桌面端优先使用表格，移动端可横向滚动或卡片堆叠。
10. 百分比输入中，用户输入 `30` 表示 `30%`。

## 输入项

### 产品基础信息

- Selling price
- Product cost
- Seller-paid shipping cost
- Packaging cost
- Ad cost per order
- Refund rate percentage
- Discount rate percentage
- Other variable cost
- Currency

### 平台选择

用户可以选择比较以下平台：

- Shopify
- Etsy
- eBay
- Amazon
- TikTok Shop

首次访问默认至少选中 Shopify、Etsy、Amazon；如果 localStorage 中已有用户历史选择，优先恢复历史选择。

### 平台费用假设

每个平台费用都必须可编辑。

Shopify 默认假设字段：

- Payment fee percentage
- Fixed payment fee
- Third-party transaction fee percentage
- Other fixed platform fee

说明：如果使用 Shopify Payments，third-party transaction fee 可以设为 0。

Etsy 默认假设字段：

- Marketplace transaction fee percentage
- Payment fee percentage
- Fixed payment fee
- Listing fee
- Other fixed platform fee

eBay 默认假设字段：

- Final value fee percentage
- Fixed order fee
- Optional promoted listing ad fee percentage
- Other fixed platform fee

Amazon 默认假设字段：

- Referral fee percentage
- Fulfillment fee per unit
- Storage or other fee per unit
- Other fixed platform fee

TikTok Shop 默认假设字段：

- Referral fee percentage
- Payment fee percentage
- Fixed payment fee
- Affiliate / creator commission percentage，optional
- Other fixed platform fee

这些默认值只作为 editable estimates，不要写成官方长期准确费率。

## 输出项

对每个平台显示：

- Gross revenue
- Discount amount
- Net revenue
- Platform fee
- Payment fee
- Fulfillment fee
- Product cost
- Shipping cost
- Packaging cost
- Ad cost
- Refund reserve
- Other variable cost
- Total cost
- Net profit
- Profit margin
- Gross ROAS
- Net revenue ROAS
- POAS / Profit on Ad Spend

额外显示：

- Best platform by net profit
- Best platform by margin
- Lowest fee platform

## 公式

百分比输入先转换为小数，例如用户输入 `10`，内部按 `0.10` 计算。

```txt
Gross revenue = Selling price
Discount amount = Selling price × Discount rate
Net revenue = Selling price - Discount amount
```

退款准备金 V1 使用保守的收入口径：

```txt
Refund reserve = Net revenue × Refund rate

说明：Refund reserve 是简化的保守毛损估算，未精确计算平台佣金是否退还、支付网关固定费是否退还、退货物流、库存损耗等。精确的支付费损耗请引导用户使用 Stripe vs PayPal Fee Calculator。
```

页面 tooltip 说明：This is a simplified conservative estimate. Actual refund loss may depend on whether product cost, shipping, platform fees, payment fees, and return shipping are recoverable.

平台费和支付费：

```txt
Platform fee = Net revenue × Platform fee percentage + fixed platform fees + optional other fixed platform fee
Payment fee = Net revenue × Payment fee percentage + fixed payment fee
Fulfillment fee = fulfillment-related per-unit fees
```

总成本必须明确写成加法：

```txt
Total cost = Product cost + Seller-paid shipping cost + Packaging cost + Ad cost per order + Refund reserve + Platform fee + Payment fee + Fulfillment fee + Other variable cost
Net profit = Net revenue - Total cost
Profit margin = Net profit / Net revenue × 100
Gross ROAS = Gross revenue / Ad cost
Net revenue ROAS = Net revenue / Ad cost
POAS = Net profit / Ad cost
```

说明：Gross ROAS 更接近广告平台常见口径；Net revenue ROAS 用折扣后收入；POAS 用净利润衡量广告花费后的利润效率。页面必须避免把三者混为同一个指标。

边界处理：

- 如果 Ad cost <= 0，Gross ROAS、Net revenue ROAS 和 POAS 显示 N/A。
- 如果 Net revenue <= 0，显示错误提示，不要继续正常计算利润率。
- 如果任何金额输入为空、NaN、Infinity，按安全默认值处理或显示错误。
- 如果平台费用导致 Total cost 过高，可以正常显示负利润，但必须清晰标红。

## 页面内容结构

本页面必须包含：

1. SEO H1
2. 简短说明
3. 费用假设提示
4. 计算器表单
5. 结果区域
6. 公式说明
7. 示例计算
8. 常见错误
9. FAQ
10. 相关工具
11. Pro 功能预告
12. Last updated
13. 免责声明

## FAQ

英文 FAQ：

1. Why is my profit different across platforms?
2. Are the platform fee assumptions accurate?
3. Does this include VAT, sales tax, or income tax?
4. How should I estimate ad cost per order?
5. What is a common profit margin range for ecommerce sellers?

中文 FAQ：

1. 为什么同一个产品在不同平台的利润不一样？
2. 这些平台费用假设是否准确？
3. 这个计算器是否包含 VAT、销售税或所得税？
4. 我应该如何估算每单广告成本？
5. 跨境电商卖家的常见利润率范围是多少？

注意：不要把“合理利润率是多少”写成具体建议或保证，应使用“常见范围”“取决于类目和成本结构”等谨慎表达。

## Pro 功能预告

显示以下按钮，但不要实现真实功能：

- Save calculation history — Pro
- Export CSV — Pro
- Export PDF — Pro
- Batch calculation — Pro

点击后打开 ProFeatureModal：

英文：This Pro feature is coming soon. Join the waitlist to get early access.

中文：这个 Pro 功能即将上线。加入等候名单即可获得早期访问资格。

## localStorage

通过 `useLocalStorage` 保存：

- 用户最近一次输入。
- 用户选择的平台。
- 用户编辑过的费用假设。

不要保存敏感信息。不要保存明文邮箱、支付信息、真实身份信息、地址、手机号等；只能保存计算输入、显示偏好、demo 状态等低风险数据。localStorage 保存原始用户输入值，不保存转换后的内部百分比。

## 验收标准

完成后应满足：

1. 三种语言路径可访问。
2. 表单输入正常。
3. 用户可以选择多个平台比较。
4. 用户可以编辑所有费用假设。
5. 结果实时更新。
6. 净利润、利润率、Gross ROAS、Net revenue ROAS、POAS 计算正确。
7. Ad cost <= 0 时 ROAS / POAS 显示 N/A。
8. Net revenue <= 0 时显示错误提示。
9. 最高净利润平台被高亮。
10. 最高利润率平台被高亮。
11. 最低费用平台被高亮。
12. 移动端显示正常。
13. localStorage SSR 安全并能保存最近输入。
14. 页面有公式说明、示例、FAQ、免责声明。
15. 没有真实支付、登录、数据库、广告接入。

---

# Prompt 3：广告回本 ROAS 计算器

请在现有项目基础上开发广告回本 ROAS 计算器。本次只完成这个计算器，不要开发其他计算器。

## 页面路径

请实现：

- `/en/ad-spend-break-even-calculator`
- `/zh/ad-spend-break-even-calculator`
- `/es/ad-spend-break-even-calculator`

## 页面标题

英文：Break-even ROAS and Ad Spend Calculator

中文：广告回本 ROAS 计算器

## 页面用途

帮助卖家计算：

- 广告最多能花多少钱。
- ROAS 达到多少才不会亏损。
- 要达到目标利润需要多少 ROAS。
- Max CPA。
- Break-even ACoS。
- Target ACoS。

## 输入项

### 产品经济模型

- Selling price
- Product cost
- Shipping cost
- Packaging cost
- Platform fee percentage
- Payment fee percentage
- Fixed payment fee
- Other variable cost
- Currency

本计算器的 Revenue 等于 Selling price，不包含折扣。请与多平台计算器里的 Net revenue 区分，避免在 `calculators.ts` 中函数命名冲突。

### 目标利润

支持两种模式：

1. Target profit per order
2. Target profit margin percentage

用户可以切换模式。切换时保留输入值并实时重新计算。

### 当前广告指标，可选

- Current ROAS
- Current CPA

如果用户没有输入 Current ROAS，不显示 Profit status indicator，或显示 “Enter current ROAS to evaluate status.”

## 输出项

- Revenue
- Platform fee
- Payment fee
- Variable cost before ads
- Contribution margin before ads
- Break-even ad spend per order
- Max CPA at break-even
- Break-even ROAS
- Target ad spend per order
- Target CPA
- Target ROAS
- Break-even ACoS
- Target ACoS
- Profit status indicator

## 公式

```txt
Revenue = Selling price

说明：本计算器假定 Revenue = Selling price，未扣除折扣。如果广告订单普遍使用折扣码，请在 Selling price 中直接输入折后平均售价，以获得更接近实际的 ROAS 估算。
Platform fee = Revenue × Platform fee percentage
Payment fee = Revenue × Payment fee percentage + Fixed payment fee
Variable cost before ads = Product cost + Shipping cost + Packaging cost + Platform fee + Payment fee + Other variable cost
Contribution margin before ads = Revenue - Variable cost before ads
Break-even ad spend per order = Contribution margin before ads
Max CPA at break-even = Break-even ad spend per order
Break-even ROAS = Revenue / Break-even ad spend per order
```

目标利润：

```txt
Target profit = Target profit per order
```

或：

```txt
Target profit = Revenue × Target profit margin
```

目标广告支出：

```txt
Target ad spend per order = Contribution margin before ads - Target profit
Target CPA = Target ad spend per order
Target ROAS = Revenue / Target ad spend per order
Break-even ACoS = Break-even ad spend per order / Revenue
Target ACoS = Target ad spend per order / Revenue
```

## 边界处理

如果 Contribution margin before ads <= 0，显示警告：

英文：This product is not profitable before advertising based on your current inputs.

中文：根据当前输入，这个产品在投放广告前已经不盈利。

如果 Target ad spend per order <= 0，显示警告：

英文：Your target profit is higher than the available contribution margin. You may need to increase price, reduce costs, or lower the target margin.

中文：你的目标利润高于当前可用贡献毛利。你可能需要提高售价、降低成本或下调目标利润率。

如果 Revenue <= 0，不计算 ROAS 或 ACoS，显示 N/A 或错误提示。

如果分母 <= 0，不计算 ROAS，显示 N/A 或警告。

## 状态显示

如果用户输入 Current ROAS：

- Current ROAS > Target ROAS：Profitable / 盈利
- Current ROAS 在 Break-even ROAS 和 Target ROAS 之间：Above break-even but below target / 高于回本线，但低于目标利润
- Current ROAS = Break-even ROAS：Breaking even / 刚好回本
- Current ROAS < Break-even ROAS：Losing money / 亏损

注意：浮点数比较应允许极小误差，例如 epsilon = 0.0001。

## 页面内容结构

本页面必须包含：

1. SEO H1
2. 简短说明
3. 计算器表单
4. 结果区域
5. 公式说明
6. 示例计算
7. 常见错误
8. FAQ
9. 相关工具
10. Pro 功能预告
11. Last updated
12. 免责声明

## FAQ

英文 FAQ：

1. What is break-even ROAS?
2. What is the difference between ROAS and ACoS?
3. How do I calculate max CPA?
4. Why is my target ROAS so high?
5. How can I lower my break-even ROAS?

中文 FAQ：

1. 什么是 break-even ROAS？
2. ROAS 和 ACoS 有什么区别？
3. 如何计算 Max CPA？
4. 为什么我的目标 ROAS 这么高？
5. 如何降低广告回本 ROAS？

## localStorage

通过 `useLocalStorage` 保存用户最近一次输入。

## 验收标准

完成后应满足：

1. 三种语言路径可访问。
2. 输入项正常。
3. 目标利润金额和目标利润率两种模式可切换。
4. Contribution margin 计算正确。
5. Break-even ROAS 计算正确。
6. Target ROAS 计算正确。
7. ACoS 计算正确。
8. Revenue <= 0 或分母 <= 0 时不会报错。
9. 状态提示显示正确。
10. 页面包含公式、示例、FAQ、免责声明。
11. 移动端显示正常。
12. localStorage SSR 安全并能保存最近输入。
13. 没有真实支付、登录、数据库、广告接入。

---

# Prompt 4：Stripe vs PayPal 手续费计算器

请在现有项目基础上开发 Stripe vs PayPal 手续费计算器。本次只完成这个计算器，不要开发其他计算器。

## 页面路径

请实现：

- `/en/stripe-vs-paypal-fee-calculator`
- `/zh/stripe-vs-paypal-fee-calculator`
- `/es/stripe-vs-paypal-fee-calculator`

## 页面标题

英文：Stripe vs PayPal Fee Calculator for Online Sellers

中文：Stripe vs PayPal 手续费计算器

## 页面用途

帮助卖家在不同支付费用假设下，对比 Stripe、PayPal、Shopify Payments 等支付方式的手续费和实际到账金额。

## 重要开发原则

1. 不要写死“当前官方费率一定是多少”。
2. 所有费用必须可编辑。
3. 默认值放在 `lib/defaultFees.ts`。
4. 页面必须提示：费用假设是可编辑估算值，支付手续费可能因国家、货币、卡类型、账号类型、交易类型和政策变化而不同。
5. 不提供金融、税务、法律或会计建议。
6. 计算逻辑和 UI 分离。
7. Refund rate、Chargeback rate 必须参与公式，不得成为死字段。

## 输入项

- Transaction amount
- Number of transactions，明确表示 monthly number of transactions
- Currency
- Stripe percentage fee
- Stripe fixed fee
- Stripe international card surcharge percentage，optional
- Stripe currency conversion fee percentage，optional
- Stripe refund retained percentage fee，optional
- Stripe refund non-refundable fixed fee，optional
- Stripe chargeback fixed fee，optional
- PayPal percentage fee
- PayPal fixed fee
- PayPal international card surcharge percentage，optional
- PayPal currency conversion fee percentage，optional
- PayPal refund retained percentage fee，optional
- PayPal refund non-refundable fixed fee，optional
- PayPal chargeback fixed fee，optional
- Shopify Payments percentage fee
- Shopify Payments fixed fee
- Shopify Payments international card surcharge percentage，optional
- Shopify Payments currency conversion fee percentage，optional
- Shopify Payments refund retained percentage fee，optional
- Shopify Payments refund non-refundable fixed fee，optional
- Shopify Payments chargeback fixed fee，optional
- Optional extra fee percentage
- Refund rate percentage
- Chargeback rate percentage

高级选项 UI 要求：

- International card surcharge、Currency conversion fee、Refund retained percentage fee、Refund non-refundable fixed fee、Chargeback fixed fee、Optional extra fee percentage 默认放入 `Advanced fees` 折叠区。
- 移动端默认收起 Advanced fees，只展示摘要和“Edit advanced fees”按钮。
- Optional extra fee percentage 是全局可选附加费率，适用于所有支付方式；如需为某个支付方式设置不同附加费，应直接调整该支付方式的 percentage fee 或该支付方式的 advanced fee。

## 输出项

对每个支付方式显示：

- Gross transaction volume
- Base fee per transaction
- Extra percentage fee per transaction
- Estimated refund cost
- Estimated chargeback cost
- Total fees
- Net received
- Effective fee rate
- Difference vs lowest-cost provider
- Monthly estimated fees
- Annual estimated fees

额外显示：

- Lowest-cost provider
- Highest-cost provider
- Estimated monthly savings
- Estimated annual savings

## 公式

```txt
Gross transaction volume = Transaction amount × Number of transactions
Base fee per transaction = Transaction amount × Percentage fee + Fixed fee
Extra percentage fee per transaction = Transaction amount × (Optional extra fee percentage + International card surcharge percentage + Currency conversion fee percentage)
Fee per transaction = Base fee per transaction + Extra percentage fee per transaction
Base total fees = Fee per transaction × Number of transactions
Estimated refunded transactions = Number of transactions × Refund rate
Estimated refunded volume = Transaction amount × Estimated refunded transactions
Estimated refund cost = Estimated refunded volume × Refund retained percentage fee + Estimated refunded transactions × Refund non-refundable fixed fee
Estimated chargeback transactions = Number of transactions × Chargeback rate
Estimated chargeback cost = Estimated chargeback transactions × Chargeback fixed fee
Total fees = Base total fees + Estimated refund cost + Estimated chargeback cost
Net received = Gross transaction volume - Total fees
Effective fee rate = Total fees / Gross transaction volume × 100
Monthly estimated fees = Total fees
Annual estimated fees = Monthly estimated fees × 12
Savings = Highest total fees - Lowest total fees
```

说明：Refund rate 和 Chargeback rate 在 V1 中只估算支付侧额外费用，不估算商品退款损失、库存损失或物流损失。不同支付服务商对退款手续费是否退还的规则可能不同，因此 Refund retained percentage fee 和 Refund non-refundable fixed fee 都必须是可编辑假设值。

避免重复计算：Base total fees 已经包含所有原始交易的基础手续费。Estimated refund cost 只能表示退款场景下额外保留、额外扣除或明确需要单独估算的支付侧成本。若某项手续费已完全包含在 Base total fees 中，不得在 Estimated refund cost 中重复加入。Refund retained percentage fee 的默认值建议为 0，并通过 tooltip 提醒用户根据支付服务商规则自行调整。

Refund retained percentage fee 定义：支付服务商在退款时保留或不退还的百分比手续费占原始交易金额的比例。

## 边界处理

如果 Transaction amount <= 0，显示错误：

英文：Transaction amount must be greater than zero.

中文：交易金额必须大于 0。

如果 Number of transactions <= 0，显示错误：

英文：Number of transactions must be greater than zero.

中文：交易笔数必须大于 0。

如果 Gross transaction volume <= 0，不要计算 effective fee rate。

如果 Refund rate 或 Chargeback rate < 0，显示错误。

如果任一百分比 >= 1000%，显示 warning，提示用户检查输入。

## 页面提示

英文：Fee assumptions are editable estimates. Payment processor fees vary by country, currency, card type, account type, transaction type, and policy updates. Always verify current rates with each provider.

中文：费用假设是可编辑的估算值。支付手续费可能因国家、货币、银行卡类型、账号类型、交易类型和政策变化而不同。请始终以各支付服务商的官方最新费率为准。

## 页面内容结构

本页面必须包含：

1. SEO H1
2. 简短说明
3. 计算器表单
4. 结果区域
5. 公式说明
6. 示例计算
7. 常见错误
8. FAQ
9. 相关工具
10. Pro 功能预告
11. Last updated
12. 免责声明

## FAQ

英文 FAQ：

1. Why do Stripe and PayPal fees differ?
2. Are these payment fee assumptions official?
3. Do these fees include currency conversion?
4. Do refunds and chargebacks change the final cost?
5. How can online sellers reduce payment processing fees?

中文 FAQ：

1. 为什么 Stripe 和 PayPal 的手续费不同？
2. 这些支付费用假设是官方费率吗？
3. 这些费用包含货币转换费吗？
4. 退款和拒付会影响最终成本吗？
5. 在线卖家如何降低支付手续费？

## localStorage

通过 `useLocalStorage` 保存用户最近一次输入和编辑过的费用假设。

## 验收标准

完成后应满足：

1. 三种语言路径可访问。
2. 用户可以编辑 Stripe、PayPal、Shopify Payments 的费用假设。
3. 总交易额计算正确。
4. 每笔手续费计算正确。
5. Refund rate 和 Chargeback rate 参与计算。
6. 总手续费计算正确。
7. 实际到账金额计算正确。
8. 有效费率计算正确。
9. 最低成本支付方式显示正确。
10. 月度和年度节省金额计算正确。
11. 输入非法值时显示错误。
12. 页面包含公式、示例、FAQ、免责声明。
13. 移动端显示正常。
14. localStorage SSR 安全并能保存最近输入。
15. 没有真实支付、登录、数据库、广告接入。

---

# Prompt 5：到岸成本计算器

请在现有项目基础上开发到岸成本计算器。本次只完成这个计算器，不要开发其他计算器。

## 页面路径

请实现：

- `/en/landed-cost-calculator`
- `/zh/landed-cost-calculator`
- `/es/landed-cost-calculator`

## 页面标题

英文：Landed Cost Calculator for Importers and Ecommerce Sellers

中文：到岸成本计算器

## 页面用途

帮助小型进口商和跨境卖家计算产品从采购到入库、清关、销售前的真实单位成本。

## 输入项

### 产品

- Product unit cost
- Quantity
- Currency
- HS code，可选，仅作备注，不自动查询
- Supplier country，可选
- Destination country，可选

### 国际物流

- International freight cost
- Insurance cost
- Freight type：Sea / Air / Express / Other

### 进口费用

- Customs valuation method：CIF / FOB
- Customs duty rate percentage
- Import tax / VAT / GST rate percentage
- Include VAT/GST as cost：Yes / No
- Customs broker fee
- Other import fees

说明：

- CIF：关税基数包含 product unit cost + freight per unit + insurance per unit。
- FOB：关税基数只使用 product unit cost。
- 这只是估算模型，不代表所有国家或地区的海关规则。

### 销售费用

- Selling price per unit
- Platform fee percentage
- Payment fee percentage
- Fixed payment fee
- Ad cost per order
- Refund rate percentage
- Domestic delivery cost per unit
- Packaging cost per unit
- Warehouse or prep cost per unit
- Other cost per unit
- Target margin percentage

## 输出项

- Total product cost
- Freight per unit
- Insurance per unit
- Customs value per unit
- Duty amount per unit
- Import tax / VAT / GST amount per unit
- Broker fee per unit
- Other import fees per unit
- Landed cost per unit
- Selling fees per unit
- Fixed cost per unit before selling-rate costs
- Variable selling-rate cost percentage
- Total cost per unit
- Net profit per unit
- Profit margin
- Break-even selling price
- Suggested price for 30% margin
- Suggested price for 50% margin
- Suggested price for user-defined target margin

## 公式

```txt
Total product cost = Product unit cost × Quantity
Freight per unit = International freight cost / Quantity
Insurance per unit = Insurance cost / Quantity
```

海关价值：

```txt
If Customs valuation method = CIF:
Customs value per unit = Product unit cost + Freight per unit + Insurance per unit

If Customs valuation method = FOB:
Customs value per unit = Product unit cost
```

进口费用：

```txt
Duty per unit = Customs value per unit × Customs duty rate
Import tax per unit = (Customs value per unit + Duty per unit) × Import tax rate
Broker fee per unit = Customs broker fee / Quantity
Other import fees per unit = Other import fees / Quantity
```

如果 Include VAT/GST as cost = No：

- Import tax per unit 在结果中显示。
- 不计入 Landed cost per unit。
- 显示说明：VAT/GST may be recoverable in some jurisdictions. This switch only changes whether it is treated as a cost in this estimate.

到岸成本：

```txt
Landed cost per unit = Product unit cost + Freight per unit + Insurance per unit + Duty per unit + Included import tax per unit + Broker fee per unit + Other import fees per unit
```

销售费：

```txt
Selling percentage fees per unit = Selling price × Platform fee percentage + Selling price × Payment fee percentage
Selling fixed fees per unit = Fixed payment fee
Refund reserve = Selling price × Refund rate
Selling fees per unit = Selling percentage fees per unit + Selling fixed fees per unit
```

说明：本计算器的 Refund reserve 以 Selling price 为基数（而非 Net revenue），因为到岸成本场景默认不包含折扣字段。请在 `calculators.ts` 中使用不同函数名，例如 `calcRefundReserveByNetRevenue` 和 `calcRefundReserveBySellingPrice`，避免与 Prompt 2 的退款准备金口径混淆。

总成本：

```txt
Total cost per unit = Landed cost per unit + Selling fees per unit + Ad cost per order + Refund reserve + Domestic delivery cost per unit + Packaging cost per unit + Warehouse or prep cost per unit + Other cost per unit
Net profit per unit = Selling price - Total cost per unit
Profit margin = Net profit per unit / Selling price × 100
```

Break-even selling price 不能写成模糊的 `Total cost per unit before profit`。由于平台费、支付费和退款准备金都可能随售价变化，应先区分“固定非售价成本”和“随售价变化的费率成本”，再反推售价：

```txt
Fixed non-selling cost per unit = Landed cost per unit + Ad cost per order + Domestic delivery cost per unit + Packaging cost per unit + Warehouse or prep cost per unit + Other cost per unit
Fixed payment fee per unit = Fixed payment fee
Variable selling-rate cost = Platform fee percentage + Payment fee percentage + Refund rate
Break-even selling price = (Fixed non-selling cost per unit + Fixed payment fee per unit) / (1 - Variable selling-rate cost)
```

目标售价：

```txt
Suggested price for target margin = (Fixed non-selling cost per unit + Fixed payment fee per unit) / (1 - Variable selling-rate cost - Target margin)
```

边界：

- 如果 `1 - Variable selling-rate cost <= 0`，Break-even selling price 显示 N/A。
- 如果 `1 - Variable selling-rate cost - Target margin <= 0`，Suggested price 显示 N/A，并提示目标利润率过高或费用率过高。
- 如果 `1 - Variable selling-rate cost < 0.05`，显示 warning：费用率占比非常高，反推售价可能不现实。

## 边界处理

如果 Quantity <= 0，显示错误：

英文：Quantity must be greater than zero.

中文：数量必须大于 0。

如果 target margin >= 100%，显示错误：

英文：Target margin must be below 100%.

中文：目标利润率必须低于 100%。

如果 Selling price <= 0，不计算 profit margin，显示 N/A。

如果 Quantity 很大或金额很大，结果仍应稳定，不显示 NaN 或 Infinity。

## 页面内容结构

本页面必须包含：

1. SEO H1
2. 简短说明
3. 计算器表单
4. 结果区域
5. 成本拆解表格
6. 公式说明
7. 示例计算
8. 常见错误
9. FAQ
10. 相关工具
11. Pro 功能预告
12. Last updated
13. 免责声明

## FAQ

英文 FAQ：

1. What is landed cost?
2. Why does landed cost matter for ecommerce sellers?
3. Should VAT/GST be included as a cost?
4. What is the difference between CIF and FOB for duty estimates?
5. What is the difference between landed cost and total selling cost?

中文 FAQ：

1. 什么是到岸成本？
2. 为什么到岸成本对跨境电商卖家很重要？
3. VAT/GST 是否应该计入成本？
4. CIF 和 FOB 在关税估算中有什么区别？
5. 到岸成本和销售总成本有什么区别？

## 页面提示

英文：This calculator is for estimation only. Duty, VAT, GST, customs rules, and shipping charges vary by country, product category, HS code, and policy updates. Always verify important numbers with official customs sources or a qualified professional.

中文：本计算器仅用于估算。关税、VAT、GST、清关规则和物流费用会因国家、产品类别、HS 编码和政策变化而不同。请始终以海关官方信息或专业人士意见为准。

## localStorage

通过 `useLocalStorage` 保存用户最近一次输入。

## 验收标准

完成后应满足：

1. 三种语言路径可访问。
2. Quantity <= 0 时不报错，显示错误。
3. CIF / FOB 切换有效。
4. Freight per unit 计算正确。
5. Duty per unit 计算正确。
6. Import tax 计算正确。
7. Include VAT/GST as cost 开关有效。
8. Landed cost per unit 计算正确。
9. Total cost per unit 计算正确。
10. Net profit per unit 计算正确。
11. Break-even selling price 公式正确。
12. Suggested price 计算正确。
13. 页面包含公式、示例、FAQ、免责声明。
14. 移动端显示正常。
15. localStorage SSR 安全并能保存最近输入。
16. 没有真实支付、登录、数据库、广告接入。

---

# Prompt 6：法律页、About、Contact、Guides 页面

请在现有项目基础上完善非计算器页面。本次只完成法律页、信任页和指南页，不要开发新计算器。

## 需要完成的页面

请完成三种语言路径下的这些页面：

- `/[locale]/about`
- `/[locale]/contact`
- `/[locale]/privacy-policy`
- `/[locale]/terms`
- `/[locale]/disclaimer`
- `/[locale]/guides`
- `/[locale]/guides/how-to-calculate-ecommerce-profit-after-ads`

## About 页面

内容要说明：

- SellerMargin 是一个面向电商卖家的免费计算工具站。
- 网站帮助卖家估算利润、广告回本、平台费用、支付手续费和到岸成本。
- 第一版不需要注册。
- 计算结果仅供规划和估算。
- 不提供金融、税务、法律、会计建议。
- 未来可能推出 Pro 功能，例如保存历史、批量 SKU、CSV/PDF 导出和白标报告。

不要写虚假团队、虚假用户数、虚假融资、虚假案例。

## Contact 页面

内容包含：

- 联系说明。
- 邮箱从 `NEXT_PUBLIC_CONTACT_EMAIL` 读取。
- 如果环境变量缺失，可显示 `[replace-with-real-email@yourdomain.com]` 占位。
- 用明显提示标注：上线前必须配置真实联系邮箱。
- Contact 表单只做前端 demo，不接真实后端。
- 表单字段：Name、Email、Message。
- 提交后显示 demo 成功状态。
- 表单下方提示：This demo form does not send messages to a server in V1.

不要使用 `hello@example.com` 作为看起来真实的正式联系方式，避免上线后忘记替换。

## Privacy Policy 页面

内容必须说明：

- V1 不需要注册。
- V1 不使用数据库保存用户账号。
- V1 的计算器输入主要保存在用户浏览器的 localStorage。
- WaitlistForm 和 ContactForm 在 V1 中是 demo，不发送到真实服务器。
- V1 默认不使用非必要 cookies，不接入 analytics，不做广告追踪。
- 如果未来接入 analytics、邮件服务、支付、账号系统、广告追踪或任何第三方脚本，Privacy Policy 和 Cookie Policy 必须更新，并在需要时启用 Cookie consent。
- 不要声称已经接入了尚未接入的第三方服务。

## Terms 页面

内容必须说明：

- 使用本网站即表示接受条款。
- 工具仅用于估算和规划。
- 不保证结果准确、完整或适用于所有场景。
- 用户需要自行验证平台费用、税费、关税、物流和广告数据。
- 不提供金融、税务、法律、会计建议。
- 不承担因使用估算结果造成的商业损失。

## Disclaimer 页面

内容必须说明：

- 所有计算器仅用于估算。
- 平台费用、支付费用、税费、关税、物流费用、广告成本可能变化。
- 默认费率是可编辑假设，不代表官方长期准确费率。
- 不提供金融、税务、法律、会计建议。
- 重要决策请咨询官方来源或合格专业人士。

## Guides 首页

内容要求：

- 显示指南列表。
- 第一篇指南：How to Calculate Ecommerce Profit After Ads。
- 链接到四个计算器。
- 每种语言都有页面结构。
- 西班牙语如果暂时不能完整翻译，可使用英文占位，但 title、H1、meta description 和主要导航应有西班牙语。

## 第一篇 Guide 页面

标题：

英文：How to Calculate Ecommerce Profit After Ads

中文：如何计算广告后的电商真实利润

内容结构：

1. Introduction
2. Why gross profit is not enough
3. Key costs to include
   - Product cost
   - Shipping
   - Platform fees
   - Payment fees
   - Refund reserve
   - Ad spend
   - Import or landed costs
4. Basic formula
5. Example calculation
6. How to use the calculators on this site
7. Common mistakes
8. Disclaimer

要求：

- 内容实用，优先用清晰小标题和要点式表达。
- 不夸张。
- 不承诺收益。
- 不提供税务、法律、金融建议。
- 链接到四个计算器页面。
- 每种语言都要有页面结构。
- 英文正文建议 600-900 words，中文正文建议 800-1200 字，不要写成冗长水文。
- 英文和中文内容尽量完整。
- 西班牙语可先保留英文正文占位，但 title、H1、meta description、按钮、FAQ 问题和主要导航必须先翻译成西班牙语。

## Metadata 要求

每页有基础 metadata：

- title
- description
- canonical
- openGraph title
- openGraph description

## Guide 内容长度控制

第一篇 Guide 的英文正文建议 600-900 words，中文正文建议 800-1200 字。若本 Prompt 输出过长，优先完成英文正文；中文和西班牙语正文可在 Prompt 8 TODO 中补齐。但 Guide 页面结构、metadata、FAQ 问题、主要 CTA、免责声明和内部链接必须三语言同时完成。

## 验收标准

完成后应满足：

1. 所有页面三种语言路径可访问。
2. Header/Footer 链接正常。
3. 法律页内容完整。
4. About 不包含虚假用户数或虚假团队。
5. Contact 表单不接真实后端，并明确 demo 状态。
6. Privacy Policy 说明 localStorage。
7. Guides 首页存在。
8. 第一篇 Guide 页面存在。
9. Guide 页面链接到相关计算器。
10. 移动端显示正常。
11. 每页有基础 metadata。

---

# Prompt 7：SEO、sitemap、robots、Vercel 部署检查

请在现有项目基础上完成 SEO 和部署准备。本次不要开发新功能，只做 SEO、metadata、sitemap、robots、部署检查。

## SEO 要求

每个语言版本页面都要有：

- title
- meta description
- H1
- canonical
- hreflang
- Open Graph title
- Open Graph description
- 内部链接
- 清晰 heading 结构

## 多语言 SEO

必须支持：

- `/en`
- `/zh`
- `/es`

每个页面都要有对应语言版本。

请确保：

1. canonical 指向当前语言页面。
2. hreflang 包含 en、zh、es。
3. hreflang 包含 x-default，指向根路径 `/`；根路径再跳转到 `/en`。
4. sitemap 包含所有语言 URL。
5. 根路径 `/` 能正确处理。
6. 语言切换不会导致 404。
7. 无效 locale 有合理处理。

## Metadata 实现要求

- 使用 Next.js App Router 推荐方式实现 metadata。
- 如页面 metadata 依赖 locale，使用 `generateMetadata()`。
- metadata 文案来自翻译文件或 `lib/seo.ts`，不要散落硬编码。
- 提供 `lib/seo.ts` helper 生成 canonical、hreflang、Open Graph。
- 需要配置站点基础 URL，例如：`NEXT_PUBLIC_SITE_URL`，本地可 fallback 到 `https://sellermargin.com` 占位。

## 结构化数据

请为以下内容添加 JSON-LD：

- FAQ 模块：FAQPage JSON-LD。
- 计算器页面：WebApplication JSON-LD。

注意：不要写虚假评分、虚假 reviews、虚假用户数，不要添加 `aggregateRating`、`review`、`ratingCount`、`userInteractionCount` 等需要真实数据支撑的字段。

FAQPage 最小模板：

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

WebApplication 最小模板：

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SellerMargin",
  "url": "https://sellermargin.com/en/example-page",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Free ecommerce profit calculator for planning and estimation."
}
```

JSON-LD 文案必须来自同一份 FAQ/SEO 数据源或 messages 文件，避免页面 FAQ 与结构化数据不一致。

## 需要生成或完善

- `app/sitemap.ts` 或等效 sitemap 生成方式。

`app/sitemap.ts` 最小示例：

```ts
import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sellermargin.com';
const locales = ['en', 'zh', 'es'] as const;
const paths = ['', '/multi-platform-profit-calculator', '/ad-spend-break-even-calculator', '/stripe-vs-paypal-fee-calculator', '/landed-cost-calculator', '/about', '/contact', '/guides'];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: {
        languages: {
          en: `${siteUrl}/en${path}`,
          zh: `${siteUrl}/zh${path}`,
          es: `${siteUrl}/es${path}`,
          'x-default': `${siteUrl}/`,
        },
      },
    }))
  );
}
```

- `app/robots.ts` 或 `public/robots.txt`。
- metadata helpers。
- Open Graph metadata。
- `app/icon.tsx` 或等效 favicon：32×32，背景 `#0F766E`，白色 `SM` 字母。若使用 `app/icon.tsx`，请导出 `size = { width: 32, height: 32 }` 与 `contentType = 'image/png'`；如需 `.ico`，可同时提供 `public/favicon.ico` 静态备用文件。
- Static OG image placeholder：`public/og-image.png`，建议 1200×630，背景 `#0F766E`，包含白色 `SellerMargin` 与 tagline `Free Ecommerce Profit Calculators`；V1 不使用 `@vercel/og` 或 `satori` 动态生成。
- FAQPage JSON-LD。
- WebApplication JSON-LD。
- README.md。
- Vercel 部署说明。

## README 要求

README 包含：

1. 项目介绍。
2. 技术栈。
3. 如何本地运行。
4. 如何构建。
5. 如何部署到 Vercel。
6. 环境变量说明：`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_CONTACT_EMAIL`、`NEXT_PUBLIC_ANALYTICS_ENABLED`。
7. 如何运行测试：`pnpm test`。
8. 多语言结构说明。
7. 默认费用假设位置。
8. 计算逻辑位置。
9. localStorage 使用说明。
10. V1 不包含的功能说明。
11. 下一阶段 TODO。

## 技术检查

请检查：

- `pnpm build` 是否能通过。
- `pnpm test` 是否能通过。
- `pnpm lint` 是否能通过。
- Lighthouse 基础表现是否合理：Performance、SEO、Accessibility 尽量保持 90+，但不要在页面上声称已通过正式审计。README 中说明可用 Chrome DevTools Lighthouse 手动验证。
- Core Web Vitals 目标：移动端 LCP < 2.5s，CLS < 0.1；如未达到，需说明原因和 TODO。
- 浏览器控制台不应出现明显 hydration mismatch、React key、404 资源或 runtime error。

同时检查：

- TypeScript 是否有错误。
- TypeScript 是否有错误。
- ESLint 是否有严重错误。
- 内部链接是否有明显错误。
- 移动端布局是否明显破坏。
- localStorage 在服务端渲染时不会报错。
- 语言切换器是否正常。
- Header/Footer 是否正常。
- 所有页面是否能访问。

## 验收标准

完成后应满足：

1. sitemap 存在并包含所有语言 URL。
2. robots 存在。
3. README.md 存在。
4. 每个页面有 metadata。
5. 多语言 hreflang 设置合理。
6. FAQ 页面模块有 JSON-LD。
7. 计算器页面有 WebApplication 或 SoftwareApplication JSON-LD。
8. `pnpm build` 通过。
9. 没有明显 TypeScript 错误。
10. 没有明显 404 内部链接。
11. Vercel 可以部署。
12. 没有新增登录、支付、数据库、广告功能。

---

# Prompt 8：最终检查和修 Bug

请对整个项目做最终检查和修 Bug。本次不要添加大功能，只做检查、修复和整理。

## 检查范围

请检查：

1. 首页
2. 多平台利润计算器
3. 广告回本 ROAS 计算器
4. Stripe vs PayPal 手续费计算器
5. 到岸成本计算器
6. About
7. Contact
8. Privacy Policy
9. Terms
10. Disclaimer
11. Guides
12. 第一篇 Guide
13. Header
14. Footer
15. LanguageSwitcher
16. CurrencySelector
17. WaitlistForm
18. ProFeatureModal
19. useLocalStorage
20. sitemap
21. robots
22. metadata
23. JSON-LD
24. README
25. not-found.tsx
26. error.tsx
27. CookieConsentBanner
28. 单元测试

## 重点检查：多语言

检查：

- `/en`、`/zh`、`/es` 是否都能访问。
- 所有计算器三种语言路径是否可访问。
- 语言切换是否正常。
- 语言切换是否保持当前页面 slug。
- 不同语言页面是否不会 404。
- 翻译缺失时是否 fallback 到英文。
- `es.json` 是否 key 完整。
- 无效 locale 是否有合理处理。

## 重点检查：计算器

检查所有计算器是否：

- 输入为空时不崩溃。
- 输入非法值时有提示。
- 不会除以 0。
- 不会显示 NaN。
- 不会显示 Infinity。
- 结果格式正确。
- 百分比格式正确。
- 货币格式正确。
- 用户输入 `30` 是否按 `30%` 处理。
- localStorage 不会在 SSR 阶段报错。
- 移动端可用。

## 重点检查：公式

必须重点核对：

- 多平台利润计算器 Total cost 是否是明确加法。
- 多平台利润计算器 Ad cost <= 0 时 ROAS / POAS 是否 N/A。
- 多平台利润计算器 Gross ROAS、Net revenue ROAS、POAS 是否命名清晰且公式口径不同。
- 广告回本计算器 Revenue <= 0 时 ROAS / ACoS 是否 N/A。
- Stripe vs PayPal 中 Refund rate 和 Chargeback rate 是否参与计算。
- 到岸成本计算器 CIF / FOB 是否切换有效。
- 到岸成本计算器 Break-even selling price 是否使用反推公式。
- Suggested price 分母 <= 0 时是否显示 N/A。

## 重点检查：内容合规

检查是否存在：

- 虚假用户数。
- 虚假评价。
- 虚假收入案例。
- “保证准确”。
- “保证盈利”。
- “官方费率永久准确”。
- 金融、税务、法律、会计建议。
- 未上线服务却声称已经使用。

如果有，请删除或改成谨慎表述。

## 重点检查：UI

检查：

- 移动端导航。
- 表格溢出。
- 按钮状态。
- Pro 弹窗关闭方式。
- FAQ 展开/显示。
- Footer 链接。
- 表单布局。
- 错误提示位置。
- CurrencySelector 是否清晰说明不做汇率换算。

## 重点检查：SEO

检查：

- title
- meta description
- canonical
- hreflang
- x-default
- sitemap
- robots
- H1
- 内部链接
- JSON-LD
- favicon / icon
- Open Graph image

## 性能、可访问性与错误页

检查：

- `app/[locale]/not-found.tsx` 是否存在且支持多语言，根级 `app/not-found.tsx` 是否作为英文 fallback。
- 404 / 无效页面可 noindex。
- 绝对禁止在首页、4 个计算器页面、Guides 页面添加 `noindex`。核心工具页必须允许 `index, follow`。
- `app/error.tsx` 或 `app/[locale]/error.tsx` 是否存在，支持基本多语言文案，不泄露技术栈错误细节，并提供返回首页按钮。
- 主要交互组件是否可键盘操作。
- 关键按钮和输入是否有 label 或 aria-label。
- 移动端 Lighthouse 是否没有明显性能和布局问题。
- 控制台是否没有 hydration mismatch、runtime error 或资源 404。
- CookieConsentBanner 是否不会在 V1 无非必要 cookies 时误导用户。

## 构建

运行：

```bash
pnpm build
```

如有错误，请修复。

运行测试和 lint：

```bash
pnpm test
pnpm lint
```

## 不要做

本次不要添加：

- 登录。
- 支付。
- 数据库。
- 真实邮件服务。
- AdSense。
- 新计算器。
- AI 内容生成功能。
- 管理后台。

## 最终输出

完成后请输出：

1. 修复了哪些问题。
2. 修改了哪些文件。
3. `pnpm build` 是否通过。
4. `pnpm test` 是否通过。
5. `pnpm lint` 是否通过，如未通过请说明。
6. 如何本地运行。
7. 如何部署到 Vercel。
8. 还有哪些下一阶段 TODO。
9. 是否可以作为公开 MVP 上线。

---

# 下一阶段 TODO 建议

V1 上线后，可以考虑：

1. 真实 waitlist 邮件服务。
2. 账号系统。
3. 保存计算历史。
4. CSV/PDF 导出。
5. 批量 SKU 计算器。
6. 更多平台，如 Walmart Marketplace、Shopee、Lazada。
7. 按国家/类目管理默认费率。
8. 汇率换算。
9. 用户自定义默认费用模板。
10. 白标报告。

不要在 V1 开发阶段提前实现这些功能，只保留合理入口和 TODO。
