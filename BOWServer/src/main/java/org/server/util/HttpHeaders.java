package org.server.util;

import java.util.*;

public class HttpHeaders {
    public static final String ACCEPT = "Accept";
    public static final String ACCEPT_CHARSET = "Accept-Charset";
    public static final String ACCEPT_ENCODING = "Accept-Encoding";
    public static final String ACCEPT_LANGUAGE = "Accept-Language";
    public static final String AUTHORIZATION = "Authorization";
    public static final String CACHE_CONTROL = "Cache-Control";
    public static final String CONTENT_DISPOSITION = "Content-Disposition";
    public static final String CONTENT_ENCODING = "Content-Encoding";
    public static final String CONTENT_LENGTH = "Content-Length";
    public static final String CONTENT_TYPE = "Content-Type";
    public static final String COOKIE = "Cookie";
    public static final String DATE = "Date";
    public static final String ETAG = "ETag";
    public static final String EXPIRES = "Expires";
    public static final String HOST = "Host";
    public static final String IF_MATCH = "If-Match";
    public static final String IF_MODIFIED_SINCE = "If-Modified-Since";
    public static final String IF_NONE_MATCH = "If-None-Match";
    public static final String IF_UNMODIFIED_SINCE = "If-Unmodified-Since";
    public static final String LAST_MODIFIED = "Last-Modified";
    public static final String LOCATION = "Location";
    public static final String ORIGIN = "Origin";
    public static final String PRAGMA = "Pragma";
    public static final String REFERER = "Referer";
    public static final String SET_COOKIE = "Set-Cookie";
    public static final String USER_AGENT = "User-Agent";
    public static final String VARY = "Vary";
    public static final String WWW_AUTHENTICATE = "WWW-Authenticate";

    private final Map<String, List<String>> headers;

    public HttpHeaders() {
        this.headers = new LinkedHashMap<>();
    }

    public HttpHeaders(Map<String, String> singleValueHeaders) {
        this();
        if (singleValueHeaders != null) {
            singleValueHeaders.forEach(this::add);
        }
    }

    public void add(String name, String value) {
        headers.computeIfAbsent(name, k -> new ArrayList<>()).add(value);
    }

    public void set(String name, String value) {
        List<String> values = new ArrayList<>();
        values.add(value);
        headers.put(name, values);
    }

    public String getFirst(String name) {
        List<String> values = headers.get(name);
        return (values != null && !values.isEmpty()) ? values.get(0) : null;
    }

    public List<String> get(String name) {
        return headers.getOrDefault(name, Collections.emptyList());
    }

    public Set<String> keySet() {
        return headers.keySet();
    }

    public boolean containsKey(String name) {
        return headers.containsKey(name);
    }

    public boolean isEmpty() {
        return headers.isEmpty();
    }

    public Map<String, List<String>> toMultiValueMap() {
        return new LinkedHashMap<>(headers);
    }

    public void setContentType(String contentType) {
        set(CONTENT_TYPE, contentType);
    }

    public String getContentType() {
        return getFirst(CONTENT_TYPE);
    }

    public void setContentLength(long length) {
        set(CONTENT_LENGTH, String.valueOf(length));
    }

    public Long getContentLength() {
        String value = getFirst(CONTENT_LENGTH);
        return value != null ? Long.valueOf(value) : null;
    }

    @Override
    public String toString() {
        return headers.toString();
    }
}
