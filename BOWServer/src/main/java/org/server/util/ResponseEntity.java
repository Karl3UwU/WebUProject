package org.server.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.server.enums.HttpStatus;

import java.util.Objects;

public class ResponseEntity<T> extends HttpEntity<T> {
    private static final Gson DEFAULT_GSON = new GsonBuilder()
            .setPrettyPrinting()
            .registerTypeAdapter(java.time.LocalDateTime.class,
                    (com.google.gson.JsonSerializer<java.time.LocalDateTime>) (src, typeOfSrc, context) ->
                            new com.google.gson.JsonPrimitive(src.toString()))
            .create();


    private final HttpStatus status;

    public ResponseEntity(HttpStatus status) {
        this(null, null, status);
    }

    public ResponseEntity(T body, HttpStatus status) {
        this(body, null, status);
    }

    public ResponseEntity(HttpHeaders headers, HttpStatus status) {
        this(null, headers, status);
    }

    public ResponseEntity(T body, HttpHeaders headers, HttpStatus status) {
        super(body, headers);
        this.status = Objects.requireNonNull(status, "HttpStatus must not be null");
    }

    public HttpStatus getStatusCode() {
        return status;
    }

    public int getStatusCodeValue() {
        return status.value();
    }

    // JSON utility methods
    public String toJson() {
        return toJson(DEFAULT_GSON);
    }

    public String toJson(Gson gson) {
        T body = this.getBody();
        if (body == null) {
            return null;
        }
        if (body instanceof String) {
            return (String) body;
        }
        return gson.toJson(body);
    }

    // Static factory methods
    public static <T> ResponseEntity<T> ok(T body) {
        return new ResponseEntity<>(body, HttpStatus.OK);
    }

    public static <T> ResponseEntity<T> created(T body) {
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    public static <T> ResponseEntity<T> accepted(T body) {
        return new ResponseEntity<>(body, HttpStatus.ACCEPTED);
    }

    public static <T> ResponseEntity<T> badRequest(T body) {
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    public static <T> ResponseEntity<T> unauthorized(T body) {
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    public static <T> ResponseEntity<T> forbidden(T body) {
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    public static <T> ResponseEntity<T> notFound(T body) {
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    public static <T> ResponseEntity<T> unprocessableEntity(T body) {
        return new ResponseEntity<>(body, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static <T> ResponseEntity<T> internalServerError(T body) {
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Builder methods
    public static BodyBuilder status(HttpStatus status) {
        return new DefaultBuilder(status);
    }

    public static BodyBuilder status(int status) {
        return new DefaultBuilder(HttpStatus.valueOf(status));
    }

    public static BodyBuilder ok() {
        return status(HttpStatus.OK);
    }

    public static BodyBuilder created() {
        return status(HttpStatus.CREATED);
    }

    public static BodyBuilder accepted() {
        return status(HttpStatus.ACCEPTED);
    }

    public static BodyBuilder noContent() {
        return status(HttpStatus.NO_CONTENT);
    }

    public static BodyBuilder badRequest() {
        return status(HttpStatus.BAD_REQUEST);
    }

    public static BodyBuilder unauthorized() {
        return status(HttpStatus.UNAUTHORIZED);
    }

    public static BodyBuilder forbidden() {
        return status(HttpStatus.FORBIDDEN);
    }

    public static BodyBuilder notFound() {
        return status(HttpStatus.NOT_FOUND);
    }

    public static BodyBuilder unprocessableEntity() {
        return status(HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BodyBuilder internalServerError() {
        return status(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Builder interfaces
    public interface BodyBuilder {
        BodyBuilder header(String headerName, String... headerValues);
        BodyBuilder headers(HttpHeaders headers);
        BodyBuilder contentLength(long contentLength);
        BodyBuilder contentType(String contentType);
        <T> ResponseEntity<T> body(T body);
        <T> ResponseEntity<T> build();
    }

    // Builder implementation
    private static class DefaultBuilder implements BodyBuilder {
        private final HttpStatus status;
        private final HttpHeaders headers = new HttpHeaders();

        public DefaultBuilder(HttpStatus status) {
            this.status = status;
        }

        @Override
        public BodyBuilder header(String headerName, String... headerValues) {
            for (String headerValue : headerValues) {
                headers.add(headerName, headerValue);
            }
            return this;
        }

        @Override
        public BodyBuilder headers(HttpHeaders headers) {
            if (headers != null) {
                for (String key : headers.keySet()) {
                    for (String value : headers.get(key)) {
                        this.headers.add(key, value);
                    }
                }
            }
            return this;
        }

        @Override
        public BodyBuilder contentLength(long contentLength) {
            headers.setContentLength(contentLength);
            return this;
        }

        @Override
        public BodyBuilder contentType(String contentType) {
            headers.setContentType(contentType);
            return this;
        }

        @Override
        public <T> ResponseEntity<T> body(T body) {
            return new ResponseEntity<>(body, headers, status);
        }

        @Override
        public <T> ResponseEntity<T> build() {
            return new ResponseEntity<>(headers, status);
        }
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof ResponseEntity)) {
            return false;
        }
        ResponseEntity<?> otherResponse = (ResponseEntity<?>) other;
        return super.equals(otherResponse) && Objects.equals(status, otherResponse.status);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), status);
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder("<");
        builder.append(this.status.value());
        builder.append(' ');
        builder.append(this.status.getReasonPhrase());
        builder.append(',');

        T body = this.getBody();
        if (body != null) {
            // Convert body to JSON using Gson
            String jsonBody;
            if (body instanceof String) {
                jsonBody = (String) body;
            } else {
                jsonBody = DEFAULT_GSON.toJson(body);
            }
            builder.append(jsonBody);
            builder.append(',');
        }

        // Convert headers to JSON using Gson
        builder.append(DEFAULT_GSON.toJson(this.getHeaders().toMultiValueMap()));
        builder.append('>');
        return builder.toString();
    }
}
