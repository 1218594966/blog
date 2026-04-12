# 项目记忆

## 当前状态

- 项目类型：个人主页 + Blog + 后台编辑 + AI 对话 + 扩展入口站
- 代码真源：GitHub `main`
- 线上部署：服务器会自动同步 GitHub 更新
- 运行时数据：存放在 `storage/`，不回写仓库

## 当前结构

- 主站：首页、关于、最近研究、文章、AI 对话区、联系入口
- 后台：内容编辑、AI 配置、留言查看
- 扩展入口：
  - `/tools`
  - `/projects`
  - `/lab`

## 协作约定

- 默认使用中文
- 优先保持结构清晰，不要把所有功能继续堆在首页
- 后续新增功能优先考虑放在 tools / projects / lab 之一
- 修改完成后优先更新记忆文件，再提交 GitHub

## 最近一次任务

<!-- LAST_TASK_START -->
- 时间：2026-04-12
- 摘要：初始化 AI 工作流与项目记忆系统
<!-- LAST_TASK_END -->

## 下一步建议

- 拆分 `server.js`、`public/assets/site.js`、`public/assets/admin.js`
- 把博客从弹窗升级成独立文章页
- 在 `/tools` 或 `/lab` 中落地第一个真实功能页面
