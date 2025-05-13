import java.io.IOException;
import java.io.OutputStream;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.sun.net.httpserver.HttpExchange;

public class FileHandler {
    private final Path rootPath;

    public FileHandler(String webRoot) {
        this.rootPath = Paths.get(webRoot).toAbsolutePath();
    }

    public void serveFile(String requestPath, HttpExchange exchange) throws IOException {
        Path filePath = rootPath.resolve("." + requestPath).normalize();

        // Security check to prevent path traversal
        if (!filePath.startsWith(rootPath)) {
            exchange.sendResponseHeaders(403, -1);
            return;
        }

        if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
            String mimeType = URLConnection.guessContentTypeFromName(filePath.toString());
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }

            byte[] content = Files.readAllBytes(filePath);
            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.sendResponseHeaders(200, content.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(content);
            }
        } else {
            // 404 Not Found
            exchange.sendResponseHeaders(404, -1);
        }
    }
}
