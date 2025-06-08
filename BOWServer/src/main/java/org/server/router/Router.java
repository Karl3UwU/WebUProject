package org.server.router;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

import org.server.controllers.TestController;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

public class Router {

    private static final Map<String, Route> routes = new HashMap<>();

    public static void startServer() throws IOException {
        registerAllRoutes();

        HttpServer server = HttpServer.create(new InetSocketAddress(80), 0);
        server.createContext("/", Router::handleRequest);
        server.setExecutor(null);
        server.start();
        System.out.println("Server started on http://localhost:80");
    }

    public static void registerAllRoutes() {
        for(Object controller : ControllerRegistry.getControllers()) {
            registerRoutes(controller);
        }
    }

    private static void registerRoutes(Object controller) {
        Class<?> clazz = controller.getClass();

        String basePath = "";
        if (clazz.isAnnotationPresent(RequestMapping.class)) {
            basePath = clazz.getAnnotation(RequestMapping.class).value();
            if (!basePath.startsWith("/")) basePath = "/" + basePath;
            if (basePath.endsWith("/")) basePath = basePath.substring(0, basePath.length() - 1);
        }

        for (Method method : clazz.getDeclaredMethods()) {
            if (method.isAnnotationPresent(GetMapping.class)) {
                String path = method.getAnnotation(GetMapping.class).value();
                String fullPath = normalizePath(basePath, path);
                routes.put("GET:" + fullPath, new Route(controller, method));
            }

            if (method.isAnnotationPresent(PostMapping.class)) {
                String path = method.getAnnotation(PostMapping.class).value();
                String fullPath = normalizePath(basePath, path);
                routes.put("POST:" + fullPath, new Route(controller, method));
            }
        }
    }

    private static String normalizePath(String base, String path) {
        if (!path.startsWith("/")) path = "/" + path;
        return base + path;
    }

    private static void handleRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();

        if (path.startsWith("/api/")) {
            handleApiRequest(exchange);
        } else {
            handleHTMLRequest(exchange);
        }
    }

    private static void handleApiRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String key = method + ":" + path;

        Route route = routes.get(key);
        String response;

        if (route != null) {
            try {
                Object result = route.method.invoke(route.controller);
                response = result != null ? result.toString() : "";
                exchange.sendResponseHeaders(200, response.length());
            } catch (Exception e) {
                response = "500 Error: " + e.getMessage();
                exchange.sendResponseHeaders(500, response.length());
            }
        } else {
            response = "404 Not Found";
            exchange.sendResponseHeaders(404, response.length());
        }

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }

    private static void handleHTMLRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();

        // Serve / as /index.html
        if (path.equals("/")) {
            path = "/index.html";
        }

        String resourcePath = path.startsWith("/") ? path.substring(1) : path;
        InputStream inputStream = Router.class.getClassLoader().getResourceAsStream(resourcePath);
        if (inputStream == null) {
            String response = "404 Not Found: " + path;
            exchange.sendResponseHeaders(404, response.getBytes().length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
            return;
        }

        String contentType = getContentType(path);
        exchange.getResponseHeaders().set("Content-Type", contentType);

        byte[] content = inputStream.readAllBytes();
        exchange.sendResponseHeaders(200, content.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(content);
        }
    }

    private static String getContentType(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }
}