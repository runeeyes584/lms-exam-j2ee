package com.lms.lms.service.impl;

import com.lms.lms.dto.response.AuthResponse;
import com.lms.lms.dto.response.UserPublicResponse;
import com.lms.lms.entity.RefreshToken;
import com.lms.lms.entity.User;
import com.lms.lms.exception.AppException;
import com.lms.lms.repository.RefreshTokenRepository;
import com.lms.lms.repository.UserRepository;
import com.lms.lms.service.AuthService;
import com.lms.lms.utils.JwtUtil;
import com.lms.lms.utils.ResponseCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final RefreshTokenRepository refreshTokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final long refreshExpirationMs;

        public AuthServiceImpl(
                        UserRepository userRepository,
                        RefreshTokenRepository refreshTokenRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil,
                        @Value("${jwt.refresh-expiration}") long refreshExpirationMs) {
                this.userRepository = userRepository;
                this.refreshTokenRepository = refreshTokenRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
                this.refreshExpirationMs = refreshExpirationMs;
        }

        @Override
        public AuthResponse login(String email, String rawPassword) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(ResponseCode.UNAUTHORIZED,
                                                "Invalid email or password"));

                if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                        throw new AppException(ResponseCode.UNAUTHORIZED, "Invalid email or password");
                }

                String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());

                // refresh token random string
                String refreshToken = generateSecureToken();

                Instant now = Instant.now();
                RefreshToken rt = RefreshToken.builder()
                                .userId(user.getId())
                                .token(refreshToken)
                                .createdAt(now)
                                .expiresAt(now.plusMillis(refreshExpirationMs))
                                .revoked(false)
                                .build();

                refreshTokenRepository.save(rt);

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .user(UserPublicResponse.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .fullName(user.getFullName())
                                                .avatarUrl(user.getAvatarUrl())
                                                .role(user.getRole())
                                                .build())
                                .build();
        }

        @Override
        public void logout(String token) {
                RefreshToken rt = refreshTokenRepository
                                .findByTokenAndRevokedFalse(token)
                                .orElseThrow(() -> new AppException(ResponseCode.UNAUTHORIZED,
                                                "Invalid refresh token"));

                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
        }

        @Override
        public AuthResponse refresh(String token) {

                RefreshToken rt = refreshTokenRepository
                                .findByTokenAndRevokedFalse(token)
                                .orElseThrow(() -> new AppException(ResponseCode.UNAUTHORIZED,
                                                "Invalid refresh token"));

                if (rt.getExpiresAt().isBefore(Instant.now())) {
                        throw new AppException(ResponseCode.UNAUTHORIZED, "Refresh token expired");
                }

                // revoke token cũ
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);

                User user = userRepository.findById(rt.getUserId())
                                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "User not found"));

                // tạo token mới
                String newAccessToken = jwtUtil.generateAccessToken(
                                user.getId(),
                                user.getRole().name());

                String newRefreshToken = generateSecureToken();

                Instant now = Instant.now();

                RefreshToken newRt = RefreshToken.builder()
                                .userId(user.getId())
                                .token(newRefreshToken)
                                .createdAt(now)
                                .expiresAt(now.plusMillis(refreshExpirationMs))
                                .revoked(false)
                                .build();

                refreshTokenRepository.save(newRt);

                return AuthResponse.builder()
                                .accessToken(newAccessToken)
                                .refreshToken(newRefreshToken)
                                .user(UserPublicResponse.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .fullName(user.getFullName())
                                                .avatarUrl(user.getAvatarUrl())
                                                .role(user.getRole())
                                                .build())
                                .build();
        }

        private String generateSecureToken() {
                byte[] bytes = new byte[64];
                new SecureRandom().nextBytes(bytes);
                return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        }
}