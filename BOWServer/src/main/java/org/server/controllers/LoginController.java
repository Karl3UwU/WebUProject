package org.server.controllers;

import com.google.gson.JsonObject;
import org.server.router.PostMapping;
import org.server.router.RequestMapping;
import org.server.router.RequestParam;
import org.server.util.JWTPayload;
import org.server.util.JWTUtil;

@RequestMapping("/api/login")
public class LoginController {

    @PostMapping("/send")
    public String sendLoginRequest(@RequestParam("email") String email,
                                   @RequestParam("password") String password) {
        JsonObject response = new JsonObject();

        if(!isValidUser(email, password)) {
            response.addProperty("error", "Invalid email or password");
            return response.toString();
        }

        JWTPayload jwtPayload = new JWTPayload(email);
        String token = JWTUtil.createToken(jwtPayload);
        response.addProperty("token", token);

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
