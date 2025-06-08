package org.server.controllers;

import org.server.router.GetMapping;
import org.server.router.RequestMapping;

@RequestMapping("/api/test")
public class TestController {
    @GetMapping("/hello")
    public String helloWorld() {
        return "Hello from TestController!";
    }
}
