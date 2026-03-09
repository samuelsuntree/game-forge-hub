# ADR-001: GitHub 作为唯一事实源

## Status
accepted

## Context
团队需要一个协作平台，但不希望引入重量级工具（Jira、Notion 等），也不希望数据分散在多个系统中。
团队规模小（< 10人），成员能力强，需要最小化管理开销。

PMBOK 7 原则7（裁剪）指出："使用'刚好够'的过程实现预期成果。"
对于小团队，不需要独立的任务管理数据库。

## Decision
- GitHub Issues、PR、Milestones、Discussions 作为唯一事实源
- 本地 SQLite 仅存储增强层数据（积分、成就、每日快照）
- 通过 GitHub Labels 编码任务状态和难度（标签即协议）
- 任何时候删除本地数据库，系统仍然能运行（只丢失积分历史）

## Consequences
- 好处：零数据迁移成本，团队直接在 GitHub 操作也能驱动流程
- 好处：符合"刚好够"原则，不引入额外复杂性
- 代价：受限于 GitHub API rate limit（5000次/小时）
- 代价：GitHub Discussions API 需要 GraphQL，集成复杂度稍高
- 代价：离线场景下无法操作（但对游戏开发团队影响极小）
