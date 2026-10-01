import http from "http";
import fs from "fs/promises";
import path from "path";

const PORT = 3000;

async function readJson(filePath) {
  try {
    const text =
      await fs.readFile(
        filePath,
        "utf8"
      );

    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function loadDashboardData() {
  const regression =
    await readJson(
      "./results/current.json"
    );

  const baseline =
    await readJson(
      "./results/baseline.json"
    );

  const security =
    await readJson(
      "./results/security.json"
    );

  const qwen8b =
    await readJson(
      "./benchmarks/qwen3_8b.json"
    );

  const qwen4b =
    await readJson(
      "./benchmarks/qwen3_4b_instruct.json"
    );

  return {
    regression,
    baseline,
    security,

    benchmarks: {
      qwen8b,
      qwen4b,
    },
  };
}

const server =
  http.createServer(
    async (req, res) => {
      if (
        req.url === "/api/data"
      ) {
        const data =
          await loadDashboardData();

        res.writeHead(
          200,
          {
            "Content-Type":
              "application/json; charset=utf-8",
          }
        );

        res.end(
          JSON.stringify(data)
        );

        return;
      }

      if (
        req.url === "/" ||
        req.url === "/index.html"
      ) {
        const html =
          await fs.readFile(
            path.join(
              process.cwd(),
              "dashboard",
              "index.html"
            ),
            "utf8"
          );

        res.writeHead(
          200,
          {
            "Content-Type":
              "text/html; charset=utf-8",
          }
        );

        res.end(html);

        return;
      }

      res.writeHead(404);

      res.end(
        "Not Found"
      );
    }
  );

server.listen(
  PORT,
  () => {
    console.log("");
    console.log(
      "======================================"
    );

    console.log(
      "AI AGENT QA DASHBOARD"
    );

    console.log(
      "======================================"
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log("");
    console.log(
      "종료하려면 Ctrl + C"
    );
  }
);