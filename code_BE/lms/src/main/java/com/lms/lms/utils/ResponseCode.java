package com.lms.lms.utils;

public final class ResponseCode {
    private ResponseCode() {
    }

    public static final int SUCCESS = 0;
    public static final int ERROR = 9999;
    public static final int VALIDATION_ERROR = 1001;
    public static final int UNAUTHORIZED = 1002;
    public static final int FORBIDDEN = 1003;
    public static final int NOT_FOUND = 1004;

}
