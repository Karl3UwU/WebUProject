package org.server.controllers;

import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.QueryParam;
import org.server.router.annotations.request.RequestHeader;

@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public String helloWorld() {
        return "Hello from TestController!";
    }

    @GetMapping("/query")
    public String queryEndpoint(@QueryParam("q") String test) {
        return test;
    }

    @GetMapping("/header")
    public String headerEndpoint(@RequestHeader("Accept") String length) {
        return length;
    }
}
