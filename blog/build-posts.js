#!/usr/bin/env node
/**
 * 地荒博客 - 文章清单自动生成脚本
 *
 * 扫描 posts/ 目录下所有 .md 文件，解析 front-matter，
 * 生成 posts.json 供前端目录页自动渲染（无需手动登记文章）。
 *
 * 用法：node _static/blog/build-posts.js
 * 已接入 updateweb.bat 部署流程，部署时自动执行。
 */
const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'posts');
const outFile = path.join(__dirname, 'posts.json');

if (!fs.existsSync(postsDir)) {
  console.error('posts/ 目录不存在: ' + postsDir);
  process.exit(1);
}

const files = fs.readdirSync(postsDir).filter((f) => f.toLowerCase().endsWith('.md'));

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
      file
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)); // 按日期倒序

fs.writeFileSync(outFile, JSON.stringify(posts, null, 2), 'utf8');
console.log('已生成 posts.json，共 ' + posts.length + ' 篇文章');
posts.forEach((p) => console.log('  - ' + p.title + (p.collection ? ' [' + p.collection + ']' : '')));
