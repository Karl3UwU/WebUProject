package org.server.controllers;

import com.google.gson.JsonObject;
import org.server.router.annotations.mapping.PostMapping;
import org.server.router.annotations.mapping.RequestMapping;
import org.server.router.annotations.request.RequestParam;
import org.server.util.JWTPayload;
import org.server.util.JWTUtil;

@RequestMapping("/api/login")
public class LoginController {

    @PostMapping("/send")
    public String sendLoginRequest(@RequestParam("email") String email,
                                   @RequestParam("password") String password) {
        JsonObject response = new JsonObject();
        if (!isValidUser(email, password)) {
            response.addProperty("success", false);
            response.addProperty("message", "Invalid email or password");
            response.add("data", null);
            return response.toString();
        }

        JWTPayload jwtPayload = new JWTPayload(email);
        String token = JWTUtil.createToken(jwtPayload);

        JsonObject data = new JsonObject();
        data.addProperty("token", token);

        response.addProperty("success", true);
        response.addProperty("message", "Login successful");
        response.add("data", data);

        return response.toString();
    }

    public boolean isValidUser(String email, String password) {

        if( email == null || password == null || email.isEmpty() || password.isEmpty()) {
            return false;
        }
        // TODO: ACTUAL IMPLEMENTATION
        return (email.equals("test@gmail.com") && password.equals("password"));
    }

}
