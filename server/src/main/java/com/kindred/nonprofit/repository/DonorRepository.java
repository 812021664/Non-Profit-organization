package com.kindred.nonprofit.repository;

import com.kindred.nonprofit.domain.Donor;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DonorRepository extends JpaRepository<Donor, String> {
    Optional<Donor> findByEmailIgnoreCase(String email);

    @Query("select d from Donor d where lower(concat(d.firstName, ' ', d.lastName)) = lower(:name)")
    Optional<Donor> findByFullName(@Param("name") String name);
}
