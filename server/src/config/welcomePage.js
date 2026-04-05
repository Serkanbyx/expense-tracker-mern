const { version } = require("../../package.json");

const getWelcomePage = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expense Tracker API</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0b1120;
      color: #e2e8f0;
      overflow: hidden;
      position: relative;
    }

    body::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 60% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
      pointer-events: none;
    }

    body::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 60px,
          rgba(16, 185, 129, 0.02) 60px,
          rgba(16, 185, 129, 0.02) 61px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 60px,
          rgba(16, 185, 129, 0.02) 60px,
          rgba(16, 185, 129, 0.02) 61px
        );
      pointer-events: none;
    }

    .container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 3rem 2rem;
      max-width: 520px;
      width: 100%;
    }

    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      position: relative;
    }

    .icon::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow:
        0 0 40px rgba(16, 185, 129, 0.3),
        0 8px 32px rgba(0, 0, 0, 0.3);
      transform: rotate(8deg);
    }

    .icon::after {
      content: "$";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #10b981 0%, #34d399 40%, #6ee7b7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .version {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      margin-bottom: 2rem;
      letter-spacing: 0.03em;
    }

    .chart-decoration {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
      margin-bottom: 2rem;
      height: 60px;
    }

    .bar {
      width: 12px;
      border-radius: 4px 4px 0 0;
      opacity: 0.6;
      transition: opacity 0.3s;
    }

    .bar:nth-child(1) { height: 30px; background: #10b981; }
    .bar:nth-child(2) { height: 45px; background: #ef4444; opacity: 0.5; }
    .bar:nth-child(3) { height: 55px; background: #10b981; }
    .bar:nth-child(4) { height: 25px; background: #ef4444; opacity: 0.5; }
    .bar:nth-child(5) { height: 60px; background: #10b981; }
    .bar:nth-child(6) { height: 35px; background: #ef4444; opacity: 0.5; }
    .bar:nth-child(7) { height: 50px; background: #10b981; }
    .bar:nth-child(8) { height: 20px; background: #ef4444; opacity: 0.5; }

    .container:hover .bar {
      opacity: 1;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .btn-primary,
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      box-shadow:
        0 4px 16px rgba(16, 185, 129, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow:
        0 8px 24px rgba(16, 185, 129, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.04);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      border-color: rgba(16, 185, 129, 0.3);
      transform: translateY(-2px);
    }

    .sign {
      font-size: 0.85rem;
      color: #64748b;
    }

    .sign a {
      color: #10b981;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .sign a:hover {
      color: #34d399;
    }

    @media (max-width: 480px) {
      .container {
        padding: 2rem 1.25rem;
      }

      h1 {
        font-size: 1.75rem;
      }

      .icon {
        width: 64px;
        height: 64px;
      }

      .icon::after {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon"></div>
    <h1>Expense Tracker API</h1>
    <p class="version">v${version}</p>

    <div class="chart-decoration">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>

    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/api/health" class="btn-secondary">Health Check</a>
    </div>

    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>
`;

module.exports = getWelcomePage;
