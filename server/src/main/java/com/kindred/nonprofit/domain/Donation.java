package com.kindred.nonprofit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donation {
    @Id
    @Column(length = 80)
    private String id;

    @Column(name = "donor_id", nullable = false, length = 80)
    private String donorId;

    @Column(name = "campaign_id", nullable = false, length = 80)
    private String campaignId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "donation_date", nullable = false)
    private LocalDateTime date;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(name = "payment_method", nullable = false, length = 60)
    private String paymentMethod;

    @Column(nullable = false, length = 60)
    private String channel;

    @Column(nullable = false)
    private boolean recurring;

    @Column(nullable = false, unique = true, length = 80)
    private String reference;

    @Column(length = 500)
    private String note;

    protected Donation() {
    }

    public Donation(
        String id,
        String donorId,
        String campaignId,
        BigDecimal amount,
        LocalDateTime date,
        String status,
        String paymentMethod,
        String channel,
        boolean recurring,
        String reference,
        String note
    ) {
        this.id = id;
        this.donorId = donorId;
        this.campaignId = campaignId;
        this.amount = amount;
        this.date = date;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.channel = channel;
        this.recurring = recurring;
        this.reference = reference;
        this.note = note;
    }

    public void replaceWith(Donation source) {
        this.donorId = source.donorId;
        this.campaignId = source.campaignId;
        this.amount = source.amount;
        this.date = source.date;
        this.status = source.status;
        this.paymentMethod = source.paymentMethod;
        this.channel = source.channel;
        this.recurring = source.recurring;
        this.reference = source.reference;
        this.note = source.note;
    }

    public String getId() { return id; }
    public String getDonorId() { return donorId; }
    public String getCampaignId() { return campaignId; }
    public BigDecimal getAmount() { return amount; }
    public LocalDateTime getDate() { return date; }
    public String getStatus() { return status; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getChannel() { return channel; }
    public boolean isRecurring() { return recurring; }
    public String getReference() { return reference; }
    public String getNote() { return note; }
}
