package org.server;

import org.server.router.Router;

import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try {
            Router.startServer();
        } catch (IOException exception) {
            System.out.println(exception.getMessage());
        }
    }
}