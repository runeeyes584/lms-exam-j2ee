package com.example.be_lms.service;

public interface VNPayPaymentService {

    String createPaymentUrl(String userId, String courseId, long amount);

    String handleReturn(java.util.Map<String, String> params);
}