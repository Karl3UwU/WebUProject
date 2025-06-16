package org.server.router;

import org.server.controllers.AuthController;
import org.server.controllers.BrowseController;
import org.server.controllers.ReviewsController;

import java.util.*;

public class ControllerRegistry {
    private static final List<Object> controllers = new ArrayList<>();

    static {
        controllers.add(new AuthController());
        controllers.add(new BrowseController());
        controllers.add(new ReviewsController());
    }

    public static List<Object> getControllers() {
        return controllers;
    }

    public static void registerController(Object controller) {
        controllers.add(controller);
    }
}
