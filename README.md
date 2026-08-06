# KodaTools — Free Online Calculators & Everyday Tools

面向英语用户的在线计算器与日常工具站，Astro 静态站 + Vercel 部署。

## 当前状态（v1 基础版）

已完成 21 个页面，构建通过，可直接部署。

**10 个工具页：**
- Math: Percentage Calculator
- Finance: Mortgage, Loan, Compound Interest, Tip
- Health: BMI, Calorie
- Date & Time: Age Calculator
- Converters: Unit Converter (length/weight/temperature)
- Everyday: Word Counter

**6 个分类首页** + 首页 + About/Contact/Privacy/Terms 合规页。

## 本地开发

```bash
npm install
npm run dev        # 开发预览 http://localhost:4321
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

## 部署到 Vercel

1. 把本项目推送到 GitHub 仓库
2. Vercel → New Project → 导入该仓库
3. Framework 选 **Astro**（Vercel 会自动识别），Build Command `npm run build`，Output `dist`
4. 部署后绑定域名 `www.kodatools.com`
5. 旧站 URL 已在 `vercel.json` 配置 301 重定向到首页

## 接入 AdSense

1. 打开 `src/layouts/BaseLayout.astro`
2. 找到注释掉的 AdSense script，把 `ca-pub-XXXXXXXXXXXXXXXX` 换成你的发布商 ID，取消注释
3. 广告位：每个计算器页有 2 个 `.ad-slot` 占位（计算器下方 + 相关工具上方），在 AdSense 后台创建广告单元后把代码放进 CalculatorLayout 的对应 `.ad-slot` div 中
4. 在 `public/` 下放置 `ads.txt`

## 新增一个计算器的步骤

复制任一现有计算器页作为模板，例如：

```bash
cp src/pages/finance/loan-calculator.astro src/pages/finance/auto-loan-calculator.astro
```

然后修改：
- frontmatter 里的 `title / h1 / description / subtitle / faqs / related`
- `slot="calculator"` 里的输入字段和 `<script>` 计算逻辑
- 正文 `<section class="content-section">` 的 How to Use / Formula / Example / 参考表

每个页面已内置：WebApplication + FAQPage + Breadcrumb 三种结构化数据、面包屑、相关工具内链、2 个广告位。

**别忘了：**
- 在对应分类首页 `src/pages/<category>/index.astro` 的 tools 数组里加一行
- 在 `public/sitemap.xml` 加一条 URL
- 更新首页 `src/pages/index.astro` 的 popular/categories（如需）

## SEO 要点

- 每个页面 title ≤ 60 字符、description ≤ 155 字符，含主关键词
- 计算器「输入即出结果」，移动端优先
- 金融/健康页已带免责声明（YMYL 合规）
- 页面速度目标 Lighthouse ≥ 95（纯静态 + 原生 JS，轻松达标）

## 路线图

- [ ] 扩充至 40 个核心计算器（见方案文档 kodatools-new-site-plan.md）
- [ ] 程序化换算数值页 /convert/150-cm-to-inches（300-500 页）
- [ ] 日期长尾页 how-many-days-until-x（100 页）
- [ ] 博客支撑内容
