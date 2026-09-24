package com.kindred.nonprofit.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public final class ApiDtos {
    private ApiDtos() {
    }

    public record DonorDto(
        @NotBlank String id,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String phone,
        @NotBlank String city,
        @NotBlank String country,
        @NotBlank @Pattern(regexp = "Individual|Corporate|Foundation") String kind,
        @NotBlank @Pattern(regexp = "Visionary|Champion|Sustainer|Supporter") String tier,
        @NotBlank @Pattern(regexp = "Active|Lapsed|New") String status,
        @NotNull @DecimalMin("0.00") BigDecimal totalGiven,
        int donationCount,
        @NotNull LocalDateTime firstGiftDate,
        @NotNull LocalDateTime lastGiftDate,
        @NotNull LocalDateTime joinedAt,
        boolean communicationConsent,
        Set<String> tags,
        String notes
    ) {
    }

    public record DonationDto(
        @NotBlank String id,
        @NotBlank String donorId,
        @NotBlank String campaignId,
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDateTime date,
        @NotBlank @Pattern(regexp = "Completed|Pending|Failed|Refunded") String status,
        @NotBlank @Pattern(regexp = "Card|Bank transfer|Check|Cash|Digital wallet") String paymentMethod,
        @NotBlank @Pattern(regexp = "Online|Event|Direct mail|Partner|Recurring") String channel,
        boolean recurring,
        @NotBlank String reference,
        String note
    ) {
    }

    public record CampaignDto(
        @NotBlank String id,
        @NotBlank String name,
        @NotBlank String category,
        @NotBlank String description,
        @NotNull @Positive BigDecimal goal,
        @NotNull @DecimalMin("0.00") BigDecimal raised,
        int donorCount,
        @NotNull LocalDateTime startDate,
        @NotNull LocalDateTime endDate,
        @NotBlank @Pattern(regexp = "Active|Upcoming|Completed") String status,
        @NotBlank @Pattern(regexp = "#[0-9A-Fa-f]{6}") String accent
    ) {
    }

    public record ImportRequest(
        @NotNull List<@Valid DonorDto> donors,
        @NotNull List<@Valid DonationDto> donations,
        @NotNull List<@Valid CampaignDto> campaigns
    ) {
    }

    public record ImportResult(int donorsImported, int donationsImported, int campaignsImported) {
    }

    public record BootstrapResponse(
        List<DonorDto> donors,
        List<DonationDto> donations,
        List<CampaignDto> campaigns,
        WorkspaceStatus status
    ) {
    }

    public record WorkspaceStatus(
        boolean initialized,
        String integration,
        String storage,
        long donors,
        long donations,
        long campaigns,
        List<String> legacyCapabilities,
        Instant serverTime
    ) {
    }

    public record LegacyDonorRequest(@NotBlank String name, @NotBlank @Email String email) {
    }

    public record LegacyDonationRequest(
        @NotBlank String donorName,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String category
    ) {
    }

    public record LegacyDonorReport(String name, String email, BigDecimal totalDonations) {
    }

    public record LegacyReportResponse(List<LegacyDonorReport> donors, BigDecimal grandTotal) {
    }
}
