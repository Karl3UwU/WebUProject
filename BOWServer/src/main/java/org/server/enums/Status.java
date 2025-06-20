package org.server.enums;

public enum Status {
    Wishlist,
    Reading,
    Completed;

    public static boolean isValid(String input) {
        for (Status s : Status.values()) {
            if (s.name().equalsIgnoreCase(input)) {
                return true;
            }
        }
        return false;
    }

    public static String normalize(String input) {
        return Status.valueOf(
                input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase()
        ).name();
    }
}
