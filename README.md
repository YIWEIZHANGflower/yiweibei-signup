# 亦玮杯 S2 报名网站

2027 年江苏省高校公开赛（CS2 高校赛事品牌亦玮杯第二届公开赛，规模约 16 支队伍）的官方报名页。

## 线上地址

- 仓库：https://github.com/YIWEIZHANGflower/yiweibei-signup
- GitHub Pages：https://YIWEIZHANGflower.github.io/yiweibei-signup/

## 站点结构

- `index.html`：首屏、关于赛事、参赛资格与自查说明、报名流程时间线、规则、常见问题、往届回顾、报名表单、报名须知、报名成功状态、页脚。
- `styles.css`：移动优先响应式样式（系统字体栈，无外链资源）；时间线桌面横排、窄屏纵向；FAQ 用 details/summary（键盘可操作）。
- `app.js`：表单校验、资格自查计数、提交与成功状态逻辑（升级未改动）。
- `config.js`：提交通道配置（见下）。

## 报名规则（页面上写明的事实）

- 五人阵容中至少四人须有核实的江苏高校身份，身份通过 5E 平台核实。
- 流程：提交报名 → 主办方管理审核 → 5E 核实 → 确认参赛。
- 比赛时间、地点等未定信息一律标“待公布”，本站不编造日期、地点、奖金、赛制细节。

## 提交通道接线说明

表单提交走 `config.js` 里的 `FORM_ENDPOINT`，默认是 FormSubmit 占位地址。

接线只需两步：

1. 把 `config.js` 里的 `FORM_ENDPOINT` 换成自己的 FormSubmit 地址（格式：`https://formsubmit.co/ajax/你的邮箱`）。
2. 点一次 FormSubmit 发来的确认链接，提交即通。

在换成真实地址之前，表单提交会如实提示“提交通道待主办方配置”，不会显示假成功。报名数据不会写入公开仓库、公开 Issue 或任何公开位置。

## 本地预览

直接用浏览器打开 `index.html` 即可（全部资源本地相对路径，无需构建）。
