package org.server.router;

import java.lang.reflect.Method;

public class Route {
    public Object controller;
    public Method method;

    public Route(Object controller, Method method) {
        this.controller = controller;
        this.method = method;
    }
}