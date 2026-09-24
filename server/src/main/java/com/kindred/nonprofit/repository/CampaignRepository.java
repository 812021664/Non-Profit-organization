package com.kindred.nonprofit.repository;

import com.kindred.nonprofit.domain.Campaign;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, String> {
    Optional<Campaign> findFirstByCategoryIgnoreCase(String category);
}
