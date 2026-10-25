# PJ1 · CLI SVG 编辑器

TypeScript 面向对象实现的 SVG 命令行编辑器，支持六种图形、嵌套分组、SVG 读写及撤销重做。

```sh
npm ci
npm run cli
```

完整架构、命令用法、AI 协作过程与验收记录见 [doc/README.md](doc/README.md)。

```sh
npm run check
npm run cli -- --script examples/flowchart.txt
```

需要 Node.js 22 或更高版本。交互时按 Ctrl+D（Windows 也可 Ctrl+Z 后回车）结束输入；Ctrl+C 退出。
