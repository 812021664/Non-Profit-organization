package com.kindred.nonprofit.controller;

import com.kindred.nonprofit.dto.ApiDtos.DonationDto;
import com.kindred.nonprofit.dto.ApiDtos.DonorDto;
import com.kindred.nonprofit.dto.ApiDtos.LegacyDonationRequest;
import com.kindred.nonprofit.dto.ApiDtos.LegacyDonorRequest;
import com.kindred.nonprofit.dto.ApiDtos.LegacyReportResponse;
import com.kindred.nonprofit.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/legacy")
public class LegacyController {
    private final WorkspaceService workspaceService;

    public LegacyController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping("/donors")
    @ResponseStatus(HttpStatus.CREATED)
    public DonorDto addDonor(@Valid @RequestBody LegacyDonorRequest request) {
        return workspaceService.addLegacyDonor(request);
    }

    @PostMapping("/donations")
    @ResponseStatus(HttpStatus.CREATED)
    public DonationDto addDonation(@Valid @RequestBody LegacyDonationRequest request) {
        return workspaceService.addLegacyDonation(request);
    }

    @GetMapping("/reports")
    public LegacyReportResponse reports() {
        return workspaceService.legacyReport();
    }
}
