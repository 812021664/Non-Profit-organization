package com.kindred.nonprofit.service;

import com.kindred.nonprofit.domain.Campaign;
import com.kindred.nonprofit.domain.Donation;
import com.kindred.nonprofit.domain.Donor;
import com.kindred.nonprofit.dto.ApiDtos.BootstrapResponse;
import com.kindred.nonprofit.dto.ApiDtos.CampaignDto;
import com.kindred.nonprofit.dto.ApiDtos.DonationDto;
import com.kindred.nonprofit.dto.ApiDtos.DonorDto;
import com.kindred.nonprofit.dto.ApiDtos.ImportRequest;
import com.kindred.nonprofit.dto.ApiDtos.ImportResult;
import com.kindred.nonprofit.dto.ApiDtos.LegacyDonationRequest;
import com.kindred.nonprofit.dto.ApiDtos.LegacyDonorReport;
import com.kindred.nonprofit.dto.ApiDtos.LegacyDonorRequest;
import com.kindred.nonprofit.dto.ApiDtos.LegacyReportResponse;
import com.kindred.nonprofit.dto.ApiDtos.WorkspaceStatus;
import com.kindred.nonprofit.exception.ConflictException;
import com.kindred.nonprofit.exception.ResourceNotFoundException;
import com.kindred.nonprofit.repository.CampaignRepository;
import com.kindred.nonprofit.repository.DonationRepository;
import com.kindred.nonprofit.repository.DonorRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceService {
    private static final List<String> LEGACY_CAPABILITIES = List.of(
        "add donor",
        "add donation by donor name",
        "category-based giving",
        "per-donor totals",
        "grand-total report"
    );

    private final DonorRepository donorRepository;
    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final Environment environment;
    private boolean initialized;

    public WorkspaceService(
        DonorRepository donorRepository,
        DonationRepository donationRepository,
        CampaignRepository campaignRepository,
        Environment environment
    ) {
        this.donorRepository = donorRepository;
        this.donationRepository = donationRepository;
        this.campaignRepository = campaignRepository;
        this.environment = environment;
    }

    @Transactional(readOnly = true)
    public BootstrapResponse bootstrap() {
        List<DonorDto> donors = donorRepository.findAll().stream().map(this::toDto).toList();
        List<DonationDto> donations = donationRepository.findAllByOrderByDateDesc().stream().map(this::toDto).toList();
        List<CampaignDto> campaigns = campaignRepository.findAll().stream()
            .sorted(Comparator.comparing(Campaign::getStartDate).reversed())
            .map(this::toDto)
            .toList();
        return new BootstrapResponse(donors, donations, campaigns, status());
    }

    @Transactional(readOnly = true)
    public DonorDto getDonor(String id) {
        return donorRepository.findById(id).map(this::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + id));
    }

    @Transactional(readOnly = true)
    public DonationDto getDonation(String id) {
        return donationRepository.findById(id).map(this::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + id));
    }

    @Transactional(readOnly = true)
    public CampaignDto getCampaign(String id) {
        return campaignRepository.findById(id).map(this::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("Campaign not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<DonorDto> listDonors() {
        return donorRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<DonationDto> listDonations() {
        return donationRepository.findAllByOrderByDateDesc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<CampaignDto> listCampaigns() {
        return campaignRepository.findAll().stream()
            .sorted(Comparator.comparing(Campaign::getStartDate).reversed())
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceStatus status() {
        return new WorkspaceStatus(
            initialized,
            "Non-Profit-organization legacy model + Kindred workspace",
            environment.acceptsProfiles(Profiles.of("postgres")) ? "PostgreSQL" : "H2",
            donorRepository.count(),
            donationRepository.count(),
            campaignRepository.count(),
            LEGACY_CAPABILITIES,
            java.time.Instant.now()
        );
    }

    @Transactional
    public ImportResult importWorkspace(ImportRequest request) {
        request.donors().forEach(this::upsertDonor);
        request.campaigns().forEach(this::upsertCampaign);
        request.donations().forEach(this::upsertDonation);
        recalculateAll();
        initialized = true;
        return new ImportResult(request.donors().size(), request.donations().size(), request.campaigns().size());
    }

    @Transactional
    public DonorDto saveDonor(DonorDto dto) {
        if (dto.id() == null || dto.id().isBlank()) {
            throw new ConflictException("Client-generated donor id is required for safe synchronization.");
        }
        Donor donor = donorRepository.save(upsertDonor(dto));
        initialized = true;
        return toDto(donor);
    }

    @Transactional
    public DonationDto saveDonation(DonationDto dto) {
        if (dto.id() == null || dto.id().isBlank()) {
            throw new ConflictException("Client-generated donation id is required for safe synchronization.");
        }
        if (!donorRepository.existsById(dto.donorId())) {
            throw new ResourceNotFoundException("Donor not found: " + dto.donorId());
        }
        if (!campaignRepository.existsById(dto.campaignId())) {
            throw new ResourceNotFoundException("Campaign not found: " + dto.campaignId());
        }
        Donation donation = upsertDonation(dto);
        Donation saved = donationRepository.save(donation);
        recalculateDonor(dto.donorId());
        recalculateCampaign(dto.campaignId());
        initialized = true;
        return toDto(saved);
    }

    @Transactional
    public CampaignDto saveCampaign(CampaignDto dto) {
        if (dto.id() == null || dto.id().isBlank()) {
            throw new ConflictException("Client-generated campaign id is required for safe synchronization.");
        }
        Campaign campaign = campaignRepository.save(upsertCampaign(dto));
        initialized = true;
        return toDto(campaign);
    }

    @Transactional(readOnly = true)
    public LegacyReportResponse legacyReport() {
        List<Donor> donors = donorRepository.findAll().stream()
            .sorted(Comparator.comparing(donor -> (donor.getFirstName() + " " + donor.getLastName()).toLowerCase()))
            .toList();
        List<LegacyDonorReport> reports = donors.stream()
            .map(donor -> new LegacyDonorReport(
                donor.getFirstName() + " " + donor.getLastName(),
                donor.getEmail(),
                donationRepository.findByDonorId(donor.getId()).stream()
                    .filter(donation -> "Completed".equals(donation.getStatus()))
                    .map(Donation::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
            ))
            .toList();
        BigDecimal grandTotal = reports.stream()
            .map(LegacyDonorReport::totalDonations)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new LegacyReportResponse(reports, grandTotal);
    }

    @Transactional
    public DonorDto addLegacyDonor(LegacyDonorRequest request) {
        String name = request.name().trim();
        int separator = name.indexOf(' ');
        String firstName = separator > 0 ? name.substring(0, separator).trim() : name;
        String lastName = separator > 0 ? name.substring(separator + 1).trim() : "Supporter";
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        Donor donor = new Donor(
            "legacy-donor-" + UUID.randomUUID(),
            firstName,
            lastName,
            request.email().trim(),
            "+1 555 0100",
            "Not provided",
            "Not provided",
            "Individual",
            "Supporter",
            "New",
            BigDecimal.ZERO,
            0,
            now,
            now,
            now,
            false,
            "Created through the legacy-compatible API",
            Set.of("Legacy import")
        );
        donorRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new ConflictException("A donor with this email already exists: " + existing.getId());
        });
        return toDto(donorRepository.save(donor));
    }

    @Transactional
    public DonationDto addLegacyDonation(LegacyDonationRequest request) {
        Donor donor = donorRepository.findByFullName(request.donorName().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + request.donorName()));
        Campaign campaign = ensureLegacyCampaign(request.category());
        donor.activateIfNew();
        donorRepository.save(donor);
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        Donation donation = new Donation(
            "legacy-donation-" + UUID.randomUUID(),
            donor.getId(),
            campaign.getId(),
            request.amount(),
            now,
            "Completed",
            "Cash",
            "Partner",
            false,
            "LEGACY-" + now.getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
            "Added through the legacy-compatible donation flow"
        );
        Donation saved = donationRepository.save(donation);
        recalculateDonor(donor.getId());
        recalculateCampaign(campaign.getId());
        initialized = true;
        return toDto(saved);
    }

    private Donor upsertDonor(DonorDto dto) {
        Donor mapped = toEntity(dto);
        Donor existing = donorRepository.findById(mapped.getId()).orElse(null);
        donorRepository.findByEmailIgnoreCase(mapped.getEmail()).ifPresent(other -> {
            if (!other.getId().equals(mapped.getId())) {
                throw new ConflictException("Donor email already belongs to: " + other.getId());
            }
        });
        if (existing == null) {
            return donorRepository.save(mapped);
        }
        existing.replaceWith(mapped);
        return donorRepository.save(existing);
    }

    private Campaign upsertCampaign(CampaignDto dto) {
        Campaign mapped = toEntity(dto);
        Campaign existing = campaignRepository.findById(mapped.getId()).orElse(null);
        if (existing == null) return campaignRepository.save(mapped);
        existing.replaceWith(mapped);
        return campaignRepository.save(existing);
    }

    private Donation upsertDonation(DonationDto dto) {
        Donation mapped = toEntity(dto);
        Donation existing = donationRepository.findById(mapped.getId()).orElse(null);
        if (existing == null) return donationRepository.save(mapped);
        existing.replaceWith(mapped);
        return donationRepository.save(existing);
    }

    private Campaign ensureLegacyCampaign(String categoryName) {
        String category = categoryName.trim();
        return campaignRepository.findFirstByCategoryIgnoreCase(category).orElseGet(() -> {
            LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
            Campaign campaign = new Campaign(
                "legacy-campaign-" + UUID.randomUUID(),
                Character.toUpperCase(category.charAt(0)) + category.substring(1),
                category,
                "Legacy giving category imported from Non-Profit-organization.",
                new BigDecimal("10000.00"),
                BigDecimal.ZERO,
                0,
                now.minusDays(30),
                now.plusDays(335),
                "Active",
                "#4adea4"
            );
            return campaignRepository.save(campaign);
        });
    }

    private void recalculateAll() {
        List<Donation> donations = donationRepository.findAll();
        Map<String, List<Donation>> byDonor = new HashMap<>();
        Map<String, List<Donation>> byCampaign = new HashMap<>();
        for (Donation donation : donations) {
            if (!"Completed".equals(donation.getStatus())) continue;
            byDonor.computeIfAbsent(donation.getDonorId(), ignored -> new ArrayList<>()).add(donation);
            byCampaign.computeIfAbsent(donation.getCampaignId(), ignored -> new ArrayList<>()).add(donation);
        }
        for (Donor donor : donorRepository.findAll()) {
            recalculateDonor(donor, byDonor.getOrDefault(donor.getId(), List.of()));
        }
        for (Campaign campaign : campaignRepository.findAll()) {
            recalculateCampaign(campaign, byCampaign.getOrDefault(campaign.getId(), List.of()));
        }
    }

    private void recalculateDonor(String donorId) {
        Donor donor = donorRepository.findById(donorId)
            .orElseThrow(() -> new ResourceNotFoundException("Donor not found: " + donorId));
        recalculateDonor(donor, donationRepository.findByDonorId(donorId));
    }

    private void recalculateDonor(Donor donor, List<Donation> allDonations) {
        List<Donation> completed = allDonations.stream().filter(donation -> "Completed".equals(donation.getStatus())).toList();
        BigDecimal total = completed.stream().map(Donation::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDateTime first = completed.stream().map(Donation::getDate).min(LocalDateTime::compareTo).orElse(null);
        LocalDateTime last = completed.stream().map(Donation::getDate).max(LocalDateTime::compareTo).orElse(null);
        donor.recalculateGiving(total, completed.size(), first, last);
        donorRepository.save(donor);
    }

    private void recalculateCampaign(String campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new ResourceNotFoundException("Campaign not found: " + campaignId));
        recalculateCampaign(campaign, donationRepository.findByCampaignId(campaignId));
    }

    private void recalculateCampaign(Campaign campaign, List<Donation> allDonations) {
        List<Donation> completed = allDonations.stream().filter(donation -> "Completed".equals(donation.getStatus())).toList();
        BigDecimal total = completed.stream().map(Donation::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Set<String> donorIds = new HashSet<>();
        completed.forEach(donation -> donorIds.add(donation.getDonorId()));
        campaign.recalculateGiving(total, donorIds.size());
        campaignRepository.save(campaign);
    }

    private Donor toEntity(DonorDto dto) {
        return new Donor(
            dto.id(), dto.firstName(), dto.lastName(), dto.email().toLowerCase(), dto.phone(), dto.city(), dto.country(),
            dto.kind(), dto.tier(), dto.status(), dto.totalGiven(), dto.donationCount(), dto.firstGiftDate(),
            dto.lastGiftDate(), dto.joinedAt(), dto.communicationConsent(), dto.notes(),
            dto.tags() == null ? Set.of() : new LinkedHashSet<>(dto.tags())
        );
    }

    private Campaign toEntity(CampaignDto dto) {
        return new Campaign(
            dto.id(), dto.name(), dto.category(), dto.description(), dto.goal(), dto.raised(), dto.donorCount(),
            dto.startDate(), dto.endDate(), dto.status(), dto.accent()
        );
    }

    private Donation toEntity(DonationDto dto) {
        return new Donation(
            dto.id(), dto.donorId(), dto.campaignId(), dto.amount(), dto.date(), dto.status(), dto.paymentMethod(),
            dto.channel(), dto.recurring(), dto.reference(), dto.note()
        );
    }

    public DonorDto toDto(Donor donor) {
        return new DonorDto(
            donor.getId(), donor.getFirstName(), donor.getLastName(), donor.getEmail(), donor.getPhone(), donor.getCity(),
            donor.getCountry(), donor.getKind(), donor.getTier(), donor.getStatus(), donor.getTotalGiven(),
            donor.getDonationCount(), donor.getFirstGiftDate(), donor.getLastGiftDate(), donor.getJoinedAt(),
            donor.isCommunicationConsent(), new LinkedHashSet<>(donor.getTags()), donor.getNotes()
        );
    }

    public DonationDto toDto(Donation donation) {
        return new DonationDto(
            donation.getId(), donation.getDonorId(), donation.getCampaignId(), donation.getAmount(), donation.getDate(),
            donation.getStatus(), donation.getPaymentMethod(), donation.getChannel(), donation.isRecurring(),
            donation.getReference(), donation.getNote()
        );
    }

    public CampaignDto toDto(Campaign campaign) {
        return new CampaignDto(
            campaign.getId(), campaign.getName(), campaign.getCategory(), campaign.getDescription(), campaign.getGoal(),
            campaign.getRaised(), campaign.getDonationCount(), campaign.getStartDate(), campaign.getEndDate(),
            campaign.getStatus(), campaign.getAccent()
        );
    }
}
