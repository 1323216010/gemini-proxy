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

You can see [claw cloud setting](https://github.com/spectre-pro/gemini-vpn/edit/main/README.md#claw-cloud-setting)

You can pull the pre-built Docker image from Docker Hub:

```bash
docker pull spectrpro/gemini-vpn
```

After pulling, you can run the proxy server:

```bash
docker run -d -p 34562:34562 --name gemini-vpn spectrpro/gemini-vpn
```

The proxy will be accessible at `http://localhost:34562`.

### Building and Running with Docker

If you prefer to build the Docker image yourself:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/spectre-pro/gemini-vpn.git
    cd gemini-vpn
    ```
2.  **Build the Docker image:**
    ```bash
    docker build -t spectrpro/gemini-vpn .
    ```
3.  **Run the Docker container:**
    ```bash
    docker run -d -p 34562:34562 --name gemini-vpn spectrpro/gemini-vpn
    ```

### Running Locally (Node.js)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/spectre-pro/gemini-vpn.git
    cd gemini-vpn
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

## Configuration

The proxy server can be configured using environment variables:

*   `PORT`: The port on which the proxy server will listen. Defaults to `34562`.
    *   Example: `PORT=8080 node src/main.js`
*   `TARGET_API_URL`: The base URL of the target API. Defaults to `https://generativelanguage.googleapis.com`.
    *   Example: `TARGET_API_URL=https://api.example.com node src/main.js`

## Usage Example

Once the proxy is running, you can direct your Gemini API requests to `http://localhost:34562` instead of `https://generativelanguage.googleapis.com`.

For example, if you would normally make a request like this:

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

You would now make it to your proxy:

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

![image](https://github.com/user-attachments/assets/c1dd1a51-18da-47a6-870a-0f3ecc615055)


## License

This project is licensed under the [LICENSE](LICENSE) file.
