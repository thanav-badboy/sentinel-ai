# 🛡️ SentinelAI — Real-Time SOC AI Threat Engine

> An enterprise Security Operations Center (SOC) dashboard powered by live multi-modal LLM reasoning to detect, analyze, and automatically quarantine AI-driven social engineering and spear-phishing attacks in real time.

---

## 🌟 Key Features

* **⚡ Dynamic Multi-Agent Threat Scanning:** Connects directly to live LLM reasoning APIs to analyze incoming communications for urgency cues, impersonation vectors, and pressure tactics.
* **🎯 In-line Payload Token Highlighting:** Automatically extracts malicious text tokens and renders dynamic DOM overlays highlighting suspicious phrases in real time.
* **📄 Automated Executive Incident Reports:** Generates download-ready PDF security tickets (`jsPDF` + `html2canvas`) complete with calculated risk scores, technical breakdown, and SOC remediation playbooks.
* **📊 Multi-Panel Enterprise Portal:**
  * **Audit Workspace:** Primary threat scanning interface with real-time agent telemetry stream.
  * **Live Monitoring:** Real-time network health metrics, live telemetry packet tickers, and system status indicators.
  * **Incident Reports:** Historical threat logs with dynamic status tracking and CSV audit log export functionality.
  * **Network Assets:** Visual infrastructure grid monitoring enterprise endpoints (Mail Gateways, Auth Servers, Cloud DBs).
  * **System Config:** Autonomous quarantine toggles, multi-agent sensitivity tuning, and dynamic API key configuration.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
* **Icons & UI:** Lucide React
* **AI Intelligence Engine:** OpenAI / Gemini API Integration
* **Document Generation:** `jspdf`, `html2canvas`
* **Version Control:** Git, GitHub

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed on your system.

### 2. Installation
Clone the repository and install dependencies:

bash
git clone [https://github.com/thanav-badboy/sentinel-ai.git](https://github.com/thanav-badboy/sentinel-ai.git)
cd sentinel-ai
npm install

### 3. Environment Configuration
Create a .env file in the root directory and add your API key:

Code snippet
VITE_OPENAI_API_KEY=your_openai_api_key_here
(Note: You can also configure or override your API key dynamically inside the System Config panel on the running application).

### 4. Run the Local Development Server
Bash
npm run dev
Open http://localhost:5173 in your browser to interact with the dashboard.

📸 Demo Walkthrough
Perform a Threat Scan: Paste any suspect email or Slack message into the Audit Workspace and click Run Threat Scan.

Review Telemetry: Observe the calculated Threat Score, extracted attack vectors, and highlighted payload tokens.

Trigger Action & Quarantine: Click Quarantine & Generate Incident Report and select Download PDF Report to export an official security incident ticket.

Explore Enterprise Operations: Switch through the left sidebar tabs (Live Monitoring, Incident Reports, Network Assets) to view full platform capabilities.

📝 License
Distributed under the MIT License. See LICENSE for more information.


---

To update your repository with this README, run:

```bash
git add README.md
git commit -m "docs: add comprehensive project README"
git push origin main
