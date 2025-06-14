package org.server.enums;

public enum UserRole {
    BASIC("BASIC"),
    PUBLISHER("PUBLISHER"),
    ADMIN("ADMIN");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromString(String value) {
        if (value == null) {
            return null;
        }

        for (UserRole role : UserRole.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }

        throw new IllegalArgumentException("No UserRole found for value: " + value);
    }

    @Override
    public String toString() {
        return value;
    }
}