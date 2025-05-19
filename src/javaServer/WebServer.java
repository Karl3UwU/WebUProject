import java.io.IOException;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpServer;

public class WebServer {
    private static final int PORT = 4242;

    public static void main(String[] args) throws IOException {
        if (args.length < 1) {
            System.out.println("Usage: java WebServer <path-to-web-folder>");
            System.exit(1);
        }

        String webRoot = args[0];
        System.out.println("Serving files from: " + webRoot);

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        Router router = new Router(webRoot);
        server.createContext("/", router);

        server.start();
        System.out.println("Server started on port " + PORT);
        System.out.println("Access server at: http://localhost:4242");
    }
}
