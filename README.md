# Gemini VPN

[chinese-TW](README-TW.md)

## Description
Gemini VPN is a Node.js application that likely provides VPN-related functionalities. It utilizes `express` for web server capabilities and `node-fetch` for making network requests.

## Installation

To set up the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/spectre-pro/gemini-vpn.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd gemini-vpn
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

To run the application, execute the following command from the project root:

```bash
node src/main.js
```

## Docker Usage

You can also run this application using Docker.

1.  **Build the Docker image:**
    ```bash
    docker build -t gemini-vpn .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -p 3000:3000 gemini-vpn
    ```
    (Assuming the application runs on port 3000. Adjust if necessary.)

## License

This project is licensed under the ISC License. See the `LICENSE` file (if present) for more details.
