package com.kindred.nonprofit.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "donors")
public class Donor {
    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 50)
    private String phone;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(nullable = false, length = 40)
    private String kind;

    @Column(nullable = false, length = 40)
    private String tier;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(name = "total_given", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalGiven = BigDecimal.ZERO;

    @Column(name = "donation_count", nullable = false)
    private int donationCount;

    @Column(name = "first_gift_date", nullable = false)
    private LocalDateTime firstGiftDate;

    @Column(name = "last_gift_date", nullable = false)
    private LocalDateTime lastGiftDate;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "communication_consent", nullable = false)
    private boolean communicationConsent;

    @Column(length = 1000)
    private String notes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "donor_tags", joinColumns = @JoinColumn(name = "donor_id"))
    @Column(name = "tag", nullable = false, length = 100)
    private Set<String> tags = new LinkedHashSet<>();

    protected Donor() {
    }

    public Donor(
        String id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String city,
        String country,
        String kind,
        String tier,
        String status,
        BigDecimal totalGiven,
        int donationCount,
        LocalDateTime firstGiftDate,
        LocalDateTime lastGiftDate,
        LocalDateTime joinedAt,
        boolean communicationConsent,
        String notes,
        Set<String> tags
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.country = country;
        this.kind = kind;
        this.tier = tier;
        this.status = status;
        this.totalGiven = totalGiven;
        this.donationCount = donationCount;
        this.firstGiftDate = firstGiftDate;
        this.lastGiftDate = lastGiftDate;
        this.joinedAt = joinedAt;
        this.communicationConsent = communicationConsent;
        this.notes = notes;
        if (tags != null) {
            this.tags.addAll(tags);
        }
    }

    public void replaceWith(Donor source) {
        this.firstName = source.firstName;
        this.lastName = source.lastName;
        this.email = source.email;
        this.phone = source.phone;
        this.city = source.city;
        this.country = source.country;
        this.kind = source.kind;
        this.tier = source.tier;
        this.status = source.status;
        this.totalGiven = source.totalGiven;
        this.donationCount = source.donationCount;
        this.firstGiftDate = source.firstGiftDate;
        this.lastGiftDate = source.lastGiftDate;
        this.joinedAt = source.joinedAt;
        this.communicationConsent = source.communicationConsent;
        this.notes = source.notes;
        this.tags.clear();
        this.tags.addAll(source.tags);
    }

    public void recalculateGiving(BigDecimal total, int count, LocalDateTime firstGift, LocalDateTime lastGift) {
        this.totalGiven = total;
        this.donationCount = count;
        if (firstGift != null) this.firstGiftDate = firstGift;
        if (lastGift != null) this.lastGiftDate = lastGift;
    }

    public void activateIfNew() {
        if ("New".equals(status)) this.status = "Active";
    }

    public String getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getCity() { return city; }
    public String getCountry() { return country; }
    public String getKind() { return kind; }
    public String getTier() { return tier; }
    public String getStatus() { return status; }
    public BigDecimal getTotalGiven() { return totalGiven; }
    public int getDonationCount() { return donationCount; }
    public LocalDateTime getFirstGiftDate() { return firstGiftDate; }
    public LocalDateTime getLastGiftDate() { return lastGiftDate; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public boolean isCommunicationConsent() { return communicationConsent; }
    public String getNotes() { return notes; }
    public Set<String> getTags() { return tags; }
}
