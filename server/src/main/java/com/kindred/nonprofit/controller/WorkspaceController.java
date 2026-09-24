package com.kindred.nonprofit.controller;

import com.kindred.nonprofit.dto.ApiDtos.BootstrapResponse;
import com.kindred.nonprofit.dto.ApiDtos.CampaignDto;
import com.kindred.nonprofit.dto.ApiDtos.DonationDto;
import com.kindred.nonprofit.dto.ApiDtos.DonorDto;
import com.kindred.nonprofit.dto.ApiDtos.ImportRequest;
import com.kindred.nonprofit.dto.ApiDtos.ImportResult;
import com.kindred.nonprofit.dto.ApiDtos.WorkspaceStatus;
import com.kindred.nonprofit.service.WorkspaceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping("/status")
    public WorkspaceStatus status() {
        return workspaceService.status();
    }

    @GetMapping("/bootstrap")
    public BootstrapResponse bootstrap() {
        return workspaceService.bootstrap();
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.OK)
    public ImportResult importWorkspace(@Valid @RequestBody ImportRequest request) {
        return workspaceService.importWorkspace(request);
    }

    @GetMapping("/donors")
    public List<DonorDto> donors() {
        return workspaceService.listDonors();
    }

    @GetMapping("/donations")
    public List<DonationDto> donations() {
        return workspaceService.listDonations();
    }

    @GetMapping("/campaigns")
    public List<CampaignDto> campaigns() {
        return workspaceService.listCampaigns();
    }

    @GetMapping("/donors/{id}")
    public DonorDto donor(@PathVariable String id) {
        return workspaceService.getDonor(id);
    }

    @GetMapping("/donations/{id}")
    public DonationDto donation(@PathVariable String id) {
        return workspaceService.getDonation(id);
    }

    @GetMapping("/campaigns/{id}")
    public CampaignDto campaign(@PathVariable String id) {
        return workspaceService.getCampaign(id);
    }

    @PutMapping("/donors/{id}")
    public DonorDto saveDonor(@PathVariable String id, @Valid @RequestBody DonorDto donor) {
        if (!id.equals(donor.id())) {
            throw new IllegalArgumentException("Donor id in the URL and body must match.");
        }
        return workspaceService.saveDonor(donor);
    }

    @PutMapping("/donations/{id}")
    public DonationDto saveDonation(@PathVariable String id, @Valid @RequestBody DonationDto donation) {
        if (!id.equals(donation.id())) {
            throw new IllegalArgumentException("Donation id in the URL and body must match.");
        }
        return workspaceService.saveDonation(donation);
    }

    @PutMapping("/campaigns/{id}")
    public CampaignDto saveCampaign(@PathVariable String id, @Valid @RequestBody CampaignDto campaign) {
        if (!id.equals(campaign.id())) {
            throw new IllegalArgumentException("Campaign id in the URL and body must match.");
        }
        return workspaceService.saveCampaign(campaign);
    }
}
