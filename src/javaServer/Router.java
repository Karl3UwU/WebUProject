import java.io.IOException;
import java.io.OutputStream;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class Router implements HttpHandler {
    private final FileHandler fileHandler;

    public Router(String webRoot) {
        this.fileHandler = new FileHandler(webRoot);
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        System.out.println("Received request for: " + path);

        if (path.startsWith("/api/")) {
            // Handle API request
            handleApiRequest(path, exchange);
        } else {
            // Serve file
            if (path.equals("/")) {
                path = "/index.html";
                System.out.println("Modifier to default path of: " + path);
            }
            fileHandler.serveFile(path, exchange);
        }
    }

    private void handleApiRequest(String path, HttpExchange exchange) throws IOException {
        String response = "API request received for path: " + path;
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, response.getBytes().length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }
}