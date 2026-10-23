package com.kaamsetu.repository;

import com.kaamsetu.domain.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, UUID> {
    Optional<UserDevice> findByUserIdAndFcmToken(UUID userId, String fcmToken);
    List<UserDevice> findByUserIdAndActiveTrue(UUID userId);
}
