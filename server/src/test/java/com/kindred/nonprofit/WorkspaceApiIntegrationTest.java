package com.kindred.nonprofit;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class WorkspaceApiIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void importsWorkspaceAndServesBootstrap() throws Exception {
        mockMvc.perform(get("/api/status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.integration", org.hamcrest.Matchers.containsString("Non-Profit-organization")))
            .andExpect(jsonPath("$.initialized").value(false));

        String workspace = """
            {
              "donors": [{
                "id": "donor-test-1", "firstName": "Maya", "lastName": "Chen",
                "email": "maya@example.org", "phone": "+1 555 1000", "city": "Oakland", "country": "USA",
                "kind": "Individual", "tier": "Supporter", "status": "New", "totalGiven": 0,
                "donationCount": 0, "firstGiftDate": "2026-01-01T12:00:00", "lastGiftDate": "2026-01-01T12:00:00",
                "joinedAt": "2026-01-01T12:00:00", "communicationConsent": true, "tags": ["Test"], "notes": null
              }],
              "campaigns": [{
                "id": "campaign-test-1", "name": "Community Table", "category": "Food",
                "description": "Fresh food for neighbors.", "goal": 10000, "raised": 0, "donorCount": 0,
                "startDate": "2026-01-01T12:00:00", "endDate": "2026-12-31T12:00:00", "status": "Active", "accent": "#4adea4"
              }],
              "donations": [{
                "id": "donation-test-1", "donorId": "donor-test-1", "campaignId": "campaign-test-1",
                "amount": 250, "date": "2026-02-10T12:00:00", "status": "Completed", "paymentMethod": "Card",
                "channel": "Online", "recurring": false, "reference": "TEST-1001", "note": null
              }]
            }
            """;

        mockMvc.perform(post("/api/import")
                .contentType(MediaType.APPLICATION_JSON)
                .content(workspace))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.donorsImported").value(1))
            .andExpect(jsonPath("$.donationsImported").value(1));

        mockMvc.perform(get("/api/bootstrap"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.donors", hasSize(1)))
            .andExpect(jsonPath("$.donors[0].totalGiven").value(250))
            .andExpect(jsonPath("$.donors[0].status").value("New"))
            .andExpect(jsonPath("$.donations[0].amount").value(250))
            .andExpect(jsonPath("$.campaigns[0].raised").value(250))
            .andExpect(jsonPath("$.status.initialized").value(true));
    }

    @Test
    void preservesLegacyDonorDonationAndReportFlow() throws Exception {
        mockMvc.perform(post("/api/legacy/donors")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Ravi Patel\",\"email\":\"ravi-legacy@example.org\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.firstName").value("Ravi"))
            .andExpect(jsonPath("$.lastName").value("Patel"));

        mockMvc.perform(post("/api/legacy/donations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"donorName\":\"Ravi Patel\",\"amount\":125.50,\"category\":\"cash\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.amount").value(125.5))
            .andExpect(jsonPath("$.campaignId", org.hamcrest.Matchers.startsWith("legacy-campaign-")));

        mockMvc.perform(get("/api/legacy/reports"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.donors", hasSize(greaterThanOrEqualTo(1))))
            .andExpect(jsonPath("$.grandTotal", greaterThanOrEqualTo(125.5)));
    }

    @Test
    void validatesLegacyDonationAmount() throws Exception {
        mockMvc.perform(post("/api/legacy/donors")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Valid Donor\",\"email\":\"valid@example.org\"}"))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/legacy/donations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"donorName\":\"Valid Donor\",\"amount\":-5,\"category\":\"Cash\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.amount").exists());
    }
}
