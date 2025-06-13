package org.server.router;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.PostMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.QueryParam;
import org.server.router.annotations.request.RequestBody;
import org.server.router.annotations.request.RequestHeader;
import org.server.router.annotations.request.RequestParam;

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
                Object[] args = resolveArguments(route.method, exchange);
                Object result = route.method.invoke(route.controller, args);
                response = result != null ? result.toString() : "";
                exchange.sendResponseHeaders(200, response.getBytes().length);
            } catch (Exception e) {
                e.printStackTrace();
                response = "500 Internal Server Error: " + e.getMessage();
                exchange.sendResponseHeaders(500, response.getBytes().length);
            }
        } else {
            response = "404 Not Found";
            exchange.sendResponseHeaders(404, response.getBytes().length);
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

    private static Object[] resolveArguments(Method method, HttpExchange exchange) throws IOException {
        var parameters = method.getParameters();
        Object[] args = new Object[parameters.length];

        Map<String, String> queryParams = parseQueryParams(exchange);
        String requestBody = new String(exchange.getRequestBody().readAllBytes());

        for (int i = 0; i < parameters.length; i++) {
            var param = parameters[i];

            if (param.isAnnotationPresent(RequestHeader.class)) {
                var annotation = param.getAnnotation(RequestHeader.class);
                String headerValue = exchange.getRequestHeaders().getFirst(annotation.value());
                if (annotation.required() && headerValue == null) {
                    throw new RuntimeException("Missing required header: " + annotation.value());
                }
                args[i] = headerValue;

            } else if (param.isAnnotationPresent(RequestParam.class)) {
                var annotation = param.getAnnotation(RequestParam.class);
                String value = null;

                String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
                if (contentType != null && contentType.contains("application/x-www-form-urlencoded")) {
                    Map<String, String> formParams = parseFormData(requestBody);
                    value = formParams.get(annotation.value());
                }

                if (value == null) {
                    value = queryParams.get(annotation.value());
                }

                if (annotation.required() && value == null) {
                    throw new RuntimeException("Missing required request param: " + annotation.value());
                }
                args[i] = value;

            } else if (param.isAnnotationPresent(RequestBody.class)) {
                args[i] = new com.google.gson.Gson().fromJson(requestBody, param.getType());

            } else if (param.isAnnotationPresent(QueryParam.class)) {
                var annotation = param.getAnnotation(QueryParam.class);
                String value = queryParams.get(annotation.value());
                if (annotation.required() && value == null) {
                    throw new RuntimeException("Missing required query param: " + annotation.value());
                }
                args[i] = value;
            }
            else if (param.getType() == HttpExchange.class) {
                args[i] = exchange;

            } else {
                args[i] = null;
            }
        }

        return args;
    }

    private static Map<String, String> parseQueryParams(HttpExchange exchange) {
        String query = exchange.getRequestURI().getQuery();
        Map<String, String> result = new HashMap<>();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] parts = param.split("=");
                if (parts.length == 2) {
                    result.put(parts[0], parts[1]);
                }
            }
        }
        return result;
    }

    private static Map<String, String> parseFormData(String body) {
        Map<String, String> result = new HashMap<>();
        if (body != null && !body.isEmpty()) {
            for (String param : body.split("&")) {
                String[] parts = param.split("=", 2);
                if (parts.length == 2) {
                    try {
                        String key = java.net.URLDecoder.decode(parts[0], "UTF-8");
                        String value = java.net.URLDecoder.decode(parts[1], "UTF-8");
                        result.put(key, value);
                    } catch (Exception e) {
                        // Handle decoding error
                    }
                }
            }
        }
        return result;
    }
}