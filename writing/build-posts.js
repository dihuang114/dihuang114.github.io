#!/usr/bin/env node
/**
 * 地荒的小世界 - 文章清单自动生成脚本
 *
 * 扫描 posts/ 目录下所有 .md 文件，解析 front-matter，
 * 并把文章全文（markdown 原文）一并嵌入生成的 posts.js。
 *
 * 阅读页直接从 window.POSTS 取内容渲染，完全不请求 .md 文件：
 *  - 彻底规避 GitHub Pages Jekyll 对 .md 的处理（HTTP 404）
 *  - 无 CORS 问题，本地 file:// 直接打开也能正常显示
 *
 * 用法：node _static/writing/build-posts.js
 * 已接入 updateweb.bat 部署流程，部署时自动执行。
 */
const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'posts');
const outFile = path.join(__dirname, 'posts.js');

if (!fs.existsSync(postsDir)) {
  console.error('posts/ 目录不存在: ' + postsDir);
  process.exit(1);
}

const files = fs.readdirSync(postsDir).filter((f) => f.toLowerCase().endsWith('.md'));

// 统计正文字数（中文字符，排除空白和 markdown 符号）
function countChars(text) {
  return text.replace(/[#>*`~\-_\[\]()!|]/g, '').replace(/\s+/g, '').length;
}

const posts = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');

    // 解析 YAML front-matter（可选）
    const meta = {};
    let content = raw;
    const fm = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(raw);
    if (fm) {
      fm[1].split('\n').forEach((line) => {
        const m = /^([^:]+):\s*(.*)$/.exec(line.trim());
        if (!m) return;
        const key = m[1].trim().toLowerCase();
        let val = m[2].trim();
        val = val.replace(/^["']|["']$/g, '');
        meta[key] = val;
      });
      content = raw.slice(fm[0].length);
    }

    // 标题：优先 front-matter，否则取正文第一个 # 标题
    let title = meta.title || '';
    if (!title) {
      const h1 = /^#\s+(.+)$/m.exec(content);
      if (h1) title = h1[1].trim();
    }

    return {
      title,
      author: meta.author || '',
      date: meta.date || '',
      excerpt: meta.excerpt || '', // 留空则列表不显示摘要
      collection: meta.collection || '', // 可选：《秽土童话》/《高中回忆录》等
      wordCount: countChars(content), // 正文字数（不含 front-matter）
      file,
      content // 文章全文（markdown 原文），嵌入 JS 中
    };
  })
  .sort((a, b) => {
    // 先按合集分组（秽土童话在前），组内按文件数字序号（=日期旧→新）
    if (a.collection !== b.collection) {
      const order = { '秽土童话': 0, '高中回忆录': 1 };
      return (order[a.collection] ?? 9) - (order[b.collection] ?? 9);
    }
    const numA = parseInt(a.file, 10) || 0;
    const numB = parseInt(b.file, 10) || 0;
    return numA - numB;
  });

const js = '/* 本文件由 build-posts.js 自动生成，请勿手动修改 */\nwindow.POSTS = ' +
  JSON.stringify(posts, null, 2) + ';\n';

fs.writeFileSync(outFile, js, 'utf8');
console.log('已生成 posts.js，共 ' + posts.length + ' 篇文章');
posts.forEach((p) => console.log('  - ' + p.title + (p.collection ? ' [' + p.collection + ']' : '') + ' (' + p.content.length + ' 字符)'));
