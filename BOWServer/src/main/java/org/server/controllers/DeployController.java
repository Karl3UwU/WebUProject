package org.server.controllers;

import org.server.router.annotations.mapping.PostMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.QueryParam;

@RequestMapping("/api/deploy")
public class DeployController {
    private static final String SECRET = "mySecretPassword";

    @PostMapping("/start")
    public void redeploy(@QueryParam("pass") String pass) {

    }
}
