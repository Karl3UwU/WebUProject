package org.server.util;

import java.util.Objects;

public class HttpEntity<T> {
    public static final HttpEntity<?> EMPTY = new HttpEntity<>();

    private final HttpHeaders headers;
    private final T body;

    protected HttpEntity() {
        this(null, null);
    }

    public HttpEntity(T body) {
        this(body, null);
    }

    public HttpEntity(HttpHeaders headers) {
        this(null, headers);
    }

    public HttpEntity(T body, HttpHeaders headers) {
        this.body = body;
        this.headers = headers != null ? headers : new HttpHeaders();
    }

    public HttpHeaders getHeaders() {
        return headers;
    }

    public T getBody() {
        return body;
    }

    public boolean hasBody() {
        return body != null;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof HttpEntity)) {
            return false;
        }
        HttpEntity<?> otherEntity = (HttpEntity<?>) other;
        return Objects.equals(headers, otherEntity.headers) && Objects.equals(body, otherEntity.body);
    }

    @Override
    public int hashCode() {
        return Objects.hash(headers, body);
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder("<");
        if (body != null) {
            builder.append(body);
            builder.append(',');
        }
        builder.append(headers);
        builder.append('>');
        return builder.toString();
    }
}
