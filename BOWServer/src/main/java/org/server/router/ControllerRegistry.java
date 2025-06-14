package org.server.router;

import org.server.controllers.AuthController;

import java.util.*;

public class ControllerRegistry {
    private static final List<Object> controllers = new ArrayList<>();

    static {
        controllers.add(new AuthController());
    }

    public static List<Object> getControllers() {
        return controllers;
    }

    public static void registerController(Object controller) {
        controllers.add(controller);
    }
}
