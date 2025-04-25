const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const readme = fs.readFileSync("./README.md", "utf8");
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Emergency Healthcare Dashboard</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          background-color: #1e40af;
          color: white;
          padding: 20px;
          border-radius: 5px;
        }
        pre {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        code {
          font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        }
      </style>
    </head>
    <body>
      <h1>Emergency Healthcare Dashboard</h1>
      <div>DevOps Docker Container Running Successfully!</div>
      <div style="margin-top: 20px;">
        <h2>Project Documentation</h2>
        <div id="readme-content">${readme.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\`\`\`([\s\S]*?)\`\`\`/g, "<pre><code>$1</code></pre>")}</div>
      </div>
    </body>
  </html>`;
  res.send(html);
});

app.get("/grafana", (req, res) => {
  res.redirect("http://localhost:3001");
});

app.get("/prometheus", (req, res) => {
  res.redirect("http://localhost:9090");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 