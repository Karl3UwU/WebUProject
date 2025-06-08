package org.server.controllers;

import org.server.router.annotations.mapping.GetMapping;
import org.server.router.annotations.request.QueryParam;
import org.server.router.annotations.mapping.RequestMapping;

@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/test")
    public String test(@QueryParam("q") String authToken) {
        return authToken;
    }
}
