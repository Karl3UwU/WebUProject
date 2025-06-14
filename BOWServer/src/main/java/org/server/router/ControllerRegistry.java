package org.server.router;

import org.server.controllers.AuthController;
import org.server.controllers.BookController;
import org.server.controllers.TestController;

import java.util.*;

public class ControllerRegistry {
    private static final List<Object> controllers = new ArrayList<>();

    static {
        controllers.add(new TestController());
        controllers.add(new AuthController());
        controllers.add(new BookController());
    }

    public static List<Object> getControllers() {
        return controllers;
    }

    public static void registerController(Object controller) {
        controllers.add(controller);
    }
}
