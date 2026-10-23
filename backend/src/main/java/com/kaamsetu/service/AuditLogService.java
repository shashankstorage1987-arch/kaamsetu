package com.kaamsetu.service;

import com.kaamsetu.domain.entity.AuditLog;
import com.kaamsetu.domain.entity.User;
import com.kaamsetu.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(User actor, String action, String metadata) {
        AuditLog auditLog = new AuditLog(actor, action, metadata);
        auditLogRepository.save(auditLog);
    }
}
