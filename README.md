# Gemini VPN Proxy
[繁體中文](README-TW.md)

This project provides a simple Node.js proxy server for the Google Generative Language API (Gemini API). It allows you to route your API requests through a local proxy, which can be useful for various purposes such as debugging, logging, or bypassing certain network restrictions.

## Features

*   **API Proxy:** Forwards requests to `https://generativelanguage.googleapis.com`.
*   **HTTP Method Support:** Handles all standard HTTP methods (GET, POST, PUT, DELETE, etc.).
*   **Body Parsing:** Supports JSON, URL-encoded, plain text, and raw binary request bodies.
*   **Header Forwarding:** Copies most original request headers to the target API, with necessary adjustments for proxying (e.g., `Host` header).
*   **Streamed Responses:** Efficiently streams responses from the target API back to the client.
*   **Docker Support:** Easily deployable using Docker.

## Getting Started

### Using Docker (Recommended)

You can use the [claw cloud](https://console.run.claw.cloud/signin?link=RGXA3AIOBR4S) to run

You can see [claw cloud setting](https://github.com/spectre-pro/gemini-proxy?tab=readme-ov-file#claw-cloud-setting)

You can pull the pre-built Docker image from Docker Hub:

```bash
docker pull ghcr.io/spectre-pro/gemini-proxy
```

After pulling, you can run the proxy server:

```bash
docker run -d -p 34562:34562 --name gemini-proxy ghcr.io/spectre-pro/gemini-proxy
```

The proxy will be accessible at `http://localhost:34562`.

### Building and Running with Docker

If you prefer to build the Docker image yourself:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/spectre-pro/gemini-proxy.git
    cd gemini-proxy
    ```
2.  **Build the Docker image:**
    ```bash
    docker build -t ghcr.io/spectre-pro/gemini-proxy .
    ```
3.  **Run the Docker container:**
    ```bash
    docker run -d -p 34562:34562 --name gemini-proxy ghcr.io/spectre-pro/gemini-proxy
    ```

### Running Locally (Node.js)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/spectre-pro/gemini-proxy.git
    cd gemini-proxy
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    node src/main.js
    ```
    The server will run on `http://localhost:34562` by default.

## Usage Example

Once the proxy is running, you can direct your Gemini API requests to `http://localhost:34562` instead of `https://generativelanguage.googleapis.com`.

For example, OpenAI format:

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
Content-Type: application/json
{
  "contents": [
    {
      "parts": [
        {"text": "Hello, Gemini!"}
      ]
    }
  ]
}
```

Gemini format:

```
POST http://localhost:34562/v1beta/models/gemini-pro:generateContent
Content-Type: application/json
{
  "contents": [
    {
      "parts": [
        {"text": "Hello, Gemini!"}
      ]
    }
  ]
}
```

The proxy will forward this request to `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` and return the response.

### Claw cloud setting

<img width="541" height="852" alt="螢幕擷取畫面 2025-07-12 185901" src="https://github.com/user-attachments/assets/391bd8ec-38d4-43aa-aab5-1cacbbcfe364" />

## License

This project is licensed under the [LICENSE](LICENSE) file.

## Star History


<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date" />
</picture>
