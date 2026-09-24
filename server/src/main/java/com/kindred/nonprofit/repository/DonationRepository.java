package com.kindred.nonprofit.repository;

import com.kindred.nonprofit.domain.Donation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, String> {
    List<Donation> findAllByOrderByDateDesc();
    List<Donation> findByDonorId(String donorId);
    List<Donation> findByCampaignId(String campaignId);
}
