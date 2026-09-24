package com.kindred.nonprofit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
public class Campaign {
    @Id
    @Column(length = 80)
    private String id;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal goal;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal raised = BigDecimal.ZERO;

    @Column(name = "donor_count", nullable = false)
    private int donorCount;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(nullable = false, length = 20)
    private String accent;

    protected Campaign() {
    }

    public Campaign(
        String id,
        String name,
        String category,
        String description,
        BigDecimal goal,
        BigDecimal raised,
        int donorCount,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String status,
        String accent
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.goal = goal;
        this.raised = raised;
        this.donorCount = donorCount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.accent = accent;
    }

    public void replaceWith(Campaign source) {
        this.name = source.name;
        this.category = source.category;
        this.description = source.description;
        this.goal = source.goal;
        this.raised = source.raised;
        this.donorCount = source.donorCount;
        this.startDate = source.startDate;
        this.endDate = source.endDate;
        this.status = source.status;
        this.accent = source.accent;
    }

    public void recalculateGiving(BigDecimal raised, int donorCount) {
        this.raised = raised;
        this.donorCount = donorCount;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public BigDecimal getGoal() { return goal; }
    public BigDecimal getRaised() { return raised; }
    public int getDonationCount() { return donorCount; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public String getStatus() { return status; }
    public String getAccent() { return accent; }
}
